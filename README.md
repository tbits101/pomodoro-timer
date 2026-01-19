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
   
   **Restoration/Restarting**:
   If you need to restart the server (e.g., after closing the terminal), simply run the command above again. To stop a running server, press `Ctrl+C` in the terminal.

### 🌐 [How to Publish/Deploy for Free](DEPLOYMENT.md)
Want to show your timer to the world? Check out our **[Deployment Guide](DEPLOYMENT.md)** for easy instructions on how to host this on GitHub Pages, Netlify, or Vercel for free.

2. **Direct Open**:

2. **Direct Open**:
   You can simply open `index.html` in your browser, though notifications might be blocked.

## FAQ & Troubleshooting

**How do I make sure I have the latest version?**
I've added a version log to the console. 
1. Open Developer Tools (F12 or Right Click -> Inspect).
2. Go to the "Console" tab.
3. Look for the message: `Pomodoro Timer v1.2.0 - Loaded`.

**How do I clear the cache for localhost?**
Browsers sometimes hold onto old files. To force a refresh:
- **Windows/Linux**: Press `Ctrl + Shift + R` or `Ctrl + F5`.
- **Mac**: Press `Cmd + Shift + R`.
- **Chrome DevTools**: With DevTools open, right-click the Refresh button and select "Empty Cache and Hard Reload".

## Roadmap (Future Improvements)

We have a comprehensive plan to evolve this tool into a productivity powerhouse.

### 🔵 Core Features (The Basics)
- **1. Pomodoro Timer**
    - [x] Default 25-minute work session
    - [x] 5-minute short break
    - [x] 15–30 minute long break
    - [x] Start / Pause / Reset controls
- **2. Session Flow**
    - [ ] Automatic transition (Work → Break → Work)
    - [ ] Manual skip option
- **3. Notifications & Alerts**
    - [x] Sound when session ends
    - [x] Browser notification visual alert
- **4. Session Counter**
    - [ ] Track completed Pomodoro cycles (e.g., "Pomodoro #1, #2")
- **5. Minimal UI**
    - [x] Timer countdown
    - [x] Current mode display
    - [x] Clear call-to-action buttons
- **6. Settings (Basic)**
    - [x] Adjust work and break durations
    - [ ] Enable/disable sounds toggle

### 🟢 Intermediate Features (Quality of Life)
- **7. Task List**
    - [x] Add current task focus
    - [ ] Multiple tasks queue
    - [x] Mark tasks complete
- **8. Auto-Start Options**
    - [ ] Auto-start next work session
    - [ ] Auto-start breaks
- **9. History & Daily Stats**
    - [x] History log of sessions
    - [ ] Total focused time calculation
    - [ ] Daily/Weekly summaries
- **10. Pause & Resume Tracking**
    - [ ] Track interruptions and paused time
- **11. Cross-Platform Sync**
    - [ ] Cloud backup of settings and history

### 🟣 Advanced Features (Power User)
- **12. Advanced Analytics**
    - [ ] Focus trends over time
    - [ ] Productivity by time of day
- **13. Custom Workflows**
    - [ ] Custom sequences (e.g., 50/10)
    - [ ] Presets (Coding, Study, Writing)
- **14. Distraction Management**
    - [ ] Website blocking integration
    - [ ] "Do Not Disturb" integration
- **15. Smart Recommendations**
    - [ ] Adaptive lengths based on performance
- **16. Gamification**
    - [ ] XP, Levels, Badges
    - [ ] Streaks
- **17. Collaboration**
    - [ ] Virtual co-working rooms
- **18. Integrations**
    - [ ] Calendar & Task Manager sync
- **19. Offline & Reliability**
    - [x] Full offline mode support
    - [ ] Battery-efficient background workers
- **20. Accessibility**
    - [ ] Screen reader support
    - [ ] Color-blind themes

## Project Structure
- `index.html`: Main structure.
- `style.css`: All styles and animations.
- `script.js`: Timer logic and notification handling.
