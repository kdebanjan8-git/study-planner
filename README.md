# 🎓 Smart Study Planner

An intelligent, interactive study planner web application and CLI companion that balances your subject syllabus, calculates exam countdowns, optimizes daily study sessions, and tracks topic mastery and progress percentages.

![Smart Study Planner](https://img.shields.io/badge/Status-Ready-brightgreen) ![HTML5](https://img.shields.io/badge/HTML5-Modern-orange) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow) ![Python](https://img.shields.io/badge/Python-3.x-blue)

---

## 🌟 Key Features

### 1. 🔐 Student Authentication & Cinematic Login Animation
- **Sign In & Sign Up Portal**: Register new accounts or log in with existing credentials, complete with show/hide password toggles and live password strength analysis.
- **1-Click Demo Student Access**: Instant one-click sign-in button for quick testing without typing credentials.
- **Cinematic Post-Login Animation**:
  - Orbiting 3D rings with an energetic central checkmark and glowing particle sphere.
  - Multi-colored celebratory confetti explosion.
  - Harmonious 4-chord triumph audio chime via Web Audio API.
  - Smooth animated progress loader bar: *"Calibrating exam dates & study sessions (100%)..."*
- **User Profile Management**: Custom initials avatar, academic goal badge, and dropdown in the top navbar with single-click logout.

### 2. 📚 Subject & Exam Date Management
- **Enter Subjects & Exam Dates**: Add courses with specific exam dates, times, target grades, and custom color accents.
- **Exam Countdown Clocks**: Real-time badges showing days left with urgency indicators (*Critical <3 days*, *Approaching <10 days*, *Safe*).
- **Chapter & Topic Breakdown**: Assign estimated study hours, difficulty levels (*Easy*, *Medium*, *Hard*), and priority (*High*, *Normal*, *Low*).
- **Bulk Import**: Paste syllabus chapters or topic lists in one click to populate subjects instantly.

### 2. 📅 Intelligent Daily Schedule Generator
- **Urgency & Difficulty Weighting**: Topics are prioritized by closeness to exam date and difficulty level.
- **Interleaved Practice**: Alternates between subjects across days to maximize memory retention and prevent burnout.
- **Pre-Exam Buffer**: Automatically preserves the final 1–2 days before an exam exclusively for revision and mock practice.
- **Dynamic Rebalancer**: Fall behind or missed a day? Click **Auto-Rebalance** to redistribute unfinished topics across remaining days without stress.

### 3. ✅ Topic Progress & Mastery Tracking
- **Interactive Checklists**: Check off topics with instant completion feedback, confetti bursts, and audio chimes.
- **Status Stages**: Track topics across *Not Started*, *In Progress*, *Completed*, and *Needs Revision*.
- **Study Streak**: Maintains daily study streaks (🔥) to build consistent study habits.

### 4. 📊 Progress Percentage & Analytics
- **Live Progress Gauges**: Animated circular progress ring showing overall syllabus completion.
- **Subject-by-Subject Progress**: Progress bars and completion percentages for every course.
- **Chart.js Visualizations**:
  - Bar chart of completion percentage by subject.
  - Doughnut chart of topic completion statuses.
  - Estimated study hours vs. actual logged focus hours.
- **Exam Readiness Score**: Evaluates whether you are *Ahead of Schedule*, *On Track*, or *Need Focus*.

### 5. ⏱️ Integrated Pomodoro Focus Timer
- **Focus Modes**: 25m Pomodoro, 5m Short Break, 15m Long Break, 50m Deep Work.
- **Topic Linking**: Link your focus session to a specific chapter to log exact study minutes.
- **Audio Chimes**: Built-in Web Audio API synthesizers for zero-dependency sound notifications.

---

## 🚀 How to Run

### Option 1: One-Click Launch (Windows .bat)
- Double-click [**`launch.bat`**](file:///c:/Users/kdeba/OneDrive/Desktop/Smart%20Study%20Planner/launch.bat) (or `lunch.bat`) to start the background server and automatically open the application in your browser.
- Double-click [**`stop.bat`**](file:///c:/Users/kdeba/OneDrive/Desktop/Smart%20Study%20Planner/stop.bat) to stop the server whenever you are done.

### Option 2: Direct in Browser (Zero Installation)
Simply double-click [**`login.html`**](file:///c:/Users/kdeba/OneDrive/Desktop/Smart%20Study%20Planner/login.html) or [**`index.html`**](file:///c:/Users/kdeba/OneDrive/Desktop/Smart%20Study%20Planner/index.html) in any web browser (Google Chrome, Microsoft Edge, Brave, Firefox).

### Option 3: Local Server
Run using Python:
```bash
python server.py
```
This opens `http://localhost:8000/login.html` automatically in your default browser.

Or via npm:
```bash
npm start
```

### Option 4: Command-Line CLI Companion
Manage your study planner directly in your terminal:
```bash
python planner.py
```
Or run specific commands:
```bash
python planner.py progress      # View overall & subject progress %
python planner.py schedule      # View daily study schedule
python planner.py complete      # Interactively check off a completed topic
python planner.py add-subject   # Add a new subject & exam date
python planner.py add-topic     # Add a topic to a subject
```

---

## 📁 File Structure

```
Smart Study Planner/
├── login.html        # Dedicated Login & Sign In portal with cinematic post-login animation
├── index.html        # Main planner dashboard with schedules, progress tracker, and modals
├── styles.css        # Responsive glassmorphic styles, 3D orbits, themes, and timetables
├── app.js            # Core engine: scheduler, Pomodoro timer, progress analytics, auth
├── server.py         # No-cache Python HTTP server with auto-launch to login.html
├── launch.bat        # 1-click Windows start script (starts server and opens login page)
├── lunch.bat         # Alias shortcut for launch.bat
├── stop.bat          # 1-click Windows stop script (cleanly halts port 8000 server)
├── planner.py        # Terminal CLI companion for terminal-first study tracking
├── package.json      # NPM script definitions
└── README.md         # Documentation & user guide
```

---

## 💾 Data Storage

All your planner data (subjects, exam dates, topics, settings, study streak, and logs) is persisted locally in your browser's `localStorage` (and in `planner_data.json` for the CLI). Your data never leaves your computer!
