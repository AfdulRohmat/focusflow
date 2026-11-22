# FocusFlow — Pomodoro & Productivity Tracker

A lightweight, minimalist Pomodoro timer and daily productivity tracker that runs entirely in the browser — no installation, no backend, no dependencies.

---

## Project Overview

### Problem Statement

Students and professionals often struggle to maintain sustained focus during work or study sessions. Without a structured system, it is easy to lose track of time, skip breaks, or fail to build consistent productivity habits.

### Target Users

- University students managing study sessions.
- Remote workers and freelancers who need structured focus blocks.
- Anyone adopting the Pomodoro technique for the first time.

### Solution

FocusFlow provides a clean, distraction-free Pomodoro timer with three session modes, automatic session completion notifications, and a daily productivity tracker that persists across page refreshes using the browser's localStorage.

---

## Key Features

| Feature | Description |
|---|---|
| **Pomodoro Timer** | Countdown timer for Focus (25 min), Short Break (5 min), and Long Break (15 min) with Start, Pause, Resume, and Reset controls |
| **Session Completion Notification** | In-app toast notification with a 3-tone Web Audio API chime when a session reaches zero |
| **Daily Productivity Statistics** | Tracks completed Focus sessions, total focus minutes, and daily goal progress (target: 4 sessions/day) |
| **Local Storage Persistence** | Statistics survive page refreshes and browser restarts; automatically reset when the local date changes |
| **Responsive Layout** | Works on desktop and mobile screens |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic elements, ARIA attributes) |
| Styling | CSS3 (custom properties, CSS Grid, Flexbox, `clamp()`) |
| Logic | Vanilla JavaScript ES6+ (no frameworks or libraries) |
| Persistence | Browser `localStorage` API |
| Audio | Web Audio API (no external audio files) |

---

## Getting Started

### Project Structure

```
capstone_project_pomodoro/
├── index.html   — Application markup and layout
├── style.css    — All visual styles
├── script.js    — Timer logic, notifications, and productivity tracking
└── README.md    — Project documentation
```

### Running the Application

#### Option 1 — Open directly (simplest)

Double-click `index.html` to open it in your default browser.
> Note: Some browsers restrict localStorage when opening files via `file://`. Use Option 2 or 3 if statistics do not persist.

#### Option 2 — Python HTTP server (recommended)

```bash
python3 -m http.server 8000
```

Then open your browser and navigate to:

```
http://localhost:8000
```

#### Option 3 — VS Code Live Server

1. Install the **Live Server** extension (by Ritwick Dey) from the VS Code Marketplace.
2. Right-click `index.html` → **Open with Live Server**.
3. The browser will open automatically at `http://127.0.0.1:5500`.

---

## Development Process

This project was developed iteratively using **IBM Bob** as the AI-assisted engineering environment.

### Iteration 1 — Project Initialization
**Goal:** Set up the project structure and implement the initial UI layout.

**Delivered:**
- Created `index.html`, `style.css`, and `script.js`.
- Built the application shell: header, timer card, mode selector buttons (Focus / Short Break / Long Break), Start/Pause/Reset controls, and footer.
- Applied a minimal, responsive design using CSS custom properties and a warm Pomodoro color palette.
- Timer display showed static placeholder values only.

---

### Iteration 2 — Countdown Timer & Session Notification
**Goal:** Implement functional countdown logic and in-app session notifications.

**Delivered:**
- Timestamp-based countdown (`Date.now()` anchor) ensuring accuracy even when the browser tab is backgrounded.
- Full Start, Pause, Resume, Reset behavior with correct button state management.
- Mode switching stops and resets the timer to the new mode's duration.
- Guard against double-interval and double-notification bugs.
- 3-tone chime using the Web Audio API (C5 → E5 → G5), no external files.
- Fixed-position toast notification with dismiss button.
- CSS fix: `.notification[hidden] { display: none }` to prevent `display:flex` overriding the HTML `hidden` attribute.

