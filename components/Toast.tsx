import React, { useEffect, useState } from 'react';
import SparklesIcon from './icons/SparklesIcon';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setProgress(100);
      
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.max(0, prev - 100 / 27));
      }, 100);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 400);
      }, 2700);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [message, onClose]);

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
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 400);
            }}
            className="ml-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
