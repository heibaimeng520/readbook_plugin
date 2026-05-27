# Vue3 E-Book Reader

A feature-rich, offline-first e-book reader for desktop browsers built with Vue 3, featuring realistic page-flip animations powered by StPageFlip.

## Screenshots

![Reader with page-flip animation](flip-success.png)
![Click-to-flip interaction](flip-mouse-click.png)

## Features

### File Support
- **EPUB** (EPUB2/EPUB3): full OPF/NCX/nav parsing, embedded images, cover extraction
- **TXT**: auto-detect encoding (UTF-8/GBK), regex-based chapter detection

### Reading Modes
| Mode | Description |
|------|-------------|
| Pagination | Two-page spread with realistic StPageFlip page-turn animation |
| Scroll | Continuous vertical scroll, one-click switch |

### Page-Flip Animation
- Powered by [StPageFlip](https://github.com/Nodlik/StPageFlip) for realistic book-like page turning
- Dynamic import to handle Vite CJS/ESM divergence between dev and build
- Keyboard flipping (Left/Right arrows), click-to-flip, drag-to-flip
- Configurable flip speed, shadow opacity via settings panel

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Left` | Previous page |
| `Right` | Next page |
| `F` | Toggle fullscreen |
| `Esc` | Return to bookshelf |

### Personalization
- **Font family**: SimSun / SimHei / KaiTi / Microsoft YaHei / DengXian
- **Font size**: 12px - 32px (step 2px)
- **Line height**: 1.2 - 2.4 (step 0.2)
- **Themes**: Day / Eye-care / Night (complete color schemes including sidebar, toolbar, shadows)
- **Brightness**: 20% - 100%

### Utility Features
- **Bookmarks**: mark any page, view & jump from sidebar
- **Auto-save**: reading progress, settings, bookmarks persisted to localStorage
- **Reading history**: continue-reading list, sorted by last read time
- **TOC navigation**: auto-generated chapter table, click to jump

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Vue 3 (Composition API) |
| Build | Vite 6 |
| UI | Element Plus 2 |
| State | Pinia 2 |
| Routing | Vue Router 4 (Hash mode) |
| EPUB unzip | JSZip |
| HTML sanitize | DOMPurify |
| Page flip | StPageFlip (`page-flip` npm package) |
| Pagination | Custom `PaginationEngine` (DOM measurement + binary search) |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (opens http://localhost:3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── main.js                          # App entry point
├── App.vue                          # Root component (theme/brightness binding)
├── router/index.js                  # Hash-based routes: / and /reader/:bookId
│
├── views/
│   ├── HomeView.vue                 # Bookshelf home page
│   └── ReaderView.vue               # Reader page (toolbar + sidebar + reader)
│
├── stores/                          # Pinia state management
│   ├── useBookshelfStore.js         # Book list, import, remove, open
│   ├── useReaderStore.js            # Current book, pages, page index, view mode
│   ├── useSettingsStore.js          # Font, theme, brightness, flip params (auto-persist)
│   └── useBookmarkStore.js          # Bookmarks per book (auto-persist)
│
├── composables/                     # Vue Composition API helpers
│   ├── useBookLoader.js             # File → Book object (detects .epub/.txt)
│   ├── usePagination.js             # Rebuild pages on font/resize changes
│   ├── useStPageFlip.js             # StPageFlip lifecycle (init/rebuild/destroy)
│   ├── useKeyboard.js               # Global keyboard shortcut bindings
│   ├── useFullscreen.js             # Browser Fullscreen API wrapper
│   ├── useAutoSave.js               # Periodic progress persistence
│   └── useReadingHistory.js         # Track & sort reading history
│
├── engine/
│   └── PaginationEngine.js          # DOM-based binary-search pagination
│
├── parsers/
│   ├── epubParser.js                # EPUB2/EPUB3 full parser (OPF→NCX/nav→spine→content)
│   ├── txtParser.js                 # TXT parser (encoding detection, chapter regex)
│   └── tocGenerator.js              # Auto-generate TOC from chapters
│
├── components/
│   ├── layout/                      # TopToolbar (shared by home + reader)
│   ├── sidebar/                     # SidebarPanel, BookshelfTab, TocTab, BookmarkTab
│   ├── reader/                      # ReaderContainer, PageContentView, ReadingProgress
│   ├── settings/                    # FontSettings, ThemeSettings, BrightnessSlider, CurlSettings
│   └── common/                      # BookCover, BookImporter (drag-and-drop file upload)
│
└── utils/
    ├── storage.js                   # localStorage wrapper with ereader: namespace
    ├── domMeasure.js                # Offscreen DOM measurement box
    ├── constants.js                 # Storage keys, default settings
    └── epub/                        # unzipper, xmlParser, htmlSanitizer
```

## Architecture Highlights

### Pagination Engine

`PaginationEngine` uses **DOM measurement + binary search** to split chapter content into pages that precisely fit the viewport:

1. Creates an offscreen `<div>` with the exact font/line-height/width settings
2. For each page boundary, binary-searches the character offset where content height exceeds the page height
3. Adjusts break points to word boundaries (for Latin text) or allows arbitrary breaks (for CJK)
4. Caches results keyed by `(chapterId, fontSize, fontFamily, lineHeight, width, height)`

### StPageFlip Integration

StPageFlip is loaded via **dynamic `import()`** to avoid Vite's CJS pre-bundling divergence (static import yields `undefined` in dev, works in build). The composable manages:

- `init()` — create `PageFlip` instance, load HTML page elements, bind `flip` event to sync `currentPageIndex`
- `rebuild()` — re-initialize on font/resize changes, preserving current page position
- `destroy()` — clean up on unmount or view-mode switch

Each page element uses a **double-div pattern**: outer div owned by StPageFlip (style overwritten each frame), inner div for content styling safe from interference.

### Data Persistence

All data stored in `localStorage` under `ereader:` namespace:

| Key | Content |
|----|------|
| `ereader:settings` | Font/theme/brightness/flip params |
| `ereader:bookshelf` | Book metadata (no file content) |
| `ereader:progress` | Per-book reading position |
| `ereader:bookmarks` | All bookmarks |
| `ereader:history` | Last 50 reading records |

File raw data (ArrayBuffer) lives in Pinia store memory only; must re-import after page refresh.

## Browser Support

- Chrome / Edge 90+
- Firefox 90+
- Safari 15+

Requires: CSS 3D Transforms, Canvas 2D, Fullscreen API, ResizeObserver.

## License

MIT