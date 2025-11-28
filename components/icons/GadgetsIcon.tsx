
import React from 'react';

const GadgetsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" className={className}>
        <defs>
            <linearGradient id="gadgets-gradient" x1="4" y1="32" x2="60" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22D3EE"/>
                <stop offset="1" stopColor="#A855F7"/>
            </linearGradient>
        </defs>
        <rect x="18" y="6" width="28" height="52" rx="6" stroke="url(#gadgets-gradient)" strokeWidth="3"/>
        <line x1="28" y1="12" x2="36" y2="12" stroke="url(#gadgets-gradient)" strokeWidth="3" strokeLinecap="round"/>
        <line x1="4" y1="20" x2="18" y2="20" stroke="url(#gadgets-gradient)" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="4" cy="20" r="3" stroke="url(#gadgets-gradient)" strokeWidth="3"/>
        <line x1="4" y1="44" x2="18" y2="44" stroke="url(#gadgets-gradient)" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="4" cy="44" r="3" stroke="url(#gadgets-gradient)" strokeWidth="3"/>
        <line x1="60" y1="20" x2="46" y2="20" stroke="url(#gadgets-gradient)" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="60" cy="20" r="3" stroke="url(#gadgets-gradient)" strokeWidth="3"/>
        <line x1="60" y1="44" x2="46" y2="44" stroke="url(#gadgets-gradient)" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="60" cy="44" r="3" stroke="url(#gadgets-gradient)" strokeWidth="3"/>
    </svg>
);

export default GadgetsIcon;
