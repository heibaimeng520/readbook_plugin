import { unzipEpub } from '@/utils/epub/unzipper'
import { parseXml, getElementText } from '@/utils/epub/xmlParser'
import { sanitizeHtml } from '@/utils/epub/htmlSanitizer'
import { generateToc } from './tocGenerator'

/**
 * Parse an EPUB file from its ArrayBuffer.
 * @param {ArrayBuffer} arrayBuffer
 * @param {string} filename
 * @returns {Promise<{title, author, coverUrl, chapters, totalChars}>}
 */
export async function parseEpub(arrayBuffer, filename) {
  const files = await unzipEpub(arrayBuffer)

  // 1. Find container.xml to locate OPF file
  const containerPath = findFile(files, 'META-INF/container.xml')
  if (!containerPath) throw new Error('无效EPUB: 缺少 container.xml')

  const containerXml = parseXml(files.get(containerPath))
  const rootfile = containerXml.getElementsByTagName('rootfile')[0]
  if (!rootfile) throw new Error('无效EPUB: container.xml 中无 rootfile')

  const opfPath = rootfile.getAttribute('full-path') || ''
  const opfActualPath = findFile(files, opfPath) || resolvePath(containerPath, opfPath)
  if (!opfActualPath) throw new Error('无效EPUB: 找不到 OPF 文件')

  const opfXml = parseXml(files.get(opfActualPath))
  const opfDir = opfActualPath.replace(/\/[^/]+$/, '')

  // 2. Extract metadata
  const metadata = opfXml.getElementsByTagName('metadata')[0]
  const title = getElementText(metadata, 'title') || filename.replace(/\.epub$/i, '')
  const author = getElementText(metadata, 'creator') || ''

  // 3. Build manifest (id → href)
  const manifest = new Map()
  const manifestEls = opfXml.getElementsByTagName('manifest')[0]?.getElementsByTagName('item') || []
  for (const item of manifestEls) {
    const id = item.getAttribute('id')
    const href = item.getAttribute('href')
    const mediaType = item.getAttribute('media-type')
    if (id && href) {
      manifest.set(id, { href, mediaType })
    }
  }

  // 4. Get spine (reading order)
  const spineEls = opfXml.getElementsByTagName('spine')[0]?.getElementsByTagName('itemref') || []
  const spineIds = []
  for (const itemref of spineEls) {
    const idref = itemref.getAttribute('idref')
    if (idref) spineIds.push(idref)
  }

  // 5. Try to extract NCX or nav TOC for chapter structure
  const chapters = extractChapters(files, opfXml, opfDir, manifest, spineIds)

  // 6. Extract and sanitize chapter content
  let totalChars = 0
  for (const chapter of chapters) {
    const href = chapter.href
    const filePath = findFile(files, href) || resolvePath(opfDir + '/', href)
    if (filePath && files.has(filePath)) {
      let html = files.get(filePath)
      if (typeof html !== 'string') {
        html = await new Response(html).text()
      }
      // Extract body content
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      const rawContent = bodyMatch ? bodyMatch[1] : html
      const cleanHtml = sanitizeHtml(rawContent)
      // Convert relative image src to blob URLs
      chapter.htmlContent = resolveImages(cleanHtml, files, filePath, opfDir)
      chapter.textContent = stripHtml(chapter.htmlContent)
      totalChars += chapter.textContent.length
    } else {
      chapter.htmlContent = ''
      chapter.textContent = ''
    }
  }

  // If no chapters found, create a flat structure from spine
  if (chapters.length === 0) {
    chapters.push({
      id: 'ch_0',
      title: title || '正文',
      level: 1,
      href: '',
      htmlContent: '',
      textContent: '',
      charStart: 0
    })
  }

  // 7. Extract cover image
  let coverUrl = null
  const coverId = findCoverId(opfXml, manifest)
  if (coverId) {
    const coverFile = manifest.get(coverId)
    if (coverFile) {
      const coverPath = findFile(files, coverFile.href) || resolvePath(opfDir + '/', coverFile.href)
      if (coverPath && files.has(coverPath)) {
        const coverBlob = files.get(coverPath)
        if (coverBlob instanceof Blob) {
          coverUrl = URL.createObjectURL(coverBlob)
        }
      }
    }
  }

  return { title, author, coverUrl, chapters, totalChars }
}

function findFile(files, partialPath) {
  const normalized = partialPath.replace(/\\/g, '/').split('#')[0]
  if (files.has(normalized)) return normalized

  // Fuzzy search: match filename ignoring directory structure
  const name = normalized.split('/').pop()
  for (const key of files.keys()) {
    if (key.endsWith('/' + name) || key === name) return key
  }

  return null
}

