<template>
  <div class="book-cover" :class="[`size-${size}`]">
    <img v-if="book.coverUrl" :src="book.coverUrl" alt="" class="cover-img" />
    <div v-else class="cover-placeholder">
      <span class="cover-title">{{ book.title?.charAt(0) || '书' }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  book: { type: Object, required: true },
  size: { type: String, default: 'medium' }
})
</script>

<style scoped>
.book-cover {
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.size-small { width: 40px; height: 56px; }
.size-medium { width: 80px; height: 112px; }
.size-large { width: 140px; height: 196px; }
.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cover-title {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}
.size-small .cover-title { font-size: 14px; }
.size-large .cover-title { font-size: 36px; }
</style>
