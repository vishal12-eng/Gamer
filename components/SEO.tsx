import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SEO_CONFIG, buildCanonicalUrl, sanitizeDescription, sanitizeTitle } from '../utils/seoConfig';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  schema?: object | object[];
  noindex?: boolean;
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
  modifiedTime,
  section,
  schema,
  noindex = false
}) => {
  const fullTitle = title 
    ? (title.includes(SEO_CONFIG.siteName) ? sanitizeTitle(title) : `${sanitizeTitle(title)} | ${SEO_CONFIG.siteName}`)
    : SEO_CONFIG.defaultTitle;
  
  const finalDescription = sanitizeDescription(description || SEO_CONFIG.defaultDescription);
  const finalImage = image || SEO_CONFIG.defaultImage;
  const finalUrl = url ? buildCanonicalUrl(url) : SEO_CONFIG.siteUrl;
  const finalKeywords = keywords && keywords.length > 0 ? keywords.join(', ') : SEO_CONFIG.defaultKeywords.join(', ');

  const robotsContent = noindex 
    ? 'noindex, nofollow' 
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <link rel="canonical" href={finalUrl} />
      <meta name="robots" content={robotsContent} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />
      <meta property="og:locale" content={SEO_CONFIG.locale} />
      
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SEO_CONFIG.twitterHandle} />
      <meta name="twitter:creator" content={SEO_CONFIG.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(schema) ? schema : [schema])}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
