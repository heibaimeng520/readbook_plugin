import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content from an EPUB file.
 * Strips scripts, event handlers, and unsafe elements.
 * @param {string} html
 * @returns {string} clean HTML
 */
export function sanitizeHtml(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'div', 'span', 'br', 'hr',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'b', 'i', 'em', 'strong', 'u', 's', 'sub', 'sup', 'small', 'mark',
      'ul', 'ol', 'li', 'dl', 'dt', 'dd',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
      'blockquote', 'pre', 'code', 'a',
      'img', 'figure', 'figcaption',
      'section', 'article', 'nav', 'header', 'footer', 'main', 'aside'
    ],
    ALLOWED_ATTR: [
      'src', 'alt', 'title', 'href', 'class', 'id', 'style',
      'width', 'height', 'colspan', 'rowspan'
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    ADD_TAGS: [],
    WHOLE_DOCUMENT: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false
  })
}
