import '@/assets/stPageFlip.css'
import { useReaderStore } from '@/stores/useReaderStore'
import { useSettingsStore } from '@/stores/useSettingsStore'

// StPageFlip is loaded dynamically because Vite's CJS pre-bundling diverges
// between dev (static import → undefined) and build (static import works).
let PageFlip = null

async function ensurePageFlip() {
  if (PageFlip) return PageFlip
  const mod = await import('page-flip')
  PageFlip = mod?.default?.PageFlip || mod?.PageFlip
  if (!PageFlip) {
    throw new Error('Cannot resolve PageFlip class')
  }
  return PageFlip
}

let pageFlip = null
let outerContainer = null

export function useStPageFlip() {
  const readerStore = useReaderStore()
  const settingsStore = useSettingsStore()

  function buildPageElements(pages) {
    const margin = settingsStore.pageMargin
    return pages.map((page) => {
      // Outer div — owned by StPageFlip (overwrites style.cssText each frame)
      const outer = document.createElement('div')

      // Inner div — content styling lives here, safe from StPageFlip
      const inner = document.createElement('div')
      inner.style.cssText = [
        `padding: ${margin * 0.12}px ${margin}px`,
        `font-size: ${settingsStore.fontSize}px`,
        `font-family: ${settingsStore.fontFamily}`,
        `line-height: ${settingsStore.lineHeight}`,
        'width: 100%',
        'height: 100%',
        'overflow: hidden',
        'white-space: pre-wrap',
        'word-wrap: break-word',
        'text-align: justify',
        'color: var(--text-primary)',
        'background: var(--bg-secondary)',
        'box-sizing: border-box',
      ].join(';')
      inner.innerHTML = page.htmlContent || page.textContent || ''

      outer.appendChild(inner)
      return outer
    })
  }

  async function init(container, pages, pageWidth, pageHeight, startIndex = 0) {
    if (!container || !pages?.length) return null

    const pw = Math.floor(pageWidth)
    const ph = Math.floor(pageHeight)
    if (pw <= 0 || ph <= 0) return null

    destroy()

    outerContainer = container

    // Inner wrapper absorbs StPageFlip's this.block.remove() on destroy()
    const inner = document.createElement('div')
    inner.className = 'flip-book-inner'
    container.appendChild(inner)

    const startPage = Math.max(0, Math.floor(startIndex / 2) * 2)

    try {
      const PF = await ensurePageFlip()

      pageFlip = new PF(inner, {
        size: 'fixed',
        width: pw,
        height: ph,
        drawShadow: true,
        flippingTime: Math.round(settingsStore.curlSpeed * 1000),
        usePortrait: false,
        startZIndex: 0,
        autoSize: false,
        maxShadowOpacity: settingsStore.shadowDepth,
        showCover: false,
        mobileScrollSupport: false,
        showPageCorners: true,
        disableFlipByClick: false,
        clickEventForward: true,
        useMouseEvents: true,
        swipeDistance: 30,
        startPage,
      })

      const pageElements = buildPageElements(pages)
      pageFlip.loadFromHTML(pageElements)

      pageFlip.on('flip', (e) => {
        const newIdx = e.data
        if (newIdx !== readerStore.currentPageIndex) {
          readerStore.currentPageIndex = newIdx
        }
      })

      return pageFlip
    } catch (err) {
      console.error('[StPageFlip] init failed:', err)
      destroy()
      return null
    }
  }

  function rebuild(container, pages, pageWidth, pageHeight) {
    outerContainer = container
    const currentIdx = readerStore.currentPageIndex
    return init(container, pages, pageWidth, pageHeight, currentIdx)
  }

  function flipForward() {
    if (!pageFlip || readerStore.currentPageIndex + 2 >= readerStore.totalPages) return
    pageFlip.flipNext()
  }

  function flipBackward() {
    if (!pageFlip || readerStore.currentPageIndex <= 0) return
    pageFlip.flipPrev()
  }

  function destroy() {
    if (pageFlip) {
      pageFlip.destroy()
      pageFlip = null
    }
    if (outerContainer) {
      const orphans = outerContainer.querySelectorAll('.flip-book-inner')
      orphans.forEach((el) => el.remove())
    }
    outerContainer = null
  }

  return { init, rebuild, flipForward, flipBackward, destroy }
}
