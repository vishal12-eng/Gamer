import React from 'react';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center h-8 w-14 rounded-full bg-gray-300 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-black"
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`${
          theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
        } inline-flex items-center justify-center w-6 h-6 transform bg-white rounded-full transition-transform duration-300 ease-in-out`}
      >
        {theme === 'dark' ? (
          <MoonIcon className="w-5 h-5 text-gray-700 translate-y-[1px]" />
        ) : (
          <SunIcon className="w-5 h-5 text-yellow-500" />
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;
