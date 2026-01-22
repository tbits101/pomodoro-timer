// Config & State
const DEFAULT_MODES = {
    focus: 25,
    short: 5,
    long: 15
};

let modes = { ...DEFAULT_MODES };
let history = []; // [{ id, task, date, duration }]
let currentMode = 'focus';
let timeLeft = modes[currentMode] * 60;
let timerId = null;
let isRunning = false;

const DEFAULT_GOALS = {
    daily: 4,
    weekly: 20
};
let goals = { ...DEFAULT_GOALS };

// Session Flow State
let longBreakInterval = 4;
let focusCount = 0; // Cumulative focus sessions in one loop
let flowtimeRatio = 5;
let elapsedFlowtime = 0; // Track seconds in Flowtime
let theme = 'system';

// Breathing State
const BREATH_SESSIONS = {
    micro: {
        duration: 1,
        phases: [
            { type: 'Inhale', duration: 2 },
            { type: 'Hold', duration: 1 },
            { type: 'Exhale', duration: 4 }
        ]
    },
    standard: {
        duration: 3,
        phases: [
            { type: 'Inhale', duration: 5 },
            { type: 'Exhale', duration: 5 }
        ]
    },
    deep: {
        duration: 5,
        phases: [
            { type: 'Inhale', duration: 6 },
            { type: 'Hold', duration: 4 },
            { type: 'Exhale', duration: 6 }
        ]
    }
};

let currentBreathSession = 'micro';
let breathPhaseIndex = 0;
let breathTimeInPhase = 0;

// DOM Elements
const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const alarmSound = document.getElementById('alarm-sound');
const modeBtns = document.querySelectorAll('.mode-btn');
const titleDisplay = document.querySelector('.title');

// Progress Ring Elements
const circle = document.querySelector('.progress-ring__circle');
const phaseCircle = document.querySelector('.phase-ring__circle');
const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;

const phaseRadius = phaseCircle.r.baseVal.value;
const phaseCircumference = phaseRadius * 2 * Math.PI;

// Task Elements
const taskInput = document.getElementById('task-input');
const taskDisplay = document.getElementById('task-display');
const currentTaskText = document.getElementById('current-task-text');
const clearTaskBtn = document.getElementById('clear-task-btn');
const completeTaskBtn = document.getElementById('complete-task-btn');

