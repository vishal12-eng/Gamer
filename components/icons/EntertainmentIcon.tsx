
import React from 'react';

const EntertainmentIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" className={className}>
        <defs>
            <linearGradient id="entertainment-gradient" x1="12" y1="32" x2="62" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22D3EE"/>
                <stop offset="1" stopColor="#A855F7"/>
            </linearGradient>
        </defs>
        <path d="M15.46 51.46C13.25 52.79 10.5 51.13 10.5 48.54V15.46C10.5 12.87 13.25 11.21 15.46 12.54L43.01 28.08C45.22 29.41 45.22 32.59 43.01 33.92L15.46 51.46Z" stroke="url(#entertainment-gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M47 30C52 24 58 15 62 12" stroke="url(#entertainment-gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M58 8L62 12L58 16" stroke="url(#entertainment-gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default EntertainmentIcon;
