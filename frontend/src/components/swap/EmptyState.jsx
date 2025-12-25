import React from 'react';
import { Package } from 'lucide-react';

const EmptyState = ({ t, isMinimalMod, onCreate }) => (
  <div className="text-center py-20">
    <div 
      className="w-20 h-20 mx-auto mb-6 flex items-center justify-center glass"
      style={{ borderRadius: isMinimalMod ? '0' : '20px' }}
    >
      <Package size={32} className="opacity-20" />
    </div>
    <h3 className="text-lg font-medium mb-2">{t('swap.nothingYet')}</h3>
    <p className="text-sm mb-6 opacity-50">{t('swap.beFirst')}</p>
    <button
      onClick={onCreate}
      className="glass px-5 py-2.5 text-sm font-medium transition-all hover:bg-white/10"
      style={{ borderRadius: isMinimalMod ? '0' : '10px' }}
    >
      {t('swap.createListing')}
    </button>
  </div>
);

export default EmptyState;
