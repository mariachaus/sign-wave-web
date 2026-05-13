# Sign Wave — Frontend

React + Vite frontend for Sign Wave, an interactive **Ukrainian Sign Language (УЖМ)** learning application with real-time gesture recognition.

## Tech Stack

- **React 19** — UI
- **Vite 8** — build tool with HTTPS support (`@vitejs/plugin-basic-ssl`)
- **React Router v7** — client-side routing
- **SCSS** — component and page styles with CSS variables for theming
- **i18next** — Ukrainian / English localisation
- **Axios** — HTTP client
- **MediaPipe** (`@mediapipe/tasks-vision`) — real-time pose & hand landmark detection (WASM, runs in browser)
- **@react-oauth/google** — Google OAuth (`useGoogleLogin` hook)

## Project Structure

```
src/
├── components/
│   ├── exercises/              # Lesson exercise types
│   │   ├── LessonController.jsx
│   │   ├── TheorySlide.jsx
│   │   ├── QuizExercise.jsx
│   │   ├── MatchingExercise.jsx
│   │   ├── RecallExercise.jsx
│   │   └── ImitationExercise.jsx
│   ├── admin/                  # Admin panel tabs (split from AdminPage)
│   │   ├── adminUtils.js       # Shared headers() and useDebounce hook
│   │   ├── AdminUsersTab.jsx
│   │   ├── AdminGesturesTab.jsx
│   │   ├── AdminLevelsTab.jsx
│   │   └── AdminLessonsTab.jsx
│   ├── AdminPage.jsx           # Admin shell: sidebar + overview
│   ├── AuthPage.jsx
│   ├── MainDashboard.jsx
│   ├── LevelsPage.jsx
│   ├── LessonPage.jsx
│   ├── PracticePage.jsx
│   ├── GesturesPage.jsx
│   ├── GestureDetailsPage.jsx
│   ├── FlashcardsPage.jsx
│   ├── AchievementsPage.jsx
│   ├── ProfilePage.jsx
│   ├── SettingsPage.jsx
│   ├── TermsPage.jsx
│   ├── WebcamAnalyzer.jsx
│   ├── StreakCalendar.jsx
│   ├── AchievementItem.jsx
│   ├── AchievementPopup.jsx
│   ├── LessonResultPopup.jsx
│   ├── ConfirmModal.jsx
│   ├── ImageBlock.jsx
│   └── VideoUploadBlock.jsx
├── styles/
│   ├── global.scss
│   ├── components/
│   └── pages/
├── utils/
│   ├── feature_extractor.js    # Builds 225-value landmark vector per frame
│   ├── drawing_utils.js        # Draws skeleton on canvas with SNAP correction
│   ├── theme.js
│   ├── csv_manager.js
│   └── json_manager.js
├── config/
│   └── api.js                  # API base URL
├── i18n.js                     # i18next setup (uk / en inline resources)
├── App.jsx                     # ML model loading, settings sync, routing
└── main.jsx                    # GoogleOAuthProvider wrapper
```

## Getting Started

### Prerequisites

- Node.js 18+
- Backend running (see `../backend/`)

### Install

```bash
npm install
```

### Configure API

Edit `src/config/api.js` and set the base URL to your backend instance. In development the default is an empty string — all `/api/*` requests are proxied by Vite to `http://localhost:8000`.

### Run development server

```bash
npm run dev
```

The app runs on `https://localhost:5173`. HTTPS is required for camera access.

### Run on a physical device (same Wi-Fi)

```bash
npm run dev -- --host
```

Open `https://<your-ip>:5173` on the device and accept the self-signed certificate warning.

## Features

- **Lessons** — structured levels and lessons with theory, quiz, matching, recall, and imitation exercises; hearts system (5 lives per lesson)
- **Flashcards** — spaced repetition review of learned gestures with swipe UI (known / not known)
- **Practice** — gesture-specific practice sessions with real-time camera recognition
- **Free practice** — random session from all learned gestures
- **Streak system** — daily activity tracking with freeze shields and XP milestones
- **Achievements** — 19 achievements awarded automatically after lesson/practice completion
- **Daily tasks** — three randomly generated tasks per day with XP rewards
- **Profile** — XP, streak calendar, earned achievements; click-to-upload avatar
- **Settings** — theme (light/dark/system), language, font size, skeleton visibility, skeleton colours, mirror view
- **Terms of Service** — public page (`/terms`), bilingual inline content
- **Admin panel** — full CRUD for users, gestures, levels, lessons (gesture pool + theory content blocks per lesson)

## Build

```bash
npm run build
```
