<template>
  <div class="bookmark-tab">
    <div v-if="bookmarks.length === 0" class="empty-hint">暂无书签</div>
    <div v-for="bm in bookmarks" :key="bm.id" class="bookmark-item" @click="jumpTo(bm.pageIndex)">
      <div class="bm-header">
        <span class="bm-page">第{{ bm.pageIndex + 1 }}页</span>
        <span class="bm-chapter">{{ bm.chapterTitle }}</span>
        <el-button text size="small" type="danger" @click.stop="remove(bm.id)">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
      <div class="bm-excerpt" v-if="bm.textExcerpt">{{ bm.textExcerpt }}</div>
      <div class="bm-note" v-if="bm.note">{{ bm.note }}</div>
      <div class="bm-time">{{ formatTime(bm.createdAt) }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { useReaderStore } from '@/stores/useReaderStore'
import { useBookmarkStore } from '@/stores/useBookmarkStore'

const readerStore = useReaderStore()
const bookmarkStore = useBookmarkStore()

const bookmarks = computed(() => {
  if (!readerStore.bookId) return []
  return (bookmarkStore.bookmarksByBook[readerStore.bookId] || []).slice().reverse()
})

function jumpTo(pageIndex) {
  readerStore.goToPage(pageIndex)
}

function remove(bookmarkId) {
  bookmarkStore.removeBookmark(readerStore.bookId, bookmarkId)
}

function formatTime(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}
</script>

<style scoped>
.bookmark-tab { padding: 4px 0; }
.bookmark-item {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background 0.15s;
}
.bookmark-item:hover { background: var(--bg-primary); }
.bm-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.bm-page { font-size: 13px; color: var(--accent); font-weight: 500; }
.bm-chapter { font-size: 12px; color: var(--text-muted); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bm-excerpt { font-size: 13px; color: var(--text-secondary); margin: 4px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bm-note { font-size: 12px; color: var(--accent); margin: 2px 0; }
.bm-time { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
.empty-hint { text-align: center; padding: 24px; color: var(--text-muted); font-size: 14px; }
</style>
