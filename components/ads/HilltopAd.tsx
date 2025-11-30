import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useHilltopAds } from './HilltopAdsProvider';

export interface BannerItem {
  id: string;
  imageUrl: string;
  altText: string;
  link: string;
  title?: string;
}

export interface HilltopAdProps {
  width?: string | number;
  height?: string | number;
  variant?: 'square' | 'horizontal' | 'vertical';
  showTitle?: boolean;
  animationSpeed?: number;
  bannerList?: BannerItem[];
  className?: string;
  lazyLoad?: boolean;
  hilltopAdId?: string;
}

const defaultBanners: BannerItem[] = [
  {
    id: 'banner-1',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    altText: 'Premium Headphones',
    link: 'https://www.amazon.com/dp/B09XS7JWHH',
    title: 'Premium Audio Gear'
  },
  {
    id: 'banner-2',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    altText: 'Smart Watch',
    link: 'https://www.amazon.com/dp/B0BDHX4Z7W',
    title: 'Latest Smartwatches'
  },
  {
    id: 'banner-3',
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
    altText: 'Camera Equipment',
    link: 'https://www.amazon.com/dp/B09V3KXJPB',
    title: 'Photography Essentials'
  },
  {
    id: 'banner-4',
    imageUrl: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80',
    altText: 'Laptop',
    link: 'https://www.amazon.com/dp/B0BS4BP8FB',
    title: 'Tech Gadgets'
  },
  {
    id: 'banner-5',
    imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
    altText: 'Gaming Headset',
    link: 'https://www.amazon.com/dp/B0BY7P31V2',
    title: 'Gaming Accessories'
  }
];

const variantDimensions = {
  square: { width: 300, height: 300 },
  horizontal: { width: 728, height: 90 },
  vertical: { width: 160, height: 600 }
};

