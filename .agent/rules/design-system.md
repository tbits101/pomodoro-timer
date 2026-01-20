# Design System Standards

The project uses a modern "Glassmorphism" aesthetic with vibrant, dynamic backgrounds.

## Visual Language
- **Glassmorphism**: 
  - Components should use semi-transparent backgrounds (`rgba(255, 255, 255, 0.1)`).
  - Apply `backdrop-filter: blur(16px)` for depth.
  - Border: Subtle white border (`rgba(255, 255, 255, 0.2)`).
- **Dynamic Backgrounds**: 
  - Use `linear-gradient` backgrounds on the `body`.
  - Use CSS animations to transition background positions or colors over time.
- **Typography**: 
  - Primary Font: **'Outfit'** (Sans-serif) from Google Fonts.
  - Fallback: `sans-serif`.

## UI Patterns
- **Modals**: Centered overlays with blur.
- **Buttons**: Rounded pills or circular icons with smooth hover transitions (scale/color).
- **Feedback**: Use CSS transitions for all interactive state changes.

## Theming
- Themes are controlled by applying classes to the `<body>` (e.g., `.short-break`, `.long-break`).
- Colors should be updated through CSS variables or specific class overrides in `style.css`.
