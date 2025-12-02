import React, { useEffect, useState, useRef, useCallback } from 'react';
import SparklesIcon from './icons/SparklesIcon';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const duration = 2700;

  const updateProgress = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }
    
    const elapsed = timestamp - startTimeRef.current;
    const newProgress = Math.max(0, 100 - (elapsed / duration) * 100);
    
    setProgress(newProgress);
    
    if (elapsed < duration) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    } else {
      setIsVisible(false);
      setTimeout(onClose, 400);
    }
  }, [onClose, duration]);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setProgress(100);
      startTimeRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(updateProgress);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [message, updateProgress]);

  const handleClose = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsVisible(false);
    setTimeout(onClose, 400);
  };

  if (!message) return null;

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-400 ease-out
        ${isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-4 scale-95'
        }
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className="relative glass rounded-2xl shadow-glass-lg overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4">
          <div className="relative">
            <SparklesIcon className="w-5 h-5 text-cyan-400" />
            <div className="absolute inset-0 bg-cyan-400/30 blur-md"></div>
          </div>
          <span className="text-white font-medium">{message}</span>
          <button 
            onClick={handleClose}
            className="ml-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
