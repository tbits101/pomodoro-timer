# Modern Multi-Purpose Timer

A beautiful, glassmorphism-styled timer application built with vanilla HTML, CSS, and JavaScript. Originally a Pomodoro timer, now evolved into a versatile timing tool for productivity, health, sports, and kitchen tasks.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features (Current)

### 🎯 Focus & Productivity
- **Pomodoro Timer**: Standard 25-minute focus sessions with customizable breaks.
- **Flowtime Mode**: Work until your focus dips naturally; take proportional breaks.
- **Customizable Modes**: Switch between Focus, Short Break (5m), and Long Break (15m).
- **Session Flow**: Automatic transitions between Work, Short Break, and Long Break with **Granular Auto-Start Options** (v1.12+).
- **Goal Tracking**: Set daily and weekly focus goals with visual progress bars (v1.8+).

### 🧘 Health & Wellness
- **Breathing Exercises**: Guided breathing sessions with dual-ring visualization and phase countdown (v1.13+).
  - Micro-Reset (1 min): 2-1-4 breathing
  - Standard Prep (3 mins): 6-10 deep slow breaths/min
  - Deep Transition (5 mins): Full mental clearance
- **Grounding (5-4-3-2-1)**: 5-minute guided sensory grounding exercise (v1.15+).
- **Micro-Break**: Quick 1-minute rest timer (v1.15+).

### 🏃 Sport & Fitness
- **Interval Training**: Customizable work/rest cycles with configurable durations and cycle counts (v1.15+).
- **Stopwatch**: Count-up timer for open-ended activities (v1.15+).

### 🍳 Kitchen & Cooking
- **Grill Master**: Steak doneness presets (Rare/Medium/Well) with optional flip reminders (v1.15+).
- **Multi-Timer Dashboard**: Manage multiple timers simultaneously (coming soon).

### ⏱️ Utility Timers
- **Countdown Timer**: General-purpose countdown for any duration.
- **Deadline Timer**: Track time remaining until a specific deadline (coming soon).

### 📊 Tracking & History
- **History Log**: Tracks completed sessions with **Inline Editing** for titles, durations, and dates.
- **Pause & Resume Tracking**: Automatically tracks interruptions and total paused time (v1.13+).
- **Daily & Weekly Summaries**: Ultra-robust date tracking with Monday-start weeks.

### 🎨 Design & UX
- **Glassmorphism Design**: Modern UI with animated gradient backgrounds.
- **Category-Based Theming**: Color schemes change based on active category (Focus, Health, Sport, Kitchen, Utility).
- **Immediate Theme Switching**: Light/Dark/System themes with instant feedback (v1.10+).
- **Responsive**: Optimized for desktop and mobile with fluid wrapping (v1.10+).
- **Direct Timer Edit**: Click the timer text to type a custom time.

### 🔧 Task Management
- **Task Queue**: Add multiple tasks to an "Up Next" list with drag & drop reordering.
- **Inline Editing**: Click any task to edit its text.
- **Auto-Advance**: Automatically switch to the next task upon completion.

### 🔔 Notifications
- **Audio & Visual Alerts**: Plays sound and sends browser notifications when timers end.
- **PWA Support**: Installable on Android/iOS/Desktop with offline support and automated update notifications.

## How to Run

1. **Local Server (Recommended)**:
   Browser notifications often require the site to be served over HTTP/HTTPS, not `file://`.
   ```bash
   python3 -m http.server 8080
   # Open http://localhost:8080 in your browser
   ```

