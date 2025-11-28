import React from 'react';
import { Category } from '../types';

import AiIcon from '../components/icons/AiIcon';
import TechnologyIcon from '../components/icons/TechnologyIcon';
import BusinessIcon from '../components/icons/BusinessIcon';
import GlobalIcon from '../components/icons/GlobalIcon';
import GadgetsIcon from '../components/icons/GadgetsIcon';
import EntertainmentIcon from '../components/icons/EntertainmentIcon';
import ScienceIcon from '../components/icons/ScienceIcon';
import IndiaIcon from '../components/icons/IndiaIcon';
import USIcon from '../components/icons/USIcon';

// Note: 'Product' category uses 'GadgetsIcon'
const categoryIconMap: Record<Category, React.FC<{ className?: string }>> = {
  AI: AiIcon,
  Technology: TechnologyIcon,
  Business: BusinessIcon,
  Global: GlobalIcon,
  Product: GadgetsIcon,
  Entertainment: EntertainmentIcon,
  Science: ScienceIcon,
  India: IndiaIcon,
  US: USIcon,
};

// FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
export const getCategoryIcon = (category: Category, className?: string): React.ReactElement | null => {
  const IconComponent = categoryIconMap[category];
  if (!IconComponent) {
    return null;
  }
  return <IconComponent className={className} />;
};
