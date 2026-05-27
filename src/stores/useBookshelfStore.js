import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { get, set } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'
import { loadBookFromFile } from '@/composables/useBookLoader'

export const useBookshelfStore = defineStore('bookshelf', () => {
  const books = ref([])
  const currentBookId = ref(null)
  const importStatus = ref('idle') // 'idle' | 'loading' | 'error'
  const importError = ref('')

  const currentBook = computed(() =>
    books.value.find(b => b.id === currentBookId.value) || null
  )

  function loadFromStorage() {
    const saved = get(STORAGE_KEYS.BOOKSHELF)
    if (saved && Array.isArray(saved)) {
      books.value = saved
    }
  }

  function persist() {
    const meta = books.value.map(b => ({
      id: b.id,
      title: b.title,
      author: b.author,
      coverUrl: b.coverUrl,
      fileType: b.fileType,
      fileSize: b.fileSize,
      totalChars: b.totalChars,
      addedAt: b.addedAt
    }))
    set(STORAGE_KEYS.BOOKSHELF, meta)
  }

  async function importBook(file) {
    importStatus.value = 'loading'
    importError.value = ''
    try {
      const book = await loadBookFromFile(file)
      const exists = books.value.find(b => b.id === book.id)
      if (exists) {
        Object.assign(exists, book)
      } else {
        books.value.unshift(book)
      }
      persist()
      importStatus.value = 'idle'
      return book
    } catch (e) {
      importStatus.value = 'error'
      importError.value = e.message || '导入失败'
      throw e
    }
  }

  function removeBook(bookId) {
    books.value = books.value.filter(b => b.id !== bookId)
    if (currentBookId.value === bookId) {
      currentBookId.value = null
    }
    persist()
  }

  function openBook(bookId) {
    currentBookId.value = bookId
  }

  function getBook(bookId) {
    return books.value.find(b => b.id === bookId) || null
  }

  loadFromStorage()

  return {
    books, currentBookId, importStatus, importError,
    currentBook,
    importBook, removeBook, openBook, getBook, persist
  }
})
