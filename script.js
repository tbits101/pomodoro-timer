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
        sanitizeHistory();
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

    console.log(`Stats updated: [Today: ${todayMins}m] [Week: ${weekMins}m] [Total: ${totalMins}m] items: ${history.length}`);
    console.log(`Debug - TodayStart: ${new Date(todayStart).toLocaleString()}, WeekStart: ${new Date(weekStart).toLocaleString()}`);
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
    addToHistory(completed.text);

    // Switch to Short Break
    switchMode('short');
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
