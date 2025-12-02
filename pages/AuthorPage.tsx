import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import { useArticles } from '../hooks/useArticles';
import { ArticleCardSkeleton } from '../components/SkeletonLoader';
import { unslugify, slugify } from '../utils/slugify';
import UserIcon from '../components/icons/UserIcon';
import SEO from '../components/SEO';
import { getPageSEO } from '../utils/seoConfig';
import { generateAuthorPageSchema, generateOrganizationSchema } from '../utils/seoHelpers';

const AuthorPage: React.FC = () => {
  const { authorSlug } = useParams<{ authorSlug: string }>();
  const { articles, loading } = useArticles();

  const authorName = useMemo(() => (authorSlug ? unslugify(authorSlug) : ''), [authorSlug]);

  const authorArticles = useMemo(() => {
    return articles.filter(
      (article) => article.author.toLowerCase() === authorName.toLowerCase()
    );
  }, [articles, authorName]);

  const seoData = getPageSEO('author', { authorName });
  const authorSchema = generateAuthorPageSchema(authorName, authorArticles.length);
  const orgSchema = generateOrganizationSchema();

  return (
    <div>
      <SEO 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url={`/author/${slugify(authorName)}`}
        schema={[authorSchema, orgSchema]}
      />
      <div className="flex items-center mb-8">
        <UserIcon className="w-8 h-8 text-cyan-400 mr-4" />
        <div>
            <p className="text-sm uppercase tracking-wider text-gray-400">Articles by</p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                {authorName}
            </h1>
        </div>
      </div>
      
      {loading && authorArticles.length === 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => <ArticleCardSkeleton key={i} />)}
         </div>
      ) : authorArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {authorArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 py-20">No articles found for this author.</p>
      )}
    </div>
  );
};

export default AuthorPage;
