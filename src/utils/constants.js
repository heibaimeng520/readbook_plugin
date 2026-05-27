export const FONT_FAMILIES = [
  { label: '宋体', value: '"SimSun", "Noto Serif SC", serif' },
  { label: '黑体', value: '"SimHei", "Noto Sans SC", sans-serif' },
  { label: '楷体', value: '"KaiTi", "STKaiti", serif' },
  { label: '微软雅黑', value: '"Microsoft YaHei", sans-serif' },
  { label: '等线', value: '"DengXian", sans-serif' }
]

export const FONT_SIZES = [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32]

export const LINE_HEIGHTS = [1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4]

export const THEMES = [
  { label: '白天模式', value: 'day', icon: 'Sunny' },
  { label: '护眼模式', value: 'eye-care', icon: 'Apple' },
  { label: '夜间模式', value: 'night', icon: 'Moon' }
]

export const VIEW_MODES = [
  { label: '分页阅读', value: 'pagination' },
  { label: '滚动阅读', value: 'scroll' }
]

export const CURL_SPEEDS = [
  { label: '慢速', value: 0.9 },
  { label: '标准', value: 0.6 },
  { label: '快速', value: 0.35 }
]

export const CURL_SIZES = [
  { label: '小折角', value: 0.2 },
  { label: '标准', value: 0.3 },
  { label: '大折角', value: 0.45 }
]

export const SHADOW_DEPTHS = [
  { label: '浅', value: 0.3 },
  { label: '标准', value: 0.5 },
  { label: '深', value: 0.8 }
]

export const STORAGE_KEYS = {
  SETTINGS: 'ereader:settings',
  BOOKMARKS: 'ereader:bookmarks',
  BOOKSHELF: 'ereader:bookshelf',
  PROGRESS: 'ereader:progress',
  HISTORY: 'ereader:history'
}

export const CHAPTER_PATTERN = /^(第[零一二三四五六七八九十百千万\d]+[章回节卷部篇]|Chapter\s+\d+|CHAPTER\s+\d+|序言|前言|楔子)/m

export const DEFAULT_SETTINGS = {
  fontSize: 18,
  fontFamily: '"SimSun", "Noto Serif SC", serif',
  lineHeight: 1.8,
  theme: 'day',
  brightness: 85,
  pageMargin: 40,
  viewMode: 'pagination',
  curlSpeed: 0.6,
  curlSize: 0.3,
  shadowDepth: 0.5
}
