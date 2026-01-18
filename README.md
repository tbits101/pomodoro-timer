# Modern Pomodoro Timer

A beautiful, glassmorphism-styled Pomodoro timer built with vanilla HTML, CSS, and JavaScript.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features (Current)
- **25-minute Focus Timer**: Standard Pomodoro duration.
- **Customizable Modes**: Switch between Focus, Short Break (5m), and Long Break (15m).
- **Settings**: Customize the duration of each mode; saves to your browser.
- **History Log**: Tracks your completed sessions with date and time.
- **Glassmorphism Design**: Modern UI with animated gradient backgrounds.
- **Theming**: Color schemes change based on the active mode.
- **Audio & Visual Alerts**: Plays a sound and sends a browser notification when the timer ends.
- **Responsive**: Works on desktop and mobile.

## How to Run

1. **Local Server (Recommended)**:
   Browser notifications often require the site to be served over HTTP/HTTPS, not `file://`.
   ```bash
   python3 -m http.server 8080
   # Open http://localhost:8080 in your browser
   ```

2. **Direct Open**:
   You can simply open `index.html` in your browser, though notifications might be blocked.

## Roadmap (Future Improvements)

We plan to add the following features to make this a complete productivity tool:

- [x] **Short & Long Break Modes**:
    - Add buttons to switch between "Focus" (25m), "Short Break" (5m), and "Long Break" (15m).
    - Change color themes based on the active mode.

- [x] **Customizable Settings**:
    - Allow users to customize timer durations.
    - Persist settings to `localStorage`.

- [ ] **Visual Progress Indicator**:
    - Add a circular progress ring (SVG) around the timer or a progress bar.
    - Update title with dynamic progress (e.g., "12:30 - Focus").

- [x] **Task Management**:
    - Input field to define the current task being worked on.
    - History log of completed Pomodoros.

## Project Structure
- `index.html`: Main structure.
- `style.css`: All styles and animations.
- `script.js`: Timer logic and notification handling.
