import React from 'react';
import SmartAd, { BannerItem } from './SmartAd';
import { useCuelinks } from './CuelinksProvider';

interface FeedAdProps {
  bannerList?: BannerItem[];
  className?: string;
}

const FeedAd: React.FC<FeedAdProps> = ({
  bannerList,
  className = ''
}) => {
  const { hasError } = useCuelinks();
  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  return (
    <div className={`col-span-1 md:col-span-2 lg:col-span-3 ${className}`}>
      <div 
        className={`
          relative overflow-hidden rounded-2xl p-6
          ${isDarkMode 
            ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-gray-800' 
            : 'bg-gradient-to-r from-gray-50 via-white to-gray-50 border border-gray-200'
          }
        `}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500" />
        
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="flex-shrink-0 lg:w-1/3">
            <p className={`text-xs uppercase tracking-wider mb-2 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
              {hasError ? 'Featured Products' : 'Featured Partner'}
            </p>
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Discover Amazing Deals
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Explore curated products from our trusted partners
            </p>
          </div>
          
          <div className="flex-grow w-full lg:w-2/3">
            <SmartAd
              variant="horizontal"
              width="100%"
              height={200}
              bannerList={bannerList}
              showTitle={true}
              animationSpeed={4000}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedAd;
