
export interface Article {
  slug: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  imageUrl: string;
  // New fields for Editor/Admin
  status?: 'published' | 'draft' | 'scheduled';
  seoTitle?: string;
  seoDescription?: string;
  lastModified?: string;
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
