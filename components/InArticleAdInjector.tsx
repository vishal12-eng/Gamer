import React, { useMemo } from 'react';
import { InArticleAd } from './AdBanner';

interface InArticleAdInjectorProps {
  content: string;
  showAds?: boolean;
}

const InArticleAdInjector: React.FC<InArticleAdInjectorProps> = ({ 
  content, 
  showAds = true 
}) => {
  const { contentParts, adPositions } = useMemo(() => {
    if (!showAds || !content) {
      return { contentParts: [content], adPositions: [] };
    }

    const paragraphRegex = /<\/p>/gi;
    let match;
    const paragraphEndPositions: number[] = [];
    
    while ((match = paragraphRegex.exec(content)) !== null) {
      paragraphEndPositions.push(match.index + match[0].length);
    }

    const totalParagraphs = paragraphEndPositions.length;
    
    if (totalParagraphs === 0) {
      return { contentParts: [content], adPositions: [] };
    }

    const adAfterParagraphs: number[] = [];
    
    if (totalParagraphs >= 3) {
      adAfterParagraphs.push(3);
    }
    if (totalParagraphs >= 6) {
      adAfterParagraphs.push(6);
    }

    const positions: number[] = [];
    adAfterParagraphs.forEach(paraNum => {
      if (paraNum <= totalParagraphs) {
        positions.push(paragraphEndPositions[paraNum - 1]);
      }
    });

    if (positions.length === 0) {
      return { contentParts: [content], adPositions: [] };
    }

    const sortedPositions = [...positions].sort((a, b) => a - b);
    const parts: string[] = [];
    let lastIndex = 0;
    
    sortedPositions.forEach(pos => {
      parts.push(content.slice(lastIndex, pos));
      lastIndex = pos;
    });
    parts.push(content.slice(lastIndex));

    return { 
      contentParts: parts, 
      adPositions: sortedPositions.map((_, i) => i) 
    };
  }, [content, showAds]);

  if (!showAds || adPositions.length === 0) {
    return (
      <div 
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {contentParts.map((part, index) => (
        <React.Fragment key={index}>
          <div dangerouslySetInnerHTML={{ __html: part }} />
          {index < contentParts.length - 1 && (
            <InArticleAd placement="article_middle" className="my-6 not-prose" />
          )}
        </React.Fragment>
      ))}
      <InArticleAd placement="article_middle" className="mt-8 not-prose" />
    </div>
  );
};

export default InArticleAdInjector;
