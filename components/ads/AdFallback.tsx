import React from 'react';

interface AdFallbackProps {
  width: number;
  height: number;
  type?: 'newsletter' | 'article' | 'generic';
}

const AdFallback: React.FC<AdFallbackProps> = ({ 
  width, 
  height, 
  type = 'generic'
}) => {
  const isDarkMode = typeof document !== 'undefined' && 
    document.documentElement.classList.contains('dark');

  const isSmall = height < 100;

  if (type === 'newsletter') {
    return (
      <div
        className={`flex items-center justify-center rounded-lg overflow-hidden ${
          isDarkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-100 to-purple-100'
        }`}
        style={{ width, height }}
      >
        <div className={`text-center ${isSmall ? 'px-4' : 'p-6'}`}>
          {!isSmall && (
            <div className={`text-2xl mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Stay Updated
            </div>
          )}
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {isSmall ? 'Subscribe to our newsletter' : 'Get the latest tech news in your inbox'}
          </div>
          <button
            onClick={() => {
              const footer = document.querySelector('footer');
              if (footer) footer.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`mt-2 px-4 py-1.5 rounded-full text-sm font-medium ${
              isDarkMode 
                ? 'bg-white/20 text-white hover:bg-white/30' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } transition-colors`}
          >
            Subscribe
          </button>
        </div>
      </div>
    );
  }

  if (type === 'article') {
    return (
      <div
        className={`flex items-center justify-center rounded-lg overflow-hidden ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}
        style={{ width, height }}
      >
        <div className={`text-center ${isSmall ? 'px-4' : 'p-6'}`}>
          <div className={`text-lg font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {isSmall ? 'Explore More' : 'Explore More Articles'}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {isSmall ? 'Check trending' : 'Check out our trending stories'}
          </div>
          {!isSmall && (
            <a
              href="/"
              className={`inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-medium ${
                isDarkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } transition-colors`}
            >
              Browse Articles
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-lg ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'
      }`}
      style={{ width, height }}
    >
      <div className={`text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        <div className="text-xs">
          {isSmall ? 'Ad space' : 'Advertisement'}
        </div>
      </div>
    </div>
  );
};

export default AdFallback;
