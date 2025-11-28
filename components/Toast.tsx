
import React, { useEffect, useState } from 'react';
import SparklesIcon from './icons/SparklesIcon';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Wait for fade-out animation to complete before fully closing
        setTimeout(onClose, 300); 
      }, 2700); // 2.7s visible, 0.3s fade out

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg border border-white/20 transition-all duration-300 ease-in-out z-[100] flex items-center gap-3
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      role="alert"
      aria-live="assertive"
    >
      <SparklesIcon className="w-5 h-5 text-cyan-400" />
      <span>{message}</span>
    </div>
  );
};

export default Toast;