// History Elements
const historyBtn = document.getElementById('history-btn');
const historyModal = document.getElementById('history-modal');
const historyList = document.getElementById('history-list');
const closeHistoryBtn = document.getElementById('close-history-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const statsToday = document.getElementById('stats-today');
const statsWeek = document.getElementById('stats-week');
const statsTotal = document.getElementById('stats-total');

// Settings Elements
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const inputs = {
    focus: document.getElementById('focus-time-input'),
    short: document.getElementById('short-time-input'),
    long: document.getElementById('long-time-input'),
    longBreakInterval: document.getElementById('long-break-interval-input'),
    autoTransition: document.getElementById('auto-transition-toggle'),
    preset: document.getElementById('preset-select'),
    flowtimeRatio: document.getElementById('flowtime-ratio-input'),
    dailyGoal: document.getElementById('daily-goal-input'),
    weeklyGoal: document.getElementById('weekly-goal-input'),
    theme: document.getElementById('theme-select')
};

// Goal Display Elements
const goalProgressToday = document.getElementById('goal-progress-today');
const goalProgressWeek = document.getElementById('goal-progress-week');
const goalTextToday = document.getElementById('goal-text-today');
const goalTextWeek = document.getElementById('goal-text-week');

// Breathing Elements
const breathOptions = document.getElementById('breath-options');
const breathInstruction = document.getElementById('breath-instruction');
const phaseCountdown = document.getElementById('phase-countdown');
const breathSessionBtns = document.querySelectorAll('.breath-session-btn');
const sessionCounter = document.getElementById('session-counter');

// --- Initialization ---

function init() {
    if (typeof APP_VERSION !== 'undefined' && typeof BUILD_TIME !== 'undefined') {
        console.log(`Pomodoro Timer v${APP_VERSION} (Build ${BUILD_TIME}) - Loaded`);
    } else {
        console.log("Pomodoro Timer - Loaded");
    }
    // Setup Ring

    // Recalculate circumference based on actual or fallback radius
    // We update the global circumference variable if needed, but it's const.
    // So we should probably move circumference var or just trust the math.
    // Since 'circumference' is const defined at top, we can't reassign it. 
    // Let's rely on the top-level calculation but ensure strokeDasharray is set.

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;

    phaseCircle.style.strokeDasharray = `${phaseCircumference} ${phaseCircumference}`;
    phaseCircle.style.strokeDashoffset = phaseCircumference;

    // Load config from localStorage
    const savedModes = localStorage.getItem('pomodoroModes');
    if (savedModes) {
        modes = JSON.parse(savedModes);
    }

    // Load history from localStorage
    const savedHistory = localStorage.getItem('pomodoroHistory');
    if (savedHistory) {
        history = JSON.parse(savedHistory);
        sanitizeHistory();
    }

    // Load goals from localStorage
    const savedGoals = localStorage.getItem('pomodoroGoals');
    if (savedGoals) {
        goals = JSON.parse(savedGoals);
    }

    inputs.focus.value = modes.focus;
    inputs.short.value = modes.short;
    inputs.long.value = modes.long;
    inputs.dailyGoal.value = goals.daily;
    inputs.weeklyGoal.value = goals.weekly;

    // Load Session Settings
    const savedSessionSettings = localStorage.getItem('pomodoroSessionSettings');
    if (savedSessionSettings) {
        const settings = JSON.parse(savedSessionSettings);
        autoTransition = settings.autoTransition ?? true;
        longBreakInterval = settings.longBreakInterval ?? 4;
        focusCount = settings.focusCount ?? 0;
        flowtimeRatio = settings.flowtimeRatio ?? 5;
    }
    inputs.autoTransition.checked = autoTransition;
    inputs.longBreakInterval.value = longBreakInterval;
    inputs.flowtimeRatio.value = flowtimeRatio;

    const savedTheme = localStorage.getItem('pomodoroTheme');
    if (savedTheme) {
        theme = savedTheme;
    }
    inputs.theme.value = theme;
    applyTheme(theme);

    // Set Version Display
    if (typeof APP_VERSION !== 'undefined' && typeof BUILD_TIME !== 'undefined') {
        const versionEl = document.getElementById('app-version');
        if (versionEl) versionEl.textContent = `v${APP_VERSION} (Build ${BUILD_TIME})`;
    }

    // Set initial timer
    resetTimer();
}

// --- Helpers ---

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function setProgress(percent, el = circle, circ = circumference) {
    // If element is provided, we should probably check its actual circumference 
    // in case of responsive changes.
    const currentCirc = el.getTotalLength ? el.getTotalLength() : circ;
    const offset = currentCirc - (percent / 100) * currentCirc;
    el.style.strokeDashoffset = offset;
}

function updateDisplay() {
    const displayTime = currentMode === 'flowtime' ? elapsedFlowtime : timeLeft;
    timeDisplay.textContent = formatTime(displayTime);

    const modeName = currentMode === 'focus' ? 'Focus' :
        currentMode === 'flowtime' ? 'Flowtime Focus' :
            currentMode === 'breath' ? 'Breath' :
                currentMode === 'short' ? 'Short Break' : 'Long Break';

    const taskPart = currentTaskText.textContent ? `[${currentTaskText.textContent}] ` : '';
    document.title = `${formatTime(displayTime)} - ${taskPart}${modeName}`;

    // Update Ring
    if (currentMode === 'flowtime') {
        circle.style.strokeDashoffset = 0;
    } else if (currentMode === 'breath') {
        const totalTime = BREATH_SESSIONS[currentBreathSession].duration * 60;
        const percent = (timeLeft / totalTime) * 100;
        setProgress(percent, circle, circumference);
    } else {
        const totalTime = modes[currentMode] * 60;
        const percent = (timeLeft / totalTime) * 100;
        setProgress(percent, circle, circumference);
    }

    // Update Session Counter
    if (currentMode === 'focus') {
        sessionCounter.textContent = `#${focusCount + 1}`;
        sessionCounter.classList.remove('hidden');
    } else if (currentMode === 'short' || currentMode === 'long') {
        sessionCounter.textContent = `Set Progress: ${focusCount}/${longBreakInterval}`;
        sessionCounter.classList.remove('hidden');
    } else {
        sessionCounter.classList.add('hidden');
    }
}

function saveSettings() {
    const newFocus = parseInt(inputs.focus.value);
    const newShort = parseInt(inputs.short.value);
    const newLong = parseInt(inputs.long.value);
    const newDailyGoal = parseFloat(inputs.dailyGoal.value);
    const newWeeklyGoal = parseFloat(inputs.weeklyGoal.value);
    const newLongBreakInterval = parseInt(inputs.longBreakInterval.value);
    const newAutoTransition = inputs.autoTransition.checked;
    const newFlowtimeRatio = parseInt(inputs.flowtimeRatio.value);
    const newTheme = inputs.theme.value;

    // Basic Validation
    if (newFocus > 0) modes.focus = newFocus;
    if (newShort > 0) modes.short = newShort;
    if (newLong > 0) modes.long = newLong;
    if (newDailyGoal > 0) goals.daily = newDailyGoal;
    if (newWeeklyGoal > 0) goals.weekly = newWeeklyGoal;
    if (newLongBreakInterval > 0) longBreakInterval = newLongBreakInterval;
    if (newFlowtimeRatio >= 2) flowtimeRatio = newFlowtimeRatio;
    autoTransition = newAutoTransition;

    localStorage.setItem('pomodoroModes', JSON.stringify(modes));
    localStorage.setItem('pomodoroGoals', JSON.stringify(goals));
    localStorage.setItem('pomodoroSessionSettings', JSON.stringify({
        autoTransition,
        longBreakInterval,
        focusCount,
        flowtimeRatio
    }));
    theme = newTheme;
    localStorage.setItem('pomodoroTheme', theme);
    applyTheme(theme);

    settingsModal.classList.remove('open');
    calculateHistoryStats(); // Refresh stats/goals
    if (!isRunning) {
        resetTimer();
    }
}

function applyPreset(presetName) {
    if (presetName === 'custom') return;

    const PRESETS = {
        pomodoro: { focus: 25, short: 5, long: 15 },
        coding: { focus: 50, short: 10, long: 30 },
        study: { focus: 45, short: 15, long: 30 }
    };

    const config = PRESETS[presetName];
    if (config) {
        inputs.focus.value = config.focus;
        inputs.short.value = config.short;
        inputs.long.value = config.long;
    }
}

function switchMode(mode) {
    currentMode = mode;

    modeBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) btn.classList.add('active');
    });

    // Manage mode classes without overwriting theme classes
    document.body.classList.remove('focus-mode', 'short-break-break', 'long-break-break', 'flowtime-break', 'breath-mode');

    // Hide breath options by default
    breathOptions.classList.add('hidden');
    breathInstruction.classList.add('hidden');
    circle.classList.remove('breathing-ring');

    if (mode === 'flowtime') {
        document.body.classList.add('flowtime-break');
    } else if (mode === 'breath') {
        document.body.classList.add('breath-mode');
        breathOptions.classList.remove('hidden');
        timeLeft = BREATH_SESSIONS[currentBreathSession].duration * 60;
    } else if (mode !== 'focus') {
        document.body.classList.add(`${mode}-break`);
    }

    titleDisplay.textContent = mode === 'focus' ? 'Focus' :
        mode === 'flowtime' ? 'Flowtime' :
            mode === 'breath' ? 'Breath' :
                mode === 'short' ? 'Short Break' : 'Long Break';

    resetTimer();
}

