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
    const pageBuffer = 2; // Pages to show on each side of the current page

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
  const baseButtonClasses = "px-4 py-2 rounded-md text-sm font-medium transition-colors";
  const disabledButtonClasses = "bg-gray-800 text-gray-500 cursor-not-allowed";
  const enabledButtonClasses = "bg-gray-700 hover:bg-cyan-600 text-gray-200 hover:text-white";
  const activeButtonClasses = "bg-cyan-600 text-white";
  
  return (
    <nav className="flex items-center justify-center space-x-2 mt-12">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`${baseButtonClasses} ${currentPage === 1 ? disabledButtonClasses : enabledButtonClasses}`}
        aria-label="Go to previous page"
      >
        Previous
      </button>

      {pageNumbers.map((number, index) =>
        typeof number === 'string' ? (
          <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-400">...</span>
        ) : (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`${baseButtonClasses} ${currentPage === number ? activeButtonClasses : enabledButtonClasses}`}
            aria-current={currentPage === number ? 'page' : undefined}
          >
            {number}
          </button>
        )
      )}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`${baseButtonClasses} ${currentPage === totalPages ? disabledButtonClasses : enabledButtonClasses}`}
        aria-label="Go to next page"
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;
