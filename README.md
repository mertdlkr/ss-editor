# SS Editor

Reusable local editor for designing App Store and Google Play screenshots. Built with Next.js, React, TypeScript and Tailwind CSS. Starts with neutral copy and empty screenshot slots.

## Quick start

Requires Node.js 22 or newer.

```bash
git clone https://github.com/mertdlkr/ss-editor.git
cd ss-editor
npm ci
npm run dev
```

Open http://localhost:3000. The editor runs locally and saves to this folder; a writable Node.js server is required for project persistence and uploads.

## Features

- Connected panorama canvas or isolated screens, with split crops on export.
- Seven slide layouts; iPhone, iPad, Android phone, 7-inch and 10-inch tablets, and Play Store feature graphics.
- Portrait and supported tablet landscape dimensions, multiple export size presets.
- Drag, resize, rotate, reorder, duplicate and delete; element stacking, free text, decor images and extra phone mockups.
- Undo/redo, keyboard shortcuts, cross-device element propagation, themes and previews.
- 50 locale choices, per-language captions and text, `{locale}` screenshot paths, language shortcuts and selective export.
- PNG exports bundled into ZIP files, grouped by platform, device, dimensions and locale.
- Debounced JSON autosave, localStorage cache, schema migrations and per-device/all-device reset.

The locale picker covers all 50 localizations in [Apple’s official list](https://developer.apple.com/help/app-store-connect/reference/app-information/app-store-localizations), checked on October 1, 2026. Existing editor keys such as `en`, `es` and `bn` remain unchanged for project compatibility; `APPLE_LOCALE_CODE` in `constants.ts` maps them to Apple’s API codes (`en-US`, `es-ES`, `bn-BD`, etc.).

Locale support manages your copy; it does not translate it automatically. Missing text falls back to English, then the first available translation. The editor interface currently contains English and Turkish labels.

## Use with another project

Copy this folder into your project as a separate tool (for example `tools/ss-editor`) and run its own `npm ci` and `npm run dev`. It has its own dependencies and no game, Expo or React Native runtime dependencies. It can also stay in a separate checkout alongside your app.

1. Set the app name in the toolbar and select your target languages.
2. Upload PNG/JPEG screenshots through the inspector, or put them in `public/screenshots/` and reference `/screenshots/...` paths. Uploads are stored at `public/screenshots/uploaded/`.
3. For localized captures, use a path such as `/screenshots/iphone/{locale}/01.png` and supply one image per selected locale. Keep actual images in the corresponding `public` subfolders.
4. Add your own decor PNGs to `public/decor/`; the picker discovers them automatically. You can also upload decor.
5. Edit each device deck, choose export languages/devices and download a ZIP.

Commit `app-store-screenshots.json` and any referenced files under `public/` together to carry your project to another machine. Exported ZIPs are downloaded by your browser.

## Customize

| File | Purpose |
| --- | --- |
| `app-store-screenshots.json` | Current editable project, including localized copy and transforms |
| `examples/starter.json` | Neutral starter deck; customize it for reproducible deck generation |
| `build-deck.mjs` | Copies the starter deck into the current project |
| `src/lib/defaults.ts` | Reset/fallback slides |
| `src/lib/constants.ts` | Themes, dimensions, export presets, locale labels and fonts |
| `src/components/editor/toolbar.tsx` | Language shortcuts and export controls |
| `src/components/editor/slide-canvas.tsx` | Canvas rendering, layouts and neutral backgrounds |
| `src/components/editor/device-frames.tsx` | Device chrome |
| `src/app/layout.tsx` | Google font setup and page metadata |

```bash
npm run build:deck # OVERWRITES current project with examples/starter.json
npm run typecheck
npm run build
npm start
```

`public/mockup.png` is the iPhone frame overlay; its screen measurements live in `PHONE_SCREEN` in `constants.ts`. Keep these synchronized if you replace the frame. Google fonts are fetched during the build.

## Persistence and migration

The project JSON is the canonical state. The file is loaded first; localStorage is the fallback when the file is missing or unavailable. Failed project loads block autosave to protect the file from stale cache; resolve the load error and reload before continuing. Older schemas migrate on load; legacy decks keep isolated rendering until Connected mode is enabled explicitly.

Reset reloads fallback slides and autosaves the resulting project. Uploaded files remain on disk. `build:deck` also replaces the entire project, so preserve your edits before running it.

This is a local, single-user authoring tool. Its filesystem APIs have no authentication; deploy it only behind access control with persistent writable storage if you need remote use. Static hosting cannot provide autosave/uploads.

## Origin

Extracted from the standalone screenshot editor used in footballgame, originally scaffolded by the `app-store-screenshots` skill. This repository excludes that game's screenshots, pixel icons, branding, localized marketing copy, deck generator and football pitch artwork. The reusable editing and localization mechanics are retained. See [third-party notices](THIRD_PARTY_NOTICES.md).
