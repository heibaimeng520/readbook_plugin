<template>
  <el-popover placement="bottom" :width="240" trigger="click">
    <template #reference>
      <el-button text>字体</el-button>
    </template>
    <div class="font-settings">
      <div class="setting-row">
        <span class="label">字体</span>
        <el-select v-model="settingsStore.fontFamily" size="small" style="width:140px">
          <el-option v-for="f in FONT_FAMILIES" :key="f.value" :label="f.label" :value="f.value" />
        </el-select>
      </div>
      <div class="setting-row">
        <span class="label">字号 {{ settingsStore.fontSize }}px</span>
        <el-slider
          v-model="settingsStore.fontSize"
          :min="12" :max="32" :step="2"
          size="small" style="width:140px"
        />
      </div>
      <div class="setting-row">
        <span class="label">行高 {{ settingsStore.lineHeight }}</span>
        <el-slider
          v-model="settingsStore.lineHeight"
          :min="1.2" :max="2.4" :step="0.2"
          size="small" style="width:140px"
        />
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { useSettingsStore } from '@/stores/useSettingsStore'
import { FONT_FAMILIES } from '@/utils/constants'

const settingsStore = useSettingsStore()
</script>

<style scoped>
.font-settings { display: flex; flex-direction: column; gap: 12px; }
.setting-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.label { font-size: 13px; color: var(--text-secondary); white-space: nowrap; }
</style>
