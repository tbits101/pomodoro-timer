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

// History Elements
const historyBtn = document.getElementById('history-btn');
const historyModal = document.getElementById('history-modal');
const historyList = document.getElementById('history-list');
const closeHistoryBtn = document.getElementById('close-history-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');

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

    // Load config from localStorage
    const savedModes = localStorage.getItem('pomodoroModes');
    if (savedModes) {
        modes = JSON.parse(savedModes);
    }

    // Load history from localStorage
    const savedHistory = localStorage.getItem('pomodoroHistory');
    if (savedHistory) {
        history = JSON.parse(savedHistory);
    }

    // Set initial custom values in inputs
    inputs.focus.value = modes.focus;
    inputs.short.value = modes.short;
    inputs.long.value = modes.long;

    // Set Version Display
    if (typeof APP_VERSION !== 'undefined' && typeof BUILD_TIME !== 'undefined') {
        document.getElementById('app-version').textContent = `v${APP_VERSION} (Build ${BUILD_TIME})`;
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

// --- History Logic ---

function addToHistory(taskName) {
    // Check if there is actually a task name to save
    if (!taskName) return;

    const entry = {
        id: Date.now(),
        task: taskName,
        date: new Date().toLocaleString(), // Format nicely?
        duration: modes.focus
    };

    history.unshift(entry); // Add to top
    localStorage.setItem('pomodoroHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = '';

    if (history.length === 0) {
        historyList.innerHTML = '<li style="text-align:center; opacity:0.5; margin-top:2rem;">No history yet</li>';
        return;
    }

    history.forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-item';

        // Simple date formatting
        const dateObj = new Date(item.id);
        const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        li.innerHTML = `
            <div class="history-info">
                <span class="history-task">${item.task}</span>
                <span class="history-time">${dateStr}</span>
            </div>
            <div class="history-actions">
                <span class="history-duration">${item.duration}m</span>
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

                if (soundEnabled) {
                    alarmSound.play().catch(e => console.log('Audio error', e));
                }

                showNotification();

                // Add to history if Focus
                if (currentMode === 'focus') {
                    addToHistory(currentTaskText.textContent);
                }
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
    const completedTask = currentTaskText.textContent;
    currentTaskText.textContent = '';
    taskInput.value = '';
    taskDisplay.classList.add('hidden');
    taskInput.classList.remove('hidden');

    // 2.5 Add to History
    addToHistory(completedTask);

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
