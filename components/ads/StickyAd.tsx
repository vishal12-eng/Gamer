import React, { useState, useEffect, useRef } from 'react';
import HilltopAd, { BannerItem } from './HilltopAd';

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
  const [isNearFooter, setIsNearFooter] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (footer && stickyRef.current) {
        const footerRect = footer.getBoundingClientRect();
        const stickyRect = stickyRef.current.getBoundingClientRect();
        const buffer = 50;
        
        if (footerRect.top <= stickyRect.bottom + buffer) {
          setIsNearFooter(true);
        } else {
          setIsNearFooter(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isMobile || !isVisible) return null;

  return (
    <div 
      ref={stickyRef}
      className={`${isNearFooter ? 'relative' : 'sticky'} ${className}`}
      style={{ top: isNearFooter ? 'auto' : topOffset }}
    >
      <div className="relative">
        <HilltopAd
          variant="vertical"
          width={300}
          height={600}
          bannerList={bannerList}
          showTitle={true}
          animationSpeed={6000}
          hilltopAdId="hilltop-sticky-ad"
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
