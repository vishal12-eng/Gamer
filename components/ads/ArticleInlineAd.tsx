import React from 'react';
import HilltopAd, { BannerItem } from './HilltopAd';
import { useHilltopAds } from './HilltopAdsProvider';

interface ArticleInlineAdProps {
  bannerList?: BannerItem[];
  className?: string;
}

const ArticleInlineAd: React.FC<ArticleInlineAdProps> = ({
  bannerList,
  className = ''
}) => {
  const { hasError } = useHilltopAds();
  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  return (
    <div className={`my-8 ${className}`}>
      <div 
        className={`
          p-4 rounded-2xl
          ${isDarkMode 
            ? 'bg-gray-900/50 border border-gray-800' 
            : 'bg-gray-50 border border-gray-200'
          }
        `}
      >
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {hasError ? 'Featured Products' : 'Sponsored Content'}
          </span>
        </div>
        <HilltopAd
          variant="horizontal"
          width="100%"
          height={250}
          bannerList={bannerList}
          showTitle={true}
          animationSpeed={5000}
        />
      </div>
    </div>
  );
};

export default ArticleInlineAd;
