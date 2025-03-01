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

  const config: Config = {
    debug: false,
    progress: (key, current, total) => {
      const [type, subtype] = key.split(':');
      setCaption(`${type} ${subtype} ${((current / total) * 100).toFixed(0)}%`);
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
      setCaption('图片已上传，点击按钮开始处理');
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;

    setIsRunning(true);
    resetTimer();

    try {
      const imageBlob = await removeBackground(selectedFile, config);
      const url = URL.createObjectURL(imageBlob);
      setResultUrl(url);
      setCaption('处理完成');
    } catch (error) {
      console.error('处理失败:', error);
      setCaption('处理失败');
    } finally {
      setIsRunning(false);
      stopTimer();
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        ref={fileInputRef}
      />
      
      {previewUrl && (
        <div>
          <img src={previewUrl} alt="预览图" />
          <p>{caption}</p>
          <p>处理时间: {seconds}s</p>
          <button 
            disabled={isRunning} 
            onClick={handleRemoveBackground}
          >
            {isRunning ? '处理中...' : '去除背景'}
          </button>
        </div>
      )}

      {resultUrl && (
        <div>
          <img src={resultUrl} alt="处理结果" />
          <a 
            href={resultUrl} 
            download={`removed-bg-${selectedFile?.name || 'image'}.png`}
          >
            下载图片
          </a>
        </div>
      )}
    </div>
  );
};

export default BackgroundRemoval;
