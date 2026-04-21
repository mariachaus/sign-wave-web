import React, { useRef, useState } from 'react';
// 1. ВИПРАВЛЕННЯ: Дістаємо константи та класи з MP_VISION
const MP = window.MP_VISION || {};
const DrawingUtils = MP.DrawingUtils;
const PoseLandmarker = MP.PoseLandmarker;
const HandLandmarker = MP.HandLandmarker;

import { drawAllLandmarks, hiddenPoseIds } from '../utils/drawing_utils';
import { exportLandmarksToVector } from '../utils/csv_manager';

const ImageBlock = ({ poseModel, handModel, onAddRecord }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [coordsText, setCoordsText] = useState("");
  const [gestureLabel, setGestureLabel] = useState(localStorage.getItem("lastLabel") || "");
  const [isAdded, setIsAdded] = useState(false);
  const [results, setResults] = useState(null);

  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageSrc(URL.createObjectURL(file));
      setCoordsText("");
      setIsAdded(false);
      setResults(null);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const handleDetect = async () => {
    // 2. ДОДАТКОВА ПЕРЕВІРКА: чи завантажилися класи
    if (!poseModel || !handModel || !imgRef.current || !DrawingUtils) {
      console.error("Models or DrawingUtils not ready");
      return;
    }

    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    // Тепер DrawingUtils має бути доступним як конструктор
    const drawingUtils = new DrawingUtils(ctx);

    const poseResult = await poseModel.detect(img);
    const handResult = await handModel.detect(img);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 3. ВИПРАВЛЕННЯ: використовуємо константи з MP (PoseLandmarker.POSE_CONNECTIONS)
    drawAllLandmarks(
      drawingUtils, 
      poseResult, 
      handResult, 
      PoseLandmarker.POSE_CONNECTIONS, 
      HandLandmarker.HAND_CONNECTIONS
    );

    setResults({ pose: poseResult, hand: handResult });
    generateCoordsText(poseResult, handResult);
  };

  // ... (решта функцій generateCoordsText та handleAddData без змін)

  const generateCoordsText = (poseResult, handResult) => {
    let text = "";
    if (poseResult.landmarks?.length > 0) {
      text += "=== POSE ===\n";
      poseResult.landmarks[0].forEach((lm, i) => {
        let status = hiddenPoseIds.includes(i) ? "[HIDDEN] " : "";
        text += `Pt ${i} ${status}: ${lm.x.toFixed(3)}, ${lm.y.toFixed(3)}\n`;
      });
    }
    if (handResult.landmarks) {
      handResult.landmarks.forEach((landmarks, i) => {
        const side = handResult.handednesses[i][0].categoryName;
        text += `=== ${side.toUpperCase()} HAND ===\n`;
        landmarks.forEach((lm, idx) => text += `Pt ${idx}: ${lm.x.toFixed(3)}, ${lm.y.toFixed(3)}\n`);
      });
    }
    setCoordsText(text);
  };

  const handleAddData = () => {
    if (!gestureLabel || !results?.pose?.landmarks?.[0]) return;
    
    localStorage.setItem("lastLabel", gestureLabel);
    const vector = exportLandmarksToVector(results.pose.landmarks[0], results.hand);
    
    onAddRecord({ label: gestureLabel, data: vector });
    setIsAdded(true);
  };

  return (
    <div className="upload-block" style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px' }}>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      
      {imageSrc && (
        <div className="detectOnClick" style={{ position: 'relative', marginTop: '10px' }}>
          <img 
            ref={imgRef}
            src={imageSrc} 
            alt="Preview" 
            style={{ width: '100%', cursor: 'pointer' }} 
            onClick={handleDetect}
            crossOrigin="anonymous"
          />
          <canvas 
            ref={canvasRef} 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} 
          />
        </div>
      )}
      {/* ... решта JSX ... */}
      {coordsText && (
        <div className="landmark-output" style={{ marginTop: '10px' }}>
          <pre style={{ height: '150px', overflowY: 'scroll', fontSize: '11px', background: '#f8f9fa', padding: '5px' }}>
            {coordsText}
          </pre>
          
          <div className="data-controls" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <input 
              type="text" 
              placeholder="Назва жесту" 
              value={gestureLabel} 
              onChange={(e) => setGestureLabel(e.target.value)}
            />
            <button onClick={handleAddData} disabled={isAdded}>
              {isAdded ? "✅ Додано!" : "➕ Додати"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageBlock;