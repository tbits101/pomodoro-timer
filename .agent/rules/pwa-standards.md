# PWA Standards

The Pomodoro Timer is a Progressive Web App (PWA). Reliability and installability are key.

## Manifest Configuration
- `manifest.json` must be kept up to date with app metadata.
- Theme colors in manifest should match the default `focus` theme.
- **Display**: Use `standalone` to provide an app-like experience.

## Service Worker (`sw.js`)
- **Offline Support**: The service worker must cache all critical local assets (`index.html`, `style.css`, `script.js`, etc.).
- **Cache Management**: The `CACHE_NAME` is automatically synchronized with the app version.
  - **Required**: Use `just bump` or `just set-version` to ensure the PWA cache is busted when updating assets.
- **Fetch Strategy**: Current strategy is "Cache First, fallback to Network" for maximum speed.

## Icons
- Always maintain at least two PNG icons:
  - `icon-192.png`: For common Android UI and smaller screens.
  - `icon-512.png`: For splash screens and higher-resolution displays.
- Icons should follow the "Tomato" theme unless a redesign is requested.
