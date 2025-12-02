import React from 'react';

const ShimmerOverlay: React.FC = () => (
  <div className="absolute inset-0 skeleton-shimmer"></div>
);

export const ArticleCardSkeleton: React.FC<{ index?: number }> = ({ index = 0 }) => (
  <div 
    className={`relative rounded-2xl overflow-hidden glass-card h-96 stagger-${Math.min(index + 1, 6)}`}
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
      <ShimmerOverlay />
    </div>
    
    <div className="relative p-6 flex flex-col h-full">
      {/* Category tag skeleton */}
      <div className="w-24 h-7 rounded-full bg-gray-700/50 mb-auto">
        <ShimmerOverlay />
      </div>
      
      {/* Content skeleton */}
      <div className="mt-auto space-y-3">
        <div className="h-7 bg-gray-700/50 rounded-lg w-full relative overflow-hidden">
          <ShimmerOverlay />
        </div>
        <div className="h-7 bg-gray-700/50 rounded-lg w-3/4 relative overflow-hidden">
          <ShimmerOverlay />
        </div>
        <div className="flex items-center gap-3 mt-4">
          <div className="w-6 h-6 rounded-full bg-gray-700/50 relative overflow-hidden">
            <ShimmerOverlay />
          </div>
          <div className="h-4 bg-gray-700/50 rounded w-32 relative overflow-hidden">
            <ShimmerOverlay />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const ArticlePageSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-8">
    {/* Back button skeleton */}
    <div className="h-10 w-24 bg-gray-700/30 rounded-lg relative overflow-hidden">
      <ShimmerOverlay />
    </div>
    
    {/* Category badge */}
    <div className="h-8 w-32 bg-gray-700/30 rounded-full relative overflow-hidden">
      <ShimmerOverlay />
    </div>
    
    {/* Title */}
    <div className="space-y-3">
      <div className="h-10 bg-gray-700/30 rounded-lg w-full relative overflow-hidden">
        <ShimmerOverlay />
      </div>
      <div className="h-10 bg-gray-700/30 rounded-lg w-4/5 relative overflow-hidden">
        <ShimmerOverlay />
      </div>
    </div>
    
    {/* Meta info */}
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-700/30 relative overflow-hidden">
        <ShimmerOverlay />
      </div>
      <div className="h-4 w-32 bg-gray-700/30 rounded relative overflow-hidden">
        <ShimmerOverlay />
      </div>
      <div className="h-4 w-24 bg-gray-700/30 rounded relative overflow-hidden">
        <ShimmerOverlay />
      </div>
    </div>
    
    {/* Image */}
    <div className="h-[400px] bg-gray-700/30 rounded-2xl relative overflow-hidden">
      <ShimmerOverlay />
    </div>
    
    {/* Content paragraphs */}
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i} 
          className="h-4 bg-gray-700/30 rounded relative overflow-hidden"
          style={{ width: `${85 + Math.random() * 15}%` }}
        >
          <ShimmerOverlay />
        </div>
      ))}
      <div className="h-8"></div>
      {[...Array(4)].map((_, i) => (
        <div 
          key={i + 5} 
          className="h-4 bg-gray-700/30 rounded relative overflow-hidden"
          style={{ width: `${80 + Math.random() * 20}%` }}
        >
          <ShimmerOverlay />
        </div>
      ))}
    </div>
  </div>
);

