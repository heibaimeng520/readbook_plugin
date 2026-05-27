import JSZip from 'jszip'

/**
 * Unzip an EPUB file (ZIP archive) and return a map of filename → content.
 * @param {ArrayBuffer} arrayBuffer
 * @returns {Promise<Map<string, Blob|string>>}
 */
export async function unzipEpub(arrayBuffer) {
  const zip = await JSZip.loadAsync(arrayBuffer)
  const files = new Map()

  const entries = Object.entries(zip.files)
  for (const [name, entry] of entries) {
    if (entry.dir) continue
    // Normalize path (some EPUBs use backslashes)
    const normalized = name.replace(/\\/g, '/')

    // Read as text for XML/HTML/CSS, blob for images
    const ext = normalized.split('.').pop()?.toLowerCase()
    if (['xml', 'html', 'xhtml', 'ncx', 'opf', 'css', 'txt'].includes(ext)) {
      const text = await entry.async('text')
      files.set(normalized, text)
    } else {
      const blob = await entry.async('blob')
      files.set(normalized, blob)
    }
  }

  return files
}
