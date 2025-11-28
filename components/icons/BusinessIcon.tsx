
import React from 'react';

const BusinessIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" className={className}>
        <defs>
            <linearGradient id="business-gradient" x1="8" y1="32" x2="60" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22D3EE"/>
                <stop offset="1" stopColor="#A855F7"/>
            </linearGradient>
        </defs>
        <path d="M10 22H54V50C54 51.1 53.1 52 52 52H12C10.9 52 10 51.1 10 50V22Z" stroke="url(#business-gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 22V16C22 13.79 23.79 12 26 12H38C40.21 12 42 13.79 42 16V22" stroke="url(#business-gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 38L24 30L36 42L50 24" stroke="url(#business-gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M56 20L50 24L44 20" stroke="url(#business-gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M50 24V14" stroke="url(#business-gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
export default BusinessIcon;
