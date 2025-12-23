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
import { CATEGORY_SEO } from '../utils/categorySeoContent';
import AdBanner from '../components/AdBanner';

const ARTICLES_PER_PAGE = 6;

const CategoryPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const { articles, loading } = useArticles();

  const categoryKey = name?.toLowerCase() || '';
  const categoryName = name ? name.charAt(0).toUpperCase() + name.slice(1) : '';

  const filteredArticles = articles.filter(
    (article) => article.category.toLowerCase() === categoryKey
  );

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);

  const isPaginated = currentPage > 1;

  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ============================
     SEO LOGIC (SAFE + STRONG)
  ============================ */

  const fallbackSeo = getPageSEO('category', { category: categoryName });
  const categorySeo = CATEGORY_SEO[categoryKey];

  const seoTitle = categorySeo?.title || fallbackSeo.title;
  const seoDescription = categorySeo?.description || fallbackSeo.description;
  const seoKeywords = categorySeo?.keywords || fallbackSeo.keywords;

  const breadcrumbSchema = buildCategoryBreadcrumb(categoryName);
  const collectionSchema = generateCollectionPageSchema(
    categoryName,
    filteredArticles,
    buildCategoryUrl(categoryName)
  );

  return (
    <div>
      {/* ================= SEO ================= */}
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        url={`/category/${categoryKey}`}
        schema={[breadcrumbSchema, collectionSchema]}
        noindex={isPaginated}   // page=2,3 => noindex, follow
        faqs={categorySeo?.faqs}
      />

      {/* ================= HEADING ================= */}
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 capitalize text-cyan-400 [text-shadow:0_1px_3px_rgba(0,0,0,0.15)]">
        {categoryName}
      </h1>

      {/* ================= LOADING ================= */}
      {loading && filteredArticles.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredArticles.length > 0 ? (
        <>
          {/* ================= ARTICLES GRID ================= */}
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

          {/* ================= BOTTOM AD ================= */}
          <AdBanner placement="footer" className="mt-8" />

          {/* ================= PAGINATION ================= */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />

          {/* ================= CATEGORY SEO CONTENT (PAGE 1 ONLY) ================= */}
          {!isPaginated && categorySeo?.content && (
            <section className="mt-16 max-w-3xl mx-auto text-gray-300 leading-relaxed">
              {categorySeo.content.map((para, index) => (
                <p key={index} className="mb-4">
                  {para}
                </p>
              ))}
            </section>
          )}
        </>
      ) : (
        <p className="text-center text-gray-400 py-20">
          No articles found in this category.
        </p>
      )}
    </div>
  );
};

export default CategoryPage;