function applyTheme(themeValue) {
    document.body.classList.remove('light-theme', 'dark-theme');

    if (themeValue === 'light') {
        document.body.classList.add('light-theme');
    } else if (themeValue === 'dark') {
        document.body.classList.add('dark-theme');
    } else if (themeValue === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.add('light-theme');
        }
    }
}

// System theme change listener
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (theme === 'system') {
        applyTheme('system');
    }
});

// --- History Logic ---

function addToHistory(taskName, durationOverride = null) {
    // Check if there is actually a task name to save
    if (!taskName) taskName = "Untitled Session";

    const entry = {
        id: Date.now(),
        task: taskName,
        date: new Date().toLocaleString(), // Format nicely?
        duration: durationOverride || modes.focus
    };

    history.unshift(entry); // Add to top
    localStorage.setItem('pomodoroHistory', JSON.stringify(history));
    renderHistory();
}

function sanitizeHistory() {
    let changed = false;
    history = history.map(item => {
        const id = Number(item.id);
        const duration = parseInt(item.duration);
        if (item.id !== id || item.duration !== duration) {
            changed = true;
            return { ...item, id: isNaN(id) ? Date.now() : id, duration: isNaN(duration) ? 25 : duration };
        }
        return item;
    });
    if (changed) {
        localStorage.setItem('pomodoroHistory', JSON.stringify(history));
    }
}

function formatDuration(totalMins) {
    if (totalMins < 60) return `${totalMins}m`;
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function calculateHistoryStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    // Get the start of the current week (Monday)
    const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
    const diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1); // Monday is day 1
    const weekStart = todayStart - (diffToMonday * 24 * 60 * 60 * 1000);

    let totalMins = 0;
    let todayMins = 0;
    let weekMins = 0;

    history.forEach(item => {
        const id = Number(item.id);
        if (isNaN(id) || id === 0) return;

        const duration = parseInt(item.duration) || 0;
        totalMins += duration;

        // Use a 100ms buffer to catch items exactly at todayStart
        if (id >= todayStart - 100) {
            todayMins += duration;
        }
        if (id >= weekStart - 100) {
            weekMins += duration;
        }
    });

    statsToday.textContent = formatDuration(todayMins);
    statsWeek.textContent = formatDuration(weekMins);
    statsTotal.textContent = formatDuration(totalMins);

    // Update Goal Progress
    updateGoalUI(todayMins, weekMins);

    console.log(`Stats updated: [Today: ${todayMins}m] [Week: ${weekMins}m] [Total: ${totalMins}m] items: ${history.length}`);
    console.log(`Debug - TodayStart: ${new Date(todayStart).toLocaleString()}, WeekStart: ${new Date(weekStart).toLocaleString()}`);
}

