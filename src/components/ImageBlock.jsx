import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/components/ImageBlock.scss';

const MP = window.MP_VISION || {};
const DrawingUtils = MP.DrawingUtils;
const PoseLandmarker = MP.PoseLandmarker;
const HandLandmarker = MP.HandLandmarker;

import { drawAllLandmarks, hiddenPoseIds } from '../utils/drawing_utils';
import { exportLandmarksToVector } from '../utils/csv_manager';

import { IconImage, IconPlus, IconCheck } from './Icons';

const ImageBlock = ({ poseModel, handModel, onAddRecord }) => {
  const { t } = useTranslation();
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
    if (!poseModel || !handModel || !imgRef.current || !DrawingUtils) {
      console.error("Models or DrawingUtils not ready");
      return;
    }

    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const drawingUtils = new DrawingUtils(ctx);

    const poseResult = await poseModel.detect(img);
    const handResult = await handModel.detect(img);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

  const generateCoordsText = (poseResult, handResult) => {
    let text = "";
    if (poseResult.landmarks?.length > 0) {
      text += "=== POSE ===\n";
      poseResult.landmarks[0].forEach((lm, i) => {
        const status = hiddenPoseIds.includes(i) ? "[HIDDEN] " : "";
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
    <div className="image-block">
      <label className="image-block__file-label">
        <IconImage />
        {imageSrc ? t('change_image') : t('choose_image')}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="image-block__file-input"
        />
      </label>

      {imageSrc && (
        <>
          <div className="image-block__preview" onClick={handleDetect}>
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Preview"
              className="image-block__img"
              crossOrigin="anonymous"
            />
            <canvas ref={canvasRef} className="image-block__canvas" />
          </div>
          <p className="image-block__hint">{t('click_to_detect')}</p>
        </>
      )}

      {coordsText && (
        <div>
          <pre className="image-output__coords">{coordsText}</pre>
          <div className="image-output__controls">
            <input
              type="text"
              placeholder={t('gesture_label_placeholder')}
              value={gestureLabel}
              onChange={(e) => setGestureLabel(e.target.value)}
              className="image-output__label-input"
            />
            <button
              onClick={handleAddData}
              disabled={isAdded}
              className={`image-output__add-btn${isAdded ? ' image-output__add-btn--done' : ''}`}
            >
              {isAdded ? <><IconCheck /> {t('added_to_csv')}</> : <><IconPlus /> {t('add_to_csv')}</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageBlock;
