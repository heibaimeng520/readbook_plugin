import { watch, computed } from 'vue'
import { useReaderStore } from '@/stores/useReaderStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { PaginationEngine } from '@/engine/PaginationEngine'

const engine = new PaginationEngine()

export function usePagination() {
  const readerStore = useReaderStore()
  const settingsStore = useSettingsStore()

  const layoutSettings = computed(() => ({
    fontSize: settingsStore.fontSize,
    fontFamily: settingsStore.fontFamily,
    lineHeight: settingsStore.lineHeight,
    pageMargin: settingsStore.pageMargin
  }))

  async function rebuildPages(containerWidth, containerHeight) {
    if (!readerStore.isLoaded) return
    if (!readerStore.chapters || readerStore.chapters.length === 0) return

    const allPages = []
    let pos = 0

    for (const chapter of readerStore.chapters) {
      const htmlContent = chapter.htmlContent || ''
      if (!htmlContent) {
        pos += 0
        continue
      }

      const chapterPages = engine.paginateChapter(
        htmlContent,
        layoutSettings.value,
        { width: containerWidth, height: containerHeight },
        pos,
        chapter.id
      )

      chapterPages.forEach(p => {
        p.index = allPages.length
      })
      allPages.push(...chapterPages)
      pos += htmlContent.length
    }

    const savedPage = readerStore.currentPageIndex
    readerStore.setPages(allPages)

    // Try to stay near the previous page
    if (savedPage < allPages.length) {
      readerStore.goToPage(savedPage)
    }
  }

  function handleResize(containerWidth, containerHeight) {
    if (containerWidth < 200 || containerHeight < 100) return
    rebuildPages(containerWidth, containerHeight)
  }

  // Rebuild when layout settings change
  watch(layoutSettings, () => {
    // Triggered from ReaderContainer which knows container size
    engine.clearCache()
  }, { deep: true })

  return { rebuildPages: handleResize, clearCache: () => engine.clearCache() }
}