export const HomePageSkeleton: React.FC = () => (
    <div className="space-y-16">
        {/* Hero Skeleton */}
        <section className="relative -mt-24 h-[70vh] md:h-[85vh] flex items-center justify-center text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
              <ShimmerOverlay />
            </div>
            
            {/* Floating decorative elements */}
            <div className="absolute top-1/4 left-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl float-slow"></div>
            <div className="absolute top-1/3 right-20 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl float-medium"></div>
            
            <div className="relative z-10 p-4 max-w-4xl w-full space-y-6">
                {/* Category badge */}
                <div className="flex justify-center">
                  <div className="h-10 w-32 bg-gray-700/30 rounded-full relative overflow-hidden">
                    <ShimmerOverlay />
                  </div>
                </div>
                
                {/* Title */}
                <div className="space-y-3">
                  <div className="h-14 bg-gray-700/30 rounded-lg w-full relative overflow-hidden">
                    <ShimmerOverlay />
                  </div>
                  <div className="h-14 bg-gray-700/30 rounded-lg w-4/5 mx-auto relative overflow-hidden">
                    <ShimmerOverlay />
                  </div>
                </div>
                
                {/* Summary */}
                <div className="max-w-2xl mx-auto space-y-2">
                  <div className="h-5 bg-gray-700/30 rounded w-full relative overflow-hidden">
                    <ShimmerOverlay />
                  </div>
                  <div className="h-5 bg-gray-700/30 rounded w-3/4 mx-auto relative overflow-hidden">
                    <ShimmerOverlay />
                  </div>
                </div>
                
                {/* CTA Button */}
                <div className="flex justify-center pt-4">
                  <div className="h-14 w-44 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full relative overflow-hidden">
                    <ShimmerOverlay />
                  </div>
                </div>
            </div>
        </section>

        {/* Ticker Skeleton */}
        <div className="relative w-full py-3 overflow-hidden glass border-y border-white/10">
            <div className="flex items-center justify-center gap-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 w-32 bg-gray-700/30 rounded relative overflow-hidden">
                  <ShimmerOverlay />
                </div>
              ))}
            </div>
        </div>

        {/* Articles Section */}
        <section>
            {/* Section header */}
            <div className="flex items-center mb-10 gap-4">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-lg relative overflow-hidden">
                  <ShimmerOverlay />
                </div>
                <div className="h-8 bg-gray-700/30 rounded w-48 relative overflow-hidden">
                  <ShimmerOverlay />
                </div>
                <div className="flex-grow h-px bg-gradient-to-r from-gray-700/30 to-transparent"></div>
            </div>
            
            {/* Article grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => <ArticleCardSkeleton key={i} index={i} />)}
            </div>
        </section>
    </div>
);

export const SearchResultSkeleton: React.FC = () => (
  <div className="flex gap-4 p-4 rounded-xl glass-card">
    <div className="w-32 h-32 md:w-48 md:h-36 bg-gray-700/30 rounded-lg flex-shrink-0 relative overflow-hidden">
      <ShimmerOverlay />
    </div>
    <div className="flex-1 space-y-3 py-2">
      <div className="h-5 bg-gray-700/30 rounded w-24 relative overflow-hidden">
        <ShimmerOverlay />
      </div>
      <div className="h-6 bg-gray-700/30 rounded w-3/4 relative overflow-hidden">
        <ShimmerOverlay />
      </div>
      <div className="h-4 bg-gray-700/30 rounded w-full relative overflow-hidden">
        <ShimmerOverlay />
      </div>
      <div className="h-4 bg-gray-700/30 rounded w-5/6 relative overflow-hidden">
        <ShimmerOverlay />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div className="w-5 h-5 rounded-full bg-gray-700/30 relative overflow-hidden">
          <ShimmerOverlay />
        </div>
        <div className="h-3 bg-gray-700/30 rounded w-24 relative overflow-hidden">
          <ShimmerOverlay />
        </div>
      </div>
    </div>
  </div>
);

export const CategoryPageSkeleton: React.FC = () => (
  <div className="space-y-8">
    {/* Header */}
    <div className="text-center space-y-4">
      <div className="h-12 w-48 bg-gray-700/30 rounded-lg mx-auto relative overflow-hidden">
        <ShimmerOverlay />
      </div>
      <div className="h-4 w-64 bg-gray-700/30 rounded mx-auto relative overflow-hidden">
        <ShimmerOverlay />
      </div>
    </div>
    
    {/* Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => <ArticleCardSkeleton key={i} index={i} />)}
    </div>
  </div>
);
