# Open-Higgsfield-AI - AI Generation Studio

**Generated:** 2026-03-16
**Branch:** main

## OVERVIEW
Open-source AI image/video generation web studio. 200+ models via Muapi.ai gateway. Vanilla JS + Vite + Tailwind. Three studios: Image, Video, Cinema (pro camera controls).

## STRUCTURE
```
Open-Higgsfield-AI/
├── index.html                  # HTML entry
├── package.json                # Vite 5.4, Tailwind 4.1
├── vite.config.js
├── src/
│   ├── main.js                 # Router: Image / Video / Cinema studios
│   ├── components/
│   │   ├── ImageStudio.js      # t2i / i2i with multi-image (up to 14)
│   │   ├── VideoStudio.js      # t2v / i2v generation
│   │   ├── CinemaStudio.js     # Pro camera controls (lens, aperture, focal)
│   │   ├── UploadPicker.js     # Upload history + multi-select
│   │   ├── CameraControls.js   # Camera/lens/focal/aperture pickers
│   │   ├── Header.js           # Navigation
│   │   ├── AuthModal.js        # API key management
│   │   ├── SettingsModal.js    # Settings
│   │   └── Sidebar.js          # Model selection
│   ├── lib/
│   │   ├── muapi.js            # API client (generateImage, generateVideo, uploadFile)
│   │   ├── models.js           # 200+ model definitions with endpoints
│   │   ├── uploadHistory.js    # localStorage CRUD
│   │   └── promptUtils.js      # Prompt utilities
│   └── styles/                 # CSS variables, animations
├── public/                     # Static assets
└── docs/                       # Screenshots
```

## ENTRY POINTS

| Entry | Command | Notes |
|-------|---------|-------|
| **Dev** | `npm run dev` | Vite dev server |
| **Build** | `npm run build` | Production build |
| **Preview** | `npm run preview` | Preview build |

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add new model | `src/lib/models.js` | Model definition objects |
| API integration | `src/lib/muapi.js` | Submit + poll pattern |
| Image generation UI | `src/components/ImageStudio.js` | Dual-mode t2i/i2i |
| Video generation UI | `src/components/VideoStudio.js` | t2v/i2v |
| Cinema controls | `src/components/CinemaStudio.js` | Lens, aperture, focal |
| Router/navigation | `src/main.js` | Dynamic component loading |
| Upload management | `src/lib/uploadHistory.js` | localStorage-based |

## CONVENTIONS

- **No framework**: Vanilla JS with manual DOM manipulation
- **Routing**: Manual router in `main.js` with dynamic imports
- **State**: localStorage for API keys, upload history, generation history
- **API pattern**: Two-step (submit task -> poll for results)
- **Naming**: PascalCase components, camelCase functions
- **Styling**: Tailwind CSS + dark glassmorphism theme
- **Models**: 50+ t2i, 55+ i2i, 40+ t2v, 60+ i2v models defined in `models.js`

## ANTI-PATTERNS

- Don't use React/Vue -- this is intentionally vanilla JS
- Don't modify models.js structure -- each model has endpoint/params contract
- Don't store API keys server-side -- localStorage only (client-side app)

## COMMANDS

```bash
npm install
npm run dev      # Dev server
npm run build    # Production
```
