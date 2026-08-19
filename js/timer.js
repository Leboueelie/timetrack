import { formatTimerDisplay, getTodayString, getCurrentTime, showToast } from './utils.js';
import { createSession } from './session.js';

let timerInterval = null;
let elapsedSeconds = 0;
let isPaused = false;
let activityName = '';
let category = '';

const timerDisplay = () => document.getElementById('timerDisplay');
const timerSection = () => document.getElementById('timerSection');
const timerActivity = () => document.getElementById('timerActivity');
const btnPause = () => document.getElementById('btnPause');

export function initTimer() {
  const btnStart = document.getElementById('btnStartTimer');
  const btnPauseEl = document.getElementById('btnPause');
  const btnStop = document.getElementById('btnStop');
  const btnCancel = document.getElementById('btnCancel');

  if (btnStart) {
    btnStart.addEventListener('click', startTimer);
  }
  if (btnPauseEl) {
    btnPauseEl.addEventListener('click', togglePause);
  }
  if (btnStop) {
    btnStop.addEventListener('click', stopTimer);
  }
  if (btnCancel) {
    btnCancel.addEventListener('click', cancelTimer);
  }

  restoreTimerState();
}

function startTimer() {
  const nameInput = document.getElementById('quickActivityName');
  activityName = nameInput?.value?.trim();
  category = document.getElementById('quickCategory')?.value || '';

  if (!activityName) {
    showToast('Veuillez saisir un nom d\'activité', 'error');
    return;
  }

  elapsedSeconds = 0;
  isPaused = false;

  showTimerUI();
  updateDisplay();
  startInterval();
  saveTimerState();
  showToast(`Timer démarré — ${activityName}`);
}

function showTimerUI() {
  const quickSection = document.querySelector('.timer-quick');
  const timer = timerSection();
  if (quickSection) quickSection.style.display = 'none';
  if (timer) timer.style.display = 'block';
  const actEl = timerActivity();
  if (actEl) actEl.textContent = activityName;
  const pauseEl = btnPause();
  if (pauseEl) pauseEl.textContent = 'Pause';
}

function hideTimerUI() {
  const quickSection = document.querySelector('.timer-quick');
  const timer = timerSection();
  if (quickSection) quickSection.style.display = 'block';
  if (timer) timer.style.display = 'none';
  localStorage.removeItem('timetrack_timer');
}

function startInterval() {
  stopInterval();
  timerInterval = setInterval(() => {
    if (!isPaused) {
      elapsedSeconds++;
      updateDisplay();
      saveTimerState();
    }
  }, 1000);
}

function stopInterval() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateDisplay() {
  const display = timerDisplay();
  if (display) display.textContent = formatTimerDisplay(elapsedSeconds);
}

function togglePause() {
  isPaused = !isPaused;
  const pauseEl = btnPause();
  if (pauseEl) pauseEl.textContent = isPaused ? 'Reprendre' : 'Pause';
  saveTimerState();
  showToast(isPaused ? 'Timer en pause' : 'Timer repris', 'info');
}

async function stopTimer() {
  stopInterval();

  const totalMinutes = Math.floor(elapsedSeconds / 60);
  if (totalMinutes < 1) {
    showToast('Session trop courte (< 1 min)', 'error');
    hideTimerUI();
    localStorage.removeItem('timetrack_timer');
    return;
  }

  const now = new Date();
  const startTime = new Date(now.getTime() - elapsedSeconds * 1000);
  const formatTime = (d) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

  try {
    await createSession({
      activityName,
      category,
      date: getTodayString(),
      startTime: formatTime(startTime),
      endTime: formatTime(now),
      notes: '',
    });
    showToast('Session enregistrée !');
  } catch (err) {
    showToast('Erreur lors de l\'enregistrement', 'error');
  }

  hideTimerUI();
  if (typeof window.loadDashboard === 'function') window.loadDashboard();
}

function cancelTimer() {
  stopInterval();
  hideTimerUI();
  localStorage.removeItem('timetrack_timer');
  showToast('Session annulée', 'error');
}

function saveTimerState() {
  const state = {
    elapsedSeconds,
    isPaused,
    activityName,
    category,
    savedAt: Date.now(),
  };
  localStorage.setItem('timetrack_timer', JSON.stringify(state));
}

function restoreTimerState() {
  try {
    const stored = localStorage.getItem('timetrack_timer');
    if (!stored) return;

    const state = JSON.parse(stored);
    elapsedSeconds = state.elapsedSeconds + Math.floor((Date.now() - state.savedAt) / 1000);
    isPaused = state.isPaused;
    activityName = state.activityName;
    category = state.category || '';

    showTimerUI();
    updateDisplay();
    startInterval();
  } catch {
    localStorage.removeItem('timetrack_timer');
  }
}
