# Copilot Instructions for 2048 Game Chrome Extension

## Project Overview
- This is a Vue 3 + Vite project implementing the 2048 game as a Chrome extension.
- State management uses Pinia (`src/store/gameStore.js`).
- UI is built with Vuetify 3, with dynamic theme switching (light/dark) via `src/plugins/vuetify.js`.
- Game logic is modularized in `src/gameLogic.js`.
- Chrome extension APIs (notably `chrome.storage`) are used for persistent state and theme.

## Key Files & Structure
- `src/main.js`: App entry, theme and store initialization, mounts Vue app.
- `src/App.vue`: Main UI, theme switch, new game/undo, and board rendering.
- `src/components/`: UI components (`GameBoard.vue`, `GameTile.vue`, `ScoreBoard.vue`).
- `src/gameLogic.js`: All core 2048 logic (tile creation, moves, merges, win/loss detection).
- `src/store/gameStore.js`: Pinia store, handles state, actions, and Chrome storage integration.
- `src/plugins/vuetify.js`: Vuetify theme setup, dynamic theme support.

## Build & Run
- **Dev:** `npm run dev` (serves with Vite)
- **Build:** `npm run build` (outputs to `dist/` for Chrome extension packaging)
- No test scripts are present by default.

## Project-Specific Patterns
- **State Persistence:** Game state and theme are saved/loaded via `chrome.storage.local` for extension persistence. See `gameStore.js` and `main.js` for details.
- **Unique Tile IDs:** All tiles have unique IDs for animation and reactivity (see `gameLogic.js`).
- **Undo:** Undo is managed in the store, tracking previous state.
- **Theme:** Theme is loaded from Chrome storage on startup and can be toggled in the UI.
- **No CSS Code Splitting:** Vite config disables CSS splitting for easier extension loading.

## Conventions
- Use Pinia for all state (no Vuex).
- Use Vuetify components for UI; custom styles are minimal and scoped.
- All Chrome extension logic (storage, etc.) is isolated to store and main entry.
- All game logic is in `gameLogic.js` and imported by the store.

## Examples
- To add a new persistent setting, update both the store and Chrome storage logic.
- To add a new UI feature, create a component in `src/components/` and register in `App.vue`.
- To change the board size or rules, update `gameLogic.js` and related store logic.

## External Dependencies
- Vue 3, Pinia, Vuetify 3, Vite, Chrome Extension APIs.

---
For more details, see the referenced files. Keep new code modular and follow the above patterns for state, UI, and persistence.