function updateGoalUI(todayMins, weekMins) {
    const dailyGoalMins = goals.daily * 60;
    const weeklyGoalMins = goals.weekly * 60;

    const dailyPercent = Math.min(100, Math.round((todayMins / dailyGoalMins) * 100)) || 0;
    const weeklyPercent = Math.min(100, Math.round((weekMins / weeklyGoalMins) * 100)) || 0;

    goalProgressToday.style.width = `${dailyPercent}%`;
    goalProgressWeek.style.width = `${weeklyPercent}%`;

    goalTextToday.textContent = `${dailyPercent}% of ${goals.daily}h goal`;
    goalTextWeek.textContent = `${weeklyPercent}% of ${goals.weekly}h goal`;

    // Visual feedback when goal reached
    goalProgressToday.style.background = dailyPercent >= 100
        ? 'linear-gradient(90deg, #4ade80, #22c55e)' // Green for reached
        : 'linear-gradient(90deg, #ff6b6b, #ff8e8e)';

    goalProgressWeek.style.background = weeklyPercent >= 100
        ? 'linear-gradient(90deg, #4ade80, #22c55e)'
        : 'linear-gradient(90deg, #ff6b6b, #ff8e8e)';
}

function renderHistory() {
    calculateHistoryStats();
    historyList.innerHTML = '';

    if (history.length === 0) {
        historyList.innerHTML = '<li style="text-align:center; opacity:0.5; margin-top:2rem;">No history yet</li>';
        return;
    }

    history.forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-item';

        // Simple date formatting - Include year for unambiguous parsing back
        const dateObj = new Date(item.id);
        const dateStr = dateObj.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        li.innerHTML = `
            <div class="history-info">
                <span class="history-task" contenteditable="true" data-id="${item.id}" data-type="task">${item.task}</span>
                <span class="history-time" contenteditable="true" data-id="${item.id}" data-type="date">${dateStr}</span>
            </div>
            <div class="history-actions">
                <span class="history-duration" contenteditable="true" data-id="${item.id}" data-type="duration">${item.duration}m</span>
                <button class="delete-item-btn" data-id="${item.id}" aria-label="Delete item">✕</button>
            </div>
        `;
        historyList.appendChild(li);
    });
}

// Event Delegation for Delete
historyList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-item-btn')) {
        const id = parseInt(e.target.dataset.id);
        if (id) {
            deleteHistoryItem(id);
        }
    }
});

function deleteHistoryItem(id) {
    history = history.filter(item => item.id !== id);
    localStorage.setItem('pomodoroHistory', JSON.stringify(history));
    renderHistory();
}

function updateHistoryItem(id, type, value) {
    const itemIndex = history.findIndex(item => item.id === id);
    if (itemIndex === -1) return;

    if (type === 'task') {
        history[itemIndex].task = value;
    } else if (type === 'duration') {
        // Parse "25m", "25 mins", or just "25"
        const duration = parseInt(value.replace(/[^\d]/g, ''));
        if (!isNaN(duration) && duration > 0) {
            history[itemIndex].duration = duration;
        }
    } else if (type === 'date') {
        let newDate = new Date(value);

        // Super-robust fallback parsing
        if (isNaN(newDate.getTime())) {
            // Try Month Day format (e.g., "Jan 20")
            const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
            const mMatch = value.toLowerCase().match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})/);

            if (mMatch) {
                const month = months.indexOf(mMatch[1]);
                const day = parseInt(mMatch[2]);
                const year = new Date().getFullYear();
                // Extract time if present (e.g., 06:46 PM)
                const tMatch = value.match(/(\d{1,2}):(\d{1,2})(\s*(am|pm))?/i);
                let hour = 0, min = 0;
                if (tMatch) {
                    hour = parseInt(tMatch[1]);
                    min = parseInt(tMatch[2]);
                    if (tMatch[4]?.toLowerCase() === 'pm' && hour < 12) hour += 12;
                    if (tMatch[4]?.toLowerCase() === 'am' && hour === 12) hour = 0;
                }
                newDate = new Date(year, month, day, hour, min);
            } else {
                // Try DD.MM.YYYY logic
                const dMatch = value.match(/(\d{1,2})[\.\/](\d{1,2})([\.\/](\d{2,4}))?/);
                if (dMatch) {
                    const day = parseInt(dMatch[1]);
                    const month = parseInt(dMatch[2]) - 1;
                    let year = dMatch[4] ? parseInt(dMatch[4]) : new Date().getFullYear();
                    if (year < 100) year += 2000;
                    newDate = new Date(year, month, day);
                }
            }
        }

        if (!isNaN(newDate.getTime())) {
            // Year Guard: If browser defaulted to something weird like 2001, reset to current year
            if (newDate.getFullYear() < 2010) {
                newDate.setFullYear(new Date().getFullYear());
            }

            history[itemIndex].id = Number(newDate.getTime());
            history.sort((a, b) => b.id - a.id);
        } else {
            console.error(`Failed to parse date: "${value}"`);
        }
    }

    localStorage.setItem('pomodoroHistory', JSON.stringify(history));
    // Re-render to update UI (formatting and order)
    renderHistory();
}

