import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Star, Heart, MessageCircle, RefreshCw, Share2,
  ArrowLeft, ChevronLeft, ChevronRight, ImageIcon, Shield
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from './constants';
import { formatPrice, getConditionLabel, getImageUrl } from './utils';
import '../../styles/glassmorphism.css';

const SwapDetailPage = ({ id }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isMinimalMod = theme === 'minimal-mod';
  
  useEffect(() => {
    fetch(`${API_URL}/api/swap/listings/${id}`)
      .then(res => res.json())
      .then(data => { setListing(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);
  
  if (loading) {
    return (
      <div className="dark-bg min-h-screen flex items-center justify-center" style={{ paddingTop: '80px' }}>
        <div className="w-8 h-8 border-2 border-current/20 border-t-current/60 rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!listing) {
    return (
      <div className="dark-bg min-h-screen flex flex-col items-center justify-center" style={{ paddingTop: '80px' }}>
        <p className="opacity-60">{t('swap.listingNotFound')}</p>
        <button onClick={() => navigate('/glassy-swap')} className="mt-4 text-sm" style={{ color: '#8b5cf6' }}>
          ← {t('swap.back')}
        </button>
      </div>
    );
  }
  
  const images = listing.images || [];
  
  return (
    <div className="dark-bg min-h-screen" style={{ paddingTop: '80px' }}>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/glassy-swap')}
          className="flex items-center gap-2 mb-6 text-sm transition-all opacity-60 hover:opacity-100"
        >
          <ArrowLeft size={18} />
          {t('swap.back')}
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div>
            <div 
              className="relative aspect-square mb-3 overflow-hidden glass"
              style={{ borderRadius: isMinimalMod ? '0' : '16px' }}
            >
              {images.length > 0 ? (
                <img
                  src={getImageUrl(images[currentImageIndex]?.url)}
                  alt={listing.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={48} className="opacity-10" />
                </div>
              )}
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(i => i > 0 ? i - 1 : images.length - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center glass"
                    style={{ borderRadius: isMinimalMod ? '0' : '50%' }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(i => i < images.length - 1 ? i + 1 : 0)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center glass"
                    style={{ borderRadius: isMinimalMod ? '0' : '50%' }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className="w-16 h-16 flex-shrink-0 overflow-hidden transition-all"
                    style={{
                      borderRadius: isMinimalMod ? '0' : '8px',
                      border: currentImageIndex === i ? '2px solid rgba(139,92,246,0.5)' : '2px solid transparent',
                      opacity: currentImageIndex === i ? 1 : 0.5
                    }}
                  >
                    <img src={getImageUrl(img.url)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Details */}
          <div>
            <div className="text-3xl font-bold mb-2">{formatPrice(listing.price)}</div>
            <h1 className="text-xl font-medium mb-4 opacity-90">{listing.title}</h1>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="glass px-3 py-1 text-sm" style={{ borderRadius: isMinimalMod ? '0' : '6px' }}>
                {getConditionLabel(listing.condition, t)}
              </span>
              {listing.accepts_trade && (
                <span className="glass px-3 py-1 text-sm flex items-center gap-1" style={{ borderRadius: isMinimalMod ? '0' : '6px' }}>
                  <RefreshCw size={12} /> {t('swap.trade')}
                </span>
              )}
              <span className="glass px-3 py-1 text-sm flex items-center gap-1" style={{ borderRadius: isMinimalMod ? '0' : '6px' }}>
                <MapPin size={12} /> {listing.location}
              </span>
            </div>
            
            {/* Seller */}
            <div className="glass p-4 mb-6" style={{ borderRadius: isMinimalMod ? '0' : '12px' }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 flex items-center justify-center text-lg font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', borderRadius: isMinimalMod ? '0' : '50%' }}
                >
                  {listing.seller_username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{listing.seller_username || 'User'}</span>
                    {listing.seller_verified && <Shield size={14} className="text-blue-500" />}
                  </div>
                  <div className="flex items-center gap-2 text-sm opacity-50">
                    {listing.seller_rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star size={12} className="fill-yellow-500 text-yellow-500" />
                        {listing.seller_rating?.toFixed(1)}
                      </span>
                    )}
                    <span>• {listing.seller_deals_count || 0} {t('swap.deals')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2 opacity-50">{t('swap.description')}</h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap opacity-80">{listing.description}</p>
            </div>
            
            {/* Trade Preferences */}
            {listing.trade_preferences && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2 opacity-50">{t('swap.tradePreferences')}</h3>
                <p className="text-sm opacity-70">{listing.trade_preferences}</p>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openGlassyChat', { detail: { tab: 'messages' } }))}
                className="flex-1 glass flex items-center justify-center gap-2 py-3 font-medium transition-all hover:bg-white/10"
                style={{ borderRadius: isMinimalMod ? '0' : '12px' }}
              >
                <MessageCircle size={18} />
                {t('swap.message')}
              </button>
              
              {listing.accepts_trade && (
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.2))',
                    border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: isMinimalMod ? '0' : '12px',
                    color: '#a78bfa'
                  }}
                >
                  <RefreshCw size={18} />
                  {t('swap.trade')}
                </button>
              )}
              
              <button className="glass w-12 h-12 flex items-center justify-center transition-all hover:bg-white/10" style={{ borderRadius: isMinimalMod ? '0' : '12px' }}>
                <Heart size={18} />
              </button>
              
              <button className="glass w-12 h-12 flex items-center justify-center transition-all hover:bg-white/10" style={{ borderRadius: isMinimalMod ? '0' : '12px' }}>
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapDetailPage;
