<template>
  <div class="page-content" :style="pageStyle" v-html="sanitizedHtml"></div>
</template>

<script setup>
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/useSettingsStore'

const props = defineProps({
  page: { type: Object, default: null },
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 }
})

const settingsStore = useSettingsStore()

const pageStyle = computed(() => ({
  fontFamily: settingsStore.fontFamily,
  fontSize: settingsStore.fontSize + 'px',
  lineHeight: settingsStore.lineHeight,
  width: props.width ? props.width + 'px' : '100%',
  height: props.height ? props.height + 'px' : '100%',
  padding: `${settingsStore.pageMargin * 0.12}px ${settingsStore.pageMargin}px`
}))

const sanitizedHtml = computed(() => {
  if (!props.page) return ''
  return props.page.htmlContent || props.page.textContent || ''
})
</script>

<style scoped>
.page-content {
  overflow: hidden;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-wrap: break-word;
  text-align: justify;
}
.page-content :deep(h1),
.page-content :deep(h2),
.page-content :deep(h3) {
  margin: 0.5em 0;
  font-weight: 600;
  line-height: 1.4;
}
.page-content :deep(p) {
  margin: 0;
  text-indent: 2em;
}
.page-content :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 8px auto;
}
</style>
