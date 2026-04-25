import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Імпорт сторінок
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import MainDashboard from './components/MainDashboard'; // Створимо цей файл нижче

import './App.scss';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [models, setModels] = useState({
    image: { pose: null, hand: null },
    video: { pose: null, hand: null }
  });
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsLoaded(false);
  };

  useEffect(() => {
    if (!token) return;

    async function initModels() {
      if (!window.MP_VISION) {
        setTimeout(initModels, 100);
        return;
      }
      const { FilesetResolver, PoseLandmarker, HandLandmarker } = window.MP_VISION;
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        // Одноразова ініціалізація всіх моделей (спрощено для прикладу)
        const pImg = await PoseLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task`, delegate: "GPU" }, runningMode: "IMAGE", numPoses: 1 });
        const hImg = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`, delegate: "GPU" }, runningMode: "IMAGE", numHands: 2 });
        const pVid = await PoseLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task`, delegate: "GPU" }, runningMode: "VIDEO", numPoses: 1 });
        const hVid = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`, delegate: "GPU" }, runningMode: "VIDEO", numHands: 2 });

        setModels({
          image: { pose: pImg, hand: hImg },
          video: { pose: pVid, hand: hVid }
        });
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to init MediaPipe:", error);
      }
    }
    initModels();
  }, [token]);

  if (!token) return <AuthPage onLoginSuccess={(t) => setToken(t)} />;
  
  if (!isLoaded) return (
    <div className="loading-container" style={{ textAlign: 'center', marginTop: '50px' }}>
      <p>Завантаження штучного інтелекту...</p>
      <button onClick={handleLogout}>Вийти</button>
    </div>
  );

  return (
    <Router>
      <div className="App">
        {/* Хедер залишається на всіх сторінках */}
        <header style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', background: '#333', color: 'white', alignItems: 'center' }}>
          <h3 style={{margin: 0, cursor: 'pointer'}} onClick={() => window.location.href="/"}>Sign Language Learning</h3>
          <button onClick={handleLogout} style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
        </header>

        <Routes>
          {/* Головна сторінка з режимами (Image, Webcam, Video) */}
          <Route path="/" element={<MainDashboard models={models} />} />
          
          {/* Сторінка профілю */}
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Сторінка налаштувань */}
          <Route path="/settings" element={<SettingsPage />} />

          {/* Редирект якщо шлях невірний */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;