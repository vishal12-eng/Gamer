
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import { getCategoryStyle } from '../utils/categoryStyles';
import { Category } from '../types';
import SparklesIcon from '../components/icons/SparklesIcon';
import SearchIcon from '../components/icons/SearchIcon';

const AdminArticleListPage: React.FC = () => {
  const { articles, loading } = useArticles();
  const [filter, setFilter] = useState('');

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(filter.toLowerCase()) ||
    a.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Content Manager</h1>
          <p className="text-gray-400">Manage, edit, and optimize all website content.</p>
        </div>
        <div className="mt-4 md:mt-0 relative">
          <input 
            type="text" 
            placeholder="Filter articles..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-full px-4 py-2 pl-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 w-64"
          />
          <SearchIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-gray-900/50 border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-800 text-gray-300 uppercase font-semibold tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Article</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center">Loading content...</td></tr>
              ) : filteredArticles.length > 0 ? (
                filteredArticles.map((article) => {
                  const { bg, text } = getCategoryStyle(article.category as Category);
                  return (
                    <tr key={article.slug} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img src={article.imageUrl} alt="" className="w-10 h-10 rounded object-cover mr-3 opacity-80" />
                          <span className="font-medium text-white truncate max-w-xs">{article.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bg} ${text}`}>
                          {article.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">{article.author}</td>
                      <td className="px-6 py-4">{new Date(article.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${article.status === 'draft' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>
                          {article.status || 'Published'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          to={`/admin/articles/${article.slug}`}
                          className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={6} className="px-6 py-8 text-center">No articles found matching your filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-800/30 border-t border-gray-800 text-center text-xs text-gray-500">
          Showing {filteredArticles.length} articles
        </div>
      </div>
    </div>
  );
};

export default AdminArticleListPage;
