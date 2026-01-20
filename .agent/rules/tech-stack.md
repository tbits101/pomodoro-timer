# Tech Stack Standards

This project follows a strict "Vanilla" approach to maintain simplicity and performance.

## Core Technologies
- **HTML5**: Semantic tags should be used where possible.
- **CSS3**: Vanilla CSS is used for all styling. 
  - **No Tailwind CSS** or other utility frameworks unless explicitly requested.
  - Utilize CSS variables for theme-related values.
- **JavaScript (ES6+)**: No frameworks (React, Vue, Svelte, etc.) are allowed.
  - Rely on DOM manipulation and native browser APIs.
  - Use `async/await` for asynchronous operations.

## Persistence
- Use `localStorage` for all client-side persistence (settings, history, queues).
- Data should be serialized/deserialized with `JSON.stringify` and `JSON.parse`.

## Development Tools
- **just**: Command runner for all lifecycle tasks (serve, deploy, etc.).
- **Python 3**: Used exclusively for the built-in HTTP server (`python3 -m http.server`).
