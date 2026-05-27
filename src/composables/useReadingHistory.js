import { get, set } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'

export function useReadingHistory() {
  function getHistory() {
    return get(STORAGE_KEYS.HISTORY) || []
  }

  function getProgress(bookId) {
    const progress = get(STORAGE_KEYS.PROGRESS) || {}
    return progress[bookId] || null
  }

  function getRecentBooks(limit = 10) {
    const history = getHistory()
    return history.slice(0, limit)
  }

  function clearHistory() {
    set(STORAGE_KEYS.HISTORY, [])
  }

  return { getHistory, getProgress, getRecentBooks, clearHistory }
}
