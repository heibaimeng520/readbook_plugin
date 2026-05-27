import { watch } from 'vue'
import { useReaderStore } from '@/stores/useReaderStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { get, set } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'

let saveTimer = null

export function useAutoSave() {
  const readerStore = useReaderStore()
  const settingsStore = useSettingsStore()

  function debouncedSave() {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      if (!readerStore.bookId) return

      // Save reading position
      const progress = get(STORAGE_KEYS.PROGRESS) || {}
      progress[readerStore.bookId] = {
        pageIndex: readerStore.currentPageIndex,
        chapterId: readerStore.currentChapter?.id || '',
        progress: readerStore.progress,
        timestamp: Date.now()
      }
      set(STORAGE_KEYS.PROGRESS, progress)

      // Update reading history
      const history = get(STORAGE_KEYS.HISTORY) || []
      const existing = history.findIndex(h => h.bookId === readerStore.bookId)
      if (existing >= 0) {
        history[existing].lastReadAt = Date.now()
        history[existing].pageIndex = readerStore.currentPageIndex
      } else {
        history.unshift({
          bookId: readerStore.bookId,
          lastReadAt: Date.now(),
          pageIndex: readerStore.currentPageIndex
        })
      }
      set(STORAGE_KEYS.HISTORY, history.slice(0, 50))
    }, 800)
  }

  // Auto-save on page change
  watch(() => readerStore.currentPageIndex, () => {
    debouncedSave()
  })

  // Settings are auto-persisted by the store itself
}