// History Inline Editing Delegation
historyList.addEventListener('focusout', (e) => {
    if (e.target.hasAttribute('contenteditable')) {
        const id = parseInt(e.target.dataset.id);
        const type = e.target.dataset.type;
        let newValue = e.target.innerText.trim();

        if (type === 'duration') {
            newValue = newValue.replace(/m$/, ''); // Only strip 'm' for duration
        }

        if (newValue || type === 'task') {
            updateHistoryItem(id, type, newValue);
        } else {
            renderHistory(); // Revert
        }
    }
});

historyList.addEventListener('keydown', (e) => {
    if (e.target.hasAttribute('contenteditable') && e.key === 'Enter') {
        e.preventDefault();
        e.target.blur();
    }
});

// --- Timer Logic ---

// --- Timer Logic ---

async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
    }
}

function showNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        const msg = currentMode === 'focus' ? 'Focus complete! Take a break.' : 'Break over! Back to work.';
        new Notification('Timer Finished', {
            body: msg,
            icon: 'https://cdn-icons-png.flaticon.com/512/2928/2928750.png'
        });
    }
}

function startTimer() {
    if (isRunning) {
        if (currentMode === 'flowtime') {
            stopFlowtime();
        } else {
            pauseTimer();
        }
    } else {
        requestNotificationPermission();
        isRunning = true;
        startBtn.textContent = currentMode === 'flowtime' ? 'Stop & Break' : 'Pause';

        timerId = setInterval(() => {
            if (currentMode === 'flowtime') {
                elapsedFlowtime++;
            } else if (currentMode === 'breath') {
                handleBreathingTick();
            } else {
                timeLeft--;
            }

            updateDisplay();

            if (currentMode !== 'flowtime' && timeLeft <= 0) {
                clearInterval(timerId);
                isRunning = false;
                startBtn.textContent = 'Start';

                if (soundEnabled) {
                    alarmSound.play().catch(e => console.log('Audio error', e));
                }

                showNotification();

                // Special handling for Breath mode completion
                if (currentMode === 'breath') {
                    breathInstruction.textContent = 'Finished';
                    if (phaseCountdown) phaseCountdown.textContent = '';
                    breathInstruction.classList.remove('pulse');
                    circle.classList.remove('breathing-ring');
                    setTimeout(() => {
                        switchMode('focus');
                    }, 2000);
                    return;
                }

                // Add to history if Focus
                if (currentMode === 'focus') {
                    addToHistory(currentTaskText.textContent);
                    focusCount++;
                    localStorage.setItem('pomodoroSessionSettings', JSON.stringify({
                        autoTransition,
                        longBreakInterval,
                        focusCount
                    }));
                }

                if (autoTransition) {
                    handleAutoTransition();
                }
            }
        }, 1000);
    }
}

function handleAutoTransition() {
    let nextMode = 'focus';

    if (currentMode === 'focus') {
        if (focusCount >= longBreakInterval) {
            nextMode = 'long';
            focusCount = 0; // Reset after long break
        } else {
            nextMode = 'short';
        }
    } else {
        // From any break, back to focus
        nextMode = 'focus';
    }

    switchMode(nextMode);
    startTimer(); // Auto start next session
}

function stopFlowtime() {
    if (elapsedFlowtime > 0) {
        const breakMins = Math.max(1, Math.floor(elapsedFlowtime / 60 / flowtimeRatio));

        // Create a temporary history entry or modify addToHistory to accept duration
        const focusDurationMins = Math.ceil(elapsedFlowtime / 60);

        // Add to history
        addToHistory(currentTaskText.textContent || 'Flowtime Session', focusDurationMins);

        // Switch to break
        currentMode = 'short';
        timeLeft = breakMins * 60;

        pauseTimer(); // Stop the count-up

        // Update UI state for mode
        modeBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === 'short') btn.classList.add('active');
        });
        document.body.className = 'short-break';
        titleDisplay.textContent = 'Short Break';

        if (autoTransition) {
            startTimer(); // Start the calculated break
        } else {
            updateDisplay();
        }
    } else {
        pauseTimer();
    }
}

function pauseTimer() {
    clearInterval(timerId);
    isRunning = false;
    startBtn.textContent = 'Start';
}

