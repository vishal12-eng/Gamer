import React, { useState, useEffect, useRef } from 'react';

interface AAdsSidebarProps {
  className?: string;
  topOffset?: number;
}

const AAdsSidebar: React.FC<AAdsSidebarProps> = ({
  className = '',
  topOffset = 100
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);
  const [canClose, setCanClose] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const adUnitId = import.meta.env.VITE_AADS_AD_UNIT_ID || '';

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (footer && stickyRef.current) {
        const footerRect = footer.getBoundingClientRect();
        const stickyRect = stickyRef.current.getBoundingClientRect();
        const buffer = 50;
        setIsNearFooter(footerRect.top <= stickyRect.bottom + buffer);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClose = () => {
    setCanClose(false);
  };

  const isDarkMode = typeof document !== 'undefined' && 
    document.documentElement.classList.contains('dark');

  if (!isDesktop || !canClose || !adUnitId) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={className}
    >
      <div
        ref={stickyRef}
        className={isNearFooter ? 'relative' : 'sticky'}
        style={{ top: isNearFooter ? 'auto' : topOffset }}
      >
        <div className="relative">
          <div
            className={`relative overflow-hidden rounded-xl ${
              isDarkMode 
                ? 'bg-gray-900/30 border border-gray-800' 
                : 'bg-white border border-gray-200'
            }`}
            style={{
              width: 300,
              height: 600
            }}
          >
            {!isLoaded && (
              <div 
                className={`absolute inset-0 animate-pulse ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                }`}
              />
            )}
            
            {isVisible && (
              <iframe
                data-aa={adUnitId}
                src={`//ad.a-ads.com/${adUnitId}?size=300x600`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  padding: 0,
                  overflow: 'hidden',
                  backgroundColor: 'transparent'
                }}
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                title="Sidebar Advertisement"
                sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
              />
            )}
            
            <div 
              className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-medium z-10 ${
                isDarkMode 
                  ? 'bg-gray-800/80 text-gray-500' 
                  : 'bg-gray-200/80 text-gray-500'
              }`}
            >
              Ad
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors z-30 ${
              isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
            }`}
            aria-label="Close ad"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default AAdsSidebar;
