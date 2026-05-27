<template>
  <el-popover placement="bottom" :width="200" trigger="click">
    <template #reference>
      <el-button text>主题</el-button>
    </template>
    <div class="theme-settings">
      <div
        v-for="t in THEMES"
        :key="t.value"
        class="theme-option"
        :class="{ active: settingsStore.theme === t.value }"
        @click="settingsStore.theme = t.value"
      >
        <div class="theme-swatch" :class="`swatch-${t.value}`"></div>
        <span>{{ t.label }}</span>
        <el-icon v-if="settingsStore.theme === t.value" class="check"><Check /></el-icon>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { Check } from '@element-plus/icons-vue'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { THEMES } from '@/utils/constants'

const settingsStore = useSettingsStore()
</script>

<style scoped>
.theme-settings { display: flex; flex-direction: column; gap: 4px; }
.theme-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-primary);
}
.theme-option:hover { background: var(--bg-primary); }
.theme-option.active { background: rgba(64, 158, 255, 0.08); color: var(--accent); }
.theme-swatch {
  width: 24px; height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  flex-shrink: 0;
}
.swatch-day { background: #f5f5f5; }
.swatch-eye-care { background: #c8d9bf; }
.swatch-night { background: #1a1a2e; }
.check { margin-left: auto; color: var(--accent); }
</style>
