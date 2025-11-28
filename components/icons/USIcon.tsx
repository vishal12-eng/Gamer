import React from 'react';

const USIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" className={className}>
        <defs>
            <linearGradient id="us-gradient" x1="12" y1="32" x2="52" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22D3EE"/>
                <stop offset="1" stopColor="#A855F7"/>
            </linearGradient>
        </defs>
        <path d="M32 8 L37.5 22 L52 22 L40 32 L45 46 L32 37 L19 46 L24 32 L12 22 L26.5 22 Z" stroke="url(#us-gradient)" strokeWidth="3" strokeLinejoin="round" />
    </svg>
);

export default USIcon;
