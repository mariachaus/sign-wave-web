import React, { useState, useEffect } from 'react';

// Імпорт ваших компонентів
import ImageBlock from './components/ImageBlock';
import WebcamAnalyzer from './components/WebcamAnalyzer';
import VideoUploadBlock from './components/VideoUploadBlock';

// Імпорт утиліт
import { downloadCSVDataset } from './utils/csv_manager';
import { downloadJSONDataset } from './utils/json_manager';
import './App.scss';

// ... імпорти ...

function App() {
  const [tab, setTab] = useState('image'); 
  // Створюємо два окремих набори моделей
  const [models, setModels] = useState({
    image: { pose: null, hand: null },
    video: { pose: null, hand: null }
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageDataset, setImageDataset] = useState([]);
  const [videoDataset, setVideoDataset] = useState([]);

  useEffect(() => {
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

        // --- 1. ІНІЦІАЛІЗАЦІЯ МОДЕЛЕЙ ДЛЯ ЗОБРАЖЕНЬ ---
        const poseImage = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task`,
            delegate: "GPU"
          },
          runningMode: "IMAGE",
          numPoses: 1
        });

        const handImage = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "IMAGE",
          numHands: 2
        });

        // --- 2. ІНІЦІАЛІЗАЦІЯ МОДЕЛЕЙ ДЛЯ ВІДЕО ---
        const poseVideo = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });

        const handVideo = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });

        setModels({
          image: { pose: poseImage, hand: handImage },
          video: { pose: poseVideo, hand: handVideo }
        });
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to init MediaPipe:", error);
      }
    }
    initModels();
  }, []);

  // ... решта логіки ...

  const addImageRecord = (record) => {
    setImageDataset(prev => [...prev, record]);
  };

  const addVideoSequence = (sequence) => {
    setVideoDataset(prev => [...prev, sequence]);
  };;

  // Поки моделі вантажаться, показуємо спінер або текст
  if (!isLoaded) {
    return (
      <div className="loading-container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <div className="spinner"></div>
        <p className="loading">Завантаження штучного інтелекту...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <nav style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5' }}>
        <button 
          onClick={() => setTab('image')} 
          className={tab === 'image' ? 'active-tab' : ''}
          style={{ marginRight: '10px', cursor: 'pointer' }}
        >
          🖼️ Image Mode
        </button>
        <button 
          onClick={() => setTab('webcam')} 
          className={tab === 'webcam' ? 'active-tab' : ''}
          style={{ cursor: 'pointer' }}
        >
          🎥 Webcam Mode
        </button>
        <button 
          onClick={() => setTab('videoData')} 
          className={tab === 'videoData' ? 'active-tab' : ''}
          style={{ cursor: 'pointer', marginLeft: '10px' }}
        >
          🎬 Extract Video Data
        </button>
      </nav>

      <section id="demos">
  
  {/* 1. Вкладка ФОТО */}
  {tab === 'image' && (
    <div className="image-mode">
      <h1>Sign language test - Image Detection</h1>
      <p><b>Click on an image below</b> to see the key landmarks.</p>
      
      <div className="upload-grid">
        {/* Передаємо addImageRecord */}
        <ImageBlock poseModel={models.image.pose} handModel={models.image.hand} onAddRecord={addImageRecord} />
        <ImageBlock poseModel={models.image.pose} handModel={models.image.hand} onAddRecord={addImageRecord} />
      </div>

      <div className="data-controls" style={{ textAlign: 'center', marginTop: '40px', padding: '20px', background: '#eee' }}>
        {/* Показуємо довжину imageDataset */}
        <p id="dataset-status">Записів у таблиці: <b>{imageDataset.length}</b></p>
        <button 
          className="mdc-button mdc-button--raised" 
          style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          // Завантажуємо imageDataset
          onClick={() => downloadDataset(imageDataset)}
        >
          💾 Download CSV
        </button>
      </div>
    </div>
  )}

  {/* 2. Вкладка ВЕБКАМЕРА */}
  {tab === 'webcam' && (
    <div className="webcam-mode">
      <h1>Live webcam testing</h1>
      <WebcamAnalyzer poseModel={models.video.pose} handModel={models.video.hand} />
    </div>
  )}

  {/* 3. Вкладка ВІДЕО ДАТАСЕТ (Нова) */}
  {tab === 'videoData' && (
    <div className="video-data-mode">
      <h1>Extract Sequences from Video</h1>
      <p>Завантажте коротке відео для генерації 30 кадрів.</p>
      
      <div className="upload-grid">
        {/* Передаємо addVideoSequence */}
        <VideoUploadBlock 
           poseModel={models.video.pose} 
           handModel={models.video.hand} 
           onAddSequence={addVideoSequence} 
        />
      </div>

      <div className="data-controls" style={{ textAlign: 'center', marginTop: '40px' }}>
        {/* Показуємо довжину videoDataset */}
        <p>Зібрано відео-послідовностей: <b>{videoDataset.length}</b></p>
        <button 
          // Завантажуємо videoDataset
          onClick={() => downloadJSONDataset(videoDataset)} 
          style={{ backgroundColor: '#ffa500', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          💾 Download JSON (LSTM Data)
        </button>
      </div>
    </div>
  )}

</section>
    </div>
  );
}

export default App;