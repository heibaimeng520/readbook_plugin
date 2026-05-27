let measureBox = null

export function createMeasureBox(styles) {
  if (!measureBox) {
    measureBox = document.createElement('div')
    measureBox.id = '__ereader_measure__'
    measureBox.style.cssText = `
      position: fixed;
      visibility: hidden;
      pointer-events: none;
      top: -9999px;
      left: -9999px;
      overflow: hidden;
      white-space: pre-wrap;
      word-wrap: break-word;
    `
    document.body.appendChild(measureBox)
  }
  Object.assign(measureBox.style, {
    width: styles.width + 'px',
    fontSize: styles.fontSize + 'px',
    fontFamily: styles.fontFamily,
    lineHeight: String(styles.lineHeight),
    padding: (styles.padding || 0) + 'px'
  })
  return measureBox
}

export function measureHeight(html) {
  if (!measureBox) return 0
  measureBox.innerHTML = html
  return measureBox.scrollHeight
}

export function destroyMeasureBox() {
  if (measureBox && measureBox.parentNode) {
    measureBox.parentNode.removeChild(measureBox)
    measureBox = null
  }
}