2. **Using [Just](https://github.com/casey/just) (Recommended)**:
   If you have `just` installed, you can use these shortcuts:
   - `just serve`: Start the local server.
   - `just status`: Check git status.
   - `just version`: Show current app version.
   - `just bump`: Increment patch version and update build time.
   - `just commit "Your message"`: Stage and commit changes.
   - `just push`: Push changes to the main branch.
   - `just tag "Release message"`: Create and push annotated git tag with current version.
   - `just push-tags`: Push all tags to remote.
   - `just deploy`: Deploy to GitHub Pages (merges main to gh-pages).
   - `just release "message"`: Full release workflow (bump, commit, push, tag, deploy).
   - `just`: List all available commands.
    
    **Restoration/Restarting**:

   If you need to restart the server (e.g., after closing the terminal), simply run the command above again. To stop a running server, press `Ctrl+C` in the terminal.

### 🌐 [How to Publish/Deploy for Free](DEPLOYMENT.md)
Check out our **[Deployment Guide](DEPLOYMENT.md)** for easy instructions on how to host this on GitHub Pages, Netlify, or Vercel for free.

3. **Direct Open**:
   You can simply open `index.html` in your browser, though notifications might be blocked.

## FAQ & Troubleshooting

**How do I make sure I have the latest version?**
I've added a version log to the console. 
1. Open Developer Tools (F12 or Right Click -> Inspect).
2. Go to the "Console" tab.
3. Look for the message: `Pomodoro Timer v1.4.0 - Loaded`.

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
    - [x] Automatic transition (Work → Break → Work)
    - [x] Long Break Interval (configurable)
    - [x] **Granular Auto-Start**: Independent toggles for next work sessions and breaks (v1.12+).
    - [ ] Manual skip option
- **3. Notifications & Alerts**
    - [x] Sound when session ends
    - [x] Browser notification visual alert
- **4. Session Counter**
    - [x] Track completed Pomodoro cycles (e.g., "Pomodoro #1, #2") in real-time above the timer (v1.11+).
- **5. Minimal UI**
    - [x] Timer countdown
    - [x] Current mode display
    - [x] Clear call-to-action buttons
    - [x] **Direct Timer Edit**: Click the timer text to type a custom time.
    - [x] **Settings Reorganization**: Logical groupings and scrollable container.
    - [x] **Early Task Completion**: Records actual elapsed time in history.
    - [x] **Active Task Editing**: Edit the current task text in-place.
    - [x] **Appearance**: Toggle between Light/Dark/System themes with **Immediate Feedback** (instantly updates colors on selection).
    - [x] **Mobile Optimization**: Shortened "Short" and "Long" break labels and improved `mode-switcher` wrapping for narrow screens.
    - [x] **Accessibility & Contrast**: Refined select inputs and primary buttons in settings for better readability and a more premium feel.
    - [ ] **Dynamic Backgrounds**: Gorgeous photo slideshows or ambient videos.
- **6. Settings (Basic)**
    - [x] Adjust work and break durations
    - [x] Enable/disable sounds toggle
    - [ ] **Focus Sounds**: Background ambient noise (Rain, Fireplace, City) - Default: OFF.
    - [ ] **Animated Companions**: Interactive characters (e.g. Focus Cat) that work with you.

### 🟢 Intermediate Features (Quality of Life)
- **7. Task List & Queue**
    - [x] **Task Queue**: Add multiple tasks to an "Up Next" list.
    - [x] **Auto-Advance**: Automatically switch to the next task upon completion.
    - [x] **Drag & Drop**: Reorder tasks easily.
    - [x] **Inline Editing**: Click any task to edit its text.
    - [x] **Promotion**: Instantly make any queued task the current active one.
    - [ ] **Subtasks**: Break down larger tasks into smaller checkpoints.
- **8. Auto-Start Options**
    - [x] Auto-start next work session (v1.12+)
    - [x] Auto-start breaks (v1.12+)
- **9. History & Daily Stats**
    - [x] History log of sessions
    - [x] **Delete Items**: Remove specific sessions from history.
    - [x] **Inline Editing**: Modify entry titles and durations directly in the log.
    - [ ] **Custom Labels**: Tag sessions with categories or custom notes.
    - [x] **Total focused time calculation** (Daily & Weekly summaries)
    - [x] Daily/Weekly goal tracking
    - [ ] **Advanced Reports**: Monthly and Yearly time distribution analytics.
- **10. Pause & Resume Tracking**
    - [x] Track interruptions and paused time (v1.13+)
- **11. Cross-Platform Sync**
    - [ ] Cloud backup of settings and history

### 🟣 Advanced Features (Power User)
- **12. Advanced Analytics**
    - [ ] Focus trends over time
    - [ ] Productivity by time of day
- **13. Custom Workflows**
    - [x] Custom sequences (e.g., 50/10)
    - [x] Presets (Coding, Study, Pomodoro)
- **14. Special Modes**
    - [x] **Flowtime**: Work until your focus dips naturally; take proportional breaks.
    - **Breath Time**: Guided sessions for focus preparation:
        - **Dual-Ring Visualization**: Outer ring for session progress, inner ring for phase rhythm.
        - **Phase Countdown**: Real-time seconds display for inhale/hold/exhale.
        - **Visual Duration Clues**: Session buttons now display timing patterns (e.g., "2-1-4") upfront to eliminate surprises (v1.13+).
        - **Micro-Reset** (1 min): 2-1-4 breathing.
        - **Standard Prep** (3 mins): 6-10 deep slow breaths/min.
        - **Deep Transition** (5 mins): Full mental clearance.
        - **Mobile Optimized**: Refined layout for Android and small viewports.
    - [x] **Grounding (5-4-3-2-1)**: 5-minute guided sensory grounding exercise (v1.15+).
    - [x] **Micro-Break**: Quick 1-minute rest timer (v1.15+).
    - [x] **Interval Training**: Customizable work/rest cycles for fitness (v1.15+).
    - [x] **Stopwatch**: Count-up timer for open-ended activities (v1.15+).
    - [x] **Grill Master**: Steak doneness presets with flip reminders (v1.15+).
    - [ ] **Multi-Timer Dashboard**: Manage multiple kitchen timers simultaneously.
    - [ ] **Deadline Timer**: Track time remaining until a specific deadline.
- **15. Distraction Management**
    - [ ] Website blocking integration
    - [ ] "Do Not Disturb" integration
- **15. Smart Recommendations**
    - [ ] Adaptive lengths based on performance
- **16. Gamification**
    - [ ] **Virtual Growth**: A plant or character that grows with your focus sessions and withers if you reset too often.
    - [ ] **XP, Levels, Badges**: Level up your productivity profile.
    - [ ] **Streaks**: Maintain daily consistency.
- **17. Collaboration**
    - [ ] **Virtual Body Doubling**: Join "silent focus rooms" (simulated or real-time) to work alongside others.
    - [ ] **Virtual co-working rooms**
- **18. Integrations**
    - [ ] **Calendar & Task Manager sync**: Integration with Google Calendar, Trello, and Asana.
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
- `favicon.png`: Browser tab icon (combined tomato-clock design).

## Project Standards & Automation
This repository uses `just` to enforce standards.
- **Mandatory Documentation**: `just commit` and `just release` will fail if `README.md` hasn't been updated.
- **Version Tracking**: `just bump` maintains the `version.js` file and build timestamps.
- **AI-Agent Ready**: Follows rules defined in the `.agent/rules` directory.
