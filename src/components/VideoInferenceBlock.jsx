import React, { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { extractFeatures } from '../utils/feature_extractor';
import { drawAllLandmarks } from '../utils/drawing_utils';
import { IconPlus } from './Icons';
import API_BASE_URL from '../config/api';
import '../styles/components/VideoInferenceBlock.scss';

const MP = window.MP_VISION || {};
const DrawingUtils = MP.DrawingUtils;
const PoseLandmarker = MP.PoseLandmarker;
const HandLandmarker = MP.HandLandmarker;

const FRAMES = 20;
const STEP   = 5;

const computeDelta = (buffer) =>
  buffer.map((frame, i) => {
    const delta = i === 0
      ? new Array(225).fill(0)
      : frame.map((v, j) => v - buffer[i - 1][j]);
    return [...frame, ...delta];
  });

const groupPredictions = (preds) => {
  if (!preds.length) return [];
  const groups = [];
  let cur = { ...preds[0], count: 1, confSum: preds[0].confidence };
  for (let i = 1; i < preds.length; i++) {
    if (preds[i].label === cur.label) {
      cur.count++;
      cur.confSum += preds[i].confidence;
      cur.endFrame = preds[i].endFrame;
    } else {
      groups.push({ ...cur, avgConf: cur.confSum / cur.count });
      cur = { ...preds[i], count: 1, confSum: preds[i].confidence };
    }
  }
  groups.push({ ...cur, avgConf: cur.confSum / cur.count });
  return groups;
};

const LABEL_COLORS = [
  '#7c3aed','#0891b2','#16a34a','#ca8a04','#dc2626',
  '#4f46e5','#db2777','#ea580c','#65a30d','#0284c7',
  '#9333ea','#e11d48','#d97706','#059669','#2563eb',
];
const colorMap = {};
let colorIdx = 0;
const labelColor = (label) => {
  if (!colorMap[label]) colorMap[label] = LABEL_COLORS[colorIdx++ % LABEL_COLORS.length];
  return colorMap[label];
};

const confMod = (c) => c > 0.8 ? 'good' : c > 0.5 ? 'ok' : 'bad';

// ─── One video card ────────────────────────────────────────────────────────

const SingleVideoItem = forwardRef(({ file, poseModel, handModel, onRemove, mode }, ref) => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [status, setStatus] = useState('idle');
  const [statusText, setStatusText] = useState('idle');
  const [result, setResult] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [livePred, setLivePred] = useState(null); // { label, confidence } for playback mode

  const rafRef       = useRef(null);
  const isPredicting = useRef(false);
  const frameBuffer  = useRef([]);
  const predHistory  = useRef([]);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // ── Shared: extract all frames (for single / sliding) ──────────────────
  const extractAllFrames = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const drawingUtils = new DrawingUtils(ctx);
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const allFrames = [];
    let lastTime = -1;
    video.currentTime = 0;
    await new Promise(r => { video.onseeked = r; });
    video.play();

    await new Promise((resolve) => {
      const loop = async () => {
        if (video.ended || video.paused) { video.pause(); resolve(); return; }
        if (video.currentTime !== lastTime) {
          lastTime = video.currentTime;
          const ts = performance.now();
          const poseResult = await poseModel.detectForVideo(video, ts);
          const handResult = await handModel.detectForVideo(video, ts);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawAllLandmarks(drawingUtils, poseResult, handResult,
            PoseLandmarker.POSE_CONNECTIONS, HandLandmarker.HAND_CONNECTIONS);
          allFrames.push(extractFeatures(poseResult, handResult));
          setStatusText(`extracting ${allFrames.length} frames…`);
        }
        requestAnimationFrame(loop);
      };
      loop();
    });
    return allFrames;
  };

  // ── Single gesture ──────────────────────────────────────────────────────
  const runSingle = async () => {
    setStatus('processing'); setResult(null); setTimeline([]); setLivePred(null);
    setStatusText('extracting frames…');
    const allFrames = await extractAllFrames();
    const last = allFrames[allFrames.length - 1] ?? new Array(225).fill(0);
    while (allFrames.length < FRAMES) allFrames.push([...last]);
    try {
      setStatusText('predicting…');
      const res = await fetch(`${API_BASE_URL}/ml/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: computeDelta(allFrames.slice(0, FRAMES)) }),
      });
      setResult(await res.json());
      setStatus('done'); setStatusText('done');
    } catch (e) { console.error(e); setStatus('error'); setStatusText('error'); }
  };

  // ── Sliding window ──────────────────────────────────────────────────────
  const runSliding = async () => {
    setStatus('processing'); setResult(null); setTimeline([]); setLivePred(null);
    setStatusText('extracting frames…');
    const allFrames = await extractAllFrames();
    if (allFrames.length < FRAMES) { setStatus('error'); setStatusText('too short'); return; }

    const windows = [];
    for (let s = 0; s + FRAMES <= allFrames.length; s += STEP) {
      windows.push({ startFrame: s, endFrame: s + FRAMES - 1, features: computeDelta(allFrames.slice(s, s + FRAMES)) });
    }
    try {
      setStatusText(`predicting ${windows.length} windows…`);
      const res = await fetch(`${API_BASE_URL}/ml/predict_batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ windows: windows.map(w => w.features) }),
      });
      const data = await res.json();
      const rawPreds = data.predictions.map((p, i) => ({ ...p, startFrame: windows[i].startFrame, endFrame: windows[i].endFrame }));
      setTimeline(groupPredictions(rawPreds));
      setStatus('done'); setStatusText('done');
    } catch (e) { console.error(e); setStatus('error'); setStatusText('error'); }
  };

  // ── Playback (live, like WebcamAnalyzer) ────────────────────────────────
  const stopPlayback = () => {
    cancelAnimationFrame(rafRef.current);
    const video = videoRef.current;
    if (video) video.pause();
    frameBuffer.current  = [];
    predHistory.current  = [];
    isPredicting.current = false;
    setStatus('idle'); setStatusText('idle'); setLivePred(null);
  };

  const runPlayback = async () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx          = canvas.getContext('2d');
    const drawingUtils = new DrawingUtils(ctx);
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;

    frameBuffer.current  = [];
    predHistory.current  = [];
    isPredicting.current = false;

    setStatus('playback'); setStatusText('playing…');
    setResult(null); setTimeline([]); setLivePred(null);

    video.currentTime = 0;
    await new Promise(r => { video.onseeked = r; });
    video.play();

    const sendPredict = async (features) => {
      isPredicting.current = true;
      try {
        const res  = await fetch(`${API_BASE_URL}/ml/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ features }),
        });
        const data = await res.json();
        if (data.confidence > 0.6) {
          predHistory.current.push({ label: data.label, confidence: data.confidence });
          if (predHistory.current.length > 5) predHistory.current.shift();
          const scores = {};
          predHistory.current.forEach(({ label, confidence }) => {
            scores[label] = (scores[label] || 0) + confidence;
          });
          const best      = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
          const matchCount = predHistory.current.filter(p => p.label === best).length;
          setLivePred({ label: best, confidence: scores[best] / matchCount });
        }
      } catch (e) { console.error(e); }
      finally { isPredicting.current = false; }
    };

    let lastTime = -1;
    const loop = async () => {
      if (video.ended || video.paused) {
        setStatus('done'); setStatusText('done');
        return;
      }
      if (video.currentTime !== lastTime) {
        lastTime = video.currentTime;
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

  useEffect(() => () => { cancelAnimationFrame(rafRef.current); }, []);

  const runInference = () => {
    if (mode === 'sliding')  return runSliding();
    if (mode === 'playback') return runPlayback();
    return runSingle();
  };
  useImperativeHandle(ref, () => ({ run: runInference }));

  const sortedScores = result?.all_scores
    ? Object.entries(result.all_scores).sort((a, b) => b[1] - a[1])
    : [];
  const topScore = sortedScores[0]?.[1] ?? 1;
  const totalFrames = timeline.length ? timeline[timeline.length - 1].endFrame + 1 : 1;

  return (
    <div className="vic">
      <div className="vic__header">
        <p className="vic__filename">{file.name}</p>
        <span className={`vic__status vic__status--${status}`}>{statusText}</span>
        {status === 'playback'
          ? <button className="vic__stop-btn" onClick={stopPlayback}>{t('vib_stop')}</button>
          : <button className="vic__run-btn" onClick={runInference} disabled={status === 'processing'}>
              {status === 'processing' ? '…' : t('vib_run')}
            </button>
        }
        <button className="vic__remove-btn" onClick={onRemove} disabled={status === 'processing' || status === 'playback'} title="Remove">×</button>
      </div>

      <div className="vic__video-wrap">
        <video ref={videoRef} src={videoSrc} muted className="vic__video" />
        <canvas ref={canvasRef} className="vic__canvas" />
        {livePred && (
          <div className={`vic__prediction vic__prediction--${confMod(livePred.confidence)}`}>
            {livePred.label.toUpperCase()}
            <span className="vic__prediction__conf">{(livePred.confidence * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>

      {status === 'error' && <p className="vic__error">{t('vib_server_error')}</p>}

      {status === 'done' && result && (
        <div>
          <p className="vic__top-label">
            <span style={{ color: labelColor(result.label) }}>{result.label.toUpperCase()}</span>
            {' — '}
            <span className={`vic__conf vic__conf--${confMod(result.confidence)}`}>
              {(result.confidence * 100).toFixed(1)}%
            </span>
          </p>
          <div className="vic__scores">
            {sortedScores.map(([label, score]) => (
              <div key={label} className="vic__score-row">
                <span className={`vic__score-name${label === result.label ? ' vic__score-name--top' : ''}`}>{label}</span>
                <div className="vic__score-track">
                  <div
                    className={`vic__score-fill${label === result.label ? ' vic__score-fill--top' : ''}`}
                    style={{ width: `${(score / topScore) * 100}%`, background: label === result.label ? labelColor(label) : undefined }}
                  />
                </div>
                <span className="vic__score-pct">{(score * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === 'done' && timeline.length > 0 && (
        <div>
          <p className="vic__timeline-meta">
            {t(timeline.length > 1 ? 'vib_timeline_meta_plural' : 'vib_timeline_meta', { count: timeline.length, step: STEP })}
          </p>
          <div className="vic__timeline-bar">
            {timeline.map((seg, i) => (
              <div
                key={i}
                className="vic__timeline-seg"
                title={`${seg.label} (${(seg.avgConf * 100).toFixed(0)}%) · frames ${seg.startFrame}–${seg.endFrame}`}
                style={{
                  flex: seg.endFrame - seg.startFrame + 1,
                  background: labelColor(seg.label),
                  opacity: 0.35 + seg.avgConf * 0.65,
                  borderRight: i < timeline.length - 1 ? '1px solid var(--color-surface)' : 'none',
                }}
              />
            ))}
          </div>
          <div className="vic__segments">
            {timeline.map((seg, i) => (
              <div key={i} className="vic__segment">
                <div className="vic__seg-dot" style={{ background: labelColor(seg.label) }} />
                <span className="vic__seg-name" style={{ color: labelColor(seg.label) }}>{seg.label}</span>
                <span className="vic__seg-frames">{t('vib_seg_frames', { start: seg.startFrame, end: seg.endFrame })}</span>
                <span className={`vic__seg-conf vic__seg-conf--${confMod(seg.avgConf)}`}>
                  {(seg.avgConf * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Parent ────────────────────────────────────────────────────────────────

const VideoInferenceBlock = ({ poseModel, handModel }) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [runningAll, setRunningAll] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState('single');
  const itemRefs = useRef([]);

  const addFiles = (incoming) => {
    const next = [...files];
    const names = new Set(files.map(f => f.name));
    for (const f of incoming) {
      if (f.type.startsWith('video/') && !names.has(f.name)) { next.push(f); names.add(f.name); }
    }
    itemRefs.current = new Array(next.length).fill(null);
    setFiles(next);
  };

  const removeFile = (idx) => {
    const next = files.filter((_, i) => i !== idx);
    itemRefs.current = new Array(next.length).fill(null);
    setFiles(next);
  };

  const runAll = async () => {
    setRunningAll(true);
    for (const r of itemRefs.current) { if (r) await r.run(); }
    setRunningAll(false);
  };

  return (
    <div className="vib">
      
      <div className="vib__mode-toggle">
        {[['single', t('vib_mode_single')], ['sliding', t('vib_mode_sliding')], ['playback', t('vib_mode_playback')]].map(([val, label]) => (
          <button
            key={val}
            className={`vib__mode-btn${mode === val ? ' vib__mode-btn--active' : ''}`}
            onClick={() => setMode(val)}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === 'sliding' && (
        <p className="vib__mode-hint">{t('vib_hint_sliding', { frames: FRAMES, step: STEP })}</p>
      )}
      {mode === 'playback' && (
        <p className="vib__mode-hint">{t('vib_hint_playback')}</p>
      )}

      <div
        className={`vib__dropzone${dragging ? ' vib__dropzone--dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(Array.from(e.dataTransfer.files)); }}
      >
        <p className="vib__dropzone-hint">{t('vib_dropzone_hint')}</p>
        <label className="vib__add-btn">
          <IconPlus /> {t('vib_add_videos')}
          <input type="file" accept="video/*" multiple onChange={(e) => addFiles(Array.from(e.target.files))} style={{ display: 'none' }} />
        </label>
      </div>

      {files.length > 0 && (
        <div className="vib__actions">
          <button className="vib__run-all-btn" onClick={runAll} disabled={runningAll}>
            {runningAll ? t('vib_running') : t('vib_run_all', { count: files.length })}
          </button>
          <button className="vib__clear-btn" onClick={() => { setFiles([]); itemRefs.current = []; }} disabled={runningAll}>
            {t('vib_clear_all')}
          </button>
          <span className="vib__count">{t(files.length > 1 ? 'vib_count_plural' : 'vib_count', { count: files.length })}</span>
        </div>
      )}

      <div className="vib__card-list">
        {files.map((file, i) => (
          <SingleVideoItem
            key={`${file.name}-${i}`}
            ref={el => { itemRefs.current[i] = el; }}
            file={file}
            poseModel={poseModel}
            handModel={handModel}
            onRemove={() => removeFile(i)}
            mode={mode}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoInferenceBlock;
