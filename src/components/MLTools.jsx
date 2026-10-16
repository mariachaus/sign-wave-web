import React from 'react';
import { useTranslation } from 'react-i18next';

import { IconDownload } from './Icons';
import ImageBlock from './ImageBlock';
import WebcamAnalyzer from './WebcamAnalyzer';
import VideoUploadBlock from './VideoUploadBlock';
import VideoInferenceBlock from './VideoInferenceBlock';

import { downloadCSVDataset } from '../utils/csv_manager';
import { downloadJSONDataset } from '../utils/json_manager';

const MLTools = ({
  tab,
  models,
  imageDataset,
  setImageDataset,
  videoDataset,
  setVideoDataset,
}) => {
  const { t } = useTranslation();

  switch (tab) {
    case 'image':
      return (
        <div className="dashboard-content image-mode">
          <h1>{t('image_detection')}</h1>

          <ImageBlock
            poseModel={models.image.pose}
            handModel={models.image.hand}
            onAddRecord={(record) =>
              setImageDataset((prev) => [...prev, record])
            }
          />

          <button
            className="download-btn"
            onClick={() => downloadCSVDataset(imageDataset)}
          >
            <IconDownload /> {t('download_csv')}
          </button>
        </div>
      );

    case 'webcam':
      return (
        <div className="dashboard-content webcam-mode">
          <h1>{t('live_testing')}</h1>

          <WebcamAnalyzer
            poseModel={models.video.pose}
            handModel={models.video.hand}
            isMirror={
              localStorage.getItem('mirror_view') !== 'false'
            }
          />
        </div>
      );

    case 'videoData':
      return (
        <div className="dashboard-content video-data-mode">
          <h1>{t('extract_sequences')}</h1>

          <VideoUploadBlock
            poseModel={models.video.pose}
            handModel={models.video.hand}
            onAddSequence={(sequence) =>
              setVideoDataset((prev) => [...prev, sequence])
            }
          />

          
            <div className="dataset-actions">
            <button
                className="download-btn"
                onClick={() => downloadJSONDataset(videoDataset)}
                disabled={videoDataset.length === 0}
            >
                <IconDownload /> {t('download_json')}
                {videoDataset.length > 0 && ` (${videoDataset.length})`}
            </button>

            <button
                className="upload-grid__clear-btn"
                onClick={() => {
                    setVideoDataset([])
                }}
                disabled={videoDataset.length === 0}
            >
                {t('clear_json')}
            </button>
            </div>
        </div>
      );

    case 'inferenceTest':
      return (
        <div className="dashboard-content">
          <h1>Video Inference Test</h1>

          <VideoInferenceBlock
            poseModel={models.video.pose}
            handModel={models.video.hand}
          />
        </div>
      );

    default:
      return null;
  }
};

export default MLTools;
