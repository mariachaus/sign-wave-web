import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { extractFeatures } from '../utils/feature_extractor';
import { drawAllLandmarks } from '../utils/drawing_utils';
import { useMLWebSocket } from '../hooks/useMLWebSocket';
import '../styles/components/WebcamAnalyzer.scss';
import { IconCamera, IconStop } from './Icons';

const MP = window.MP_VISION || {};
const DrawingUtils = MP.DrawingUtils;
const PoseLandmarker = MP.PoseLandmarker;
const HandLandmarker = MP.HandLandmarker;

const FRAMES = 20;

const computeDelta = (buffer) =>
  buffer.map((frame, i) => {
    const delta = i === 0
      ? new Array(225).fill(0)
      : frame.map((v, j) => v - buffer[i - 1][j]);
    return [...frame, ...delta];
  });

const WebcamAnalyzer = ({ poseModel, handModel, onGestureDetected, isMirror: isMirrorProp }) => {
  const { t } = useTranslation();
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [prediction, setPrediction] = useState({ label: '', confidence: 0 });

  const isPredicting  = useRef(false);
  const frameBuffer   = useRef([]);
  const predHistory   = useRef([]);
  const lastVideoTime = useRef(-1);

  const { connect, disconnect, predict } = useMLWebSocket();

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    const video = videoRef.current;
    if (video?.srcObject) { video.srcObject.getTracks().forEach(t => t.stop()); video.srcObject = null; }
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    frameBuffer.current   = [];
    predHistory.current   = [];
    isPredicting.current  = false;
    lastVideoTime.current = -1;
    setPrediction({ label: '', confidence: 0 });
    setIsRunning(false);
    disconnect();
  };

  const start = async () => {
    try {
      await connect();
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      video.srcObject = stream;
      video.onloadeddata = () => {
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
        setIsRunning(true);

        const ctx          = canvas.getContext('2d');
        const drawingUtils = new DrawingUtils(ctx);

        const sendPredict = async (features) => {
          isPredicting.current = true;
          try {
            const data = await predict(features);
            if (data.confidence > 0.6) {
              predHistory.current.push({ label: data.label, confidence: data.confidence });
              if (predHistory.current.length > 5) predHistory.current.shift();
              const scores = {};
              predHistory.current.forEach(({ label, confidence }) => {
                scores[label] = (scores[label] || 0) + confidence;
              });
              const best       = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
              const matchCount = predHistory.current.filter(p => p.label === best).length;
              const conf       = scores[best] / matchCount;
              setPrediction({ label: best, confidence: conf });
              if (conf > 0.8 && onGestureDetected) onGestureDetected(best);
            }
          } catch (e) { if (e.message !== 'busy') console.error(e); }
          finally { isPredicting.current = false; }
        };

        const loop = async () => {
          if (!videoRef.current?.srcObject) return;
          if (video.currentTime !== lastVideoTime.current) {
            lastVideoTime.current = video.currentTime;
            const ts         = performance.now();
            const poseResult = await poseModel.detectForVideo(video, ts);
            const handResult = await handModel.detectForVideo(video, ts);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawAllLandmarks(drawingUtils, poseResult, handResult,
              PoseLandmarker.POSE_CONNECTIONS, HandLandmarker.HAND_CONNECTIONS);
            frameBuffer.current.push(extractFeatures(poseResult, handResult));
            if (frameBuffer.current.length > FRAMES) frameBuffer.current.shift();
            if (frameBuffer.current.length === FRAMES && !isPredicting.current) {
              sendPredict(computeDelta([...frameBuffer.current]));
            }
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        loop();
      };
    } catch (err) { console.error('Webcam error:', err); }
  };

  useEffect(() => () => stop(), []);

  const isMirror = isMirrorProp !== undefined ? isMirrorProp : localStorage.getItem('mirror_view') !== 'false';
  const mirrorStyle = { transform: isMirror ? 'scaleX(-1)' : 'scaleX(1)' };
  const predMod = prediction.confidence > 0.8 ? 'good' : prediction.confidence > 0.5 ? 'ok' : 'muted';

  return (
    <div className="webcam-analyzer">
      <div className="webcam-analyzer__video-wrap">
        <video ref={videoRef} autoPlay playsInline muted className="webcam-analyzer__video" style={mirrorStyle} />
        <canvas ref={canvasRef} className="webcam-analyzer__canvas" style={mirrorStyle} />
        {prediction.label && (
          <div className={`webcam-analyzer__prediction webcam-analyzer__prediction--${predMod}`}>
            {prediction.label.toUpperCase()}
            <span className="webcam-analyzer__prediction__conf">
              {(prediction.confidence * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>
      <button
        onClick={isRunning ? stop : start}
        className={`webcam-analyzer__toggle-btn webcam-analyzer__toggle-btn--${isRunning ? 'stop' : 'start'}`}
      >
        {isRunning ? <><IconStop /> {t('stop_camera')}</> : <><IconCamera /> {t('start_camera')}</>}
      </button>
    </div>
  );
};

export default WebcamAnalyzer;
