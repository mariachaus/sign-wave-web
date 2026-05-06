import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Імпортуємо хук для зміни мови

import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import MainDashboard from './components/MainDashboard';
import GesturesPage from './components/GesturesPage';
import GestureDetailsPage from './components/GestureDetailsPage';
import LevelsPage from './components/LevelsPage';
import LessonPage from './components/LessonPage';
import PracticePage from './components/PracticePage';
import AchievementsPage from './components/AchievementsPage';
import AdminPage from './components/AdminPage';
import FlashcardsPage from './components/FlashcardsPage';
import API_BASE_URL from "./config/api";
import { applyTheme, applyFontSize } from './utils/theme';

import axios from 'axios';
import './styles/global.scss';

function App() {
  const { t, i18n } = useTranslation();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [models, setModels] = useState({ image: { pose: null, hand: null }, video: { pose: null, hand: null } });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Apply saved theme immediately on mount
  useEffect(() => {
    applyTheme(localStorage.getItem('theme') || 'system');
    applyFontSize(localStorage.getItem('font_size') || 1.0);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setIsLoaded(false);
    setIsAdmin(false);
    window.location.href = '/auth';
  };

  useEffect(() => {
    if (!token) return;

    async function syncUserSettings() {
      try {
        const profileRes = await axios.get(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (profileRes.data.role === 'admin') setIsAdmin(true);

        const res = await axios.get(`${API_BASE_URL}/api/settings/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.ui) {
          const ui = res.data.ui;
          // Записуємо все у локальне сховище
          localStorage.setItem('skeleton_color', ui.landmark_color);
          if (ui.connection_color) localStorage.setItem('connection_color', ui.connection_color);
          localStorage.setItem('is_landmarks_visible', ui.is_landmarks_visible);
          localStorage.setItem('mirror_view', ui.is_mirror_view_enabled);
          localStorage.setItem('font_size', ui.font_size);
          applyFontSize(ui.font_size);
          if (ui.theme) {
            localStorage.setItem('theme', ui.theme);
            applyTheme(ui.theme);
          }

          // --- РОБОТА З МОВОЮ ---
          if (ui.language) {
            localStorage.setItem('i18nextLng', ui.language); // Стандартний ключ для i18next
            // Змінюємо мову в самому додатку, якщо вона відрізняється
            if (i18n.language !== ui.language) {
              i18n.changeLanguage(ui.language);
            }
          }
        }
      } catch (err) {
        console.error("Failed to sync settings from DB", err);
      }
    }

    syncUserSettings();

    async function initModels() {
      if (!window.MP_VISION) { setTimeout(initModels, 100); return; }
      const { FilesetResolver, PoseLandmarker, HandLandmarker } = window.MP_VISION;
      try {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
        const pImg = await PoseLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task`, delegate: "GPU" }, runningMode: "IMAGE", numPoses: 1 });
        const hImg = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`, delegate: "GPU" }, runningMode: "IMAGE", numHands: 2 });
        const pVid = await PoseLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task`, delegate: "GPU" }, runningMode: "VIDEO", numPoses: 1 });
        const hVid = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`, delegate: "GPU" }, runningMode: "VIDEO", numHands: 2 });

        setModels({ image: { pose: pImg, hand: hImg }, video: { pose: pVid, hand: hVid } });
        setIsLoaded(true);
      } catch (error) { console.error("Failed to init MediaPipe:", error); }
    }
    initModels();
  }, [token, i18n]); // Додано i18n у залежності

  const PrivateRoute = ({ children }) => {
    if (!token) return <Navigate to="/auth" />;
    if (!isLoaded) return (
      <div className="loading-container">
        <p>Loading models and data... Please wait</p>
      </div>
    );
    return children;
  };

  return (
    <Router>
      <div className="App">
        {token && (
          <header className="app-header">
            <div className="app-header__logo" onClick={() => window.location.href="/"}>
              <div className="app-header__logo-icon">🤟</div>
              <h3 className="app-header__title">SignWave</h3>
            </div>
            <div className="app-header__right">
              {isAdmin && (
                <button className="app-header__admin-btn" onClick={() => window.location.href="/admin"}>
                  Admin
                </button>
              )}
              <button className="app-header__logout" onClick={handleLogout}>{t('log_out')}</button>
            </div>
          </header>
        )}

        <Routes>
          <Route path="/auth" element={!token ? <AuthPage onLoginSuccess={(t) => setToken(t)} /> : <Navigate to="/" />} />
          <Route path="/" element={<PrivateRoute><MainDashboard models={models} /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><SettingsPage models={models} /></PrivateRoute>} />
          
          {/* Ці маршрути також краще захистити PrivateRoute, якщо вони потребують токена для API */}
          <Route path="/gestures" element={<PrivateRoute><GesturesPage /></PrivateRoute>} />
          <Route path="/gestures/:id" element={<PrivateRoute><GestureDetailsPage /></PrivateRoute>} />
          <Route path="/learn" element={<PrivateRoute><LevelsPage /></PrivateRoute>} />
          <Route path="/lesson/:id" element={<PrivateRoute><LessonPage models={models} /></PrivateRoute>} />
          <Route path="/practice/:gestureId" element={<PrivateRoute><PracticePage models={models} /></PrivateRoute>} />
          <Route path="/achievements" element={<PrivateRoute><AchievementsPage /></PrivateRoute>} />
          <Route path="/flashcards" element={<PrivateRoute><FlashcardsPage /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
          
          <Route path="*" element={<Navigate to={token ? "/" : "/auth"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;