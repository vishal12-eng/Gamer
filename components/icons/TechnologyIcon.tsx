
import React from 'react';

const TechnologyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" className={className}>
        <defs>
            <linearGradient id="tech-gradient" x1="4" y1="32" x2="60" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22D3EE"/>
                <stop offset="1" stopColor="#A855F7"/>
            </linearGradient>
        </defs>
        <path d="M32 4L58.78 19V49L32 64L5.22 49V19L32 4Z" stroke="url(#tech-gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M32 52V40" stroke="url(#tech-gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 46L28 36" stroke="url(#tech-gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M44 46L36 36" stroke="url(#tech-gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="32" cy="32" r="4" stroke="url(#tech-gradient)" strokeWidth="3"/>
        <circle cx="16" cy="28" r="4" stroke="url(#tech-gradient)" strokeWidth="3"/>
        <circle cx="48" cy="28" r="4" stroke="url(#tech-gradient)" strokeWidth="3"/>
    </svg>
);

export default TechnologyIcon;
