
import React, { useRef, useState, useEffect } from 'react';
const MP = window.MP_VISION || {};
const DrawingUtils = MP.DrawingUtils;
const PoseLandmarker = MP.PoseLandmarker;
const HandLandmarker = MP.HandLandmarker;

import { drawAllLandmarks } from '../utils/drawing_utils';
import API_BASE_URL from "../config/api";
import { exportLandmarksToVector } from '../utils/csv_manager'; 

const API_URL = `${API_BASE_URL}/predict`;
const TASK_URL = `${API_BASE_URL}/get_task`;

// 2. НАЛАШТУВАННЯ LSTM
const SEND_INTERVAL = 500; // Відправляємо дані на сервер кожні пів секунди (швидше реагування)
const SEQUENCE_LENGTH = 30; // Нам потрібно рівно 30 кадрів

const WebcamAnalyzer = ({ poseModel, handModel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [prediction, setPrediction] = useState("Waiting for 30 frames...");
  const [currentTask, setCurrentTask] = useState("");
  const [exerciseStatus, setExerciseStatus] = useState({ text: "Loading task...", color: "#fff" });
  const [isWebcamRunning, setIsWebcamRunning] = useState(false);

  // Внутрішні змінні
  const isProcessing = useRef(false);
  const isSuccessPause = useRef(false);
  
  const lastSendTime = useRef(0);
  const lastVideoTime = useRef(-1); // Для правильного підрахунку кадрів
  const framesBuffer = useRef([]);  // 3. ДОДАНО: Наша "коробка" для 30 кадрів
  const requestRef = useRef();

  const fetchNextTask = async () => {
    try {
      const response = await fetch(TASK_URL);
      const data = await response.json();
      setCurrentTask(data.target);
      setExerciseStatus({ text: "Show the sign", color: "#ffffff" });
      isSuccessPause.current = false;
      framesBuffer.current = []; // Очищаємо буфер для нового завдання
    } catch (err) {
      console.error("Не вдалося отримати завдання", err);
    }
  };

  const sendToBackend = async (sequence) => {
    if (isSuccessPause.current || isProcessing.current) return;

    isProcessing.current = true;
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Відправляємо масив із 30 кадрів
        body: JSON.stringify({ features: sequence })
      });

      if (!response.ok) throw new Error(`Server Error ${response.status}`);
      
      const data = await response.json();
      if (data.label) {
        const conf = data.confidence;
        setPrediction(`Sign: ${data.label.toUpperCase()} (${(conf * 100).toFixed(1)}%)`);

        // Логіка перевірки завдання
        if (currentTask && data.label === currentTask && conf >= 0.75) {
          isSuccessPause.current = true;
          setExerciseStatus({ text: `Good! (${(conf * 100).toFixed(0)}%)`, color: "#4caf50" });
          
          // Очищаємо буфер, щоб не було "подвійного спрацьовування"
          framesBuffer.current = [];
          
          setTimeout(() => {
            fetchNextTask();
          }, 2500);
        }
      }
    } catch (error) {
      setPrediction("Error: " + error.message);
    } finally {
      isProcessing.current = false;
    }
  };

  const predictWebcam = async () => {
    if (!videoRef.current || !canvasRef.current || !poseModel || !handModel || !DrawingUtils) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const drawingUtils = new DrawingUtils(ctx);

    // Збираємо кадри ТІЛЬКИ коли відео реально оновлюється
    if (video.currentTime !== lastVideoTime.current) {
      lastVideoTime.current = video.currentTime;
      const startTimeMs = performance.now();
      
      const handResult = handModel.detectForVideo(video, startTimeMs);
      const poseResult = await new Promise(resolve => {
        poseModel.detectForVideo(video, startTimeMs, resolve);
      });

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawAllLandmarks(
        drawingUtils, 
        poseResult, 
        handResult, 
        PoseLandmarker.POSE_CONNECTIONS, 
        HandLandmarker.HAND_CONNECTIONS
      );

      // 4. Екстракція та округлення (ЯК ПРИ ЗБОРІ ДАНИХ)
      const rawVector = exportLandmarksToVector(poseResult.landmarks?.[0], handResult);
      const vector = rawVector.map(num => Number(num.toFixed(4)));
      
      framesBuffer.current.push(vector);

      // Якщо масив більший за 30, викидаємо найстаріший кадр (ковзне вікно)
      if (framesBuffer.current.length > SEQUENCE_LENGTH) {
        framesBuffer.current.shift();
      }

      // Відправка на сервер: тільки якщо є рівно 30 кадрів і пройшов інтервал
      const now = performance.now();
      if (framesBuffer.current.length === SEQUENCE_LENGTH && now - lastSendTime.current > SEND_INTERVAL) {
        lastSendTime.current = now;
        // Відправляємо копію масиву на бекенд
        sendToBackend([...framesBuffer.current]);
      } else if (framesBuffer.current.length < SEQUENCE_LENGTH) {
        setPrediction(`Gathering frames: ${framesBuffer.current.length}/${SEQUENCE_LENGTH}...`);
      }
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  const toggleWebcam = async () => {
    if (isWebcamRunning) {
      const stream = videoRef.current.srcObject;
      if (stream) stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      cancelAnimationFrame(requestRef.current);
      framesBuffer.current = []; // Очищаємо буфер при вимкненні
    } else {
      framesBuffer.current = []; // Очищаємо буфер при старті
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.onloadeddata = () => {
        predictWebcam();
        fetchNextTask();
      };
    }
    setIsWebcamRunning(!isWebcamRunning);
  };

  // Очищення при виході з компонента
  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="webcam-section">
      <div className="task-panel" style={{ background: '#333', color: '#fff', padding: '15px', borderRadius: '8px' }}>
        <h3>Target: <span style={{ color: '#ffeb3b' }}>{currentTask.toUpperCase()}</span></h3>
        <p style={{ color: exerciseStatus.color, fontWeight: 'bold', fontSize: '18px' }}>{exerciseStatus.text}</p>
      </div>

      <div style={{ position: 'relative', marginTop: '20px' }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', transform: 'scaleX(-1)', borderRadius: '8px' }} />
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)' }} />
      </div>

      <div className="controls" style={{ marginTop: '15px', textAlign: 'center' }}>
        <button onClick={toggleWebcam} style={{ padding: '12px 24px', fontSize: '16px', backgroundColor: isWebcamRunning ? '#dc3545' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isWebcamRunning ? "🛑 Вимкнути камеру" : "📷 Увімкнути камеру"}
        </button>
        <p className="prediction-text" style={{ marginTop: '15px', fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
          {prediction}
        </p>
      </div>
    </div>
  );
};

export default WebcamAnalyzer;