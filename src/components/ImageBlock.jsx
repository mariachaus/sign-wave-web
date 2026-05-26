import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/components/ImageBlock.scss';

const MP = window.MP_VISION || {};
const DrawingUtils = MP.DrawingUtils;
const PoseLandmarker = MP.PoseLandmarker;
const HandLandmarker = MP.HandLandmarker;

import { drawAllLandmarks, hiddenPoseIds } from '../utils/drawing_utils';
import { exportLandmarksToVector } from '../utils/csv_manager';
import { IconPlus, IconCheck } from './Icons';


// ============================================================================
// Single image card
// ============================================================================
const SingleImageProcessor = ({ file, gestureLabel, normalize, poseModel, handModel, onAddRecord, onRemove }) => {
  const { t } = useTranslation();
  const [imageSrc, setImageSrc] = useState(null);
  const [coordsText, setCoordsText] = useState("");
  const [isAdded, setIsAdded] = useState(false);
  const [results, setResults] = useState(null);

  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleDetect = async () => {
    if (!poseModel || !handModel || !imgRef.current || !DrawingUtils) return;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const drawingUtils = new DrawingUtils(ctx);
    const poseResult = await poseModel.detect(img);
    const handResult = await handModel.detect(img);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAllLandmarks(drawingUtils, poseResult, handResult, PoseLandmarker.POSE_CONNECTIONS, HandLandmarker.HAND_CONNECTIONS);
    setResults({ pose: poseResult, hand: handResult });
    setIsAdded(false);

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

  const handleAdd = () => {
    if (!gestureLabel || !results?.pose?.landmarks?.[0]) return;
    localStorage.setItem("lastLabel", gestureLabel);
    const vector = exportLandmarksToVector(results.pose.landmarks[0], results.hand, normalize);
    onAddRecord({ label: gestureLabel, data: vector });
    setIsAdded(true);
  };

  return (
    <div className={`img-processor${isAdded ? ' img-processor--added' : ''}`}>
      <div className="img-processor__header">
        <h4 className="img-processor__title">{file.name}</h4>
        <button className="img-processor__remove-btn" onClick={onRemove} title="Remove">×</button>
      </div>

      <div className="img-processor__preview" onClick={handleDetect}>
        {imageSrc && (
          <img ref={imgRef} src={imageSrc} alt={file.name} className="img-processor__img" crossOrigin="anonymous" />
        )}
        <canvas ref={canvasRef} className="img-processor__canvas" />
        {!results && <div className="img-processor__detect-hint">{t('click_to_detect')}</div>}
      </div>

      {coordsText && (
        <>
          <pre className="img-processor__coords">{coordsText}</pre>
          <button
            onClick={handleAdd}
            disabled={isAdded || !gestureLabel}
            className={`img-processor__add-btn${isAdded ? ' img-processor__add-btn--done' : ''}`}
          >
            {isAdded ? <><IconCheck /> {t('added_to_csv')}</> : <><IconPlus /> {t('add_to_csv')}</>}
          </button>
        </>
      )}
    </div>
  );
};


// ============================================================================
// Batch upload container
// ============================================================================
const ImageBlock = ({ poseModel, handModel, onAddRecord }) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [gestureLabel, setGestureLabel] = useState(localStorage.getItem("lastLabel") || "");
  const [normalize, setNormalize] = useState(localStorage.getItem("imgNormalize") === "true");

  const addFiles = (incoming) => {
    const next = [...files];
    const names = new Set(files.map(f => f.name));
    for (const f of incoming) {
      if (f.type.startsWith('image/') && !names.has(f.name)) { next.push(f); names.add(f.name); }
    }
    setFiles(next);
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleLabelChange = (e) => {
    setGestureLabel(e.target.value);
    localStorage.setItem("lastLabel", e.target.value);
  };

  const handleNormalizeChange = (e) => {
    setNormalize(e.target.checked);
    localStorage.setItem("imgNormalize", e.target.checked);
  };

  return (
    <div className="image-block">
      <div className="upload-settings">
        <div className="upload-settings__field">
          <label className="upload-settings__label">{t('gesture_label_for_all')}:</label>
          <input
            type="text"
            placeholder={t('gesture_label_placeholder')}
            value={gestureLabel}
            onChange={handleLabelChange}
            className="upload-settings__text-input"
          />
        </div>

        <div className="upload-settings__field upload-settings__field--row">
          <label className="settings-toggle">
            <input type="checkbox" checked={normalize} onChange={handleNormalizeChange} />
            <span className="settings-toggle__track">
              <span className="settings-toggle__thumb" />
            </span>
          </label>
          <span className="upload-settings__label">{t('normalize_by_nose')}</span>
        </div>
      </div>

      <div
        className={`upload-block__dropzone${dragging ? ' upload-block__dropzone--dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(Array.from(e.dataTransfer.files)); }}
      >
        <p className="upload-block__dropzone-hint">{t('img_dropzone_hint')}</p>
        <label className="upload-block__add-btn">
          <IconPlus /> {t('vib_add_videos')}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => addFiles(Array.from(e.target.files))}
            className="upload-block__file-input"
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="upload-grid">
          <div className="upload-grid__actions">
            <button className="upload-grid__clear-btn" onClick={() => setFiles([])}>{t('vib_clear_all')}</button>
            <span className="upload-grid__count">{files.length} image{files.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="upload-grid__list">
            {files.map((file, idx) => (
              <SingleImageProcessor
                key={`${file.name}-${idx}`}
                file={file}
                gestureLabel={gestureLabel}
                normalize={normalize}
                poseModel={poseModel}
                handModel={handModel}
                onAddRecord={onAddRecord}
                onRemove={() => removeFile(idx)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageBlock;
