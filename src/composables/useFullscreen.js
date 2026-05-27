import { ref, onMounted, onUnmounted } from 'vue'

export function useFullscreen() {
  const isFullscreen = ref(false)

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      isFullscreen.value = true
    } else {
      document.exitFullscreen().catch(() => {})
      isFullscreen.value = false
    }
  }

  function onFsChange() {
    isFullscreen.value = !!document.fullscreenElement
  }

  onMounted(() => {
    document.addEventListener('fullscreenchange', onFsChange)
    window.addEventListener('ereader:toggle-fullscreen', toggleFullscreen)
  })

  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', onFsChange)
    window.removeEventListener('ereader:toggle-fullscreen', toggleFullscreen)
  })

  return { isFullscreen, toggleFullscreen }
}
