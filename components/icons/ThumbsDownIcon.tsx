import React from 'react';

interface ThumbsDownIconProps {
  className?: string;
  filled?: boolean;
}

const ThumbsDownIcon: React.FC<ThumbsDownIconProps> = ({ className, filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.498 15.75c.806 0 1.533.422 2.031 1.08a9.04 9.04 0 0 1 2.86 2.4c.723.384 1.35.956 1.653 1.715a4.498 4.498 0 0 0 .322 1.672v1.05a.75.75 0 0 1-.75.75A2.25 2.25 0 0 1 14.25 21c0-1.152-.26-2.243-.723-3.218-.266-.558.107-1.282.725-1.282h3.126c1.026 0 1.945-.694 2.054-1.715.045-.422.068-.85.068-1.285a11.95 11.95 0 0 0-2.649-7.521c-.388-.482-.987-.729-1.605-.729H9.752c-.483 0-.964.078-1.423.23l-3.114 1.04a4.5 4.5 0 0 0-1.423.23H1.875a1.875 1.875 0 0 0-1.875 1.875v1.25c0 1.036.84 1.875 1.875 1.875h5.623Z" />
  </svg>
);

export default ThumbsDownIcon;
