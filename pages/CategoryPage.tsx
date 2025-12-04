import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import { useArticles } from '../hooks/useArticles';
import { ArticleCardSkeleton } from '../components/SkeletonLoader';
import SEO from '../components/SEO';
import { buildCategoryBreadcrumb } from '../utils/seoEngine';
import { generateCollectionPageSchema } from '../utils/seoHelpers';
import { getPageSEO, buildCategoryUrl } from '../utils/seoConfig';
import AdBanner from '../components/AdBanner';

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

  const seoData = getPageSEO('category', { category: categoryName });
  const breadcrumbSchema = buildCategoryBreadcrumb(categoryName);
  const collectionSchema = generateCollectionPageSchema(
    categoryName,
    filteredArticles,
    buildCategoryUrl(categoryName)
  );
  
  return (
    <div>
      <SEO 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url={`/category/${name}`}
        schema={[breadcrumbSchema, collectionSchema]}
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
            {currentArticles.map((article, index) => (
              <React.Fragment key={article.slug}>
                <ArticleCard article={article} />
                {index === 3 && currentArticles.length > 4 && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3">
                    <AdBanner placement="home_after_card_3" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Ad Banner - End of Category Feed */}
          <AdBanner placement="footer" className="mt-8" />
          
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
