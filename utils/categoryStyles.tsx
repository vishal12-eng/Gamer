import { Category } from '../types';

export interface CategoryStyle {
  bg: string;
  text: string;
}

const categoryStyles: Record<Category, CategoryStyle> = {
  Technology: { bg: 'bg-sky-500/20', text: 'text-sky-300' },
  AI: { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-300' },
  Business: { bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
  Global: { bg: 'bg-amber-500/20', text: 'text-amber-300' },
  Product: { bg: 'bg-rose-500/20', text: 'text-rose-300' },
  Entertainment: { bg: 'bg-indigo-500/20', text: 'text-indigo-300' },
  Science: { bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
  India: { bg: 'bg-orange-500/20', text: 'text-orange-300' },
  US: { bg: 'bg-red-500/20', text: 'text-red-300' },
};

export const getCategoryStyle = (category: Category): CategoryStyle => {
  return categoryStyles[category] || categoryStyles.Technology;
};
