/**
 * FocusFlow — script.js
 * Iteration 4: Final — restored 25-min Focus, fixed minutes recording.
 */

// ── Mode configuration (seconds) ────────────────────────────
const MODE_SECONDS = {
  focus:         25 * 60,
  'short-break':  5 * 60,
  'long-break':  15 * 60,
};

const MODE_LABELS = {
  focus:         'Focus session complete! Time for a break. 🎉',
  'short-break': 'Short break over. Back to work! 💪',
  'long-break':  'Long break over. Ready to focus? 🚀',
};

const DAILY_GOAL       = 4;    // target sesi focus per hari
const STORAGE_KEY      = 'focusflow_stats';

// ── DOM references ───────────────────────────────────────────
const timerDisplay        = document.getElementById('timer-display');
const btnStart            = document.getElementById('btn-start');
const btnPause            = document.getElementById('btn-pause');
const btnReset            = document.getElementById('btn-reset');
const modeBtns            = document.querySelectorAll('.mode-btn');
const notification        = document.getElementById('notification');
const notificationMsg     = document.getElementById('notification-message');
const notificationDismiss = document.getElementById('notification-dismiss');

// Stats DOM
const statSessions     = document.getElementById('stat-sessions');
const statMinutes      = document.getElementById('stat-minutes');
const statGoalCount    = document.getElementById('stat-goal-count');
const statProgressBar  = document.getElementById('stat-progress-bar');
const statProgressFill = document.getElementById('stat-progress-fill');

// ── Timer state ──────────────────────────────────────────────
let currentMode    = 'focus';
let remainingMs    = MODE_SECONDS[currentMode] * 1000;
let timerInterval  = null;
let startTimestamp = null;
let isRunning      = false;

// ── Local Storage helpers ────────────────────────────────────
/**
 * Returns today's date as "YYYY-MM-DD" using the user's local timezone.
 */
function localDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Load stats from localStorage.
 * Returns { date, sessions, minutes }.
 * Resets to zero if stored date differs from today or data is invalid.
 */
function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error('empty');
    const parsed = JSON.parse(raw);
    // Validate shape
    if (
      typeof parsed.date    !== 'string' ||
      typeof parsed.sessions !== 'number' ||
      typeof parsed.minutes  !== 'number'
    ) throw new Error('invalid shape');

    // Auto-reset on date change
    if (parsed.date !== localDateString()) throw new Error('new day');

    return parsed;
  } catch {
    return { date: localDateString(), sessions: 0, minutes: 0 };
  }
}

/** Persist current stats to localStorage. */
function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Storage quota exceeded or private mode — silent fail
  }
}

// ── Stats state ──────────────────────────────────────────────
let stats = loadStats();

// ── Stats UI renderer ────────────────────────────────────────
function renderStats() {
  const pct = Math.min(100, Math.round((stats.sessions / DAILY_GOAL) * 100));

  statSessions.textContent     = stats.sessions;
  statMinutes.textContent      = stats.minutes;
  statGoalCount.textContent    = `${stats.sessions} / ${DAILY_GOAL} sessions`;
  statProgressFill.style.width = `${pct}%`;
  statProgressBar.setAttribute('aria-valuenow', pct);
}

/** Record one completed Focus session. Called only once when timer hits zero. */
function recordFocusSession() {
  stats.sessions += 1;
  stats.minutes  += 25;  // one Focus session = 25 minutes (fixed, independent of MODE_SECONDS)
  stats.date      = localDateString();
  saveStats(stats);
  renderStats();
}

// ── Helpers ──────────────────────────────────────────────────
function formatTime(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function render() {
  timerDisplay.textContent = formatTime(remainingMs);
}

function syncButtons() {
  const finished = remainingMs <= 0;
  btnStart.textContent = isRunning
    ? 'Running…'
    : finished
      ? 'Done'
      : (remainingMs < MODE_SECONDS[currentMode] * 1000 ? 'Resume' : 'Start');
  btnStart.disabled = isRunning || finished;
  btnPause.disabled = !isRunning;
}

// ── Web Audio notification sound ─────────────────────────────
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const tones = [523.25, 659.25, 783.99]; // C5, E5, G5
    tones.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const startAt = ctx.currentTime + i * 0.18;
      const stopAt  = startAt + 0.22;
      gain.gain.setValueAtTime(0, startAt);
      gain.gain.linearRampToValueAtTime(0.4, startAt + 0.02);
      gain.gain.linearRampToValueAtTime(0,   stopAt);
      osc.start(startAt);
      osc.stop(stopAt);
    });
  } catch (e) {
    console.warn('Web Audio API unavailable:', e);
  }
}

// ── Notification helpers ─────────────────────────────────────
function showNotification(mode) {
  notificationMsg.textContent = MODE_LABELS[mode] ?? 'Session complete!';
  notification.hidden = false;
}

function hideNotification() {
  notification.hidden = true;
}

// ── Core timer functions ─────────────────────────────────────
function tick() {
  const elapsed  = Date.now() - startTimestamp;
  remainingMs    = Math.max(0, remainingMs - elapsed);
  startTimestamp = Date.now();

  render();

  if (remainingMs <= 0) {
    stopTimer();
    // Record stats ONLY for a completed Focus session
    if (currentMode === 'focus') {
      recordFocusSession();
    }
    playNotificationSound();
    showNotification(currentMode);
  }
}

function startTimer() {
  if (isRunning) return;
  if (remainingMs <= 0) return;   // timer sudah selesai — harus Reset dulu
  hideNotification();
  isRunning      = true;
  startTimestamp = Date.now();
  timerInterval  = setInterval(tick, 500);
  syncButtons();
}

function pauseTimer() {
  if (!isRunning) return;
  clearInterval(timerInterval);
  timerInterval  = null;
  const elapsed  = Date.now() - startTimestamp;
  remainingMs    = Math.max(0, remainingMs - elapsed);
  isRunning      = false;
  render();
  syncButtons();
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning     = false;
  syncButtons();
}

function resetTimer() {
  stopTimer();
  remainingMs = MODE_SECONDS[currentMode] * 1000;
  hideNotification();
  render();
  syncButtons();
}

// ── Mode switching ───────────────────────────────────────────
modeBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.dataset.mode === currentMode) return;
    modeBtns.forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    currentMode = btn.dataset.mode;
    resetTimer();
  });
});

// ── Button events ────────────────────────────────────────────
btnStart.addEventListener('click', startTimer);
btnPause.addEventListener('click', pauseTimer);
btnReset.addEventListener('click', resetTimer);
notificationDismiss.addEventListener('click', hideNotification);

// ── Initial render ───────────────────────────────────────────
render();
syncButtons();
renderStats();
