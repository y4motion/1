import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, MessageCircle, User, Grid } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide
        setIsVisible(false);
      } else {
        // Scrolling up - show
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Home',
      exact: true
    },
    {
      path: '/marketplace',
      icon: Grid,
      label: 'Shop',
      exact: false
    },
    {
      path: '/cart',
      icon: ShoppingBag,
      label: 'Cart',
      badge: 0, // TODO: Connect to cart count
      exact: false
    },
    {
      path: '/chat',
      icon: MessageCircle,
      label: 'Chat',
      badge: 2, // TODO: Connect to unread messages
      exact: false
    },
    {
      path: user ? '/profile' : '/login',
      icon: User,
      label: user ? 'Me' : 'Login',
      exact: false
    }
  ];

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (path) => {
    navigate(path);
    
    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden */}
      <div style={{
        height: '80px',
        display: 'none'
      }} className="mobile-nav-spacer" />
      
      <nav 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'none',
          background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: `1px solid ${theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'}`,
          padding: '0.5rem 0',
          paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))',
          zIndex: 1000,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)'
        }}
        className="mobile-bottom-nav"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  gap: '0.25rem',
                  padding: '0.5rem',
                  background: 'none',
                  border: 'none',
                  color: active ? '#a855f7' : theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  minWidth: '60px',
                  WebkitTapHighlightColor: 'transparent',
                  fontFamily: theme === 'minimal-mod' ? 'SF Mono, monospace' : 'inherit'
                }}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                <div style={{ position: 'relative' }}>
                  <Icon 
                    size={24} 
                    strokeWidth={active ? 2.5 : 2}
                    style={{
                      transform: active ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.2s'
                    }}
                  />
                  {item.badge > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-8px',
                      background: '#ef4444',
                      color: 'white',
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '10px',
                      minWidth: '18px',
                      textAlign: 'center',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: active ? '600' : '500',
                  letterSpacing: '0.3px'
                }}>
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {active && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '4px',
                    height: '4px',
                    background: '#a855f7',
                    borderRadius: '50%'
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile-only styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-nav-spacer {
            display: block !important;
          }
          
          .mobile-bottom-nav {
            display: block !important;
          }
        }
        
        /* Support for iPhone notch */}
        @supports (padding: max(0px)) {
          .mobile-bottom-nav {
            padding-bottom: max(0.5rem, env(safe-area-inset-bottom)) !important;
          }
        }
      `}</style>
    </>
  );
}
