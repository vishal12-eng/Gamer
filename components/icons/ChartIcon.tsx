
import React from 'react';

const ChartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M6 16.5v2.25a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0024 18.75V7.5a2.25 2.25 0 00-2.25-2.25h-5.25m-9 6V9a2.25 2.25 0 012.25-2.25H9m4.5 0H12m4.5 0h2.25m-9 11.25V10.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.5 4.5 7.5-7.5" />
    </svg>
);

export default ChartIcon;
