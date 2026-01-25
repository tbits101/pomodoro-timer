// Config & State
const DEFAULT_MODES = {
    focus: 25,
    short: 5,
    long: 15
};

let modes = { ...DEFAULT_MODES };
let history = []; // [{ id, task, date, duration }]
let currentCategory = 'focus';
let currentSubMode = 'focus';
let currentMode = 'focus'; // Keep for compatibility with existing logic for now
let timeLeft = modes[currentMode] * 60;
let timerId = null;
let isRunning = false;
let currentSessionDuration = modes[currentMode] * 60;

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
let autoStartBreaks = true;
let autoStartWork = true;

// Pause & Interruption Tracking
let sessionInterruptions = 0;
let sessionPausedTime = 0; // Total seconds paused
let pauseStartTime = null;

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
    },
    box: {
        duration: 2,
        phases: [
            { type: 'Inhale', duration: 4 },
            { type: 'Hold', duration: 4 },
            { type: 'Exhale', duration: 4 },
            { type: 'Hold', duration: 4, empty: true }
        ]
    },
    relax: {
        duration: 2,
        phases: [
            { type: 'Inhale', duration: 4 },
            { type: 'Hold', duration: 7 },
            { type: 'Exhale', duration: 8 }
        ]
    },
    custom: {
        duration: 5,
        phases: [] // Populated dynamically
    }
};

let currentBreathSession = 'micro';
let breathTimeInPhase = 0;

// Sport Interval State
let intervalWorkTime = 40;
let intervalRestTime = 20;
let totalIntervalCycles = 8;
let currentCycle = 1;
let isIntervalRest = false;

// Grounding State
const GROUNDING_STEPS = [
    { count: 5, prompt: "Things you see" },
    { count: 4, prompt: "Things you can touch" },
    { count: 3, prompt: "Things you hear" },
    { count: 2, prompt: "Things you can smell" },
    { count: 1, prompt: "Thing you can taste" }
];
let groundingStepIndex = 0;

// Grill Master State
let flipReminderInterval = 120; // 2 minutes
let isFlipReminderEnabled = false;
let flipReminderTimer = null;
let lastFlipTime = 0;

// Deadline Timer State
let deadlineTarget = null;

// Multi-Timer State
let multiTimers = []; // { id, name, duration, timeLeft, isRunning }
let multiTimerIntervalId = null;

// DOM Elements
const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const alarmSound = document.getElementById('alarm-sound');
const categoryBtns = document.querySelectorAll('.category-btn');
const submodeSwitchers = document.querySelectorAll('.mode-switcher');
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
    autoStartBreaks: document.getElementById('auto-start-breaks-toggle'),
    autoStartWork: document.getElementById('auto-start-work-toggle'),
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
const groundingInstruction = document.getElementById('grounding-instruction');
const phaseCountdown = document.getElementById('phase-countdown');
const breathSessionBtns = document.querySelectorAll('.breath-session-btn');
const sessionCounter = document.getElementById('session-counter');
const customBreathConfig = document.getElementById('custom-breath-config');
const customInputs = {
    inhale: document.getElementById('custom-inhale'),
    hold: document.getElementById('custom-hold'),
    exhale: document.getElementById('custom-exhale'),
    holdEmpty: document.getElementById('custom-hold-empty'),
    duration: document.getElementById('custom-duration')
};

// Grill Elements
const grillPresets = document.getElementById('grill-presets');
const steakBtns = document.querySelectorAll('.steak-btn');
const flipToggle = document.getElementById('flip-reminder-toggle');

// Sport Elements
const intervalWorkInput = document.getElementById('interval-work-input');
const intervalRestInput = document.getElementById('interval-rest-input');
const intervalCyclesInput = document.getElementById('interval-cycles-input');

// Deadline Elements
const deadlineOptions = document.getElementById('deadline-options');
const deadlineInput = document.getElementById('deadline-input');

