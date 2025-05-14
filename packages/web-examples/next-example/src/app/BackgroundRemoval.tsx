'use client';

import {
  Config,
  preload,
  removeBackground
} from '@imgly/background-removal';
import { useEffect, useRef, useState } from 'react';

const BackgroundRemoval = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [resultUrl, setResultUrl] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState('0');
  const [startDate, setStartDate] = useState(Date.now());
  const [caption, setCaption] = useState('等待上传图片');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  // 检测移动端
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // AdSense
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (window.adsbygoogle === undefined) {
          window.adsbygoogle = [];
        }
        // 根据是否为移动端决定推送多少个广告, 目前pc跟移动端都一样，都是两个广告
        if (isMobile) {
          window.adsbygoogle.push({});
          window.adsbygoogle.push({});
          window.adsbygoogle.push({});
        } else {
          window.adsbygoogle.push({});
          window.adsbygoogle.push({});
          window.adsbygoogle.push({});
          window.adsbygoogle.push({});
          window.adsbygoogle.push({});
        }
      } catch (err) {
        console.log('AdSense error:', err);
      }
    }
  }, [isMobile]);


  const config: Config = {
    debug: false,
    progress: (key, current, total) => {
      const progress = Math.floor((current / total) * 100);
      setCaption(`处理中 ${progress}%`);
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
        console.log('模型预加载成功');
      } catch (error) {
        console.error('模型预加载失败:', error);
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
      setCaption('准备开始处理');
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;

    setIsRunning(true);
    resetTimer();
    setCaption('正在处理...');

    try {
      const imageBlob = await removeBackground(selectedFile, config);
      const url = URL.createObjectURL(imageBlob);
      setResultUrl(url);
      setCaption('处理完成');
    } catch (error) {
      console.error('处理失败:', error);
      setCaption('处理失败，请重试');
    } finally {
      setIsRunning(false);
      stopTimer();
    }
  };

  return (
    <div className="app">

      {/* 左侧广告位 - 仅PC端显示 */}
      {!isMobile && (
        <div className="side-ad left-ad">
          <ins className="adsbygoogle"
               style={{
                 display: 'inline-block',
                 width: '120px',
                 height: '600px',
                 textAlign: 'center'
               }}
               data-ad-client="ca-pub-6001362307342407"
               data-ad-slot="7658691644">
          </ins>
        </div>
      )}

      <div className="container">
        <h1 className="title">智能图片背景移除</h1>
        <p className="description">快速、准确地移除图片背景，支持拖拽上传</p>

        {/* 由于会被别的页面iframe，那么我们这里就控制一下高度吧 bg-is-index-0  - 仅PC端显示 */}
        {!isMobile && (
            <div className="mt-2 rounded-lg border-gray-200 overflow-hidden ad-container ad-container-top">
              <ins className="adsbygoogle"
                   style={{
                     display: 'inline-block',
                     width: '100%',
                     height: '90px',
                     textAlign: 'left'
                   }}
                   data-ad-client="ca-pub-6001362307342407"
                   data-ad-slot="7658691644" >
              </ins>
            </div>
        )}

        <div className="card">
          <div
            className="drop-zone"
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) {
                // 创建一个新的 FileList 对象
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);

                // 创建一个合法的 ChangeEvent
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
            <p className="upload-text">拖拽图片到此处</p>
            <p className="upload-hint">或点击选择文件</p>
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
                <img src={previewUrl} alt="预览图" className="preview-image" />
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
                  {isRunning ? '处理中...' : '去除背景'}
                </button>
              </div>
            </div>
          )}

          {resultUrl && (
            <div className="result-area">
              <div className="image-container">
                <img src={resultUrl} alt="处理结果" className="result-image" />
              </div>
              <div className="action-bar">
                <a
                  href={resultUrl}
                  download={`removed-bg-${selectedFile?.name || 'image'}.png`}
                  className="action-button download"
                >
                  下载图片
                </a>
              </div>
            </div>
          )}

          {/* 由于会被别的页面iframe，那么我们这里就控制一下高度吧 bg-is-index-1  - 仅PC端显示 */}
          {!isMobile && (
              <div className="mt-2 rounded-lg border-gray-200 overflow-hidden ad-container ad-container-bottom">
                <ins className="adsbygoogle"
                     style={{
                       display: 'inline-block',
                       width: '100%',
                       height: '90px',
                       textAlign: 'left'
                     }}
                     data-ad-client="ca-pub-6001362307342407"
                     data-ad-slot="7658691644" >
                </ins>
              </div>
          )}

        </div>
      </div>

      {/* 右侧广告位 - 仅PC端显示 */}
      {!isMobile && (
        <div className="side-ad right-ad">
          <ins className="adsbygoogle"
               style={{
                 display: 'inline-block',
                 width: '120px',
                 height: '600px',
                 textAlign: 'center'
               }}
               data-ad-client="ca-pub-6001362307342407"
               data-ad-slot="7658691644">
          </ins>
        </div>
      )}

      <style jsx>{`
        .app {
          min-height: 100vh;
          width: 100%;
          background-color: #f8fafc;
          display: flex;
          align-items: flex-start;  /* 改为顶部对齐 */
          justify-content: center;
          padding: 40px 0;  /* 添加上下内边距 */
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
          margin-bottom: 40px;  /* 添加底部间距 */
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

        .upload-icon {
          color: #94a3b8;
          margin-bottom: clamp(12px, 3vw, 20px);
          width: clamp(32px, 8vw, 48px);
          height: auto;
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

        .action-button {
          padding: clamp(10px, 2.5vw, 12px) clamp(20px, 5vw, 24px);
          font-size: clamp(14px, 3.5vw, 16px);
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

        .file-input {
          display: none;
        }
    
        .result-area {
          margin-top: 24px;
        }
    
        .image-container {
          position: relative;
          width: 100%;
          min-height: 200px;
          border-radius: 8px;
          overflow: hidden;
          background: #f1f5f9;
        }
    
        .preview-image,
        .result-image {
          width: 100%;
          height: auto;
          display: block;
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
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          background-color: #3b82f6;
          color: white;
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

        /* 广告容器样式 */
        .ad-container {
          background-color: #f0f9ff;
          border: 1px solid #bae6fd;
          padding: 4px;
          margin: 10px 0;
          min-height: 90px;
          position: relative;
        }
        
        .ad-container::before {
          content: "广告区域";
          position: absolute;
          top: 0;
          left: 0;
          background-color: #0ea5e9;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-bottom-right-radius: 4px;
          z-index: 1;
        }
        
        .ad-container-top::before {
          content: "顶部广告区域";
        }
        
        .ad-container-bottom::before {
          content: "底部广告区域";
        }

        /* 侧边广告样式 */
        .side-ad {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          width: 120px;
          height: 600px;
          background-color: #fff1f2; /* 浅粉色背景 */
          border: 1px solid #fecdd3; /* 粉色边框 */
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .left-ad {
          left: max(10px, calc(50% - 500px)); /* 距离中心内容左侧一定距离 */
        }

        .right-ad {
          right: max(10px, calc(50% - 500px)); /* 距离中心内容右侧一定距离 */
        }

        /* 为侧边广告添加标签 */
        .side-ad::before {
          content: "侧边广告";
          position: absolute;
          top: 0;
          left: 0;
          background-color: #e11d48; /* 深粉色背景 */
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-bottom-right-radius: 4px;
          z-index: 1;
        }

        .left-ad::before {
          content: "左侧广告";
        }

        .right-ad::before {
          content: "右侧广告";
        }

        /* 在小屏幕上隐藏侧边广告 */
        @media (max-width: 1200px) {
          .side-ad {
            display: none;
          }
        }

      `}</style>
    </div>
  );
};

export default BackgroundRemoval;
