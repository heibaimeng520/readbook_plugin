<template>
  <div class="reading-progress">
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>
    <div class="progress-info">
      <span>{{ currentLabel }}</span>
      <span>{{ pageLabel }}</span>
      <span>{{ percentLabel }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useReaderStore } from '@/stores/useReaderStore'

const readerStore = useReaderStore()

const progressPercent = computed(() => Math.round(readerStore.progress * 100))
const pageLabel = computed(() => `第${readerStore.currentPageIndex + 1}/${readerStore.totalPages}页`)
const percentLabel = computed(() => `${progressPercent.value}%`)
const currentLabel = computed(() => readerStore.currentChapter?.title || '')
</script>

<style scoped>
.reading-progress {
  height: 32px;
  flex-shrink: 0;
  border-top: 1px solid var(--border-color);
  background: var(--toolbar-bg);
}
.progress-bar {
  height: 2px;
  background: var(--border-color);
}
.progress-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.3s;
}
.progress-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 16px;
  font-size: 11px;
  color: var(--text-muted);
}
</style>
