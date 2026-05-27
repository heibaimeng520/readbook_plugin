import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { get, set } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'

let idCounter = Date.now()

export const useBookmarkStore = defineStore('bookmarks', () => {
  const bookmarksByBook = ref({})

  function loadFromStorage() {
    const saved = get(STORAGE_KEYS.BOOKMARKS)
    if (saved) bookmarksByBook.value = saved
  }

  function persist() {
    set(STORAGE_KEYS.BOOKMARKS, bookmarksByBook.value)
  }

  function getBookmarks(bookId) {
    return bookmarksByBook.value[bookId] || []
  }

  function addBookmark(bookId, pageIndex, chapterTitle, textExcerpt, note) {
    if (!bookmarksByBook.value[bookId]) {
      bookmarksByBook.value[bookId] = []
    }
    const exists = bookmarksByBook.value[bookId].find(b => b.pageIndex === pageIndex)
    if (exists) return exists

    const bookmark = {
      id: 'bm_' + (idCounter++),
      bookId,
      pageIndex,
      chapterTitle: chapterTitle || '',
      textExcerpt: textExcerpt || '',
      note: note || '',
      createdAt: Date.now()
    }
    bookmarksByBook.value[bookId].push(bookmark)
    persist()
    return bookmark
  }

  function removeBookmark(bookId, bookmarkId) {
    if (!bookmarksByBook.value[bookId]) return
    bookmarksByBook.value[bookId] = bookmarksByBook.value[bookId].filter(b => b.id !== bookmarkId)
    persist()
  }

  function hasBookmark(bookId, pageIndex) {
    const list = bookmarksByBook.value[bookId] || []
    return list.some(b => b.pageIndex === pageIndex)
  }

  function getBookmarkAtPage(bookId, pageIndex) {
    const list = bookmarksByBook.value[bookId] || []
    return list.find(b => b.pageIndex === pageIndex) || null
  }

  loadFromStorage()

  return {
    bookmarksByBook,
    getBookmarks, addBookmark, removeBookmark, hasBookmark, getBookmarkAtPage
  }
})
