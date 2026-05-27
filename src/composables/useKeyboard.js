import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReaderStore } from '@/stores/useReaderStore'

export function useKeyboard() {
  const router = useRouter()
  const readerStore = useReaderStore()

  function handleKeydown(e) {
    // Ignore if user is typing in an input
    const tag = e.target.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    if (e.target.isContentEditable) return

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
        e.preventDefault()
        if (readerStore.viewMode === 'pagination') {
          // Flip forward — handled by ReaderContainer
          window.dispatchEvent(new CustomEvent('ereader:flip-forward'))
        } else {
          readerStore.nextPage()
        }
        break
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault()
        if (readerStore.viewMode === 'pagination') {
          window.dispatchEvent(new CustomEvent('ereader:flip-backward'))
        } else {
          readerStore.prevPage()
        }
        break
      case 'f':
      case 'F':
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault()
          window.dispatchEvent(new CustomEvent('ereader:toggle-fullscreen'))
        }
        break
      case 'Escape':
        readerStore.unload()
        router.push('/')
        break
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
