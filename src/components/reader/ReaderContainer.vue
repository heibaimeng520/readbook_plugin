<template>
  <div
    ref="containerRef"
    class="reader-container"
    :class="{ 'scroll-mode': isScrollMode }"
    @contextmenu.prevent
  >
    <!-- PAGINATION MODE: StPageFlip handles the two-page spread and animation -->
    <div
      v-if="!isScrollMode && hasPages"
      ref="flipContainerRef"
      class="flip-book-container"
    ></div>

    <!-- SCROLL MODE: Continuous scroll -->
    <div v-else-if="isScrollMode && hasPages" class="scroll-container" ref="scrollRef" @scroll="handleScroll">
      <div v-for="page in readerStore.pages" :key="page.index" class="scroll-page">
        <PageContentView :page="page" :width="scrollPageWidth" :height="scrollPageHeight" />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-reader">
      <p>暂无内容</p>
    </div>

    <ReadingProgress />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useReaderStore } from '@/stores/useReaderStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { usePagination } from '@/composables/usePagination'
import { useStPageFlip } from '@/composables/useStPageFlip'
import PageContentView from './PageContentView.vue'
import ReadingProgress from './ReadingProgress.vue'

const readerStore = useReaderStore()
const settingsStore = useSettingsStore()
const { rebuildPages } = usePagination()
const { init: initFlip, rebuild: rebuildFlip, flipForward, flipBackward, destroy: destroyFlip } = useStPageFlip()

const containerRef = ref(null)
const flipContainerRef = ref(null)
const scrollRef = ref(null)

const containerWidth = ref(0)
const containerHeight = ref(0)

const isScrollMode = computed(() => readerStore.viewMode === 'scroll')
const hasPages = computed(() => readerStore.pages.length > 0)

const pageWidth = computed(() => Math.floor((containerWidth.value - 2) / 2))
const pageHeight = computed(() => containerHeight.value - 32)
const scrollPageWidth = computed(() => Math.min(900, containerWidth.value - 80))
const scrollPageHeight = computed(() => containerHeight.value - 32)

function updateSize() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  containerWidth.value = rect.width
  containerHeight.value = rect.height - 32 // subtract progress bar
  triggerPagination()
}

let paginationTimer = null
function triggerPagination() {
  if (paginationTimer) clearTimeout(paginationTimer)
  paginationTimer = setTimeout(() => {
    if (readerStore.isLoaded && containerWidth.value > 100) {
      const singlePageW = Math.floor((containerWidth.value - 2) / 2)
      rebuildPages(singlePageW, containerHeight.value - 32)
    }
  }, 150)
}

// After pages are rebuilt, initialize or update StPageFlip
let flipInitialized = false
let flipInitPending = false

function initStPageFlip() {
  if (isScrollMode.value || !readerStore.pages.length) return
  if (containerWidth.value < 100) return
  if (flipInitPending) return

  flipInitPending = true
  nextTick(async () => {
    flipInitPending = false
    // flipContainerRef is only available after Vue renders the v-if block
    if (!flipContainerRef.value || isScrollMode.value) return

    if (flipInitialized) {
      rebuildFlip(flipContainerRef.value, readerStore.pages, pageWidth.value, pageHeight.value)
    } else {
      await initFlip(flipContainerRef.value, readerStore.pages, pageWidth.value, pageHeight.value)
      flipInitialized = true
    }
  })
}

// Watch for page rebuilds (triggered by font change, resize, or book load)
watch(() => readerStore.pages, () => {
  if (!isScrollMode.value) initStPageFlip()
}, { deep: false })

// Watch for book load
watch(() => readerStore.isLoaded, (loaded) => {
  if (loaded) triggerPagination()
})

// Watch for view mode switch — re-init flip when switching back to pagination
watch(() => readerStore.viewMode, (mode) => {
  if (mode === 'pagination' && readerStore.pages.length > 0 && !flipInitialized) {
    initStPageFlip()
  }
})

// Watch for font/theme changes that need re-pagination
watch(
  () => [settingsStore.fontSize, settingsStore.fontFamily,
         settingsStore.lineHeight, settingsStore.pageMargin],
  () => triggerPagination()
)

let resizeObserver = null

onMounted(() => {
  updateSize()

  resizeObserver = new ResizeObserver(() => {
    updateSize()
    // updateSize triggers pagination, which triggers page watch, which calls initStPageFlip
  })
  resizeObserver.observe(containerRef.value)

  // Keyboard-driven page flip events
  window.addEventListener('ereader:flip-forward', onKeyboardFlipForward)
  window.addEventListener('ereader:flip-backward', onKeyboardFlipBackward)
})

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
  if (flipInitialized) {
    destroyFlip()
    flipInitialized = false
  }
  window.removeEventListener('ereader:flip-forward', onKeyboardFlipForward)
  window.removeEventListener('ereader:flip-backward', onKeyboardFlipBackward)
})

function onKeyboardFlipForward() {
  if (!isScrollMode.value) flipForward()
}

function onKeyboardFlipBackward() {
  if (!isScrollMode.value) flipBackward()
}

function handleScroll() {
  if (!scrollRef.value) return
  const el = scrollRef.value
  const scrollRatio = el.scrollTop / (el.scrollHeight - el.clientHeight)
  const pageIdx = Math.floor(scrollRatio * (readerStore.totalPages - 1))
  if (pageIdx >= 0 && pageIdx !== readerStore.currentPageIndex) {
    readerStore.currentPageIndex = pageIdx
  }
}

defineExpose({ containerRef })
</script>

<style scoped>
.reader-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-secondary);
  position: relative;
}

/* StPageFlip container — fills the available space */
.flip-book-container {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* StPageFlip internal page content styling */
.flip-book-container :deep(.stf__item) {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

/* Scroll mode */
.scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.scroll-page {
  width: 100%;
  max-width: 900px;
  min-height: 100%;
  display: flex;
  justify-content: center;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.empty-reader {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}
</style>
