<template>
  <div class="home-layout">
    <TopToolbar>
      <template #left>
        <span class="app-title">阅读器</span>
      </template>
      <template #right>
        <el-button type="primary" @click="showImporter = true">
          <el-icon style="margin-right:4px"><Plus /></el-icon>
          导入书籍
        </el-button>
      </template>
    </TopToolbar>

    <div class="home-body">
      <SidebarPanel activeTab="bookshelf" :showTabs="false">
        <BookshelfTab @import="showImporter = true" />
      </SidebarPanel>

      <div class="home-center">
        <div class="welcome">
          <div class="welcome-icon">📖</div>
          <h2>欢迎使用电子书阅读器</h2>
          <p>支持 TXT / EPUB 格式，纯前端离线阅读</p>
          <el-button type="primary" size="large" @click="showImporter = true">
            导入您的第一本书
          </el-button>
        </div>
      </div>
    </div>

    <BookImporter v-model:visible="showImporter" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import TopToolbar from '@/components/layout/TopToolbar.vue'
import SidebarPanel from '@/components/sidebar/SidebarPanel.vue'
import BookshelfTab from '@/components/sidebar/BookshelfTab.vue'
import BookImporter from '@/components/common/BookImporter.vue'

const showImporter = ref(false)
</script>

<style scoped>
.home-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary);
}
.home-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.home-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.welcome {
  text-align: center;
  color: var(--text-primary);
}
.welcome-icon {
  font-size: 64px;
  margin-bottom: 16px;
}
.welcome h2 {
  font-size: 24px;
  margin-bottom: 8px;
  font-weight: 500;
}
.welcome p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}
</style>
