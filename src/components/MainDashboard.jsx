import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageBlock from './ImageBlock';
import WebcamAnalyzer from './WebcamAnalyzer';
import VideoUploadBlock from './VideoUploadBlock';
import { downloadCSVDataset } from '../utils/csv_manager';
import { downloadJSONDataset } from '../utils/json_manager';

const MainDashboard = ({ models }) => {
  const [tab, setTab] = useState('image');
  const [imageDataset, setImageDataset] = useState([]);
  const [videoDataset, setVideoDataset] = useState([]);
  const navigate = useNavigate();

  return (
    <>
      <nav style={{ 
        marginBottom: '20px', 
        padding: '10px', 
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <button onClick={() => setTab('image')}>🖼️ Image Mode</button>
        <button onClick={() => setTab('webcam')}>🎥 Webcam Mode</button>
        <button onClick={() => setTab('videoData')}>🎬 Video Data</button>
        
        {/* Нова кнопка переходу до бібліотеки жестів */}
        <button 
          onClick={() => navigate('/gestures')} 
          style={{ background: '#e0e0e0', fontWeight: '500' }}
        >
          📖 Gesture Library
        </button>

        <button 
          onClick={() => navigate('/profile')} 
          style={{ marginLeft: 'auto', fontWeight: 'bold' }}
        >
          👤 My Profile
        </button>
      </nav>

      <section id="demos">
        {tab === 'image' && (
          <div className="image-mode">
            <h1>Image Detection</h1>
            <div className="upload-grid">
              <ImageBlock 
                poseModel={models.image.pose} 
                handModel={models.image.hand} 
                onAddRecord={(r) => setImageDataset(prev => [...prev, r])} 
              />
            </div>
            <button onClick={() => downloadCSVDataset(imageDataset)}>💾 Download CSV</button>
          </div>
        )}

        {tab === 'webcam' && (
          <div className="webcam-mode">
            <h1>Live testing</h1>
            <WebcamAnalyzer poseModel={models.video.pose} handModel={models.video.hand} />
          </div>
        )}

        {tab === 'videoData' && (
          <div className="video-data-mode">
            <h1>Extract Sequences</h1>
            <VideoUploadBlock 
              poseModel={models.video.pose} 
              handModel={models.video.hand} 
              onAddSequence={(s) => setVideoDataset(prev => [...prev, s])} 
            />
            <button onClick={() => downloadJSONDataset(videoDataset)}>💾 Download JSON</button>
          </div>
        )}
      </section>
    </>
  );
};

export default MainDashboard;