// Config & State
const DEFAULT_MODES = {
    focus: 25,
    short: 5,
    long: 15
};

let modes = { ...DEFAULT_MODES };
let currentMode = 'focus';
let timeLeft = modes[currentMode] * 60;
let timerId = null;
let isRunning = false;

// DOM Elements
const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const alarmSound = document.getElementById('alarm-sound');
const modeBtns = document.querySelectorAll('.mode-btn');
const titleDisplay = document.querySelector('.title');

// Progress Ring Elements
const circle = document.querySelector('.progress-ring__circle');
const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;

// Task Elements
const taskInput = document.getElementById('task-input');
const taskDisplay = document.getElementById('task-display');
const currentTaskText = document.getElementById('current-task-text');
const clearTaskBtn = document.getElementById('clear-task-btn');
const completeTaskBtn = document.getElementById('complete-task-btn');

// Settings Elements
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const inputs = {
    focus: document.getElementById('focus-time-input'),
    short: document.getElementById('short-time-input'),
    long: document.getElementById('long-time-input')
};

// --- Initialization ---

function init() {
    // Setup Ring
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;

    // Load config from localStorage
    const savedModes = localStorage.getItem('pomodoroModes');
    if (savedModes) {
        modes = JSON.parse(savedModes);
    }

    // Set initial custom values in inputs
    inputs.focus.value = modes.focus;
    inputs.short.value = modes.short;
    inputs.long.value = modes.long;

    // Set initial timer
    resetTimer();
}

// --- Helpers ---

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function setProgress(percent) {
    // 0% = empty, 100% = full
    // But we are counting DOWN. 
    // Start: Full circle (offset 0). End: Empty (offset circumference)
    // Or other way? Let's make it deplete.
    // Full = 0 offset. Empty = circumference.
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
}

function updateDisplay() {
    timeDisplay.textContent = formatTime(timeLeft);
    const modeName = currentMode === 'focus' ? 'Focus' :
        currentMode === 'short' ? 'Short Break' : 'Long Break';
    const taskPart = currentTaskText.textContent ? `[${currentTaskText.textContent}] ` : '';
    document.title = `${formatTime(timeLeft)} - ${taskPart}${modeName}`;

    // Update Ring
    const totalTime = modes[currentMode] * 60;
    const percent = (timeLeft / totalTime) * 100;
    // We want the ring to disappear as time goes. 
    // If percent is 100 (full), offset should be 0.
    // If percent is 0 (empty), offset should be circumference.
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
}

function saveSettings() {
    const newFocus = parseInt(inputs.focus.value);
    const newShort = parseInt(inputs.short.value);
    const newLong = parseInt(inputs.long.value);

    // Basic Validation
    if (newFocus > 0) modes.focus = newFocus;
    if (newShort > 0) modes.short = newShort;
    if (newLong > 0) modes.long = newLong;

    localStorage.setItem('pomodoroModes', JSON.stringify(modes));

    settingsModal.classList.remove('open');
    if (!isRunning) {
        resetTimer();
    }
}

function switchMode(mode) {
    currentMode = mode;

    modeBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) btn.classList.add('active');
    });

    document.body.className = mode === 'focus' ? '' : `${mode}-break`;
    titleDisplay.textContent = mode === 'focus' ? 'Focus' :
        mode === 'short' ? 'Short Break' : 'Long Break';

    resetTimer();
}

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
        pauseTimer();
    } else {
        requestNotificationPermission();
        isRunning = true;
        startBtn.textContent = 'Pause';

        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();

            if (timeLeft === 0) {
                clearInterval(timerId);
                isRunning = false;
                startBtn.textContent = 'Start';
                alarmSound.play().catch(e => console.log('Audio error', e));
                showNotification();
            }
        }, 1000);
    }
}

function pauseTimer() {
    clearInterval(timerId);
    isRunning = false;
    startBtn.textContent = 'Start';
}

function resetTimer() {
    pauseTimer();
    timeLeft = modes[currentMode] * 60;
    // Reset ring to full
    circle.style.strokeDashoffset = 0;
    updateDisplay();
}

// --- Task Logic ---
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && taskInput.value.trim() !== '') {
        currentTaskText.textContent = taskInput.value;
        taskInput.classList.add('hidden');
        taskDisplay.classList.remove('hidden');
        updateDisplay(); // Update title
    }
});

clearTaskBtn.addEventListener('click', () => {
    currentTaskText.textContent = '';
    taskInput.value = '';
    taskDisplay.classList.add('hidden');
    taskInput.classList.remove('hidden');
    taskInput.focus();
    updateDisplay(); // Update title
});

completeTaskBtn.addEventListener('click', () => {
    // 1. Notify user
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Task Completed!', {
            body: `You finished "${currentTaskText.textContent}". Enjoy your break!`,
            icon: 'https://cdn-icons-png.flaticon.com/512/2928/2928750.png'
        });
    }

    // 2. Clear task (or keep it as "Completed" list? For now just clear inputs)
    currentTaskText.textContent = '';
    taskInput.value = '';
    taskDisplay.classList.add('hidden');
    taskInput.classList.remove('hidden');

    // 3. Switch to Short Break
    switchMode('short');

    // 4. Reset Timer (already done by switchMode)
    // Optional: Auto start break? Let's leave it manual start for control.
});

// --- Event Listeners ---

startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        switchMode(btn.dataset.mode);
    });
});

settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('open');
});

closeModalBtn.addEventListener('click', saveSettings);

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.remove('open');
        inputs.focus.value = modes.focus;
        inputs.short.value = modes.short;
        inputs.long.value = modes.long;
    }
});

// Start
init();