function resolvePath(basePath, relativePath) {
  if (!relativePath) return null
  const parts = relativePath.replace(/\\/g, '/').split('/')
  const baseParts = basePath.replace(/\\/g, '/').split('/')
  baseParts.pop() // remove filename

  for (const part of parts) {
    if (part === '..') {
      baseParts.pop()
    } else if (part !== '.') {
      baseParts.push(part)
    }
  }
  return baseParts.join('/')
}

function extractChapters(files, opfXml, opfDir, manifest, spineIds) {
  const chapters = []

  // First try NCX (EPUB2 TOC)
  const ncxItem = findNcxId(opfXml, manifest)
  if (ncxItem) {
    const ncxPath = findFile(files, ncxItem.href) || resolvePath(opfDir + '/', ncxItem.href)
    if (ncxPath && files.has(ncxPath)) {
      const ncxXml = parseXml(files.get(ncxPath))
      const navPoints = ncxXml.getElementsByTagName('navPoint')
      let id = 0
      for (const np of navPoints) {
        const label = getElementText(np, 'text') || getElementText(np, 'navLabel') || ''
        const content = np.getElementsByTagName('content')[0]
        const src = content?.getAttribute('src') || ''
        const [href, anchor] = src.split('#')

        chapters.push({
          id: `ch_${id++}`,
          title: label || `章节 ${id}`,
          level: getNavDepth(np),
          href,
          htmlContent: '',
          textContent: '',
          charStart: 0
        })
      }
    }
  }

  // Then check for EPUB3 nav document
  if (chapters.length === 0) {
    const navItem = findNavItem(manifest)
    if (navItem) {
      const navPath = findFile(files, navItem.href) || resolvePath(opfDir + '/', navItem.href)
      if (navPath && files.has(navPath)) {
        const navHtml = files.get(navPath)
        if (typeof navHtml === 'string') {
          const navChapters = parseNavHtml(navHtml)
          chapters.push(...navChapters)
        }
      }
    }
  }

  return chapters
}

function findNcxId(opfXml, manifest) {
  for (const [id, item] of manifest) {
    if (item.mediaType === 'application/x-dtbncx+xml') return { id, ...item }
  }
  const spine = opfXml.getElementsByTagName('spine')[0]
  const ncxId = spine?.getAttribute('toc')
  if (ncxId && manifest.has(ncxId)) {
    return { id: ncxId, ...manifest.get(ncxId) }
  }
  return null
}

function findNavItem(manifest) {
  for (const [id, item] of manifest) {
    if (item.href?.includes('nav') && item.mediaType?.includes('html')) {
      return { id, ...item }
    }
    if (item.href?.includes('toc') && item.mediaType?.includes('html')) {
      return { id, ...item }
    }
  }
  return null
}

function parseNavHtml(html) {
  const chapters = []
  const navMatch = html.match(/<nav[^>]*epub:type="toc"[^>]*>([\s\S]*?)<\/nav>/i)
    || html.match(/<nav[^>]*id="toc"[^>]*>([\s\S]*?)<\/nav>/i)
    || [null, html]

  const linkRegex = /<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi
  let match
  let id = 0
  while ((match = linkRegex.exec(navMatch[1])) !== null) {
    const href = match[1].split('#')[0]
    const title = match[2].replace(/<[^>]+>/g, '').trim()
    chapters.push({
      id: `ch_${id++}`,
      title: title || `章节 ${id}`,
      level: 1,
      href,
      htmlContent: '',
      textContent: '',
      charStart: 0
    })
  }
  return chapters
}

function getNavDepth(navPoint) {
  let depth = 1
  let parent = navPoint.parentNode
  while (parent) {
    if (parent.nodeName === 'navPoint') depth++
    parent = parent.parentNode
  }
  return Math.min(depth, 3)
}

function findCoverId(opfXml, manifest) {
  // Check meta cover
  const metaEls = opfXml.getElementsByTagName('meta') || []
  for (const meta of metaEls) {
    if (meta.getAttribute('name') === 'cover') {
      return meta.getAttribute('content')
    }
  }
  // Check manifest for cover image
  for (const [id, item] of manifest) {
    if (item.href?.toLowerCase().includes('cover') && item.mediaType?.startsWith('image/')) {
      return id
    }
  }
  return null
}

function resolveImages(html, files, currentFile, opfDir) {
  const imgRegex = /<img\s+[^>]*src="([^"]*)"[^>]*>/gi
  return html.replace(imgRegex, (match, src) => {
    if (src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('http')) {
      return match
    }
    const baseDir = currentFile.replace(/\/[^/]+$/, '')
    const imgPath = resolvePath(baseDir + '/', src)
    const foundPath = findFile(files, imgPath)
    if (foundPath && files.has(foundPath)) {
      const blob = files.get(foundPath)
      if (blob instanceof Blob) {
        const blobUrl = URL.createObjectURL(blob)
        return match.replace(src, blobUrl)
      }
    }
    return match
  })
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
}
