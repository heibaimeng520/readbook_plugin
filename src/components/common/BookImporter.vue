<template>
  <el-dialog
    v-model="visibleModel"
    title="导入书籍"
    width="420px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-upload
      class="importer-upload"
      drag
      :auto-upload="false"
      :show-file-list="false"
      :accept="'.txt,.epub'"
      @change="handleFileChange"
    >
      <el-icon class="upload-icon" :size="48"><UploadFilled /></el-icon>
      <div class="upload-text">
        <p>点击或拖拽文件到此处</p>
        <p class="upload-hint">支持 TXT、EPUB 格式</p>
      </div>
    </el-upload>

    <div v-if="importing" class="import-status">
      <el-icon class="spin"><Loading /></el-icon>
      <span>正在解析文件...</span>
    </div>

    <div v-if="importError" class="import-error">
      <el-icon><WarningFilled /></el-icon>
      <span>{{ importError }}</span>
    </div>

    <template #footer>
      <el-button @click="visibleModel = false">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { UploadFilled, Loading, WarningFilled } from '@element-plus/icons-vue'
import { useBookshelfStore } from '@/stores/useBookshelfStore'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible'])

const router = useRouter()
const bookshelfStore = useBookshelfStore()
const importing = ref(false)
const importError = ref('')

const visibleModel = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})

async function handleFileChange(file) {
  importError.value = ''
  importing.value = true
  try {
    const book = await bookshelfStore.importBook(file.raw)
    visibleModel.value = false
    router.push(`/reader/${book.id}`)
  } catch (e) {
    importError.value = e.message || '导入失败，请检查文件格式'
  } finally {
    importing.value = false
  }
}
</script>

<style scoped>
.importer-upload :deep(.el-upload-dragger) {
  padding: 32px;
}
.upload-icon {
  color: var(--text-muted);
  margin-bottom: 8px;
}
.upload-text p {
  font-size: 14px;
  color: var(--text-primary);
}
.upload-hint {
  font-size: 12px !important;
  color: var(--text-muted) !important;
  margin-top: 4px;
}
.import-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  color: var(--accent);
  font-size: 14px;
}
.import-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  color: #f56c6c;
  font-size: 14px;
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
