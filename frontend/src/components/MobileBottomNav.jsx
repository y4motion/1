import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, MessageCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Проверка мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Скрытие при скролле вниз, показ при скролле вверх
  useEffect(() => {
    if (!isMobile) return;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMobile]);

  // Не рендерим на десктопе
  if (!isMobile) return null;

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const navItems = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/marketplace', icon: ShoppingBag, label: 'Магазин' },
    { path: '/cart', icon: ShoppingCart, label: 'Корзина', badge: cartCount },
    { path: '/chat', icon: MessageCircle, label: 'Чат' }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Spacer */}
      <div style={{ height: '70px' }} />
      
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0.6rem 0',
        paddingBottom: 'calc(0.6rem + env(safe-area-inset-bottom, 0px))',
        zIndex: 1000,
        transition: 'transform 0.3s ease',
        transform: isVisible ? 'translateY(0)' : 'translateY(100%)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.4rem 1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <Icon 
                    size={22}
                    strokeWidth={active ? 2 : 1.5}
                    style={{
                      color: active ? '#fff' : 'rgba(255, 255, 255, 0.4)',
                      transition: 'all 0.2s ease',
                      filter: active ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none'
                    }}
                  />
                  {item.badge > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-8px',
                      background: '#ef4444',
                      color: 'white',
                      fontSize: '0.6rem',
                      fontWeight: '600',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  fontFamily: '"SF Mono", Monaco, monospace',
                  color: active ? '#fff' : 'rgba(255, 255, 255, 0.4)',
                  fontWeight: active ? '500' : '400',
                  letterSpacing: '0.02em',
                  transition: 'all 0.2s ease',
                  textShadow: active ? '0 0 10px rgba(255,255,255,0.3)' : 'none'
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
