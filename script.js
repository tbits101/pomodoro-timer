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

function updateDisplay() {
    timeDisplay.textContent = formatTime(timeLeft);
    const modeName = currentMode === 'focus' ? 'Focus' :
        currentMode === 'short' ? 'Short Break' : 'Long Break';
    document.title = `${formatTime(timeLeft)} - ${modeName}`;
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

    // Close modal
    settingsModal.classList.remove('open');

    // Update current timer only if not running to avoid disruption
    // Or if running but we want to adjust endpoint (complex). 
    // Simplest: If logic requires update, do it. 
    // Here: Update timeLeft if we are in that mode and paused, or just force reset.
    if (!isRunning) {
        resetTimer();
    }
}

function switchMode(mode) {
    currentMode = mode;

    // Update UI Active State
    modeBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) btn.classList.add('active');
    });

    // Body Theme
    document.body.className = mode === 'focus' ? '' : `${mode}-break`;

    // Title
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
                // Optionally auto-switch modes here? For now, just stop.
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
    pauseTimer(); // Stops interval
    timeLeft = modes[currentMode] * 60;
    updateDisplay();
}

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

// Close modal if clicking outside content
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        // Can optionally save or just cancel. Let's just close (cancel) or save?
        // User expects "Save" usually only on button. Let's just close without saving?
        // Actually, safer to just close.
        settingsModal.classList.remove('open');
        // Reset inputs to match actual modes
        inputs.focus.value = modes.focus;
        inputs.short.value = modes.short;
        inputs.long.value = modes.long;
    }
});

// Start
init();