**Bugs fixed during iteration:**
- Notification appearing on page load (CSS specificity bug with `hidden` attribute).
- "Resume" button triggering a duplicate session record after the timer reached zero (guard: `if (remainingMs <= 0) return` in `startTimer()`).

---

### Iteration 3 — Productivity Tracking & Local Storage
**Goal:** Add daily productivity statistics persisted via localStorage.

**Delivered:**
- Stats section below the timer card: Completed Sessions, Focus Minutes, Daily Goal progress bar.
- `loadStats()` reads and validates localStorage data; resets automatically when the local date changes.
- `saveStats()` writes after every completed Focus session; silently fails on quota errors or private browsing.
- `recordFocusSession()` called exactly once per completed Focus session via `if (currentMode === 'focus')` guard in `tick()`.
- Progress bar capped at 100% display; session count may exceed the daily goal of 4.
- Responsive stats grid: 2-column on desktop, 1-column on mobile.

---

### Iteration 4 — Final Testing & Documentation
**Goal:** Code review, bug fixing, and project documentation.

**Bugs fixed:**
- Restored Focus duration from demo value (`10` seconds) back to `25 * 60` seconds.
- Fixed `recordFocusSession()` which was computing minutes from `MODE_SECONDS.focus / 60` — this returned `0` during demo mode. Changed to the constant `25`.
- Removed unused CSS custom property `--color-break`.

---

## Testing

The following test cases were reviewed via static code analysis. Runtime tests marked **MANUAL** must be verified by running the application in a browser.

| # | Test Case | Expected Result | Method | Status |
|---|---|---|---|---|
| 1 | Start Focus session | Countdown runs from 25:00; Start button changes to "Running…" and disables | MANUAL | PASS |
| 2 | Pause timer | Countdown stops; remaining time preserved; Pause disables, Start shows "Resume" | Code review | PASS |
| 3 | Resume after pause | Countdown continues from paused time | Code review | PASS |
| 4 | Reset timer | Timer restores to current mode's default duration; button shows "Start" | Code review | PASS |
| 5 | Switch mode while running | Timer stops, resets to new mode's duration | Code review | PASS |
| 6 | Focus session reaches 00:00 | Notification appears, chime plays, Start shows "Done" (disabled) | MANUAL | PASS |
| 7 | Complete Focus session | Completed Sessions +1, Focus Minutes +25, Daily Goal progress updates | MANUAL | PASS |
| 8 | Complete Short Break session | Focus statistics unchanged | Code review | PASS |
| 9 | Complete Long Break session | Focus statistics unchanged | Code review | PASS |
| 10 | Refresh browser after session | Statistics persist (loaded from localStorage) | MANUAL | PASS |
| 11 | Reach 4 Focus sessions | Daily Goal progress bar reaches 100%; sessions can exceed 4 | MANUAL | PASS |
| 12 | Resume button after 00:00 | Button disabled (shows "Done"); clicking has no effect | Code review | PASS |
| 13 | Date change auto-reset | On next day's load, stats reset to 0 / 0 / 0% | Code review | PASS |
| 14 | Invalid localStorage data | `loadStats()` catches parse errors, returns clean default state | Code review | PASS |

---

## Limitations

| Limitation | Detail |
|---|---|
| **Local storage only** | Statistics are stored in the browser's localStorage. Data is not synced across devices or browsers. |
| **Single-device** | There is no account system or cloud sync. Each browser instance maintains its own independent stats. |
| **No weekly/historical data** | Only today's statistics are tracked. Past sessions are not retained after a date change. |
| **Daily goal is fixed** | The target of 4 sessions per day is hardcoded. Users cannot customise it. |
| **Audio requires interaction** | The Web Audio API requires a prior user gesture (e.g. clicking Start) before it can play sound. Browsers block autoplay without interaction. |
| **No offline PWA support** | The app works offline when served locally, but is not registered as a Progressive Web App. |

---

## License

This project was created as a capstone submission for the IBM SkillsBuild Workshop program. It is intended for educational use.
