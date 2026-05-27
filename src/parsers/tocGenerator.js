import { CHAPTER_PATTERN } from '@/utils/constants'

/**
 * Generate TOC from plain text lines or from HTML content.
 * @param {string[]} lines — for TXT: array of text lines
 * @returns {Array<{id, title, level, htmlContent, textContent, charStart}>}
 */
export function generateToc(lines) {
  const chapters = []
  let currentContent = []
  let currentTitle = '开始'
  let charOffset = 0
  let id = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Check if this line is a chapter heading
    const isHeading = isChapterHeading(line)

    if (isHeading && currentContent.length > 0) {
      // Save previous chapter
      const htmlContent = currentContent.join('\n')
      const textContent = currentContent.join('')
      chapters.push({
        id: `ch_${id++}`,
        title: currentTitle,
        level: 1,
        htmlContent: escapeHtml(htmlContent),
        textContent,
        charStart: charOffset
      })
      charOffset += textContent.length
      currentContent = []
    }

    if (isHeading) {
      currentTitle = line
    }

    currentContent.push(line)
  }

  // Save the last chapter
  if (currentContent.length > 0) {
    const textContent = currentContent.join('')
    chapters.push({
      id: `ch_${id++}`,
      title: currentTitle,
      level: 1,
      htmlContent: escapeHtml(currentContent.join('\n')),
      textContent,
      charStart: charOffset
    })
  }

  // If only one "chapter" (no headings found), split by blank lines
  // into reasonable sections
  if (chapters.length <= 1 && lines.length > 100) {
    return splitByBlankLines(lines)
  }

  return chapters
}

function isChapterHeading(line) {
  if (!line || line.length > 80) return false
  return CHAPTER_PATTERN.test(line)
}

function splitByBlankLines(lines) {
  const chapters = []
  let currentContent = []
  let charOffset = 0
  let id = 0
  let sectionNum = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.trim() === '' && currentContent.length > 20) {
      const htmlContent = currentContent.join('\n')
      const textContent = currentContent.join('')
      sectionNum++
      chapters.push({
        id: `ch_${id++}`,
        title: `第${sectionNum}节`,
        level: 1,
        htmlContent: escapeHtml(htmlContent),
        textContent,
        charStart: charOffset
      })
      charOffset += textContent.length
      currentContent = []
    } else {
      currentContent.push(line)
    }
  }

  if (currentContent.length > 0) {
    sectionNum++
    const textContent = currentContent.join('')
    chapters.push({
      id: `ch_${id++}`,
      title: `第${sectionNum}节`,
      level: 1,
      htmlContent: escapeHtml(currentContent.join('\n')),
      textContent,
      charStart: charOffset
    })
  }

  return chapters
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
