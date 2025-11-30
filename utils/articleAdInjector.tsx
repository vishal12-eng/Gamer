import React from 'react';
import { ArticleInlineAd } from '../components/ads';

export function injectAdsIntoContent(
  htmlContent: string,
  afterParagraph: number = 2
): React.ReactNode[] {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  const allParagraphs = tempDiv.querySelectorAll('p');
  const elements: React.ReactNode[] = [];
  
  allParagraphs.forEach((p, index) => {
    elements.push(
      <p 
        key={`p-${index}`} 
        className="mb-4"
        dangerouslySetInnerHTML={{ __html: p.innerHTML }}
      />
    );
    
    if (index + 1 === afterParagraph) {
      elements.push(<ArticleInlineAd key={`ad-${index}`} />);
    }
  });
  
  return elements;
}

export function splitContentWithAd(
  content: string,
  insertAfterParagraph: number = 2
): { before: string; after: string } {
  const paragraphEndTag = '</p>';
  let count = 0;
  let splitIndex = 0;
  
  for (let i = 0; i < content.length; i++) {
    if (content.substring(i, i + paragraphEndTag.length) === paragraphEndTag) {
      count++;
      if (count === insertAfterParagraph) {
        splitIndex = i + paragraphEndTag.length;
        break;
      }
    }
  }
  
  if (splitIndex === 0) {
    return { before: content, after: '' };
  }
  
  return {
    before: content.substring(0, splitIndex),
    after: content.substring(splitIndex)
  };
}
