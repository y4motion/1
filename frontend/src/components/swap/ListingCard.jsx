import React, { useState } from 'react';
import { Star, Eye, MessageCircle } from 'lucide-react';
import { getImageUrl, getConditionLabel, getTimeAgo } from './utils';

const ListingCard = ({ listing, isMinimalMod, t, formatPrice, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const primaryImage = listing.images?.find(img => img.is_primary)?.url || listing.images?.[0]?.url;
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="mb-4 break-inside-avoid cursor-pointer transition-all duration-300 glass"
      style={{
        borderRadius: isMinimalMod ? '0' : '12px',
        overflow: 'hidden',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={getImageUrl(primaryImage)}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: isHovered ? 'scale(1.03)' : 'scale(1)' }}
        />
        
        {/* Hover Overlay */}
        <div 
          className="absolute inset-0 flex items-center justify-center gap-3 transition-opacity duration-300"
          style={{ background: 'rgba(0,0,0,0.5)', opacity: isHovered ? 1 : 0 }}
        >
          <button className="px-4 py-2 text-sm font-medium text-white bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            {t('swap.view')}
          </button>
          <button 
            className="px-4 py-2 text-sm font-medium text-white bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <MessageCircle size={16} />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3">
        <div className="text-lg font-semibold mb-1">{formatPrice(listing.price)}</div>
        <h3 className="text-sm mb-2 line-clamp-2 opacity-70">{listing.title}</h3>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="text-xs opacity-35">#{getConditionLabel(listing.condition, t).toLowerCase().replace(' ', '_')}</span>
          {listing.accepts_trade && <span className="text-xs opacity-35">#trade</span>}
          <span className="text-xs opacity-35">#{listing.location?.toLowerCase()}</span>
          {listing.seller_verified && <span className="text-xs opacity-35">#verified</span>}
        </div>
        
        {/* Seller + Stats */}
        <div className="flex items-center justify-between text-xs opacity-40">
          <div className="flex items-center gap-1">
            <span>{listing.seller_username || 'User'}</span>
            {listing.seller_rating > 0 && (
              <>
                <Star size={10} className="fill-yellow-500 text-yellow-500" />
                <span>{listing.seller_rating?.toFixed(1)}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5"><Eye size={10} /> {listing.views}</span>
            <span>{getTimeAgo(listing.created_at, t)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
