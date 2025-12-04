import React from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleToggle = () => {
    const newTheme = isDark ? 'light' : 'dark';
    console.log('[ThemeToggle] Toggling from', theme, 'to', newTheme);
    toggleTheme();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      onMouseDown={(e) => {
        e.stopPropagation();
        console.log('[ThemeToggle] Mouse down detected');
      }}
      onTouchStart={() => {
        console.log('[ThemeToggle] Touch start detected');
      }}
      style={{
        position: 'relative',
        zIndex: 99999,
        width: '60px',
        height: '32px',
        borderRadius: '9999px',
        cursor: 'pointer',
        backgroundColor: isDark ? '#374151' : '#3b82f6',
        border: '3px solid',
        borderColor: isDark ? '#9ca3af' : '#2563eb',
        padding: '0',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.3s ease',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span
        style={{
          position: 'absolute',
          top: '3px',
          left: isDark ? '30px' : '3px',
          width: '22px',
          height: '22px',
          borderRadius: '9999px',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'left 0.3s ease',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          pointerEvents: 'none',
        }}
      >
        {isDark ? (
          <svg style={{ width: '14px', height: '14px', color: '#6366f1' }} fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          <svg style={{ width: '14px', height: '14px', color: '#f59e0b' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;
