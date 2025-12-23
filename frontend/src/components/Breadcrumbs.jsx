import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Breadcrumbs() {
  const location = useLocation();
  const { theme } = useTheme();
  
  // Build breadcrumb trail from current path
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  // Map route segments to readable names
  const routeNames = {
    'marketplace': 'Marketplace',
    'product': 'Product',
    'category': 'Category',
    'feed': 'Feed',
    'articles': 'Articles',
    'creators': 'Creators',
    'voting': 'Voting',
    'rating': 'Rating',
    'groupbuy': 'Group Buy',
    'cart': 'Cart',
    'checkout': 'Checkout',
    'profile': 'Profile',
    'pc-builder': 'PC Builder',
    'chat': 'Chat',
    'notifications': 'Notifications',
    'mod': 'Mod'
  };
  
  // Don't show breadcrumbs on home page or certain pages
  if (pathnames.length === 0 || location.pathname === '/') return null;
  
  return (
    <nav 
      className="breadcrumbs" 
      aria-label="Breadcrumb"
      style={{
        padding: '1rem 2.5rem',
        marginBottom: '0.5rem'
      }}
    >
      <ol style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        listStyle: 'none',
        margin: 0,
        padding: 0,
        flexWrap: 'wrap'
      }}>
        {/* Home link */}
        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link 
            to="/" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: 'rgba(255, 255, 255, 0.6)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              transition: 'color 0.2s',
              fontFamily: theme === 'minimal-mod' ? 'SF Mono, monospace' : 'inherit'
            }}
            onMouseEnter={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.9)'}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
          >
            <Home size={16} />
            <span>Home</span>
          </Link>
        </li>
        
        {/* Dynamic breadcrumbs */}
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayName = routeNames[value] || value;
          
          return (
            <li key={to} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ChevronRight size={16} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
              {isLast ? (
                <span style={{
                  color: '#a855f7',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  fontFamily: theme === 'minimal-mod' ? 'SF Mono, monospace' : 'inherit'
                }}>
                  {displayName}
                </span>
              ) : (
                <Link 
                  to={to} 
                  style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s',
                    fontFamily: theme === 'minimal-mod' ? 'SF Mono, monospace' : 'inherit'
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.9)'}
                  onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
                >
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