function resetTimer() {
    pauseTimer();
    elapsedFlowtime = 0;
    timeLeft = currentMode === 'breath'
        ? BREATH_SESSIONS[currentBreathSession].duration * 60
        : modes[currentMode] * 60;

    // Reset breathing state
    breathPhaseIndex = 0;
    breathTimeInPhase = 0;
    if (breathInstruction) {
        breathInstruction.textContent = 'Ready?';
        breathInstruction.classList.remove('pulse');
    }
    circle.classList.remove('breathing-ring');

    // Reset ring to full
    circle.style.strokeDashoffset = 0;
    if (phaseCircle) phaseCircle.style.strokeDashoffset = phaseCircle.getTotalLength ? phaseCircle.getTotalLength() : phaseCircumference;
    if (phaseCountdown) {
        phaseCountdown.textContent = '';
    }
    updateDisplay();
}

function handleBreathingTick() {
    timeLeft--;
    breathTimeInPhase++;

    const session = BREATH_SESSIONS[currentBreathSession];
    let currentPhase = session.phases[breathPhaseIndex];

    if (breathTimeInPhase >= currentPhase.duration) {
        breathPhaseIndex = (breathPhaseIndex + 1) % session.phases.length;
        breathTimeInPhase = 0;
        currentPhase = session.phases[breathPhaseIndex]; // Fixed bug below
    }
    // Re-calculating after potential index change
    currentPhase = session.phases[breathPhaseIndex];

    // Update instruction and countdown
    breathInstruction.textContent = currentPhase.type;
    breathInstruction.classList.remove('hidden');

    const remainingInPhase = currentPhase.duration - breathTimeInPhase;
    phaseCountdown.textContent = remainingInPhase;

    // Update inner progress ring to reflect breath phase (inhale/hold/exhale)
    const phasePercent = (breathTimeInPhase / currentPhase.duration) * 100;

    if (currentPhase.type === 'Inhale') {
        setProgress(phasePercent, phaseCircle, phaseCircumference); // Expanding
    } else if (currentPhase.type === 'Exhale') {
        setProgress(100 - phasePercent, phaseCircle, phaseCircumference); // Contracting
    } else if (currentPhase.type === 'Hold') {
        setProgress(100, phaseCircle, phaseCircumference); // Stay full during hold
    }
}

// --- Edit Timer Logic ---
timeDisplay.addEventListener('click', () => {
    if (document.querySelector('.timer-input')) return; // Already editing

    pauseTimer();

    const currentText = timeDisplay.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'timer-input';
    input.maxLength = 5; // MM:SS

    // Replace text with input
    timeDisplay.textContent = '';
    timeDisplay.appendChild(input);
    input.focus();
    input.select();

    // Save on Enter or Blur
    const saveTime = () => {
        const val = input.value.trim();
        // Regex for MM:SS or Just MM or M:SS
        // Supports: 25, 25:00, 5:00
        const match = val.match(/^(\d{1,2})(:(\d{1,2}))?$/);

        if (match) {
            let mins = parseInt(match[1]);
            let secs = match[3] ? parseInt(match[3]) : 0;

            // Limit logical bounds
            if (mins > 99) mins = 99;
            if (secs > 59) secs = 59;

            if (mins === 0 && secs === 0) {
                // Don't allow 00:00, reset to default? or just ignore
            } else {
                timeLeft = (mins * 60) + secs;
            }
        }

        // Restore display
        updateDisplay();
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveTime();
            input.blur(); // Triggers blur event
        }
    });

    input.addEventListener('blur', () => {
        saveTime(); // Determine if we want to save on blur or just cancel? 
        // Let's save on blur for better UX
    });
});

// --- Task Queue Logic ---
let taskQueue = []; // Array of objects or strings? Let's use objects { id, text }

// Load Queue
const savedQueue = localStorage.getItem('pomodoroTaskQueue');
if (savedQueue) {
    taskQueue = JSON.parse(savedQueue);
}

// Global Elements for Queue
const activeTaskDisplay = document.getElementById('active-task-display');
const taskInputGroup = document.getElementById('task-input-group');
const addTaskBtn = document.getElementById('add-task-btn');
const queueContainer = document.getElementById('queue-container');
const taskQueueList = document.getElementById('task-queue-list');
// Re-bind existing elements that might have moved or changed context
// completeTaskBtn is now inside active-task-display

function saveQueue() {
    localStorage.setItem('pomodoroTaskQueue', JSON.stringify(taskQueue));
    updateTaskUI();
}