// Multi-Timer Elements
const multiTimerDashboard = document.getElementById('multi-timer-dashboard');
const timerGrid = document.getElementById('timer-grid');
const addTimerBtn = document.getElementById('add-timer-btn');
const presetTimeBtns = document.querySelectorAll('.preset-time-btn');

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
        autoStartBreaks = settings.autoStartBreaks ?? settings.autoTransition ?? true;
        autoStartWork = settings.autoStartWork ?? settings.autoTransition ?? true;
        longBreakInterval = settings.longBreakInterval ?? 4;
        focusCount = settings.focusCount ?? 0;
        flowtimeRatio = settings.flowtimeRatio ?? 5;
    }
    inputs.autoStartBreaks.checked = autoStartBreaks;
    inputs.autoStartWork.checked = autoStartWork;
    inputs.longBreakInterval.value = longBreakInterval;
    inputs.flowtimeRatio.value = flowtimeRatio;

    const savedTheme = localStorage.getItem('pomodoroTheme');
    if (savedTheme) {
        theme = savedTheme;
    }
    inputs.theme.value = theme;
    applyTheme(theme);

    // Load Deadline
    const savedDeadline = localStorage.getItem('pomodoroDeadline');
    if (savedDeadline) {
        // We restore the target, but we don't auto-start the timer to avoid ringing immediately if expired
        // Or maybe we just set the input value?
        deadlineTarget = parseInt(savedDeadline);
        // Convert timestamp to YYYY-MM-DDTHH:MM for input
        const date = new Date(deadlineTarget);
        // Adjust for timezone offset to show correct local time in input
        const localIso = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        if (deadlineInput) deadlineInput.value = localIso;
    }

    // Set Version Display
    if (typeof APP_VERSION !== 'undefined' && typeof BUILD_TIME !== 'undefined') {
        const versionEl = document.getElementById('app-version');
        if (versionEl) versionEl.textContent = `v${APP_VERSION} (Build ${BUILD_TIME})`;
    }

    // Set initial timer
    switchCategory('focus');
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

    // Handle Deadline Display
    if (currentMode === 'deadline') {
        timeDisplay.classList.add('deadline-display');
        timeDisplay.classList.remove('timer-display');

        if (deadlineTarget) {
            const diff = deadlineTarget - Date.now();
            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                let text = '';
                if (days > 0) text += `${days}d `;
                text += `${hours}h ${minutes}m ${seconds}s`;
                timeDisplay.textContent = text;
            } else {
                timeDisplay.textContent = "Time's up!";
            }
        } else {
            timeDisplay.textContent = "--d --h --m --s";
        }
    } else {
        timeDisplay.classList.remove('deadline-display');
        timeDisplay.classList.add('timer-display');
        timeDisplay.textContent = formatTime(displayTime);
    }

    // Map submodes to user-friendly names
    const modeNameMap = {
        focus: 'Focus',
        flowtime: 'Flowtime Focus',
        short: 'Short Break',
        long: 'Long Break',
        breath: 'Breathing',
        grounding: 'Grounding',
        microbreak: 'Micro-Break',
        interval: 'Interval',
        stopwatch: 'Stopwatch',
        multi: 'Kitchen',
        countdown: 'Timer',
        deadline: 'Deadline'
    };

    const modeName = modeNameMap[currentMode] || 'Timer';
    const taskPart = currentTaskText.textContent ? `[${currentTaskText.textContent}] ` : '';
    document.title = `${formatTime(displayTime)} - ${taskPart}${modeName}`;

    // Update Ring
    if (currentMode === 'flowtime') {
        circle.style.strokeDashoffset = 0;
    } else if (currentMode === 'breath') {
        const percent = (timeLeft / currentSessionDuration) * 100;
        setProgress(percent, circle, circumference);
    } else {
        const percent = (timeLeft / currentSessionDuration) * 100;
        setProgress(percent, circle, circumference);
    }

    // Update Session Counter
    if (currentMode === 'focus') {
        sessionCounter.textContent = `#${focusCount + 1}`;
        sessionCounter.classList.remove('hidden');
    } else if (currentMode === 'short' || currentMode === 'long') {
        sessionCounter.textContent = `Set Progress: ${focusCount}/${longBreakInterval}`;
        sessionCounter.classList.remove('hidden');
    } else if (currentMode === 'interval') {
        sessionCounter.textContent = `Cycle ${currentCycle}/${totalIntervalCycles} - ${isIntervalRest ? 'REST' : 'WORK'}`;
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
    const newAutoStartBreaks = inputs.autoStartBreaks.checked;
    const newAutoStartWork = inputs.autoStartWork.checked;
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
    autoStartBreaks = newAutoStartBreaks;
    autoStartWork = newAutoStartWork;

    localStorage.setItem('pomodoroModes', JSON.stringify(modes));
    localStorage.setItem('pomodoroGoals', JSON.stringify(goals));
    localStorage.setItem('pomodoroSessionSettings', JSON.stringify({
        autoStartBreaks,
        autoStartWork,
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

function handleFlipReminder() {
    if (!isRunning || !isFlipReminderEnabled || currentMode !== 'grill') return;

    const elapsed = Math.round((currentSessionDuration - timeLeft));
    if (elapsed > 0 && elapsed % flipReminderInterval === 0 && elapsed !== lastFlipTime) {
        lastFlipTime = elapsed;
        if (soundEnabled) {
            // Distinct sound for flip or just reuse alarm briefly?
            // Reusing alarm but stopping it quickly
            alarmSound.play().catch(e => console.log('Audio error', e));
            setTimeout(() => {
                alarmSound.pause();
                alarmSound.currentTime = 0;
            }, 1000);
        }
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Grill Master', {
                body: 'Time to flip the meat!',
                icon: 'https://cdn-icons-png.flaticon.com/512/2928/2928750.png'
            });
        }
    }
}

function handleGroundingTick() {
    if (!isRunning) return;

    // 5 steps, 1 min each for a 5 min session
    const stepDuration = 60;
    const stepIndex = Math.min(4, Math.floor((currentSessionDuration - timeLeft) / stepDuration));

    if (stepIndex !== groundingStepIndex) {
        groundingStepIndex = stepIndex;
        // Pulse effect?
        groundingInstruction.classList.remove('pulse');
        void groundingInstruction.offsetWidth; // trigger reflow
        groundingInstruction.classList.add('pulse');
    }

    const step = GROUNDING_STEPS[groundingStepIndex];
    groundingInstruction.textContent = `Focus on ${step.count} ${step.prompt}`;
}

function handleIntervalTick() {
    if (!isRunning) return;

    if (timeLeft <= 0) {
        // Switch between Work and Rest
        if (!isIntervalRest) {
            // End of Work
            isIntervalRest = true;
            timeLeft = intervalRestTime;
            currentSessionDuration = intervalRestTime;
            if (soundEnabled) alarmSound.play().catch(e => console.log('Audio error', e));
        } else {
            // End of Rest
            isIntervalRest = false;
            currentCycle++;

            if (currentCycle > totalIntervalCycles) {
                // Entire session complete
                clearInterval(timerId);
                isRunning = false;
                startBtn.textContent = 'Start';
                if (soundEnabled) alarmSound.play().catch(e => console.log('Audio error', e));
                showNotification();
                setTimeout(() => switchCategory('focus'), 2000);
                return;
            }

            timeLeft = intervalWorkTime;
            currentSessionDuration = intervalWorkTime;
            if (soundEnabled) alarmSound.play().catch(e => console.log('Audio error', e));
        }
    }
}

function switchCategory(category) {
    if (currentCategory === category && document.querySelector(`.category-btn[data-category="${category}"]`).classList.contains('active')) {
        // Already in this category, just ensure submode switcher is visible
        submodeSwitchers.forEach(switcher => {
            switcher.classList.toggle('hidden', switcher.dataset.category !== category);
        });
        return;
    }

    currentCategory = category;

    // Update Category UI
    categoryBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });

    // Show relevant submode switcher
    submodeSwitchers.forEach(switcher => {
        switcher.classList.toggle('hidden', switcher.dataset.category !== category);
    });

    // Reset Body Classes for Categories
    document.body.classList.remove('focus-category', 'health-category', 'sport-category', 'kitchen-category', 'utility-category');
    document.body.classList.add(`${category}-category`);

    // Switch to first submode in category
    const firstSubmode = document.querySelector(`.mode-switcher[data-category="${category}"] .mode-btn`);
    if (firstSubmode) {
        switchMode(firstSubmode.dataset.mode);
    }
}

