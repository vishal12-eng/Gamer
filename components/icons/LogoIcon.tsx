
import React from 'react';

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="logo-neon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#22D3EE' }} />
        <stop offset="100%" style={{ stopColor: '#A855F7' }} />
      </linearGradient>
      <filter id="logo-neon-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
        <feComponentTransfer in="blur" result="fadedBlur">
            <feFuncA type="linear" slope="0.7"/>
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="fadedBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    
    <g filter="url(#logo-neon-glow)" transform="translate(0, -2)">
      {/* Hexagon Outline */}
      <path
        d="M 50,20 L 76,35 L 76,65 L 50,80 L 24,65 L 24,35 Z"
        fill="none"
        stroke="url(#logo-neon-gradient)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Inner Geometric Elements */}
      <g strokeWidth="2" stroke="url(#logo-neon-gradient)" fill="none">
        {/* Central Node */}
        <circle cx="50" cy="50" r="8" />
        
        {/* Connecting Lines from center */}
        <path d="M 50 42 V 35" />
        <path d="M 50 58 V 65" />
        
        {/* Micro-icons / decorative elements */}
        <circle cx="50" cy="35" r="3" />
        <circle cx="50" cy="65" r="3" />
        
        {/* Side elements */}
        <path d="M 38 42.5 A 15 15 0 0 1 38 57.5" />
        <path d="M 62 42.5 A 15 15 0 0 0 62 57.5" />
      </g>
    </g>
  </svg>
);

export default LogoIcon;
