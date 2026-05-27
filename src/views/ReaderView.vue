<template>
  <div class="reader-layout" v-if="readerStore.isLoaded">
    <TopToolbar>
      <template #left>
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          书架
        </el-button>
        <el-divider direction="vertical" />
        <span class="book-title">{{ readerStore.bookMeta?.title || '' }}</span>
      </template>
      <template #right>
        <el-button text @click="handleAddBookmark">
          <el-icon><Star /></el-icon>
        </el-button>
        <FontSettings />
        <ThemeSettings />
        <BrightnessSlider />
        <CurlSettings />
        <el-divider direction="vertical" />
        <el-button text @click="toggleViewMode">
          {{ readerStore.viewMode === 'pagination' ? '滚动模式' : '分页模式' }}
        </el-button>
        <el-button text @click="toggleFullscreen">
          <el-icon><FullScreen /></el-icon>
        </el-button>
        <el-button text @click="toggleSidebar">
          <el-icon><Operation /></el-icon>
        </el-button>
      </template>
    </TopToolbar>

    <div class="reader-body">
      <SidebarPanel v-if="sidebarVisible" activeTab="toc">
        <TocTab />
        <BookmarkTab />
      </SidebarPanel>

      <ReaderContainer ref="readerContainerRef" />

      <div v-if="sidebarVisible" class="sidebar-spacer" />
    </div>
  </div>

  <div v-else class="reader-loading">
    <el-icon class="loading-icon" :size="48"><Loading /></el-icon>
    <p>加载中...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, FullScreen, Operation, Loading, Star } from '@element-plus/icons-vue'
import { useBookshelfStore } from '@/stores/useBookshelfStore'
import { useReaderStore } from '@/stores/useReaderStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useBookmarkStore } from '@/stores/useBookmarkStore'
import { useKeyboard } from '@/composables/useKeyboard'
import { useFullscreen } from '@/composables/useFullscreen'
import { useAutoSave } from '@/composables/useAutoSave'
import TopToolbar from '@/components/layout/TopToolbar.vue'
import SidebarPanel from '@/components/sidebar/SidebarPanel.vue'
import TocTab from '@/components/sidebar/TocTab.vue'
import BookmarkTab from '@/components/sidebar/BookmarkTab.vue'
import ReaderContainer from '@/components/reader/ReaderContainer.vue'
import FontSettings from '@/components/settings/FontSettings.vue'
import ThemeSettings from '@/components/settings/ThemeSettings.vue'
import BrightnessSlider from '@/components/settings/BrightnessSlider.vue'
import CurlSettings from '@/components/settings/CurlSettings.vue'

const route = useRoute()
const router = useRouter()
const bookshelfStore = useBookshelfStore()
const readerStore = useReaderStore()
const settingsStore = useSettingsStore()
const bookmarkStore = useBookmarkStore()

const sidebarVisible = ref(true)
const readerContainerRef = ref(null)

const { toggleFullscreen } = useFullscreen()
useKeyboard()
useAutoSave()

function toggleSidebar() {
  sidebarVisible.value = !sidebarVisible.value
}

function handleAddBookmark() {
  const page = readerStore.currentPage
  if (!page) return
  const exists = bookmarkStore.hasBookmark(readerStore.bookId, readerStore.currentPageIndex)
  if (exists) {
    const bm = bookmarkStore.getBookmarkAtPage(readerStore.bookId, readerStore.currentPageIndex)
    if (bm) bookmarkStore.removeBookmark(readerStore.bookId, bm.id)
  } else {
    const text = (page.textContent || '').substring(0, 80)
    bookmarkStore.addBookmark(
      readerStore.bookId,
      readerStore.currentPageIndex,
      readerStore.currentChapter?.title || '',
      text
    )
  }
}

function toggleViewMode() {
  const newMode = readerStore.viewMode === 'pagination' ? 'scroll' : 'pagination'
  readerStore.setViewMode(newMode)
  settingsStore.viewMode = newMode
}

function goBack() {
  readerStore.unload()
  router.push('/')
}

onMounted(() => {
  const bookId = route.params.bookId
  const book = bookshelfStore.getBook(bookId)
  if (!book) {
    router.push('/')
    return
  }
  bookshelfStore.openBook(bookId)
  if (!readerStore.isLoaded || readerStore.bookId !== bookId) {
    readerStore.loadBook(book)
  }
})

onUnmounted(() => {
  // Reading position saved by useAutoSave
})
</script>

<style scoped>
.reader-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary);
}
.reader-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.sidebar-spacer {
  width: 280px;
  flex-shrink: 0;
}
.book-title {
  font-size: 14px;
  color: var(--text-secondary);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.reader-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: var(--text-secondary);
  gap: 16px;
}
.loading-icon {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
