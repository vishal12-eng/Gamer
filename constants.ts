
import { Category } from './types';

export const CATEGORIES: Category[] = ['Technology', 'AI', 'Business', 'Global', 'Product', 'Entertainment', 'Science', 'India', 'US'];

export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'For You', path: '/foryou' },
  ...CATEGORIES.map(cat => ({ name: cat, path: `/category/${cat.toLowerCase()}` })),
  { name: 'Bookmarks', path: '/bookmarks' }
];
