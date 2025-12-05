export interface InternalLink {
  text: string;
  url: string;
  category: string;
}

export interface ExternalLink {
  text: string;
  url: string;
  source: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Article {
  slug: string;
  title: string;
  summary: string;
  content: string;
  expandedContent?: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  imageUrl: string;
  heroImage?: string;
  status?: 'published' | 'draft' | 'scheduled' | 'archived';
  seoTitle?: string;
  seoDescription?: string;
  lastModified?: string;
  isExpanded?: boolean;
  wordCount?: number;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  keywords?: string[];
  internalLinks?: InternalLink[];
  externalLinks?: ExternalLink[];
  faq?: FAQItem[];
  viewCount?: number;
}

export type Category = 'Technology' | 'AI' | 'Business' | 'Global' | 'Product' | 'Entertainment' | 'Science' | 'India' | 'US';

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
    snippet?: string;
  };
}

export interface Comment {
  name: string;
  text: string;
  date: string;
}

export interface CategoryInfo {
  name: Category;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  articleCount?: number;
  isActive?: boolean;
}
