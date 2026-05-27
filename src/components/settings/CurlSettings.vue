<template>
  <el-popover placement="bottom" :width="240" trigger="click">
    <template #reference>
      <el-button text>翻页</el-button>
    </template>
    <div class="curl-settings">
      <div class="setting-row">
        <span class="label">翻页速度</span>
        <el-select v-model="settingsStore.curlSpeed" size="small" style="width:120px">
          <el-option v-for="s in CURL_SPEEDS" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
      </div>
      <div class="setting-row">
        <span class="label">折角大小</span>
        <el-select v-model="settingsStore.curlSize" size="small" style="width:120px">
          <el-option v-for="s in CURL_SIZES" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
      </div>
      <div class="setting-row">
        <span class="label">阴影深度</span>
        <el-select v-model="settingsStore.shadowDepth" size="small" style="width:120px">
          <el-option v-for="s in SHADOW_DEPTHS" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { useSettingsStore } from '@/stores/useSettingsStore'
import { CURL_SPEEDS, CURL_SIZES, SHADOW_DEPTHS } from '@/utils/constants'

const settingsStore = useSettingsStore()
</script>

<style scoped>
.curl-settings { display: flex; flex-direction: column; gap: 12px; }
.setting-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.label { font-size: 13px; color: var(--text-secondary); white-space: nowrap; }
</style>
