import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';

const AdminNewsletterPage: React.FC = () => {
  const { showToast } = useToast();
  
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles?status=published&limit=5');
        const data = await response.json();
        setArticles(data.articles || data || []);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setArticles([]);
      } finally {
        setIsLoadingArticles(false);
      }
    };

    fetchArticles();
  }, []);

  const latestArticles = articles.slice(0, 5);

  const handleGenerateSummary = async () => {
    if (latestArticles.length === 0) {
      showToast('No articles available to generate summary');
      return;
    }

    setIsGenerating(true);

    try {
      const articlesForSummary = latestArticles.map(article => ({
        title: article.title,
        summary: article.summary,
      }));

      const response = await fetch('/api/newsletter/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articles: articlesForSummary }),
      });

      const data = await response.json();

      if (data.subject && data.content) {
        setSubject(data.subject);
        setContent(data.content);
        showToast('Newsletter content generated successfully!');
      } else {
        showToast(data.error || 'Failed to generate newsletter content');
      }
    } catch (error) {
      console.error('Generate summary error:', error);
      showToast('An error occurred while generating the newsletter');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (!subject.trim() || !content.trim()) {
      showToast('Please fill in both subject and content');
      return;
    }

    setIsSending(true);

    try {
      const token = localStorage.getItem('ftj_auth_token');
      
      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, content }),
      });

      const data = await response.json();

      if (data.success) {
        showToast(data.message || 'Newsletter sent successfully!');
        setSubject('');
        setContent('');
      } else {
        showToast(data.error || data.message || 'Failed to send newsletter');
      }
    } catch (error) {
      console.error('Send newsletter error:', error);
      showToast('An error occurred while sending the newsletter');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Newsletter Manager</h1>
        <p className="text-gray-400 mt-1">Create and send newsletters to your subscribers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Compose Newsletter
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., This Week in Tech: AI Breakthroughs & More"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your newsletter content here..."
                  rows={12}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGenerating || isLoadingArticles || latestArticles.length === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-cyan-400 transition-all shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Generate AI Summary</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSendNewsletter}
                  disabled={isSending || !subject.trim() || !content.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-purple-500 transition-all shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Send Newsletter</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Latest Articles Preview
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              These articles will be used to generate the AI summary
            </p>

            {isLoadingArticles ? (
              <div className="flex items-center justify-center py-8">
                <svg className="animate-spin w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2 text-gray-400">Loading articles...</span>
              </div>
            ) : latestArticles.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No articles available</p>
            ) : (
              <div className="space-y-3">
                {latestArticles.map((article, index) => (
                  <div
                    key={article.slug}
                    className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white line-clamp-2 mb-1">
                          {article.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {article.summary}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-gray-700 text-gray-300 rounded">
                          {article.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                Use "Generate AI Summary" to create content from the latest articles
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                Review and personalize the generated content before sending
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                Test with a small audience before full campaigns
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNewsletterPage;
