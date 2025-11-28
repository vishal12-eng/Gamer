import React from 'react';

const AiIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" className={className}>
        <defs>
            <linearGradient id="ai-gradient" x1="2" y1="32" x2="62" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22D3EE"/>
                <stop offset="1" stopColor="#A855F7"/>
            </linearGradient>
        </defs>
        {/* Brain Outline */}
        <path d="M31 56 C 18 56, 12 45, 12 32 C 12 19, 18 8, 31 8" stroke="url(#ai-gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M33 56 C 46 56, 52 45, 52 32 C 52 19, 46 8, 33 8" stroke="url(#ai-gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        
        {/* Left Circuits */}
        <circle cx="21" cy="20" r="4" stroke="url(#ai-gradient)" strokeWidth="3"/>
        <path d="M21 20H31" stroke="url(#ai-gradient)" strokeWidth="3" strokeLinecap="round"/>
        
        <circle cx="21" cy="32" r="4" stroke="url(#ai-gradient)" strokeWidth="3"/>
        <path d="M21 32H31" stroke="url(#ai-gradient)" strokeWidth="3" strokeLinecap="round"/>
        
        <circle cx="21" cy="44" r="4" stroke="url(#ai-gradient)" strokeWidth="3"/>
        <path d="M21 44H31" stroke="url(#ai-gradient)" strokeWidth="3" strokeLinecap="round"/>
        
        {/* Right Circuits */}
        <circle cx="43" cy="20" r="4" stroke="url(#ai-gradient)" strokeWidth="3"/>
        <circle cx="43" cy="32" r="4" stroke="url(#ai-gradient)" strokeWidth="3"/>
        <circle cx="43" cy="44" r="4" stroke="url(#ai-gradient)" strokeWidth="3"/>

        <path d="M43 20L33 12" stroke="url(#ai-gradient)" strokeWidth="3" strokeLinecap="round"/>
        <path d="M43 32L33 32" stroke="url(#ai-gradient)" strokeWidth="3" strokeLinecap="round"/>
        <path d="M43 44L33 52" stroke="url(#ai-gradient)" strokeWidth="3" strokeLinecap="round"/>
    </svg>
);

export default AiIcon;