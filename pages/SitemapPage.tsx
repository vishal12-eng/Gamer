
import React from 'react';
import { useArticles } from '../hooks/useArticles';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const SitemapPage: React.FC = () => {
  const { articles } = useArticles();

  const categories = Array.from(new Set(articles.map(a => a.category)));
  const domain = "https://futuretechjournal50.netlify.app";

  return (
    <div className="max-w-4xl mx-auto py-8">
      <SEO 
        title="Sitemap - FutureTechJournal"
        description="Complete list of all pages and articles on FutureTechJournal."
      />
      <h1 className="text-3xl font-bold mb-8 text-white">Sitemap</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Pages</h2>
          <ul className="space-y-2 text-gray-300">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/foryou" className="hover:text-white">For You</Link></li>
          </ul>

          <h2 className="text-xl font-bold text-cyan-400 mb-4 mt-8">Categories</h2>
          <ul className="space-y-2 text-gray-300">
            {categories.map(cat => (
              <li key={cat}>
                <Link to={`/category/${cat.toLowerCase()}`} className="hover:text-white">{cat}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Articles</h2>
          <ul className="space-y-2 text-gray-300">
            {articles.map(article => (
              <li key={article.slug}>
                <Link to={`/article/${article.slug}`} className="hover:text-white">{article.title}</Link>
                <span className="text-xs text-gray-500 block">{new Date(article.date).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* XML Representation for Crawlers (Visible in source) */}
      <div style={{ display: 'none' }}>
        {`
          <?xml version="1.0" encoding="UTF-8"?>
          <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            <url><loc>${domain}/</loc></url>
            <url><loc>${domain}/about</loc></url>
            <url><loc>${domain}/contact</loc></url>
            ${articles.map(a => `
              <url>
                <loc>${domain}/article/${a.slug}</loc>
                <lastmod>${new Date(a.date).toISOString()}</lastmod>
              </url>
            `).join('')}
          </urlset>
        `}
      </div>
    </div>
  );
};

export default SitemapPage;
