import React, { ReactNode } from 'react';
import SEO from './SEO';
import { getPageSEO } from '../utils/seoConfig';

interface LegalPageLayoutProps {
  title: string;
  pageType: 'privacy' | 'terms' | 'disclaimer';
  children: ReactNode;
}

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ title, pageType, children }) => {
  const seoData = getPageSEO(pageType);
  const urlPath = pageType === 'privacy' ? '/privacy' : pageType === 'terms' ? '/terms' : '/disclaimer';

  return (
    <div className="max-w-4xl mx-auto py-8">
      <SEO 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url={urlPath}
      />
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-[#000000] dark:text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.15)] border-b border-gray-700 pb-4">{title}</h1>
      <div className="prose prose-lg dark:prose-invert max-w-none text-[#111111] dark:text-gray-300 prose-headings:text-[#000000] prose-headings:[text-shadow:0_1px_3px_rgba(0,0,0,0.15)] prose-strong:text-black prose-p:leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export default LegalPageLayout;
