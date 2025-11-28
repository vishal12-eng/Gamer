import React from 'react';

export const ArticleCardSkeleton: React.FC = () => (
  <div className="rounded-xl overflow-hidden bg-white/5 animate-pulse h-96">
    <div className="w-full h-full bg-gray-700/50"></div>
  </div>
);

export const ArticlePageSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto animate-pulse">
    <div className="h-8 bg-gray-700/50 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-700/50 rounded w-1/2 mb-8"></div>
    <div className="h-96 bg-gray-700/50 rounded-xl mb-8"></div>
    <div className="space-y-4">
      <div className="h-4 bg-gray-700/50 rounded w-full"></div>
      <div className="h-4 bg-gray-700/50 rounded w-full"></div>
      <div className="h-4 bg-gray-700/50 rounded w-11/12"></div>
      <div className="h-4 bg-gray-700/50 rounded w-full mt-6"></div>
      <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
    </div>
  </div>
);

export const HomePageSkeleton: React.FC = () => (
    <div className="space-y-16 animate-pulse">
        {/* Hero Skeleton */}
        <section className="relative -mt-24 h-[60vh] md:h-[80vh] flex items-center justify-center text-center overflow-hidden">
            <div className="absolute inset-0 bg-gray-800"></div>
            <div className="relative z-10 p-4 max-w-4xl w-full">
                <div className="h-5 bg-gray-700/50 rounded w-1/4 mx-auto mb-4"></div>
                <div className="h-12 bg-gray-700/50 rounded w-full mx-auto mb-6"></div>
                <div className="h-10 bg-gray-700/50 rounded w-3/4 mx-auto mb-8"></div>
                <div className="h-12 bg-gray-700/50 rounded-full w-40 mx-auto"></div>
            </div>
        </section>

        {/* Ticker Skeleton */}
        <div className="relative w-full h-10 overflow-hidden bg-gray-800 border-y border-gray-500/30">
            <div className="h-4 bg-gray-700/50 rounded w-1/3 mx-auto"></div>
        </div>

        {/* Articles Skeleton */}
        <section>
            <div className="h-8 bg-gray-700/50 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => <ArticleCardSkeleton key={i} />)}
            </div>
        </section>
    </div>
);

export const SearchResultSkeleton: React.FC = () => (
  <div className="flex gap-4 p-4 rounded-lg animate-pulse">
    <div className="w-32 h-32 md:w-48 md:h-36 bg-gray-700/50 rounded-md flex-shrink-0"></div>
    <div className="flex-1 space-y-3">
      <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
      <div className="h-6 bg-gray-700/50 rounded w-3/4"></div>
      <div className="h-4 bg-gray-700/50 rounded w-full"></div>
      <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
      <div className="h-4 bg-gray-700/50 rounded w-1/2 mt-2"></div>
    </div>
  </div>
);