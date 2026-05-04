import React, { useRef, useState, useEffect } from 'react';

import { extractFeatures } from '../utils/feature_extractor';


const MP = window.MP_VISION || {};
const DrawingUtils = MP.DrawingUtils;
const PoseLandmarker = MP.PoseLandmarker;
const HandLandmarker = MP.HandLandmarker;

import { drawAllLandmarks, hiddenPoseIds } from '../utils/drawing_utils';
import { exportLandmarksToVector } from '../utils/csv_manager';

// ============================================================================
// 1. ДОЧІРНІЙ КОМПОНЕНТ: Відповідає суворо за ОДНЕ відео
// ============================================================================
const SingleVideoProcessor = ({ file, gestureLabel, poseModel, handModel, onAddSequence }) => {
  const [videoSrc, setVideoSrc] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [isAdded, setIsAdded] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [extractedSequence, setExtractedSequence] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const SEQUENCE_LENGTH = 30;

  // Коли приходить новий файл, створюємо для нього URL
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      // Очищення пам'яті, коли компонент зникає
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const processVideo = async () => {
    if (!poseModel || !handModel || !videoRef.current || !gestureLabel) {
      alert("Вкажіть назву жесту зверху!");
      return;
    }

    setIsProcessing(true);
    setIsAdded(false);
    setProgress(0);
    setExtractedSequence(null); 

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const drawingUtils = new DrawingUtils(ctx);

    let framesBuffer = [];
    let lastVideoTime = -1;

    video.currentTime = Number(startTime) || 0;
    video.play();

    const captureLoop = async () => {
      if (video.paused || video.ended || framesBuffer.length >= SEQUENCE_LENGTH) {
        video.pause();
        setIsProcessing(false);
        
        if (framesBuffer.length > 0 && framesBuffer.length < SEQUENCE_LENGTH) {
            const lastFrame = framesBuffer[framesBuffer.length - 1];
            const missingFramesCount = SEQUENCE_LENGTH - framesBuffer.length;
            for (let i = 0; i < missingFramesCount; i++) {
                framesBuffer.push([...lastFrame]); 
            }
        }
        
        if (framesBuffer.length === SEQUENCE_LENGTH) {
            setExtractedSequence(framesBuffer);
            setProgress(SEQUENCE_LENGTH); 
        } else {
            alert(`Помилка у файлі ${file.name}: не вдалося розпізнати кадри.`);
        }
        return;
      }

      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const startTimeMs = performance.now();

        const poseResult = await poseModel.detectForVideo(video, startTimeMs);
        const handResult = await handModel.detectForVideo(video, startTimeMs);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawAllLandmarks(
          drawingUtils, poseResult, handResult, 
          PoseLandmarker.POSE_CONNECTIONS, HandLandmarker.HAND_CONNECTIONS
        );

        const rawVector = exportLandmarksToVector(poseResult.landmarks?.[0], handResult);
        
        const vector = extractFeatures(poseResult, handResult);
        framesBuffer.push(vector);
        
        setProgress(framesBuffer.length);
      }
      requestAnimationFrame(captureLoop);
    };

    captureLoop();
  };

  const handleAddData = () => {
    if (extractedSequence && gestureLabel) {
      onAddSequence({ label: gestureLabel, sequence: extractedSequence });
      setIsAdded(true);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '15px', borderRadius: '8px', background: '#f9f9f9' }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', wordBreak: 'break-all' }}>📄 {file.name}</h4>
      
      <div style={{ position: 'relative' }}>
        <video ref={videoRef} src={videoSrc} muted style={{ width: '100%', borderRadius: '4px', transform: 'none' }} crossOrigin="anonymous" />
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', transform: 'none' }} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
        <label style={{ fontSize: '12px' }}>Старт з (сек):</label>
        <input 
          type="number" step="0.1" min="0" 
          value={startTime} onChange={(e) => setStartTime(e.target.value)}
          disabled={isProcessing} style={{ width: '60px', padding: '4px' }}
        />
        
        <button onClick={processVideo} disabled={isProcessing || !gestureLabel} style={{ padding: '6px 12px', backgroundColor: isProcessing ? '#ffa500' : '#007bff', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', flexGrow: 1 }}>
          {isProcessing ? `⏳ ${progress}/${SEQUENCE_LENGTH}` : `▶️ Обробити`}
        </button>
        
        {extractedSequence && !isProcessing && (
          <button onClick={handleAddData} disabled={isAdded} style={{ padding: '6px 12px', backgroundColor: isAdded ? 'gray' : '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', width: '100%' }}>
            {isAdded ? "✅ Додано!" : "➕ Додати в JSON"}
          </button>
        )}
      </div>
    </div>
  );
};


// ============================================================================
// 2. БАТЬКІВСЬКИЙ КОМПОНЕНТ: Керує списком файлів
// ============================================================================
const BatchVideoUploadBlock = ({ poseModel, handModel, onAddSequence }) => {
  const [files, setFiles] = useState([]);
  const [globalLabel, setGlobalLabel] = useState(localStorage.getItem("lastLabel") || "");

  const handleMultipleFilesChange = (e) => {
    // Перетворюємо FileList на звичайний масив
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleLabelChange = (e) => {
    const val = e.target.value;
    setGlobalLabel(val);
    localStorage.setItem("lastLabel", val);
  };

  return (
    <div className="upload-block" style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
      <h2>Пакетне завантаження відео</h2>
      
      {/* Спільна назва жесту для всіх вибраних файлів */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#e9ecef', borderRadius: '6px' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Спільна назва жесту для всіх відео:</label>
        <input 
          type="text" 
          placeholder="Напр. hello" 
          value={globalLabel} 
          onChange={handleLabelChange}
          style={{ padding: '10px', width: '100%', boxSizing: 'border-box', fontSize: '16px' }}
        />
      </div>

      {/* Кнопка вибору БАГАТЬОХ файлів (додано атрибут multiple) */}
      <input 
        type="file" 
        accept="video/mp4,video/webm,video/quicktime" 
        multiple 
        onChange={handleMultipleFilesChange} 
        style={{ marginBottom: '20px' }}
      />

      {/* Якщо файли вибрано, створюємо сітку з відео */}
      {files.length > 0 && (
        <div>
          <p>Вибрано файлів: <b>{files.length}</b></p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
            {files.map((file, index) => (
              <SingleVideoProcessor 
                key={index} 
                file={file} 
                gestureLabel={globalLabel} 
                poseModel={poseModel} 
                handModel={handModel} 
                onAddSequence={onAddSequence} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchVideoUploadBlock;