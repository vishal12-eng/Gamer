import React from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen = false, onToggle }) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 md:p-5 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-inset transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-expanded={isOpen}
      >
        <h3 className="font-semibold text-gray-900 dark:text-white pr-4 text-sm md:text-base">
          {question}
        </h3>
        <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">
          <svg
            className={`w-5 h-5 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 md:px-5 md:pb-5 pt-0">
          <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQItem;
