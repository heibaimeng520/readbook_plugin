<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
import { watch } from 'vue'
import { useSettingsStore } from './stores/useSettingsStore'

const settingsStore = useSettingsStore()

watch(() => settingsStore.theme, (theme) => {
  document.documentElement.dataset.theme = theme
}, { immediate: true })

watch(() => settingsStore.brightness, (val) => {
  document.documentElement.style.setProperty('--brightness', `${val / 100}`)
}, { immediate: true })
</script>

<style>
:root {
  --bg-primary: #f5f5f5;
  --bg-secondary: #ffffff;
  --bg-sidebar: #fafafa;
  --text-primary: #303133;
  --text-secondary: #606266;
  --text-muted: #909399;
  --border-color: #e4e7ed;
  --toolbar-bg: #ffffff;
  --shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  --accent: #409eff;
  --brightness: 1;
}

[data-theme="night"] {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --bg-sidebar: #0f0f1a;
  --text-primary: #e0e0e0;
  --text-secondary: #b0b0b0;
  --text-muted: #808080;
  --border-color: #2a2a4a;
  --toolbar-bg: #16213e;
  --shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
  --accent: #5e9eff;
}

[data-theme="eye-care"] {
  --bg-primary: #c8d9bf;
  --bg-secondary: #d9e6d0;
  --bg-sidebar: #b8c9af;
  --text-primary: #3a4a2a;
  --text-secondary: #5a6a4a;
  --text-muted: #7a8a6a;
  --border-color: #a8b99a;
  --toolbar-bg: #d9e6d0;
  --shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  --accent: #5a8a3a;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
