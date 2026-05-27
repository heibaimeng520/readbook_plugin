import { generateToc } from './tocGenerator'

/**
 * Parse a TXT file from its ArrayBuffer.
 * Handles charset detection, line normalization, and chapter detection.
 * @param {ArrayBuffer} arrayBuffer
 * @param {string} filename
 * @returns {Promise<{title, author, chapters, totalChars}>}
 */
export async function parseTxt(arrayBuffer, filename) {
  // Detect encoding
  const encoding = detectEncoding(arrayBuffer)
  const decoder = new TextDecoder(encoding)
  const text = decoder.decode(arrayBuffer)

  // Normalize line endings
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')

  // Split into lines for chapter detection
  const lines = normalized.split('\n')

  // Detect chapters using regex patterns
  const chapters = generateToc(lines)
  const title = filename.replace(/\.\w+$/i, '')

  return {
    title,
    author: '',
    coverUrl: null,
    chapters,
    totalChars: normalized.length
  }
}

function detectEncoding(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer)
  const totalSize = bytes.length

  // BOM detection — definitive answer
  if (totalSize >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
    return 'utf-8'
  }
  if (totalSize >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) {
    return 'utf-16le'
  }
  if (totalSize >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
    return 'utf-16be'
  }

  // No BOM — must infer encoding from byte patterns

  // Check if there are GBK-style double-byte sequences
  // GBK lead bytes: 0x81-0xFE, trail bytes: 0x40-0xFE
  const hasGbkPattern = scanGbkPattern(bytes)

  // Try UTF-8 on the ENTIRE content (not just first 1024 bytes)
  let utf8Works = false
  let utf8Text = ''
  try {
    utf8Text = new TextDecoder('utf-8', { fatal: true }).decode(arrayBuffer)
    utf8Works = !utf8Text.includes('�')
  } catch {
    utf8Works = false
  }

  if (utf8Works) {
    // UTF-8 decoded cleanly, but verify: if the file has high bytes
    // typical of Chinese text, make sure common Chinese characters appear
    if (hasGbkPattern && !hasCommonChineseChars(utf8Text)) {
      // Looks like Chinese bytes but UTF-8 produced no Chinese →
      // it's a GBK file that happened to be valid UTF-8 by coincidence
      // (unlikely but possible with short/synthetic files)
      if (tryGbk(arrayBuffer)) return 'gbk'
    }
    return 'utf-8'
  }

  // UTF-8 failed — try GBK
  if (tryGbk(arrayBuffer)) return 'gbk'

  // Last resort: UTF-8 with replacement characters
  return 'utf-8'
}

function scanGbkPattern(bytes) {
  const len = bytes.length
  let leadByteCount = 0
  for (let i = 0; i < len - 1; i++) {
    if (bytes[i] >= 0x81 && bytes[i] <= 0xFE &&
        bytes[i + 1] >= 0x40 && bytes[i + 1] <= 0xFE) {
      leadByteCount++
      i++ // skip trail byte
    }
  }
  // If >2% of bytes are GBK lead bytes, it's likely a CJK file
  return leadByteCount > len * 0.02
}

function hasCommonChineseChars(text) {
  const sample = text.substring(0, Math.min(text.length, 3000))
  const matches = sample.match(/[一-鿿]/g)
  return matches !== null && matches.length >= 3
}

function tryGbk(arrayBuffer) {
  try {
    const text = new TextDecoder('gbk').decode(arrayBuffer)
    return !text.includes('�')
  } catch {
    return false
  }
}