function switchMode(mode) {
    // Map modes to categories for automatic syncing
    const modeToCategory = {
        focus: 'focus', flowtime: 'focus', short: 'focus', long: 'focus',
        breath: 'health', grounding: 'health', microbreak: 'health',
        interval: 'sport', stopwatch: 'sport',
        multi: 'kitchen', grill: 'kitchen',
        countdown: 'utility', deadline: 'utility'
    };

    const targetCategory = modeToCategory[mode];
    if (targetCategory && targetCategory !== currentCategory) {
        // Sync Category UI if switching to a mode in a different category
        currentCategory = targetCategory;
        categoryBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.category === targetCategory));
        submodeSwitchers.forEach(switcher => switcher.classList.toggle('hidden', switcher.dataset.category !== targetCategory));
        document.body.classList.remove('focus-category', 'health-category', 'sport-category', 'kitchen-category', 'utility-category');
        document.body.classList.add(`${targetCategory}-category`);
    }

    currentSubMode = mode;
    currentMode = mode; // Compatibility

    // Update Mode Buttons UI (across all switchers)
    modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Manage mode classes without overwriting theme classes
    document.body.classList.remove('focus-mode', 'short-break', 'long-break', 'flowtime-mode', 'breath-mode', 'grounding-mode', 'microbreak-mode', 'interval-mode', 'stopwatch-mode', 'multi-mode', 'countdown-mode', 'deadline-mode');

    // Hide specific option panels
    breathOptions.classList.add('hidden');
    if (customBreathConfig) customBreathConfig.classList.add('hidden');
    breathInstruction.classList.add('hidden');
    groundingInstruction.classList.add('hidden');
    grillPresets.classList.add('hidden');
    intervalOptions.classList.add('hidden');
    multiTimerDashboard.classList.add('hidden');
    deadlineOptions.classList.add('hidden');
    circle.classList.remove('breathing-ring');

    // Mode-specific initialization
    if (mode === 'flowtime') {
        document.body.classList.add('flowtime-mode');
        titleDisplay.textContent = 'Flowtime';
    } else if (mode === 'breath') {
        document.body.classList.add('breath-mode');
        breathOptions.classList.remove('hidden');
        if (currentBreathSession === 'custom' && customBreathConfig) {
            customBreathConfig.classList.remove('hidden');
        }
        timeLeft = BREATH_SESSIONS[currentBreathSession].duration * 60;
        titleDisplay.textContent = 'Breathing';
    } else if (mode === 'grounding') {
        document.body.classList.add('grounding-mode');
        groundingInstruction.classList.remove('hidden');
        titleDisplay.textContent = 'Grounding';
        timeLeft = 5 * 60;
        groundingStepIndex = -1; // Force first step update
        handleGroundingTick();
    } else if (mode === 'microbreak') {
        document.body.classList.add('health-mode');
        titleDisplay.textContent = 'Micro-Break';
        timeLeft = 1 * 60;
    } else if (mode === 'interval') {
        document.body.classList.add('interval-mode');
        intervalOptions.classList.remove('hidden');
        titleDisplay.textContent = 'Intervals';

        intervalWorkTime = parseInt(intervalWorkInput?.value) || 40;
        intervalRestTime = parseInt(intervalRestInput?.value) || 20;
        totalIntervalCycles = parseInt(intervalCyclesInput?.value) || 8;

        currentCycle = 1;
        isIntervalRest = false;
        timeLeft = intervalWorkTime;
        currentSessionDuration = timeLeft;
    } else if (mode === 'stopwatch') {
        document.body.classList.add('sport-mode');
        titleDisplay.textContent = 'Stopwatch';
        timeLeft = 0; // Stopwatch starts at 0
    } else if (mode === 'grill') {
        document.body.classList.add('grill-mode');
        grillPresets.classList.remove('hidden');
        titleDisplay.textContent = 'Grill Master';
        timeLeft = 6 * 60; // Default Medium
        currentSessionDuration = timeLeft; // Ensure duration is set
    } else if (mode === 'short') {
        document.body.classList.add('short-break');
        titleDisplay.textContent = 'Short Break';
        timeLeft = modes.short * 60;
    } else if (mode === 'long') {
        document.body.classList.add('long-break');
        titleDisplay.textContent = 'Long Break';
        timeLeft = modes.long * 60;
    } else if (mode === 'multi') {
        document.body.classList.add('multi-mode');
        multiTimerDashboard.classList.remove('hidden');
        titleDisplay.textContent = 'Kitchen';
        timeLeft = 0;
    } else if (mode === 'countdown') {
        document.body.classList.add('countdown-mode');
        titleDisplay.textContent = 'Timer';
        timeLeft = 10 * 60;
        timeLeft = 10 * 60;
    } else if (mode === 'deadline') {
        document.body.classList.add('utility-mode'); // Re-use utility styling if exists, or fallback
        deadlineOptions.classList.remove('hidden');
        titleDisplay.textContent = 'Deadline Timer';
        timeLeft = 0; // Not used for display directly
        updateDisplay(); // Force update to show placeholder
    } else {
        // Default (Focus)
        document.body.classList.add('focus-mode');
        titleDisplay.textContent = 'Focus';
        timeLeft = modes.focus * 60;
    }

    // Toggle Task Section & History Button
    // Show only for Focus category modes
    const isFocusCategory = ['focus', 'short', 'long', 'flowtime'].includes(mode);
    const taskSection = document.querySelector('.task-section');
    if (taskSection) taskSection.classList.toggle('hidden', !isFocusCategory);
    if (historyBtn) historyBtn.classList.toggle('hidden', !isFocusCategory);

    // Special handling for Multi-Timer persistence
    if (mode === 'multi') {
        if (!multiTimerIntervalId) {
            startMultiTimerLoop();
        }
    }

    currentSessionDuration = timeLeft;
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

