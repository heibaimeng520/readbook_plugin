import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'

export const useReaderStore = defineStore('reader', () => {
  const bookId = ref(null)
  const bookMeta = ref(null)
  const chapters = ref([])
  const pages = shallowRef([])
  const currentPageIndex = ref(0)
  const viewMode = ref('pagination')
  const isPageTurning = ref(false)
  const isLoaded = ref(false)

  const currentPage = computed(() => pages.value[currentPageIndex.value] || null)

  const totalPages = computed(() => pages.value.length)

  const currentChapter = computed(() => {
    const page = currentPage.value
    if (!page) return null
    return chapters.value.find(c => c.id === page.chapterId) || null
  })

  const progress = computed(() => {
    if (totalPages.value === 0) return 0
    return currentPageIndex.value / totalPages.value
  })

  const currentSpread = computed(() => {
    const left = pages.value[currentPageIndex.value]
    const right = pages.value[currentPageIndex.value + 1]
    return { left: left || null, right: right || null }
  })

  function loadBook(book) {
    bookId.value = book.id
    bookMeta.value = book
    chapters.value = book.chapters || []
    pages.value = book.pages || []
    currentPageIndex.value = 0
    isLoaded.value = true
  }

  function setPages(newPages) {
    pages.value = newPages
  }

  function goToPage(index) {
    if (index < 0) index = 0
    if (index >= totalPages.value) index = Math.max(0, totalPages.value - 1)
    // Ensure even index for two-page spread in pagination mode
    if (viewMode.value === 'pagination' && index % 2 !== 0) {
      index = Math.max(0, index - 1)
    }
    currentPageIndex.value = index
  }

  function nextPage() {
    if (viewMode.value === 'pagination') {
      goToPage(currentPageIndex.value + 2)
    } else {
      goToPage(currentPageIndex.value + 1)
    }
  }

  function prevPage() {
    if (viewMode.value === 'pagination') {
      goToPage(currentPageIndex.value - 2)
    } else {
      goToPage(currentPageIndex.value - 1)
    }
  }

  function goToChapter(chapterId) {
    const idx = pages.value.findIndex(p => p.chapterId === chapterId)
    if (idx >= 0) goToPage(idx)
  }

  function setViewMode(mode) {
    viewMode.value = mode
    // Align page index for the new mode
    if (mode === 'pagination' && currentPageIndex.value % 2 !== 0) {
      currentPageIndex.value = Math.max(0, currentPageIndex.value - 1)
    }
  }

  function unload() {
    bookId.value = null
    bookMeta.value = null
    chapters.value = []
    pages.value = []
    currentPageIndex.value = 0
    isLoaded.value = false
  }

  return {
    bookId, bookMeta, chapters, pages, currentPageIndex, viewMode,
    isPageTurning, isLoaded,
    currentPage, totalPages, currentChapter, progress, currentSpread,
    loadBook, setPages, goToPage, nextPage, prevPage, goToChapter, setViewMode, unload
  }
})
