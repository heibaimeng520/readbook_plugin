import { createMeasureBox, measureHeight, destroyMeasureBox } from '@/utils/domMeasure'

export class PaginationEngine {
  constructor() {
    this.cache = new Map()
  }

  /**
   * Paginate a single chapter's HTML content into pages.
   * @param {string} htmlContent — sanitized HTML
   * @param {object} settings — { fontSize, fontFamily, lineHeight, pageMargin }
   * @param {object} containerSize — { width, height }
   * @param {number} startCharIndex — offset into the full book text
   * @param {string} chapterId — for page metadata
   * @returns {Array<{chapterId, startCharIndex, endCharIndex, htmlContent, index}>}
   */
  paginateChapter(htmlContent, settings, containerSize, startCharIndex = 0, chapterId = '') {
    const pageWidth = containerSize.width - settings.pageMargin * 2
    const pageHeight = containerSize.height - settings.pageMargin * 0.12 * 2
    const cacheKey = `${chapterId}|${settings.fontSize}|${settings.fontFamily}|${settings.lineHeight}|${pageWidth}|${pageHeight}`

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      return cached.map((p, i) => ({ ...p, index: i + startCharIndex }))
    }

    const measureBox = createMeasureBox({
      width: pageWidth,
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      lineHeight: settings.lineHeight,
      padding: 0
    })

    const pages = []
    const textLength = htmlContent.length
    let pos = 0
    let pageNum = 0

    while (pos < textLength && pageNum < 10000) {
      // Binary search for the right amount of content that fits
      let low = pos + 1
      let high = textLength
      let best = pos

      while (low <= high) {
        const mid = Math.floor((low + high) / 2)
        const testHtml = `<div style="width:${pageWidth}px;font-size:${settings.fontSize}px;font-family:${settings.fontFamily};line-height:${settings.lineHeight};white-space:pre-wrap;word-wrap:break-word;">${htmlContent.substring(pos, mid)}</div>`

        if (measureHeight(testHtml) <= pageHeight) {
          best = mid
          low = mid + 1
        } else {
          high = mid - 1
        }
      }

      if (best === pos) {
        // Couldn't even fit one character — force at least one
        best = pos + 1
      }

      // Word boundary adjustment for non-CJK text
      best = this._adjustToWordBoundary(htmlContent, pos, best)

      const pageHtml = htmlContent.substring(pos, best)
      pages.push({
        chapterId,
        startCharIndex: pos + startCharIndex,
        endCharIndex: best + startCharIndex,
        htmlContent: pageHtml,
        textContent: pageHtml.replace(/<[^>]+>/g, ''),
        index: pages.length
      })

      pos = best
      pageNum++
    }

    this.cache.set(cacheKey, pages)
    return pages
  }

  _adjustToWordBoundary(text, start, end) {
    if (end <= start + 1 || end >= text.length) return end
    const char = text[end - 1]
    // CJK characters can break anywhere (covers full CJK Unified Ideographs range)
    if (/[一-鿿㐀-䶿豈-﫿]/.test(char)) return end
    // For Latin text, try to break at word boundary
    if (/[a-zA-Z0-9]/.test(char)) {
      for (let i = end - 1; i > start; i--) {
        if (/[\s,.;:!?)\]}>"']/.test(text[i])) {
          return i + 1
        }
      }
    }
    return end
  }

  clearCache() {
    this.cache.clear()
  }
}
