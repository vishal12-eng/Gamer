import React from 'react';

const ScienceIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" className={className}>
        <defs>
            <linearGradient id="science-gradient" x1="8" y1="32" x2="56" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22D3EE"/>
                <stop offset="1" stopColor="#A855F7"/>
            </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="6" stroke="url(#science-gradient)" strokeWidth="3"/>
        <ellipse cx="32" cy="32" rx="24" ry="10" stroke="url(#science-gradient)" strokeWidth="3" transform="rotate(45 32 32)"/>
        <ellipse cx="32" cy="32" rx="24" ry="10" stroke="url(#science-gradient)" strokeWidth="3" transform="rotate(-45 32 32)"/>
        <ellipse cx="32" cy="32" rx="24" ry="10" stroke="url(#science-gradient)" strokeWidth="3"/>
    </svg>
);

export default ScienceIcon;