const HilltopAd: React.FC<HilltopAdProps> = ({
  width,
  height,
  variant = 'horizontal',
  showTitle = false,
  animationSpeed = 5000,
  bannerList,
  className = '',
  lazyLoad = true,
  hilltopAdId
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set([0]));
  const containerRef = useRef<HTMLDivElement>(null);
  const hilltopContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { isLoaded, useFallback, zoneId, nativeEnabled } = useHilltopAds();

  const banners = bannerList || defaultBanners;
  
  const dimensions = useMemo(() => {
    if (width && height) {
      return { 
        width: typeof width === 'number' ? width : width, 
        height: typeof height === 'number' ? height : height 
      };
    }
    return variantDimensions[variant];
  }, [width, height, variant]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const preloadNextImages = useCallback((currentIdx: number) => {
    const nextIdx = (currentIdx + 1) % banners.length;
    const prevIdx = (currentIdx - 1 + banners.length) % banners.length;
    
    setImagesLoaded(prev => {
      const newSet = new Set(prev);
      newSet.add(nextIdx);
      newSet.add(prevIdx);
      return newSet;
    });
  }, [banners.length]);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const nextIndex = (currentIndex + 1) % banners.length;
    setCurrentIndex(nextIndex);
    preloadNextImages(nextIndex);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [banners.length, isTransitioning, currentIndex, preloadNextImages]);

  const goToPrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const prevIndex = (currentIndex - 1 + banners.length) % banners.length;
    setCurrentIndex(prevIndex);
    preloadNextImages(prevIndex);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [banners.length, isTransitioning, currentIndex, preloadNextImages]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    preloadNextImages(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [currentIndex, isTransitioning, preloadNextImages]);

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(goToNext, animationSpeed);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, animationSpeed, goToNext]);

  useEffect(() => {
    preloadNextImages(0);
  }, [preloadNextImages]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
  };

  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  if (!isLoaded) {
    return (
      <div
        className={`hilltop-ad-container relative overflow-hidden ${className}`}
        style={{
          width: isMobile ? '100%' : dimensions.width,
          height: isMobile ? 'auto' : dimensions.height,
          minHeight: '90px'
        }}
      >
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl w-full h-full" />
      </div>
    );
  }

  if (nativeEnabled && !useFallback && zoneId && hilltopAdId && window.hilltopads) {
    return (
      <div
        ref={hilltopContainerRef}
        id={hilltopAdId}
        className={`hilltop-ad-native relative overflow-hidden rounded-xl ${className}`}
        style={{
          width: isMobile ? '100%' : dimensions.width,
          height: isMobile ? 'auto' : dimensions.height,
          minHeight: '90px'
        }}
        data-zone-id={zoneId}
      >
        <div 
          className={`
            absolute top-2 right-2 z-20 px-2 py-0.5 rounded text-[10px] font-medium
            ${isDarkMode ? 'bg-gray-800/80 text-gray-400' : 'bg-gray-200/80 text-gray-600'}
          `}
        >
          Ad
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`hilltop-ad-container relative overflow-hidden select-none group ${className}`}
      style={{
        width: isMobile ? '100%' : dimensions.width,
        height: isMobile ? 'auto' : dimensions.height,
        aspectRatio: isMobile ? (variant === 'vertical' ? '1/2' : '16/9') : undefined,
        minHeight: isMobile ? '200px' : undefined,
        contentVisibility: 'auto',
        containIntrinsicSize: isMobile ? 'auto 200px' : `${dimensions.width}px ${dimensions.height}px`
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`
          absolute inset-0 rounded-xl overflow-hidden
          ${isDarkMode 
            ? 'shadow-[0_8px_32px_rgba(6,182,212,0.15),0_4px_16px_rgba(168,85,247,0.1)]' 
            : 'shadow-[0_8px_32px_rgba(0,0,0,0.15),0_4px_16px_rgba(0,0,0,0.1)]'
          }
          transition-shadow duration-300
          hover:shadow-[0_12px_48px_rgba(6,182,212,0.25),0_6px_24px_rgba(168,85,247,0.15)]
        `}
      >
        <div 
          className="absolute inset-0 rounded-xl"
          style={{
            background: isDarkMode
              ? 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(168,85,247,0.1) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,245,245,0.9) 100%)'
          }}
        />

        <div className="relative w-full h-full">
          {banners.map((banner, index) => (
            <a
              key={banner.id}
              href={banner.link}
              target="_blank"
              rel="noopener noreferrer sponsored"
              data-original-href={banner.link}
              className={`
                absolute inset-0 w-full h-full
                transition-all duration-500 ease-in-out
                ${index === currentIndex 
                  ? 'opacity-100 scale-100 z-10' 
                  : 'opacity-0 scale-105 z-0 pointer-events-none'
                }
              `}
              style={{
                transform: index === currentIndex 
                  ? 'scale(1) translateX(0)' 
                  : index > currentIndex 
                    ? 'scale(1.05) translateX(10%)' 
                    : 'scale(1.05) translateX(-10%)'
              }}
              aria-hidden={index !== currentIndex}
              tabIndex={index === currentIndex ? 0 : -1}
            >
              {(imagesLoaded.has(index) || index === currentIndex) && (
                <img
                  src={banner.imageUrl}
                  alt={banner.altText}
                  loading={lazyLoad && index > 0 ? 'lazy' : 'eager'}
                  decoding="async"
                  className={`
                    w-full h-full object-cover rounded-xl
                    transition-transform duration-300
                    hover:scale-105
                  `}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 
                      'https://via.placeholder.com/728x90?text=Sponsored+Content';
                  }}
                />
              )}
              
              {showTitle && banner.title && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <span className="text-white font-semibold text-sm md:text-base">
                    {banner.title}
                  </span>
                </div>
              )}
            </a>
          ))}
        </div>

        {isMobile && banners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
            {banners.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${index === currentIndex % 5 
                    ? 'bg-cyan-400 w-6' 
                    : 'bg-white/50 hover:bg-white/75'
                  }
                `}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {!isMobile && banners.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Previous banner"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Next banner"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        <div 
          className={`
            absolute top-2 right-2 z-20 px-2 py-0.5 rounded text-[10px] font-medium
            ${isDarkMode ? 'bg-gray-800/80 text-gray-400' : 'bg-gray-200/80 text-gray-600'}
          `}
        >
          Ad
        </div>
      </div>
    </div>
  );
};

export default HilltopAd;
