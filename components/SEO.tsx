import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  schema?: object | object[];
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  schema
}) => {
  const siteTitle = "FutureTechJournal";
  const defaultDescription = "An ultra-modern, AI-powered news and blog website covering the latest in Artificial Intelligence, Technology, Business, and Global Innovation.";
  const defaultImage = "https://picsum.photos/seed/futuretech/1200/630";
  const defaultKeywords = "AI News, Technology, Future Tech, Business News, Artificial Intelligence, Tech Blog";

  const fullTitle = title ? (title.includes(siteTitle) ? title : `${title} | ${siteTitle}`) : siteTitle;
  const finalDescription = description || defaultDescription;
  const finalImage = image || defaultImage;
  const finalUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const finalKeywords = keywords && keywords.length > 0 ? keywords.join(", ") : defaultKeywords;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <link rel="canonical" href={finalUrl} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:site_name" content={siteTitle} />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@tech_futur32551" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