function addToHistory(taskName, durationOverride = null, interruptions = null, pausedTime = null) {
    // Check if there is actually a task name to save
    if (!taskName) taskName = "Untitled Session";

    // Use globals if not provided
    const finalInterruptions = interruptions !== null ? interruptions : sessionInterruptions;
    let finalPausedTime = pausedTime !== null ? pausedTime : sessionPausedTime;

    // If currently paused, add the ongoing pause time
    if (pauseStartTime) {
        const currentPauseDuration = Math.round((Date.now() - pauseStartTime) / 1000);
        finalPausedTime += currentPauseDuration;
    }

    const entry = {
        id: Date.now(),
        task: taskName,
        date: new Date().toLocaleString(), // Format nicely?
        duration: durationOverride || Math.round(currentSessionDuration / 60),
        interruptions: finalInterruptions,
        pausedTime: finalPausedTime
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

        const interruptions = item.interruptions || 0;
        const pausedTime = item.pausedTime || 0;
        const pausedStr = pausedTime > 0 ? `• Paused: ${Math.round(pausedTime / 60)}m` : '';
        const interruptionsStr = interruptions > 0 ? ` (${interruptions} interruptions)` : '';

        li.innerHTML = `
            <div class="history-info">
                <span class="history-task" contenteditable="true" data-id="${item.id}" data-type="task">${item.task}</span>
                <span class="history-time" contenteditable="true" data-id="${item.id}" data-type="date">${dateStr}</span>
                <div class="history-stats">${pausedStr}${interruptionsStr}</div>
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

        // Resume tracking if we were paused
        if (pauseStartTime) {
            const pausedDuration = Math.round((Date.now() - pauseStartTime) / 1000);
            sessionPausedTime += pausedDuration;
            pauseStartTime = null;
        }

        isRunning = true;
        startBtn.textContent = currentMode === 'flowtime' ? 'Stop & Break' : 'Pause';

        // Initialize Deadline
        if (currentMode === 'deadline') {
            if (!deadlineInput.value) {
                alert('Please select a target date and time.');
                isRunning = false;
                startBtn.textContent = 'Start';
                return;
            }
            const target = new Date(deadlineInput.value).getTime();
            if (target <= Date.now()) {
                alert('Please select a future time.');
                isRunning = false;
                startBtn.textContent = 'Start';
                return;
            }
            deadlineTarget = target;
            localStorage.setItem('pomodoroDeadline', deadlineTarget);
        }

        timerId = setInterval(() => {
            if (currentMode === 'flowtime') {
                elapsedFlowtime++;
            } else if (currentMode === 'breath') {
                handleBreathingTick();
            } else {
                if (currentMode === 'stopwatch') {
                    timeLeft++;
                } else if (currentMode === 'deadline') {
                    // Deadline only needs display update, but we check expiry
                    const diff = deadlineTarget - Date.now();
                    timeLeft = Math.floor(diff / 1000); // Sync timeLeft for completion check logic below
                } else {
                    timeLeft--;
                }

                if (currentMode === 'grill') handleFlipReminder();
                if (currentMode === 'grounding') handleGroundingTick();
                if (currentMode === 'interval') handleIntervalTick();
            }

            updateDisplay();

            if (currentMode !== 'flowtime' && currentMode !== 'stopwatch' && timeLeft <= 0) {
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
                    // Reset session stats for next
                    sessionInterruptions = 0;
                    sessionPausedTime = 0;
                    pauseStartTime = null;

                    localStorage.setItem('pomodoroSessionSettings', JSON.stringify({
                        autoStartBreaks,
                        autoStartWork,
                        longBreakInterval,
                        focusCount
                    }));
                }

                handleAutoTransition();
            }
        }, 1000);
    }
}

function handleAutoTransition() {
    // Only auto-transition in Focus category
    if (currentCategory !== 'focus') return;

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

    const shouldAutoStart = nextMode === 'focus' ? autoStartWork : autoStartBreaks;
    if (shouldAutoStart) {
        startTimer();
    }
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
        currentSessionDuration = timeLeft;



        pauseTimer(); // Stop the count-up

        // Update UI state for mode
        modeBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === 'short') btn.classList.add('active');
        });
        document.body.className = 'short-break';
        titleDisplay.textContent = 'Short Break';

        // Reset session stats for next (break)
        sessionInterruptions = 0;
        sessionPausedTime = 0;
        pauseStartTime = null;

        if (autoStartBreaks) {
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

    // Track interruption
    if (currentMode === 'focus' || currentMode === 'flowtime') {
        sessionInterruptions++;
        pauseStartTime = Date.now();
    }
}



function resetTimer() {
    pauseTimer();
    elapsedFlowtime = 0;

    if (currentMode === 'breath') {
        if (currentBreathSession === 'custom') {
            updateCustomBreathParams(); // Ensure params are fresh
        }
        currentSessionDuration = BREATH_SESSIONS[currentBreathSession].duration * 60;
    } else if (currentMode === 'grill') {
        const activeBtn = document.querySelector('.steak-btn.active');
        const mins = activeBtn ? parseInt(activeBtn.dataset.time) : 6;
        currentSessionDuration = mins * 60;
    } else if (currentMode === 'interval') {
        currentSessionDuration = intervalWorkTime;
        currentCycle = 1;
        isIntervalRest = false;
        startBtn.textContent = 'Start';
    } else if (currentMode === 'grounding') {
        currentSessionDuration = 5 * 60;
        groundingStepIndex = -1;
    } else if (currentMode === 'microbreak') {
        currentSessionDuration = 60;
    } else if (currentMode === 'stopwatch') {
        currentSessionDuration = 0;
    } else if (currentMode === 'multi') {
        currentSessionDuration = 0;
    } else if (currentMode === 'countdown') {
        currentSessionDuration = 10 * 60; // Default
    } else if (currentMode === 'deadline') {
        currentSessionDuration = 0;
        // Don't clear deadlineTarget here so users can restart same deadline if they want? 
        // Or maybe we should? Let's keep it.
    } else {
        // Standard modes (focus, short, long) found in modes object
        currentSessionDuration = (modes[currentMode] || 25) * 60;
    }

    timeLeft = currentSessionDuration;

    // Reset breathing state
    breathPhaseIndex = 0;
    breathTimeInPhase = 0;
    if (breathInstruction) {
        breathInstruction.textContent = 'Ready?';
        breathInstruction.classList.remove('pulse');
    }
    circle.classList.remove('breathing-ring');

    // Reset tracking stats
    sessionInterruptions = 0;
    sessionPausedTime = 0;
    pauseStartTime = null;

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
        if (currentPhase.empty) {
            setProgress(0, phaseCircle, phaseCircumference); // Empty ring
            breathInstruction.textContent = 'Hold (Empty)';
        } else {
            setProgress(100, phaseCircle, phaseCircumference); // Full ring
        }
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
                currentSessionDuration = timeLeft;
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
        durationMins = Math.ceil((currentSessionDuration - timeLeft) / 60);
    }

    // Ensure at least 1 min if they spent any time
    if (durationMins === 0 && (elapsedFlowtime > 0 || (currentMode === 'focus' && timeLeft < currentSessionDuration))) {
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

    // Reset session stats for next
    sessionInterruptions = 0;
    sessionPausedTime = 0;
    pauseStartTime = null;

    // If we were in flowtime, we calculate the special break
    if (currentMode === 'flowtime') {
        const breakMins = Math.max(1, Math.floor(elapsedFlowtime / 60 / flowtimeRatio));
        switchMode('short'); // Reset timer state
        timeLeft = breakMins * 60;
        currentSessionDuration = timeLeft;
        if (autoStartBreaks) {
            startTimer();
        } else {
            updateDisplay();
        }
    } else {
        // Standard Pomodoro flow
        switchMode('short');
        if (autoStartBreaks) {
            startTimer();
        } else {
            updateDisplay();
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

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        switchCategory(btn.dataset.category);
    });
});

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

        if (currentBreathSession === 'custom') {
            customBreathConfig.classList.remove('hidden');
        } else {
            customBreathConfig.classList.add('hidden');
        }
        resetTimer();
    });
});

function updateCustomBreathParams() {
    const inhale = parseInt(customInputs.inhale.value) || 4;
    const hold = parseInt(customInputs.hold.value) || 0;
    const exhale = parseInt(customInputs.exhale.value) || 4;
    const holdEmpty = parseInt(customInputs.holdEmpty.value) || 0;
    const duration = parseInt(customInputs.duration.value) || 5;

    BREATH_SESSIONS.custom.duration = duration;
    BREATH_SESSIONS.custom.phases = [];

    if (inhale > 0) BREATH_SESSIONS.custom.phases.push({ type: 'Inhale', duration: inhale });
    if (hold > 0) BREATH_SESSIONS.custom.phases.push({ type: 'Hold', duration: hold });
    if (exhale > 0) BREATH_SESSIONS.custom.phases.push({ type: 'Exhale', duration: exhale });
    if (holdEmpty > 0) BREATH_SESSIONS.custom.phases.push({ type: 'Hold', duration: holdEmpty, empty: true });

    // Fallback if empty
    if (BREATH_SESSIONS.custom.phases.length === 0) {
        BREATH_SESSIONS.custom.phases.push({ type: 'Inhale', duration: 4 });
        BREATH_SESSIONS.custom.phases.push({ type: 'Exhale', duration: 4 });
    }
}

// Add listeners to custom inputs to live-update if paused (or restart?)
// For simplicity, update on next reset or start. But let's add listeners to reset if they change while paused.
Object.values(customInputs).forEach(input => {
    input.addEventListener('change', () => {
        if (currentMode === 'breath' && currentBreathSession === 'custom') {
            resetTimer();
        }
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

// Grill Master Interactions
steakBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        steakBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        timeLeft = parseInt(btn.dataset.time) * 60;
        currentSessionDuration = timeLeft;
        updateDisplay();
    });
});

flipToggle.addEventListener('change', (e) => {
    isFlipReminderEnabled = e.target.checked;
    lastFlipTime = 0;
});

// Start
// === Multi-Timer Logic ===

function createTimer(duration, name = 'Timer') {
    const id = Date.now();
    const timer = {
        id,
        name: `${name} ${multiTimers.length + 1}`,
        duration,
        timeLeft: duration,
        isRunning: false,
        totalDuration: duration
    };
    multiTimers.push(timer);
    renderTimerCards();
    saveMultiTimers();
}

function deleteTimer(id) {
    multiTimers = multiTimers.filter(t => t.id !== id);
    renderTimerCards();
    saveMultiTimers();
}

function toggleMultiTimer(id) {
    const timer = multiTimers.find(t => t.id === id);
    if (timer) {
        timer.isRunning = !timer.isRunning;
        renderTimerCards();
        checkMultiTimerLoop();
    }
}

function resetMultiTimer(id) {
    const timer = multiTimers.find(t => t.id === id);
    if (timer) {
        timer.isRunning = false;
        timer.timeLeft = timer.totalDuration;
        renderTimerCards();
        checkMultiTimerLoop();
    }
}

function startMultiTimerLoop() {
    if (multiTimerIntervalId) return;
    multiTimerIntervalId = setInterval(() => {
        let activeTimers = 0;
        multiTimers.forEach(timer => {
            if (timer.isRunning && timer.timeLeft > 0) {
                timer.timeLeft--;
                activeTimers++;
                if (timer.timeLeft <= 0) {
                    timer.isRunning = false;
                    timer.timeLeft = 0;
                    playMultiTimerSound(timer.name);
                }
                updateTimerCard(timer.id);
            }
        });
        if (activeTimers === 0 && multiTimers.every(t => !t.isRunning)) {
            // Optional: stop loop if nothing running? 
            // Better to keep running if in multi mode, or just rely on state.
        }
    }, 1000);
}

function checkMultiTimerLoop() {
    const anyRunning = multiTimers.some(t => t.isRunning);
    if (anyRunning && !multiTimerIntervalId) {
        startMultiTimerLoop();
    } else if (!anyRunning && multiTimerIntervalId) {
        clearInterval(multiTimerIntervalId);
        multiTimerIntervalId = null;
    }
}

function playMultiTimerSound(name) {
    if (soundEnabled) {
        alarmSound.play().catch(e => console.log(e));
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Kitchen Timer', { body: `${name} is done!` });
        }
    }
}

function renderTimerCards() {
    timerGrid.innerHTML = '';
    multiTimers.forEach(timer => {
        const card = document.createElement('div');
        card.className = `timer-card ${timer.isRunning ? 'running' : ''} ${timer.timeLeft === 0 && timer.totalDuration > 0 ? 'finished' : ''}`;
        card.id = `timer-card-${timer.id}`;

        const progressPct = ((timer.totalDuration - timer.timeLeft) / timer.totalDuration) * 100;

        card.innerHTML = `
            <div class="timer-card-header">
                <input type="text" class="timer-name" value="${timer.name}" onchange="updateTimerName(${timer.id}, this.value)">
                <button class="timer-close-btn" onclick="deleteTimer(${timer.id})">✕</button>
            </div>
            <div class="timer-digits" contenteditable="true" onblur="updateTimerDuration(${timer.id}, this.innerText)" onkeydown="handleTimerDurationKeydown(event, ${timer.id}, this)">${formatTime(timer.timeLeft)}</div>
            <div class="timer-card-controls">
                <button class="card-btn ${timer.isRunning ? 'pause' : 'start'}" onclick="toggleMultiTimer(${timer.id})">
                    ${timer.isRunning ? 'Pause' : 'Start'}
                </button>
                <button class="card-btn reset" onclick="resetMultiTimer(${timer.id})">Reset</button>
            </div>
            <div class="card-progress" style="width: ${progressPct}%"></div>
        `;
        timerGrid.appendChild(card);
    });
}

function updateTimerCard(id) {
    const timer = multiTimers.find(t => t.id === id);
    if (!timer) return;

    const card = document.getElementById(`timer-card-${id}`);
    if (card) {
        card.querySelector('.timer-digits').textContent = formatTime(timer.timeLeft);
        const progressParams = ((timer.totalDuration - timer.timeLeft) / timer.totalDuration) * 100;
        card.querySelector('.card-progress').style.width = `${progressParams}%`;

        if (timer.timeLeft === 0) {
            card.classList.add('finished');
            card.classList.remove('running');
            card.querySelector('.card-btn').textContent = 'Start';
            card.querySelector('.card-btn').className = 'card-btn start';
        }
    }
}

function updateTimerName(id, newName) {
    const timer = multiTimers.find(t => t.id === id);
    if (timer) {
        timer.name = newName;
        saveMultiTimers();
    }
}

function updateTimerDuration(id, timeString) {
    const timer = multiTimers.find(t => t.id === id);
    if (!timer) return;

    // Parse time string (supports MM:SS or just MM)
    let minutes = 0;
    let seconds = 0;

    if (timeString.includes(':')) {
        const parts = timeString.split(':');
        minutes = parseInt(parts[0]) || 0;
        seconds = parseInt(parts[1]) || 0;
    } else {
        minutes = parseInt(timeString) || 0;
    }

    const newDuration = (minutes * 60) + seconds;

    if (newDuration > 0) {
        timer.duration = newDuration;
        timer.totalDuration = newDuration;
        // Only reset time left if we're not running to prevent accidental jumps? 
        // Or if user edits, they probably want to set a new time.
        // Let's reset timeLeft to newDuration.
        timer.timeLeft = newDuration;
        timer.isRunning = false; // Pause if changed
    }

    renderTimerCards();
    saveMultiTimers();
}

function handleTimerDurationKeydown(e, id, el) {
    if (e.key === 'Enter') {
        e.preventDefault();
        el.blur();
    }
}

function saveMultiTimers() {
    localStorage.setItem('pomodoroMultiTimers', JSON.stringify(multiTimers));
}

function loadMultiTimers() {
    const saved = localStorage.getItem('pomodoroMultiTimers');
    if (saved) {
        multiTimers = JSON.parse(saved);
        renderTimerCards();
    }
}

// Event Listeners for Multi-Timer
if (addTimerBtn) {
    addTimerBtn.addEventListener('click', () => createTimer(300)); // Default 5 min
}

presetTimeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const time = parseInt(btn.dataset.time);
        createTimer(time);
    });
});

// Init Load
loadMultiTimers();

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
