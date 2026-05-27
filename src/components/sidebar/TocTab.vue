<template>
  <div class="toc-tab">
    <div v-if="chapters.length === 0" class="empty-hint">暂无目录</div>
    <div
      v-for="chapter in chapters"
      :key="chapter.id"
      class="toc-item"
      :class="{ active: currentChapter?.id === chapter.id }"
      :style="{ paddingLeft: (12 + (chapter.level - 1) * 16) + 'px' }"
      @click="jumpTo(chapter.id)"
    >
      <span class="toc-title">{{ chapter.title }}</span>
      <span class="toc-page">第{{ getChapterPage(chapter) }}页</span>
    </div>
  </div>
</template>

<script setup>
import { useReaderStore } from '@/stores/useReaderStore'

const readerStore = useReaderStore()
const chapters = readerStore.chapters || []

const currentChapter = readerStore.currentChapter

function getChapterPage(chapter) {
  const idx = readerStore.pages.findIndex(p => p.chapterId === chapter.id)
  return idx >= 0 ? idx + 1 : '?'
}

function jumpTo(chapterId) {
  readerStore.goToChapter(chapterId)
}
</script>

<style scoped>
.toc-tab {
  padding: 4px 0;
}
.toc-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary);
  transition: background 0.15s;
}
.toc-item:hover {
  background: var(--bg-primary);
}
.toc-item.active {
  color: var(--accent);
  background: rgba(64, 158, 255, 0.06);
}
.toc-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.toc-page {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: 8px;
  flex-shrink: 0;
}
.empty-hint {
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
  font-size: 14px;
}
</style>
