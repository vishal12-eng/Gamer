import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import { useArticles } from '../hooks/useArticles';
import { ArticleCardSkeleton } from '../components/SkeletonLoader';
import SEO from '../components/SEO';
import { buildBreadcrumbSchema, generateSEOTitle, generateMetaDescription } from '../utils/seoEngine';

const ARTICLES_PER_PAGE = 6;

const CategoryPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const { articles, loading } = useArticles();
  
  const categoryName = name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
  const filteredArticles = articles.filter(
    (article) => article.category.toLowerCase() === name?.toLowerCase()
  );

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);

  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const domain = "https://futuretechjournal50.netlify.app";
  const seoTitle = generateSEOTitle(`${categoryName} News & Articles`);
  const seoDesc = `Read the latest news and updates about ${categoryName} on FutureTechJournal. Curated articles powered by AI.`;
  const breadcrumbSchema = buildBreadcrumbSchema([
      { name: 'Home', url: domain },
      { name: categoryName, url: `${domain}/category/${name}` }
  ]);
  
  // Specific CollectionPage schema could be added here, but Breadcrumb + SEO meta is sufficient for now.
  
  return (
    <div>
      <SEO 
        title={seoTitle}
        description={seoDesc}
        keywords={[categoryName, `${categoryName} News`, "Tech News", "FutureTechJournal"]}
        url={`${domain}/category/${name}`}
        schema={breadcrumbSchema}
      />

      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 capitalize text-cyan-400 [text-shadow:0_1px_3px_rgba(0,0,0,0.15)]">
        {categoryName}
      </h1>
      
      {loading && filteredArticles.length === 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <ArticleCardSkeleton key={i} />)}
         </div>
      ) : filteredArticles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <p className="text-center text-gray-400 py-20">No articles found in this category.</p>
      )}
    </div>
  );
};

export default CategoryPage;
