import React, { useState, useEffect } from 'react';
import SmartAd, { BannerItem } from './SmartAd';

interface StickyAdProps {
  bannerList?: BannerItem[];
  className?: string;
  topOffset?: number;
}

const StickyAd: React.FC<StickyAdProps> = ({
  bannerList,
  className = '',
  topOffset = 100
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile || !isVisible) return null;

  return (
    <div 
      className={`sticky ${className}`}
      style={{ top: topOffset }}
    >
      <div className="relative">
        <SmartAd
          variant="vertical"
          width={300}
          height={600}
          bannerList={bannerList}
          showTitle={true}
          animationSpeed={6000}
        />
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center text-sm transition-colors z-30"
          aria-label="Close ad"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default StickyAd;
