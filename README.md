# Sign Wave — Frontend

React + Vite frontend for Sign Wave, an interactive **Ukrainian Sign Language (УЖМ)** learning application with real-time gesture recognition.

## Tech Stack

- **React 19** — UI
- **Vite 8** — build tool with HTTPS support (`@vitejs/plugin-basic-ssl`)
- **React Router v7** — client-side routing
- **SCSS** — component and page styles
- **Tailwind CSS** — utility classes
- **i18next** — Ukrainian / English localisation
- **Axios** — HTTP client
- **MediaPipe** (`@mediapipe/tasks-vision`) — real-time pose & hand landmark detection (WASM, runs in browser)

## Project Structure

```
src/
├── components/
│   ├── exercises/          # Lesson exercise types
│   │   ├── LessonController.jsx
│   │   ├── TheorySlide.jsx
│   │   ├── QuizExercise.jsx
│   │   ├── MatchingExercise.jsx
│   │   ├── RecallExercise.jsx
│   │   └── ImitationExercise.jsx
│   ├── AuthPage.jsx
│   ├── MainDashboard.jsx
│   ├── LevelsPage.jsx
│   ├── LessonPage.jsx
│   ├── PracticePage.jsx
│   ├── GesturesPage.jsx
│   ├── GestureDetailsPage.jsx
│   ├── FlashcardsPage.jsx
│   ├── AchievementsPage.jsx
│   ├── AchievementPopup.jsx
│   ├── ProfilePage.jsx
│   ├── SettingsPage.jsx
│   ├── AdminPage.jsx
│   ├── WebcamAnalyzer.jsx
│   └── StreakCalendar.jsx
├── styles/
│   ├── global.scss
│   ├── components/
│   └── pages/
├── config/
│   └── api.js              # API base URL
├── i18n.js                 # i18next setup
└── App.jsx
```

## Getting Started

### Prerequisites

- Node.js 18+
- Backend running (see `../backend/`)

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

The app runs on `https://localhost:5173` (HTTPS is required for camera access).

### Run on a physical device (same Wi-Fi network)

```bash
npm run dev -- --host
```

Then open `https://<your-computer-ip>:5173` on the device. Accept the self-signed certificate warning to enable camera access.

## Features

- **Lessons** — structured levels with theory, quiz, matching, recall, and imitation exercises
- **Practice** — gesture-specific practice sessions with real-time camera recognition
- **Streak system** — daily activity tracking with freeze shields
- **Achievements** — 19 achievements awarded automatically on lesson/practice completion
- **Daily tasks** — randomly generated tasks with XP rewards
- **Profile** — stats, streak calendar, earned achievements
- **Settings** — theme, language, font size, camera options
- **Admin panel** — user and gesture management

## Environment

The API base URL is configured in `src/config/api.js`. Update it to point to your backend instance.

## Build

```bash
npm run build
```
