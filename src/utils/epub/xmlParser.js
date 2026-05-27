/**
 * Parse an XML string into a DOM Document.
 * @param {string} xmlString
 * @returns {Document}
 */
export function parseXml(xmlString) {
  const parser = new DOMParser()
  return parser.parseFromString(xmlString, 'application/xml')
}

/**
 * Get text content of the first element matching a tag name.
 * @param {Element} parent
 * @param {string} tagName
 * @returns {string}
 */
export function getElementText(parent, tagName) {
  const el = parent.getElementsByTagName(tagName)[0]
  return el ? el.textContent?.trim() || '' : ''
}

/**
 * Query an element by tag name within a namespace.
 * @param {Element} parent
 * @param {string} ns — namespace URI
 * @param {string} tagName
 * @returns {Element|null}
 */
export function queryNS(parent, ns, tagName) {
  const elements = parent.getElementsByTagNameNS(ns, tagName)
  return elements[0] || null
}
