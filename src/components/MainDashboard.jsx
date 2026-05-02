import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ImageBlock from './ImageBlock';
import WebcamAnalyzer from './WebcamAnalyzer';
import VideoUploadBlock from './VideoUploadBlock';
import { downloadCSVDataset } from '../utils/csv_manager';
import { downloadJSONDataset } from '../utils/json_manager';
import '../styles/pages/MainDashboard.scss';

const MainDashboard = ({ models }) => {
  const [tab, setTab] = useState('image');
  const [imageDataset, setImageDataset] = useState([]);
  const [videoDataset, setVideoDataset] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <nav className="main-nav">
        <button
          className={`nav-tab ${tab === 'image' ? 'active' : ''}`}
          onClick={() => setTab('image')}
        >
          🖼️ {t('tab_image')}
        </button>
        <button
          className={`nav-tab ${tab === 'webcam' ? 'active' : ''}`}
          onClick={() => setTab('webcam')}
        >
          🎥 {t('tab_webcam')}
        </button>
        <button
          className={`nav-tab ${tab === 'videoData' ? 'active' : ''}`}
          onClick={() => setTab('videoData')}
        >
          🎬 {t('tab_video_data')}
        </button>
        <button
          className="nav-tab"
          onClick={() => navigate('/gestures')}
        >
          📖 {t('library_of_gestures')}
        </button>

        <button
          className="nav-profile-btn"
          onClick={() => navigate('/profile')}
        >
          👤 {t('my_profile')}
        </button>
      </nav>

      <section id="demos">
        {tab === 'image' && (
          <div className="dashboard-content image-mode">
            <h1>{t('image_detection')}</h1>
            <div className="upload-grid">
              <ImageBlock
                poseModel={models.image.pose}
                handModel={models.image.hand}
                onAddRecord={(r) => setImageDataset(prev => [...prev, r])}
              />
            </div>
            <button className="download-btn" onClick={() => downloadCSVDataset(imageDataset)}>
              💾 {t('download_csv')}
            </button>
          </div>
        )}

        {tab === 'webcam' && (
          <div className="dashboard-content webcam-mode">
            <h1>{t('live_testing')}</h1>
            <WebcamAnalyzer poseModel={models.video.pose} handModel={models.video.hand} />
          </div>
        )}

        {tab === 'videoData' && (
          <div className="dashboard-content video-data-mode">
            <h1>{t('extract_sequences')}</h1>
            <VideoUploadBlock
              poseModel={models.video.pose}
              handModel={models.video.hand}
              onAddSequence={(s) => setVideoDataset(prev => [...prev, s])}
            />
            <button className="download-btn" onClick={() => downloadJSONDataset(videoDataset)}>
              💾 {t('download_json')}
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default MainDashboard;
