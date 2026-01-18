const WORK_TIME = 25 * 60; // 25 minutes
let timeLeft = WORK_TIME;
let timerId = null;
let isRunning = false;

const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const alarmSound = document.getElementById('alarm-sound');

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateDisplay() {
    timeDisplay.textContent = formatTime(timeLeft);
    document.title = `${formatTime(timeLeft)} - Focus`;
}

async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
    }
}

function showNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Time is up!', {
            body: 'Good job! Take a break.',
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
        startBtn.classList.add('active'); // Optional styling hook

        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();

            if (timeLeft === 0) {
                clearInterval(timerId);
                isRunning = false;
                startBtn.textContent = 'Start';
                alarmSound.play().catch(e => console.log('Audio play failed', e));
                showNotification();
                timeLeft = WORK_TIME; // Auto reset logic or stay at 0? 
                // Usually better to stay or let user see 00:00. Let's stay at 0 and let user reset.
                startBtn.textContent = 'Start';
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
    clearInterval(timerId);
    isRunning = false;
    timeLeft = WORK_TIME;
    updateDisplay();
    startBtn.textContent = 'Start';
    document.title = 'Focus Timer';

    // Stop sound if playing
    alarmSound.pause();
    alarmSound.currentTime = 0;
}

startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

// Initial display
updateDisplay();
