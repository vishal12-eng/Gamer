import React, { useState } from 'react';
import { useToast } from '../hooks/useToast';

const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      showToast('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/mailchimpSubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (data.success || response.ok) {
        setIsSuccess(true);
        setEmail('');
        setName('');
        showToast(data.message || 'Successfully subscribed to newsletter!');
      } else {
        showToast(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      showToast('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">You're In!</h3>
          <p className="text-gray-400">Check your inbox for the latest tech insights.</p>
          <button
            onClick={() => setIsSuccess(false)}
            className="mt-6 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Subscribe another email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 p-8 md:p-12">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-cyan-500/5"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Stay Ahead of the Curve</h3>
                <p className="text-gray-400 text-sm">Join 10,000+ tech enthusiasts</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 md:mb-0">
              Get the latest tech news, AI breakthroughs, and exclusive insights delivered straight to your inbox. No spam, unsubscribe anytime.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1">
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                />
              </div>
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email *"
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-purple-500 transition-all shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe Now</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 text-center">
                By subscribing, you agree to our Privacy Policy
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewsletterForm;
