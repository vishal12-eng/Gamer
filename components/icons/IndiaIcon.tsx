import React from 'react';

const IndiaIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" className={className}>
        <defs>
            <linearGradient id="india-gradient" x1="8" y1="32" x2="56" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22D3EE"/>
                <stop offset="1" stopColor="#A855F7"/>
            </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="24" stroke="url(#india-gradient)" strokeWidth="3"/>
        <circle cx="32" cy="32" r="4" stroke="url(#india-gradient)" strokeWidth="3"/>
        {[...Array(24)].map((_, i) => (
            <line 
                key={i}
                x1="32" 
                y1="32" 
                x2="32" 
                y2="8" 
                stroke="url(#india-gradient)" 
                strokeWidth="2" 
                strokeLinecap="round"
                transform={`rotate(${i * 15} 32 32)`}
            />
        ))}
    </svg>
);

export default IndiaIcon;
