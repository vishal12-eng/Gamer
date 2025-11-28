
import React from 'react';

const GlobalIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" className={className}>
        <defs>
            <linearGradient id="global-gradient" x1="4" y1="32" x2="60" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22D3EE"/>
                <stop offset="1" stopColor="#A855F7"/>
            </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="28" stroke="url(#global-gradient)" strokeWidth="3"/>
        <path d="M4 32H60" stroke="url(#global-gradient)" strokeWidth="3" strokeLinecap="round"/>
        <ellipse cx="32" cy="32" rx="14" ry="28" stroke="url(#global-gradient)" strokeWidth="3"/>
        <path d="M11.08 19H52.92" stroke="url(#global-gradient)" strokeWidth="3" strokeLinecap="round"/>
        <path d="M11.08 45H52.92" stroke="url(#global-gradient)" strokeWidth="3" strokeLinecap="round"/>
    </svg>
);

export default GlobalIcon;
