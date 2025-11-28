import React from 'react';
import ThumbsUpIcon from './icons/ThumbsUpIcon';
import ThumbsDownIcon from './icons/ThumbsDownIcon';

type Vote = 'upvote' | 'downvote' | null;

interface FeedbackProps {
  articleSlug: string;
  currentVote: Vote;
  onVote: (vote: 'upvote' | 'downvote') => void;
}

const Feedback: React.FC<FeedbackProps> = ({ articleSlug, currentVote, onVote }) => {
  const isUpvoted = currentVote === 'upvote';
  const isDownvoted = currentVote === 'downvote';

  return (
    <div className="mt-12 py-8 border-t border-b border-gray-200 dark:border-gray-700 text-center">
      <h3 className="text-xl font-bold mb-4 text-[#000000] dark:text-white">Was this article helpful?</h3>
      <div className="flex justify-center items-center space-x-4">
        <button
          onClick={() => onVote('upvote')}
          aria-label="Upvote this article"
          className={`p-3 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-black focus:ring-green-500 ${
            isUpvoted
              ? 'bg-green-500/20 text-green-400'
              : 'bg-gray-200/80 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-green-500/10 hover:text-green-500'
          }`}
        >
          <ThumbsUpIcon className="w-7 h-7" filled={isUpvoted} />
        </button>
        <button
          onClick={() => onVote('downvote')}
          aria-label="Downvote this article"
          className={`p-3 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-black focus:ring-red-500 ${
            isDownvoted
              ? 'bg-red-500/20 text-red-400'
              : 'bg-gray-200/80 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-red-500/10 hover:text-red-500'
          }`}
        >
          <ThumbsDownIcon className="w-7 h-7" filled={isDownvoted} />
        </button>
      </div>
    </div>
  );
};

export default Feedback;
