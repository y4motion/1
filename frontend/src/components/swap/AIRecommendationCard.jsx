import React from 'react';
import { Sparkles } from 'lucide-react';

const AIRecommendationCard = ({ t, isMinimalMod }) => (
  <div
    className="mb-4 break-inside-avoid p-4 glass"
    style={{
      borderRadius: isMinimalMod ? '0' : '12px',
      borderColor: 'rgba(139, 92, 246, 0.2)',
      background: 'rgba(139, 92, 246, 0.05)'
    }}
  >
    <div className="flex items-center gap-2 mb-2">
      <Sparkles size={14} style={{ color: '#8b5cf6' }} />
      <span className="text-xs font-medium" style={{ color: '#8b5cf6' }}>CORE AI</span>
    </div>
    <p className="text-sm opacity-60">
      Looking for RTX 50-series upgrade? We found 3 offers for you.
    </p>
    <button className="mt-2 text-xs font-medium" style={{ color: '#8b5cf6' }}>
      Show →
    </button>
  </div>
);

export default AIRecommendationCard;
