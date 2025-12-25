import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, FileText, Users, ShoppingBag, 
  Rss, Award, Zap, TrendingUp 
} from 'lucide-react';
import './QuickAccessGrid.css';

const quickAccessItems = [
  {
    id: 'marketplace',
    title: 'MARKETPLACE',
    subtitle: 'Премиум товары',
    icon: ShoppingBag,
    link: '/marketplace',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80',
    size: 'large',
    stats: '2,450+ товаров'
  },
  {
    id: 'rating',
    title: 'RATING',
    subtitle: 'Топ пользователей',
    icon: Star,
    link: '/rating',
    image: 'https://images.unsplash.com/photo-1602025882379-e01cf08baa51?w=800&q=80',
    size: 'medium'
  },
  {
    id: 'articles',
    title: 'ARTICLES',
    subtitle: 'Статьи и гайды',
    icon: FileText,
    link: '/articles',
    image: 'https://images.unsplash.com/photo-1626958390898-162d3577f293?w=800&q=80',
    size: 'medium'
  },
  {
    id: 'feed',
    title: 'FEED',
    subtitle: 'Лента сообщества',
    icon: Rss,
    link: '/feed',
    image: 'https://images.unsplash.com/photo-1615031465602-20f3ff3ca279?w=800&q=80',
    size: 'large',
    stats: 'Обновляется live'
  },
  {
    id: 'creators',
    title: 'CREATORS',
    subtitle: 'Авторы контента',
    icon: Users,
    link: '/creators',
    image: 'https://images.unsplash.com/photo-1618586810102-aaa7049200c0?w=800&q=80',
    size: 'medium'
  },
  {
    id: 'groupbuy',
    title: 'GROUP BUY',
    subtitle: 'Совместные покупки',
    icon: Award,
    link: '/groupbuy',
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=800',
    size: 'medium',
    badge: 'NEW'
  }
];

const QuickAccessGrid = () => {
  return (
    <section className="quick-access-grid">
      <div className="quick-access-grid__container">
        <div className="quick-access-grid__masonry">
          {quickAccessItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.link}
                className={`quick-access-card quick-access-card--${item.size}`}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {/* Background Image */}
                <div className="quick-access-card__bg">
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <div className="quick-access-card__overlay" />
                </div>
                
                {/* Content */}
                <div className="quick-access-card__content">
                  <div className="quick-access-card__icon">
                    <Icon size={20} />
                  </div>
                  
                  <div className="quick-access-card__text">
                    <h3 className="quick-access-card__title">{item.title}</h3>
                    <p className="quick-access-card__subtitle">{item.subtitle}</p>
                  </div>
                  
                  {item.stats && (
                    <span className="quick-access-card__stats">{item.stats}</span>
                  )}
                  
                  {item.badge && (
                    <span className="quick-access-card__badge">{item.badge}</span>
                  )}
                </div>
                
                {/* Hover glow */}
                <div className="quick-access-card__glow" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickAccessGrid;
