import React, { useRef, useState, useEffect } from 'react';
const MP = window.MP_VISION || {};
const DrawingUtils = MP.DrawingUtils;
const PoseLandmarker = MP.PoseLandmarker;
const HandLandmarker = MP.HandLandmarker;

import { drawAllLandmarks } from '../utils/drawing_utils';

const WebcamAnalyzer = ({ poseModel, handModel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isWebcamRunning, setIsWebcamRunning] = useState(false);
  const requestRef = useRef();

  // Функція циклічного аналізу
  const predictWebcam = async () => {
    if (!videoRef.current || !canvasRef.current || !poseModel || !handModel) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const drawingUtils = new DrawingUtils(ctx);

    if (video.readyState >= 2) { // Перевірка, що відео готове
      const startTimeMs = performance.now();
      
      // Отримуємо результати від MediaPipe
      const handResult = handModel.detectForVideo(video, startTimeMs);
      const poseResult = await new Promise(resolve => poseModel.detectForVideo(video, startTimeMs, resolve));

      // Очищення та малювання (колір та видимість беруться всередині drawAllLandmarks з localStorage)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawAllLandmarks(
        drawingUtils, 
        poseResult, 
        handResult, 
        PoseLandmarker.POSE_CONNECTIONS, 
        HandLandmarker.HAND_CONNECTIONS
      );
    }
    
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  // Увімкнення/Вимкнення камери
  const toggleWebcam = async () => {
    if (isWebcamRunning) {
      const stream = videoRef.current.srcObject;
      if (stream) stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      cancelAnimationFrame(requestRef.current);
      setIsWebcamRunning(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          predictWebcam();
        };
        setIsWebcamRunning(true);
      } catch (err) {
        console.error("Error accessing webcam:", err);
        alert("Could not access webcam. Please check permissions.");
      }
    }
  };

  // Очищення при видаленні компонента
  useEffect(() => {
    return () => {
      cancelAnimationFrame(requestRef.current);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Отримуємо параметр дзеркального відображення з localStorage
  const isMirror = localStorage.getItem('mirror_view') !== 'false';

  return (
    <div className="webcam-preview-simple">
      <div style={{ position: 'relative', width: '100%', maxWidth: '640px', margin: '0 auto' }}>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={{ 
            width: '100%', 
            borderRadius: '12px', 
            transform: isMirror ? 'scaleX(-1)' : 'none',
            transform: isMirror ? 'scaleX(-1)' : 'none',
            backgroundColor: '#000'
          }} 
        />
        <canvas 
          ref={canvasRef} 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            transform: isMirror ? 'scaleX(-1)' : 'none' 
          }} 
        />
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          onClick={toggleWebcam} 
          style={{ 
            padding: '12px 24px', 
            backgroundColor: isWebcamRunning ? '#dc3545' : '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '25px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}
        >
          {isWebcamRunning ? "🛑 Stop Camera" : "📷 Start Camera Test"}
        </button>
      </div>
    </div>
  );
};

export default WebcamAnalyzer;