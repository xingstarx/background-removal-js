'use client';

import {
  Config,
  preload,
  removeBackground
} from '@imgly/background-removal';
import { useEffect, useRef, useState } from 'react';

const BackgroundRemovalEn = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [resultUrl, setResultUrl] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState('0');
  const [startDate, setStartDate] = useState(Date.now());
  const [caption, setCaption] = useState('Waiting for image upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const config: Config = {
    debug: false,
    progress: (key, current, total) => {
      const progress = Math.floor((current / total) * 100);
      setCaption(`Processing ${progress}%`);
    },
    rescale: true,
    device: 'gpu',
    output: {
      quality: 0.8,
      format: 'image/png'
    }
  };

  const calculateSecondsBetweenDates = (start: number, end: number) => {
    const milliseconds = end - start;
    return (milliseconds / 1000.0).toFixed(1);
  };

  useEffect(() => {
    const preloadAssets = async () => {
      try {
        await preload(config);
        console.log('Model preload successful');
      } catch (error) {
        console.error('Model preload failed:', error);
      }
    };

    preloadAssets();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(calculateSecondsBetweenDates(startDate, Date.now()));
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startDate]);

  const resetTimer = () => {
    setIsRunning(true);
    setStartDate(Date.now());
    setSeconds('0');
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultUrl('');
      setCaption('Ready to process');
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;

    setIsRunning(true);
    resetTimer();
    setCaption('Processing...');

    try {
      const imageBlob = await removeBackground(selectedFile, config);
      const url = URL.createObjectURL(imageBlob);
      setResultUrl(url);
      setCaption('Processing complete');
    } catch (error) {
      console.error('Processing failed:', error);
      setCaption('Processing failed, please try again');
    } finally {
      setIsRunning(false);
      stopTimer();
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">AI Background Removal</h1>
        <p className="description">Quick and accurate background removal, supports drag and drop</p>
    
        <div className="card">
          <div 
            className="drop-zone"
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                const event = {
                  target: {
                    files: dataTransfer.files
                  }
                } as React.ChangeEvent<HTMLInputElement>;
                handleFileSelect(event);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="upload-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" fill="none">
                <path d="M12 15V3m0 0L8 7m4-4l4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="upload-text">Drop image here</p>
            <p className="upload-hint">or click to select file</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              ref={fileInputRef}
              className="file-input"
            />
          </div>
    
          {previewUrl && (
            <div className="result-area">
              <div className="image-container">
                <img src={previewUrl} alt="Preview" className="preview-image" />
                {isRunning && (
                  <div className="processing-overlay">
                    <div className="spinner"></div>
                    <p className="processing-text">{caption}</p>
                    <p className="processing-time">{seconds}s</p>
                  </div>
                )}
              </div>
              <div className="action-bar">
                <button 
                  disabled={isRunning} 
                  onClick={handleRemoveBackground}
                  className="action-button"
                >
                  {isRunning ? 'Processing...' : 'Remove Background'}
                </button>
              </div>
            </div>
          )}
    
          {resultUrl && (
            <div className="result-area">
              <div className="image-container">
                <img src={resultUrl} alt="Result" className="result-image" />
              </div>
              <div className="action-bar">
                <a 
                  href={resultUrl} 
                  download={`removed-bg-${selectedFile?.name || 'image'}.png`}
                  className="action-button download"
                >
                  Download Image
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    
      <style jsx>{`
        .app {
          min-height: 100vh;
          width: 100%;
          background-color: #f8fafc;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 40px 0;
          box-sizing: border-box;
        }

        .container {
          width: 100%;
          max-width: 800px;
          padding: 0 20px;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .title {
          font-size: clamp(24px, 5vw, 32px);
          font-weight: 600;
          color: #1e293b;
          text-align: center;
          margin-bottom: 12px;
        }

        .description {
          text-align: center;
          color: #64748b;
          font-size: clamp(14px, 4vw, 16px);
          margin-bottom: clamp(24px, 5vw, 40px);
        }

        .card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          padding: clamp(16px, 4vw, 32px);
          width: 100%;
          margin-bottom: 40px;
        }

        .drop-zone {
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          padding: clamp(24px, 6vw, 48px) clamp(16px, 4vw, 32px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .drop-zone:hover {
          border-color: #94a3b8;
          background-color: #f8fafc;
        }

        .upload-icon {
          color: #94a3b8;
          margin-bottom: clamp(12px, 3vw, 20px);
        }

        .upload-text {
          font-size: clamp(16px, 4vw, 18px);
          color: #334155;
          margin-bottom: 8px;
          text-align: center;
        }

        .upload-hint {
          font-size: clamp(12px, 3.5vw, 14px);
          color: #64748b;
          text-align: center;
        }

        .file-input {
          display: none;
        }

        .result-area {
          margin-top: clamp(16px, 4vw, 24px);
        }

        .image-container {
          position: relative;
          width: 100%;
          min-height: 200px;
          border-radius: 8px;
          overflow: hidden;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-image,
        .result-image {
          max-width: 100%;
          max-height: 60vh;
          width: auto;
          height: auto;
          object-fit: contain;
        }

        .processing-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255,255,255,0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .processing-text {
          margin-top: 16px;
          color: #334155;
          font-size: 16px;
        }

        .processing-time {
          margin-top: 8px;
          color: #64748b;
          font-size: 14px;
        }

        .action-bar {
          margin-top: 16px;
          display: flex;
          justify-content: center;
        }

        .action-button {
          padding: clamp(10px, 2.5vw, 12px) clamp(20px, 5vw, 24px);
          font-size: clamp(14px, 3.5vw, 16px);
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .action-button:hover {
          background-color: #2563eb;
        }

        .action-button:disabled {
          background-color: #e2e8f0;
          cursor: not-allowed;
        }

        .action-button.download {
          background-color: #10b981;
        }

        .action-button.download:hover {
          background-color: #059669;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .container {
            padding: 0 12px;
          }

          .card {
            border-radius: 12px;
          }

          .drop-zone {
            border-radius: 8px;
          }

          .preview-image,
          .result-image {
            max-height: 50vh;
          }
        }
      `}</style>
    </div>
  );
};

export default BackgroundRemovalEn;