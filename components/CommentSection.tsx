import React, { useState, useEffect } from 'react';
import { Comment } from '../types';
import { useToast } from '../hooks/useToast';
import UserIcon from './icons/UserIcon';
import SparklesIcon from './icons/SparklesIcon';

interface CommentSectionProps {
  articleSlug: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ articleSlug }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const getStorageKey = () => `comments-${articleSlug}`;

  useEffect(() => {
    try {
      const savedCommentsJSON = localStorage.getItem(getStorageKey());
      if (savedCommentsJSON) {
        setComments(JSON.parse(savedCommentsJSON));
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error("Failed to load comments from localStorage", error);
      setComments([]);
    }
  }, [articleSlug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) {
      showToast('Name and comment cannot be empty.');
      return;
    }
    
    setIsSubmitting(true);
    
    const newComment: Comment = {
      name,
      text,
      date: new Date().toISOString(),
    };

    const updatedComments = [newComment, ...comments];
    setComments(updatedComments);

    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(updatedComments));
    } catch (error) {
      console.error("Failed to save comment to localStorage", error);
      showToast("Could not save your comment.");
       // Revert state if saving fails
      setComments(comments);
      setIsSubmitting(false);
      return;
    }
    
    setName('');
    setText('');
    showToast('Comment posted successfully!');
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-[#000000] dark:text-white">Join the Discussion</h2>
      
      <div className="bg-gray-900/50 p-6 rounded-lg border border-white/10 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">Your Comment</label>
            <textarea
              id="comment"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Share your thoughts..."
              required
            />
          </div>
          <div className="text-right">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-2 px-6 rounded-md transition-all duration-300 hover:shadow-cyan-glow disabled:from-gray-600 disabled:to-gray-700 disabled:shadow-none disabled:cursor-not-allowed"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-700">
                <UserIcon className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1 bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-cyan-400">{comment.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">{comment.text}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