function updateTaskUI() {
    // 1. Active Task
    if (taskQueue.length > 0) {
        const active = taskQueue[0];
        currentTaskText.textContent = active.text;
        activeTaskDisplay.classList.remove('hidden');
        document.title = `${formatTime(timeLeft)} - [${active.text}] ${currentMode === 'focus' ? 'Focus' : 'Break'}`;
    } else {
        currentTaskText.textContent = '';
        activeTaskDisplay.classList.add('hidden');
        document.title = `${formatTime(timeLeft)} - ${currentMode === 'focus' ? 'Focus' : 'Break'}`;
    }

    // 2. Queue List (Items 1 to end)
    taskQueueList.innerHTML = '';
    if (taskQueue.length > 1) {
        queueContainer.classList.remove('hidden');
        const upcoming = taskQueue.slice(1);
        upcoming.forEach((task, i) => {
            const index = i + 1; // Actual index in taskQueue
            const li = document.createElement('li');
            li.className = 'queue-item';
            li.draggable = true;
            li.dataset.index = index;

            li.innerHTML = `
                <div class="drag-handle">⋮⋮</div>
                <span class="task-text" contenteditable="true" data-index="${index}">${task.text}</span>
                <div class="item-actions">
                    <button class="promote-btn" data-index="${index}" title="Make Current">⬆</button>
                    <button class="remove-queue-btn" data-index="${index}" title="Remove">✕</button>
                </div>
            `;
            taskQueueList.appendChild(li);
        });
    } else {
        queueContainer.classList.add('hidden');
    }
}

function addTaskToQueue(text) {
    if (!text) return;
    taskQueue.push({ id: Date.now(), text });
    saveQueue();
    taskInput.value = '';
}

function completeActiveTask() {
    if (taskQueue.length === 0) return;

    // Calculate elapsed time BEFORE shifting/switching
    let durationMins;
    if (currentMode === 'flowtime') {
        durationMins = Math.ceil(elapsedFlowtime / 60);
    } else {
        // Includes 'focus', 'short', 'long' although we only care about focus usually
        const totalSecs = modes[currentMode] * 60;
        durationMins = Math.ceil((totalSecs - timeLeft) / 60);
    }

    // Ensure at least 1 min if they spent any time
    if (durationMins === 0 && (elapsedFlowtime > 0 || (currentMode === 'focus' && timeLeft < modes.focus * 60))) {
        durationMins = 1;
    }

    const completed = taskQueue.shift(); // Remove top
    saveQueue(); // Save new state

    // Notify
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Task Completed!', {
            body: `You finished "${completed.text}". Great job!`,
            icon: 'https://cdn-icons-png.flaticon.com/512/2928/2928750.png'
        });
    }

    // History
    addToHistory(completed.text, durationMins);

    // If we were in flowtime, we calculate the special break
    if (currentMode === 'flowtime') {
        const breakMins = Math.max(1, Math.floor(elapsedFlowtime / 60 / flowtimeRatio));
        switchMode('short'); // Reset timer state
        timeLeft = breakMins * 60;
        if (autoTransition) {
            startTimer();
        } else {
            updateDisplay();
        }
    } else {
        // Standard Pomodoro flow
        switchMode('short');
        if (autoTransition) {
            startTimer();
        }
    }
}

function removeTaskFromQueue(index) {
    // Index is relative to the full array
    taskQueue.splice(index, 1);
    saveQueue();
}

function promoteTask(index) {
    if (index <= 0 || index >= taskQueue.length) return;

    // Remove from current position
    const [task] = taskQueue.splice(index, 1);
    // Add to top (current)
    taskQueue.unshift(task);

    saveQueue();
}

function updateTaskText(index, newText) {
    if (taskQueue[index]) {
        taskQueue[index].text = newText;
        localStorage.setItem('pomodoroTaskQueue', JSON.stringify(taskQueue));
    }
}

// Input Handlers
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && taskInput.value.trim() !== '') {
        addTaskToQueue(taskInput.value.trim());
    }
});

addTaskBtn.addEventListener('click', () => {
    if (taskInput.value.trim() !== '') {
        addTaskToQueue(taskInput.value.trim());
    }
});

activeTaskDisplay.addEventListener('click', (e) => {
    // Handle buttons inside valid task display
    if (e.target.id === 'complete-task-btn') {
        completeActiveTask();
    } else if (e.target.id === 'clear-task-btn') {
        // Cancel task (remove without history?)
        if (confirm('Cancel current task?')) {
            taskQueue.shift();
            saveQueue();
        }
    }
});

// Queue Interactions (Delegation)
taskQueueList.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const index = parseInt(btn.dataset.index);

    if (btn.classList.contains('remove-queue-btn')) {
        removeTaskFromQueue(index);
    } else if (btn.classList.contains('promote-btn')) {
        promoteTask(index);
    }
});

// Editing Logic
taskQueueList.addEventListener('focusout', (e) => {
    if (e.target.classList.contains('task-text')) {
        const index = parseInt(e.target.dataset.index);
        const newText = e.target.innerText.trim();
        if (newText) {
            updateTaskText(index, newText);
        } else {
            updateTaskUI(); // Revert empty edits
        }
    }
});

