<template>
  <div class="top-toolbar">
    <div class="toolbar-left">
      <slot name="left" />
    </div>
    <div class="toolbar-right">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.top-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  background: var(--toolbar-bg);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  z-index: 100;
}
.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}
.top-toolbar :deep(.el-divider--vertical) {
  height: 20px;
  margin: 0 8px;
}
.top-toolbar :deep(.el-button--text) {
  color: var(--text-secondary);
}
</style>
