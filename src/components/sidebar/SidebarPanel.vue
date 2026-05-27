<template>
  <div class="sidebar-panel">
    <div class="sidebar-header">
      <slot name="header" />
    </div>
    <div class="sidebar-content">
      <el-tabs v-model="activeTabInternal" v-if="showTabs !== false">
        <el-tab-pane label="目录" name="toc" v-if="hasToc">
          <slot name="toc" />
        </el-tab-pane>
        <el-tab-pane label="书签" name="bookmarks" v-if="hasBookmarks">
          <slot name="bookmarks" />
        </el-tab-pane>
        <slot />
      </el-tabs>
      <div v-else class="sidebar-direct">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, useSlots } from 'vue'

const props = defineProps({
  activeTab: { type: String, default: 'toc' },
  showTabs: { type: Boolean, default: true }
})

const slots = useSlots()
const hasToc = true
const hasBookmarks = true
const activeTabInternal = ref(props.activeTab)
</script>

<style scoped>
.sidebar-panel {
  width: 280px;
  min-width: 280px;
  height: 100%;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sidebar-header {
  flex-shrink: 0;
}
.sidebar-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.sidebar-content :deep(.el-tabs) {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.sidebar-content :deep(.el-tabs__content) {
  flex: 1;
  overflow-y: auto;
}
.sidebar-content :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 12px;
}
.sidebar-direct {
  flex: 1;
  overflow-y: auto;
}
</style>
