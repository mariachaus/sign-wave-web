import React, { useRef, useState, useEffect } from 'react';
import { extractFeatures } from '../utils/feature_extractor'; // Імпортуй функцію
import API_BASE_URL from "../config/api"; // Імпортуй конфіг

const MP = window.MP_VISION || {};
const DrawingUtils = MP.DrawingUtils;
const PoseLandmarker = MP.PoseLandmarker;
const HandLandmarker = MP.HandLandmarker;

import { drawAllLandmarks } from '../utils/drawing_utils';

const WebcamAnalyzer = ({ poseModel, handModel, onGestureDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isWebcamRunning, setIsWebcamRunning] = useState(false);
  const requestRef = useRef();

  const [prediction, setPrediction] = useState({ label: '', confidence: 0 });

  // ML Refs
  const frameBuffer = useRef([]);
  const isPredicting = useRef(false);
  const predictionHistory = useRef([]);

  const computeDeltaFeatures = (buffer) =>
    buffer.map((frame, i) => {
      const delta = i === 0
        ? new Array(225).fill(0)
        : frame.map((v, j) => v - buffer[i - 1][j]);
      return [...frame, ...delta];
    });

  // Оновлена функція аналізу
  const predictWebcam = async () => {
    if (!videoRef.current || !canvasRef.current || !poseModel || !handModel) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const drawingUtils = new DrawingUtils(ctx);

    if (video.readyState >= 2) {
      const startTimeMs = performance.now();
      
      // 1. Отримуємо дані від MediaPipe
      const handResult = handModel.detectForVideo(video, startTimeMs);
      const poseResult = await new Promise(resolve => poseModel.detectForVideo(video, startTimeMs, resolve));

     const isPersonVisible = (poseResult?.landmarks && poseResult.landmarks.length > 0) || 
                       (handResult?.landmarks && handResult.landmarks.length > 0);

      // 2. ML ЛОГІКА: Збираємо фічі, якщо не йде активний запит

      console.log("Visible:", isPersonVisible, "Buffer:", frameBuffer.current.length);
      
      if (!isPersonVisible) {
        frameBuffer.current = [];
        setPrediction({ label: 'No data', confidence: 0 });
      } else {
        // буфер оновлюється завжди, навіть поки йде запит
        const currentFrameFeatures = extractFeatures(poseResult, handResult);
        frameBuffer.current.push(currentFrameFeatures);
        if (frameBuffer.current.length > 30) {
            frameBuffer.current.shift();
        }

        if (frameBuffer.current.length === 30 && !isPredicting.current) {
            sendToPredict(computeDeltaFeatures([...frameBuffer.current]));
        } else if (frameBuffer.current.length < 30) {
            setPrediction(prev => ({
                label: prev.label === '' || prev.label === 'No data' ? 'Analyzing...' : prev.label,
                confidence: prev.confidence
            }));
        }
      }
      
      // 3. Малювання скелета
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

const sendToPredict = async (features) => {
  isPredicting.current = true;
  try {
    const response = await fetch(`${API_BASE_URL}/ml/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: features })
    });
    const result = await response.json();

    if (result.confidence > 0.6) {
      // smoothing disabled
      predictionHistory.current.push({ label: result.label, confidence: result.confidence });
      if (predictionHistory.current.length > 5) predictionHistory.current.shift();
      const scores = {};
      predictionHistory.current.forEach(({ label, confidence }) => {
        scores[label] = (scores[label] || 0) + confidence;
      });
      const smoothedLabel = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
      const smoothedConf = scores[smoothedLabel] / predictionHistory.current.length;
      setPrediction({ label: smoothedLabel, confidence: smoothedConf });

      setPrediction({ label: result.label, confidence: result.confidence });
    }

    if (result.confidence > 0.8) {
      if (onGestureDetected) onGestureDetected(result.label);
    }
  } catch (e) {
    console.error("ML Server Error:", e);
  } finally {
    isPredicting.current = false;
  }
};

  const toggleWebcam = async () => {
    if (isWebcamRunning) {
      // 1. Зупиняємо відеопотік
      const stream = videoRef.current.srcObject;
      if (stream) stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      
      // 2. Зупиняємо цикл анімації
      cancelAnimationFrame(requestRef.current);
      
      // 3. Очищуємо Canvas (тираємо скелет)
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // 4. Скидаємо передбачення (тираємо текст)
      setPrediction({ label: '', confidence: 0 });
      predictionHistory.current = [];

      // 5. Очищуємо буфер кадрів
      frameBuffer.current = []; 
      
      setIsWebcamRunning(false);
    } else {
      // Логіка старту (залишається без змін)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          predictWebcam();
        };
        setIsWebcamRunning(true);
      } catch (err) {
        console.error("Webcam Error:", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(requestRef.current);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const isMirror = localStorage.getItem('mirror_view') !== 'false';

  return (
    <div className="webcam-preview-simple">
      <div style={{ position: 'relative', width: '100%', maxWidth: '640px', margin: '0 auto' }}>
        <video 
          ref={videoRef} 
          autoPlay playsInline muted 
          style={{ 
            width: '100%', borderRadius: '25px', 
            transform: isMirror ? 'scaleX(-1)' : 'none',
            backgroundColor: '#000'
          }} 
        />
        <canvas 
          ref={canvasRef} 
          style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
            transform: isMirror ? 'scaleX(-1)' : 'none' 
          }} 
        />
        {/* Блок з результатом передбачення */}
{prediction.label && (
  <div style={{
    position: 'absolute',
    bottom: '12px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: prediction.confidence > 0.8 ? '#00FF00' : '#FFD700',
    padding: '8px 14px',
    borderRadius: '15px',
    fontSize: 'clamp(12px, 3.5vw, 20px)',
    fontWeight: 'bold',
    zIndex: 10,
    border: `2px solid ${prediction.confidence > 0.8 ? '#00FF00' : '#FFD700'}`,
    maxWidth: '90%',
    textAlign: 'center',
    wordBreak: 'break-word',
    lineHeight: 1.3,
  }}>
    {prediction.label.toUpperCase()}
    <span style={{ fontSize: 'clamp(12px, 3.5vw, 20px)', marginLeft: '6px', opacity: 0.9 }}>
      {(prediction.confidence * 100).toFixed(0)}%
    </span>
  </div>
)}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          onClick={toggleWebcam} 
          style={{ 
            padding: '12px 24px', 
            backgroundColor: isWebcamRunning ? '#dc3545' : '#28a745', 
            color: 'white', border: 'none', borderRadius: '25px', 
            cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          {isWebcamRunning ? "🛑 Stop Camera" : "📷 Start Camera"}
        </button>
      </div>
    </div>
  );
};

export default WebcamAnalyzer;