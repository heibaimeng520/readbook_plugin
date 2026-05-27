<template>
  <el-popover placement="bottom" :width="200" trigger="click">
    <template #reference>
      <el-button text>
        <el-icon><Sunny /></el-icon>
      </el-button>
    </template>
    <div class="brightness-setting">
      <span class="label">亮度</span>
      <el-slider v-model="settingsStore.brightness" :min="20" :max="100" :step="5" />
    </div>
  </el-popover>
</template>

<script setup>
import { Sunny } from '@element-plus/icons-vue'
import { useSettingsStore } from '@/stores/useSettingsStore'

const settingsStore = useSettingsStore()
</script>

<style scoped>
.brightness-setting {
  display: flex;
  align-items: center;
  gap: 12px;
}
.label {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
}
</style>
