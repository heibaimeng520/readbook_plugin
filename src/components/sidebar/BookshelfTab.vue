<template>
  <div class="bookshelf-tab">
    <div v-if="historyBooks.length > 0" class="section">
      <div class="section-title">继续阅读</div>
      <div v-for="item in historyBooks" :key="item.book.id" class="book-item" @click="openReader(item.book.id)">
        <BookCover :book="item.book" size="small" />
        <div class="book-info">
          <div class="book-name">{{ item.book.title }}</div>
          <div class="book-progress">进度 {{ Math.round(item.progress * 100) }}%</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">全部书籍 ({{ books.length }})</div>
      <div v-if="books.length === 0" class="empty-hint">
        <p>还没有导入书籍</p>
        <el-button type="primary" size="small" @click="$emit('import')">导入书籍</el-button>
      </div>
      <div v-for="book in books" :key="book.id" class="book-item" @click="openReader(book.id)">
        <BookCover :book="book" size="small" />
        <div class="book-info">
          <div class="book-name">{{ book.title }}</div>
          <div class="book-meta">{{ book.author || '未知作者' }} · {{ book.fileType.toUpperCase() }}</div>
        </div>
        <el-button text type="danger" size="small" @click.stop="handleRemove(book.id)">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Delete } from '@element-plus/icons-vue'
import { useBookshelfStore } from '@/stores/useBookshelfStore'
import { get } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'
import BookCover from '@/components/common/BookCover.vue'

defineEmits(['import'])
const router = useRouter()
const bookshelfStore = useBookshelfStore()

const books = computed(() => bookshelfStore.books)

const historyBooks = computed(() => {
  const progress = get(STORAGE_KEYS.PROGRESS) || {}
  const history = get(STORAGE_KEYS.HISTORY) || []
  return history
    .filter(h => bookshelfStore.getBook(h.bookId))
    .slice(0, 5)
    .map(h => ({
      book: bookshelfStore.getBook(h.bookId),
      progress: progress[h.bookId]?.progress || 0
    }))
})

function openReader(bookId) {
  router.push(`/reader/${bookId}`)
}

function handleRemove(bookId) {
  bookshelfStore.removeBook(bookId)
}
</script>

<style scoped>
.bookshelf-tab {
  padding: 8px 0;
}
.section {
  margin-bottom: 8px;
}
.section-title {
  padding: 8px 16px;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}
.book-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  gap: 12px;
  transition: background 0.15s;
}
.book-item:hover {
  background: var(--bg-primary);
}
.book-info {
  flex: 1;
  min-width: 0;
}
.book-name {
  font-size: 14px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.book-meta,
.book-progress {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}
.empty-hint {
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
}
</style>
