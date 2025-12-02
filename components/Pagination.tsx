import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 3;
    const pageBuffer = 2;

    if (totalPages <= maxPagesToShow + pageBuffer) {
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        pageNumbers.push(1);
        if (currentPage > pageBuffer + 1) {
            pageNumbers.push('...');
        }

        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        if (currentPage < totalPages - pageBuffer) {
            pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();
  
  return (
    <nav className="flex items-center justify-center gap-2 mt-12">
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden
          ${currentPage === 1 
            ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed' 
            : 'glass text-gray-200 hover:text-white hover:border-cyan-500/50 hover-glow-cyan'
          }`}
        aria-label="Go to previous page"
      >
        <svg 
          className={`w-4 h-4 transition-transform duration-300 ${currentPage !== 1 ? 'group-hover:-translate-x-1' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((number, index) =>
          typeof number === 'string' ? (
            <span 
              key={`ellipsis-${index}`} 
              className="px-2 text-gray-500 select-none"
            >
              ...
            </span>
          ) : (
            <button
              key={number}
              onClick={() => onPageChange(number)}
              className={`relative w-10 h-10 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden
                ${currentPage === number 
                  ? 'bg-gradient-to-br from-cyan-500 to-purple-600 text-white shadow-hero-glow scale-110' 
                  : 'glass text-gray-300 hover:text-white hover:border-cyan-500/30'
                }`}
              aria-current={currentPage === number ? 'page' : undefined}
            >
              <span className="relative z-10">{number}</span>
              {currentPage !== number && (
                <span className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
              )}
            </button>
          )
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden
          ${currentPage === totalPages 
            ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed' 
            : 'glass text-gray-200 hover:text-white hover:border-cyan-500/50 hover-glow-cyan'
          }`}
        aria-label="Go to next page"
      >
        <span className="hidden sm:inline">Next</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-300 ${currentPage !== totalPages ? 'group-hover:translate-x-1' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
};

export default Pagination;
