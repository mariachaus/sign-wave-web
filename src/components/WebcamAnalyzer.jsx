import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { extractFeatures } from '../utils/feature_extractor';
import API_BASE_URL from '../config/api';
import '../styles/components/WebcamAnalyzer.scss';

const IconCamera = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const IconStop = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2"/>
  </svg>
);

const MP = window.MP_VISION || {};
const DrawingUtils = MP.DrawingUtils;
const PoseLandmarker = MP.PoseLandmarker;
const HandLandmarker = MP.HandLandmarker;

import { drawAllLandmarks } from '../utils/drawing_utils';

const WebcamAnalyzer = ({ poseModel, handModel, onGestureDetected, isMirror: isMirrorProp }) => {
  const { t } = useTranslation();
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
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
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

  const isMirror = isMirrorProp !== undefined ? isMirrorProp : localStorage.getItem('mirror_view') !== 'false';
  const mirrorStyle = { transform: isMirror ? 'scaleX(-1)' : 'scaleX(1)' };

  const predictionMod = ['No data', 'Analyzing...'].includes(prediction.label)
    ? 'muted'
    : prediction.confidence > 0.8 ? 'good' : 'ok';

  return (
    <div className="webcam-analyzer">
      <div className="webcam-analyzer__video-wrap">
        <video
          ref={videoRef}
          autoPlay playsInline muted
          className="webcam-analyzer__video"
          style={mirrorStyle}
        />
        <canvas
          ref={canvasRef}
          className="webcam-analyzer__canvas"
          style={mirrorStyle}
        />
        {prediction.label && (
          <div className={`webcam-analyzer__prediction webcam-analyzer__prediction--${predictionMod}`}>
            {prediction.label.toUpperCase()}
            <span className="webcam-analyzer__prediction__conf">
              {(prediction.confidence * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      <button
        onClick={toggleWebcam}
        className={`webcam-analyzer__toggle-btn webcam-analyzer__toggle-btn--${isWebcamRunning ? 'stop' : 'start'}`}
      >
        {isWebcamRunning ? <><IconStop /> {t('stop_camera')}</> : <><IconCamera /> {t('start_camera')}</>}
      </button>
    </div>
  );
};

export default WebcamAnalyzer;