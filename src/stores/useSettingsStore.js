import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { get, set } from '@/utils/storage'
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/utils/constants'

export const useSettingsStore = defineStore('settings', () => {
  const fontSize = ref(DEFAULT_SETTINGS.fontSize)
  const fontFamily = ref(DEFAULT_SETTINGS.fontFamily)
  const lineHeight = ref(DEFAULT_SETTINGS.lineHeight)
  const theme = ref(DEFAULT_SETTINGS.theme)
  const brightness = ref(DEFAULT_SETTINGS.brightness)
  const pageMargin = ref(DEFAULT_SETTINGS.pageMargin)
  const viewMode = ref(DEFAULT_SETTINGS.viewMode)
  const curlSpeed = ref(DEFAULT_SETTINGS.curlSpeed)
  const curlSize = ref(DEFAULT_SETTINGS.curlSize)
  const shadowDepth = ref(DEFAULT_SETTINGS.shadowDepth)

  function loadFromStorage() {
    const saved = get(STORAGE_KEYS.SETTINGS)
    if (!saved) return
    if (saved.fontSize != null) fontSize.value = saved.fontSize
    if (saved.fontFamily != null) fontFamily.value = saved.fontFamily
    if (saved.lineHeight != null) lineHeight.value = saved.lineHeight
    if (saved.theme != null) theme.value = saved.theme
    if (saved.brightness != null) brightness.value = saved.brightness
    if (saved.pageMargin != null) pageMargin.value = saved.pageMargin
    if (saved.viewMode != null) viewMode.value = saved.viewMode
    if (saved.curlSpeed != null) curlSpeed.value = saved.curlSpeed
    if (saved.curlSize != null) curlSize.value = saved.curlSize
    if (saved.shadowDepth != null) shadowDepth.value = saved.shadowDepth
  }

  function persist() {
    set(STORAGE_KEYS.SETTINGS, {
      fontSize: fontSize.value,
      fontFamily: fontFamily.value,
      lineHeight: lineHeight.value,
      theme: theme.value,
      brightness: brightness.value,
      pageMargin: pageMargin.value,
      viewMode: viewMode.value,
      curlSpeed: curlSpeed.value,
      curlSize: curlSize.value,
      shadowDepth: shadowDepth.value
    })
  }

  watch([fontSize, fontFamily, lineHeight, theme, brightness, pageMargin, viewMode, curlSpeed, curlSize, shadowDepth], persist, { deep: true })

  return {
    fontSize, fontFamily, lineHeight, theme, brightness, pageMargin,
    viewMode, curlSpeed, curlSize, shadowDepth,
    loadFromStorage
  }
})
