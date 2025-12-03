import React from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      onClick={toggleTheme}
      className="w-16 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center cursor-pointer px-1 transition-all duration-300"
      role="button"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      }}
    >
      <div
        className={`w-6 h-6 rounded-full bg-white dark:bg-gray-900 shadow-md flex items-center justify-center transition-all duration-300 ${
          theme === "dark" ? "translate-x-8" : "translate-x-0"
        }`}
      >
        <span className="text-gray-700 dark:text-yellow-300 text-sm">
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
      </div>
    </div>
  );
};

export default ThemeToggle;
