import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/components/VideoUploadBlock.scss';
import { extractFeatures } from '../utils/feature_extractor';


const MP = window.MP_VISION || {};
const DrawingUtils = MP.DrawingUtils;
const PoseLandmarker = MP.PoseLandmarker;
const HandLandmarker = MP.HandLandmarker;

import { drawAllLandmarks, hiddenPoseIds } from '../utils/drawing_utils';
import { exportLandmarksToVector } from '../utils/csv_manager';

import { IconPlay, IconPlus, IconCheck, IconLoader } from './Icons';

// ============================================================================
// 1. ДОЧІРНІЙ КОМПОНЕНТ: Відповідає суворо за ОДНЕ відео
// ============================================================================

const SingleVideoProcessor = ({ file, gestureLabel, sequenceLength, poseModel, handModel, onAddSequence, onRemove }) => {
  const { t } = useTranslation();
  const [videoSrc, setVideoSrc] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [extractedSequence, setExtractedSequence] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const SEQUENCE_LENGTH = sequenceLength;

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

        if (framesBuffer.length > 0 && framesBuffer.length < SEQUENCE_LENGTH) {
            const missingFramesCount = SEQUENCE_LENGTH - framesBuffer.length;
            for (let i = 0; i < missingFramesCount; i++) {
                await new Promise(r => requestAnimationFrame(r));
                const ts = performance.now();
                const poseResult = await poseModel.detectForVideo(video, ts);
                const handResult = await handModel.detectForVideo(video, ts);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawAllLandmarks(
                  drawingUtils, poseResult, handResult,
                  PoseLandmarker.POSE_CONNECTIONS, HandLandmarker.HAND_CONNECTIONS
                );
                const vector = extractFeatures(poseResult, handResult);
                framesBuffer.push(vector);
                setProgress(framesBuffer.length);
            }
        }

        setIsProcessing(false);

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
    <div className={`video-processor${isAdded ? ' video-processor--added' : ''}`}>
      <div className="video-processor__header">
        <h4 className="video-processor__title">{file.name}</h4>
        <button className="video-processor__remove-btn" onClick={onRemove} disabled={isProcessing} title="Remove">×</button>
      </div>

      <div className="video-processor__video-wrap">
        <video ref={videoRef} src={videoSrc} muted className="video-processor__video" crossOrigin="anonymous" />
        <canvas ref={canvasRef} className="video-processor__canvas" />
      </div>

      <div className="video-processor__controls">
        <label className="video-processor__start-label">{t('start_sec')}:</label>
        <input
          type="number" step="0.1" min="0"
          value={startTime} onChange={(e) => setStartTime(e.target.value)}
          disabled={isProcessing}
          className="video-processor__start-input"
        />
        <button
          onClick={processVideo}
          disabled={isProcessing || !gestureLabel}
          className={`video-processor__process-btn${isProcessing ? ' video-processor__process-btn--running' : ''}`}
        >
          {isProcessing ? <><IconLoader /> {progress}/{SEQUENCE_LENGTH}</> : <><IconPlay /> {t('process_video')}</>}
        </button>
      </div>

      {extractedSequence && !isProcessing && (
        <button
          onClick={handleAddData}
          disabled={isAdded}
          className={`video-processor__add-btn${isAdded ? ' video-processor__add-btn--done' : ''}`}
        >
          {isAdded ? <><IconCheck /> {t('added_to_json')}</> : <><IconPlus /> {t('add_to_json')}</>}
        </button>
      )}
    </div>
  );
};


// ============================================================================
// 2. БАТЬКІВСЬКИЙ КОМПОНЕНТ: Керує списком файлів
// ============================================================================
const BatchVideoUploadBlock = ({ poseModel, handModel, onAddSequence }) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [globalLabel, setGlobalLabel] = useState(localStorage.getItem("lastLabel") || "");
  const [globalSequenceLength, setGlobalSequenceLength] = useState(
    Number(localStorage.getItem("lastSequenceLength")) || 20
  );

  const addFiles = (incoming) => {
    const next = [...files];
    const names = new Set(files.map(f => f.name));
    for (const f of incoming) {
      if (f.type.startsWith('video/') && !names.has(f.name)) { next.push(f); names.add(f.name); }
    }
    setFiles(next);
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleLabelChange = (e) => {
    const val = e.target.value;
    setGlobalLabel(val);
    localStorage.setItem("lastLabel", val);
  };

  const handleSequenceLengthChange = (val) => {
    setGlobalSequenceLength(val);
    localStorage.setItem("lastSequenceLength", val);
  };

  return (
    <div className="upload-block">
      <div className="upload-settings">
        <div className="upload-settings__field">
          <label className="upload-settings__label">{t('gesture_label_for_all')}:</label>
          <input
            type="text"
            placeholder={t('gesture_label_placeholder')}
            value={globalLabel}
            onChange={handleLabelChange}
            className="upload-settings__text-input"
          />
        </div>

        <div className="upload-settings__field">
          <label className="upload-settings__label">{t('frames_for_all')}:</label>
          <div className="upload-settings__radios">
            {[20, 30].map((n) => (
              <label key={n} className="upload-settings__radio-label">
                <input
                  type="radio"
                  name="sequenceLength"
                  value={n}
                  checked={globalSequenceLength === n}
                  onChange={() => handleSequenceLengthChange(n)}
                />
                {n} {t('frames')}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`upload-block__dropzone${dragging ? ' upload-block__dropzone--dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(Array.from(e.dataTransfer.files)); }}
      >
        <p className="upload-block__dropzone-hint">{t('vib_dropzone_hint')}</p>
        <label className="upload-block__add-btn">
          <IconPlus /> {t('vib_add_videos')}
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            multiple
            onChange={(e) => addFiles(Array.from(e.target.files))}
            className="upload-block__file-input"
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="upload-grid">
          <div className="upload-grid__actions">
            <button className="upload-grid__clear-btn" onClick={() => setFiles([])}>Clear all</button>
            <span className="upload-grid__count">{files.length} video{files.length > 1 ? 's' : ''}</span>
          </div>
          <div className="upload-grid__list">
            {files.map((file, index) => (
              <SingleVideoProcessor
                key={`${file.name}-${index}`}
                file={file}
                gestureLabel={globalLabel}
                sequenceLength={globalSequenceLength}
                poseModel={poseModel}
                handModel={handModel}
                onAddSequence={onAddSequence}
                onRemove={() => removeFile(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchVideoUploadBlock;