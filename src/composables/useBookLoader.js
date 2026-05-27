import { parseEpub } from '@/parsers/epubParser'
import { parseTxt } from '@/parsers/txtParser'

/**
 * Load a book from a File object. Detects type, parses content,
 * and returns a Book object.
 * @param {File} file
 * @returns {Promise<Object>} book object
 */
export async function loadBookFromFile(file) {
  const name = file.name || ''
  const ext = name.split('.').pop().toLowerCase()

  const arrayBuffer = await file.arrayBuffer()
  const fileSize = file.size

  let result

  if (ext === 'epub') {
    result = await parseEpub(arrayBuffer, name)
  } else if (ext === 'txt') {
    result = await parseTxt(arrayBuffer, name)
  } else {
    throw new Error(`不支持的文件格式: .${ext}`)
  }

  const bookId = generateBookId(name, fileSize)

  return {
    id: bookId,
    title: result.title || name.replace(/\.[^.]+$/, ''),
    author: result.author || '未知作者',
    coverUrl: result.coverUrl || null,
    fileType: ext,
    fileSize,
    fileData: arrayBuffer,
    totalChars: result.totalChars || 0,
    chapters: result.chapters || [],
    pages: [],  // will be populated by pagination engine
    addedAt: Date.now()
  }
}

function generateBookId(name, size) {
  let hash = 0
  const str = name + size
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return 'book_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36)
}
