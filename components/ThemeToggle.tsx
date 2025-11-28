import React from 'react';
import { useTheme } from '../hooks/useTheme';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center h-8 w-14 rounded-full bg-gray-300 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-black"
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`${
          theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
        } inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-300 ease-in-out flex items-center justify-center`}
      >
        {theme === 'dark' ? (
          <MoonIcon className="h-4 w-4 text-gray-700" />
        ) : (
          <SunIcon className="h-4 w-4 text-yellow-500" />
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;