taskQueueList.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('task-text') && e.key === 'Enter') {
        e.preventDefault(); // Prevent newline
        e.target.blur(); // Trigger focusout to save
    }
});

// Current Task Editing
currentTaskText.addEventListener('focusout', () => {
    const newText = currentTaskText.innerText.trim();
    if (newText && taskQueue.length > 0) {
        taskQueue[0].text = newText;
        localStorage.setItem('pomodoroTaskQueue', JSON.stringify(taskQueue));
        updateDisplay(); // Update document title
    } else {
        updateTaskUI(); // Revert
    }
});

currentTaskText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        currentTaskText.blur();
    }
});

// Drag and Drop Logic
let draggedItemIndex = null;

taskQueueList.addEventListener('dragstart', (e) => {
    const item = e.target.closest('.queue-item');
    if (item) {
        draggedItemIndex = parseInt(item.dataset.index);
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }
});

taskQueueList.addEventListener('dragend', (e) => {
    const item = e.target.closest('.queue-item');
    if (item) item.classList.remove('dragging');
    draggedItemIndex = null;
});

taskQueueList.addEventListener('dragover', (e) => {
    e.preventDefault(); // Allow drop
    e.dataTransfer.dropEffect = 'move';
});

taskQueueList.addEventListener('drop', (e) => {
    e.preventDefault();
    const targetItem = e.target.closest('.queue-item');
    if (targetItem) {
        const targetIndex = parseInt(targetItem.dataset.index);
        if (draggedItemIndex !== null && draggedItemIndex !== targetIndex) {
            const [item] = taskQueue.splice(draggedItemIndex, 1);
            let insertPos = targetIndex;
            if (draggedItemIndex < targetIndex) {
                insertPos = targetIndex - 1;
            }
            taskQueue.splice(insertPos, 0, item);
            saveQueue();
        }
    }
});

// Initial Render
updateTaskUI();

// --- Event Listeners ---

startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        switchMode(btn.dataset.mode);
    });
});

// Breathing Session Selection
breathSessionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentBreathSession = btn.dataset.session;
        breathSessionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        resetTimer();
    });
});

// --- Settings Logic ---
let soundEnabled = true;
const soundToggle = document.getElementById('sound-toggle');

function loadSettings() {
    // ... existing time modes load ...
    const savedSound = localStorage.getItem('pomodoroSound');
    if (savedSound !== null) {
        soundEnabled = savedSound === 'true';
    }
    soundToggle.checked = soundEnabled;
}

// Update initialization to call loadSettings inside init() 
// wait, init() already does loading. Let's hook into it or just add it there.
// Actually, let's keep it clean.

settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('open');
    soundToggle.checked = soundEnabled; // Ensure UI matches state
    inputs.preset.value = 'custom'; // Reset preset select to custom when opening
});

inputs.preset.addEventListener('change', (e) => {
    applyPreset(e.target.value);
});

inputs.theme.addEventListener('change', (e) => {
    applyTheme(e.target.value);
});

closeModalBtn.addEventListener('click', () => {
    saveSettings();
    // also save sound
    soundEnabled = soundToggle.checked;
    localStorage.setItem('pomodoroSound', soundEnabled);
});

// ... inside startTimer interval ...
// if (timeLeft === 0) { ...
//     if (soundEnabled) {
//         alarmSound.play().catch(...)
//     }
// ... }

// Let's modify startTimer directly in a separate Replace chunk or rewrite it?
// The user instruction implies updating script.js. I'll use a specific target for startTimer.

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.remove('open');
        inputs.focus.value = modes.focus;
        inputs.short.value = modes.short;
        inputs.long.value = modes.long;
    }
});

// History Event Listeners
historyBtn.addEventListener('click', () => {
    renderHistory();
    historyModal.classList.add('open');
});

closeHistoryBtn.addEventListener('click', () => {
    historyModal.classList.remove('open');
});

historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) {
        historyModal.classList.remove('open');
    }
});

clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Clear all history?')) {
        history = [];
        localStorage.removeItem('pomodoroHistory');
        renderHistory();
    }
});

// Start
init();

// --- PWA Update Logic ---
window.addEventListener('pwaUpdateAvailable', (event) => {
    const registration = event.detail;
    if (!registration || !registration.waiting) return;

    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'pwa-update-toast';
    notification.className = 'glass-toast';
    notification.innerHTML = `
        <div class="toast-content">
            <p>A new version is available!</p>
            <button id="pwa-update-btn" class="btn small">Update Now</button>
        </div>
    `;

    document.body.appendChild(notification);

    document.getElementById('pwa-update-btn').addEventListener('click', () => {
        registration.waiting.postMessage('SKIP_WAITING');
        notification.remove();
    });
});
