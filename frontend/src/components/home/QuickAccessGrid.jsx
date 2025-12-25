import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Cpu, Activity, Users, Trophy, Star, BookOpen, ArrowRight 
} from 'lucide-react';
import { useStaggerReveal } from '../../hooks/useScrollReveal';
import './QuickAccessGrid.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const cardConfigs = [
  {
    id: 'builder',
    icon: Cpu,
    title: 'Собрать ПК',
    defaultPreview: 'AI поможет подобрать совместимые комплектующие',
    badge: 'AI-помощник',
    link: '/assembly',
    dataKey: null
  },
  {
    id: 'feed',
    icon: Activity,
    title: 'Лента сообщества',
    defaultPreview: 'Обсуждения, сборки, вопросы энтузиастов',
    badge: 'LIVE',
    badgeLive: true,
    link: '/feed',
    dataKey: 'feed'
  },
  {
    id: 'groupbuy',
    icon: Users,
    title: 'Совместные покупки',
    defaultPreview: 'Скидки до 40% при групповом заказе',
    badge: 'Экономь',
    link: '/groupbuy',
    dataKey: 'groupBuy'
  },
  {
    id: 'rating',
    icon: Trophy,
    title: 'Рейтинг',
    defaultPreview: 'TOP пользователей по XP и активности',
    link: '/rating',
    dataKey: 'rating'
  },
  {
    id: 'creators',
    icon: Star,
    title: 'Контент-мейкеры',
    defaultPreview: 'Популярные авторы и их работы',
    link: '/creators',
    dataKey: null
  },
  {
    id: 'articles',
    icon: BookOpen,
    title: 'Гайды и обзоры',
    defaultPreview: 'Статьи, руководства и сравнения',
    link: '/articles',
    dataKey: 'articles'
  }
];

const QuickAccessGrid = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const gridRef = useStaggerReveal('.quick-access-card', 80);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/homepage/quick-access`);
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error('Failed to fetch quick access data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCardPreview = (card) => {
    if (!data || !card.dataKey) return card.defaultPreview;

    switch (card.dataKey) {
      case 'feed':
        return data.feed?.totalPosts > 0 
          ? `${data.feed.totalPosts}+ активных обсуждений`
          : card.defaultPreview;
      
      case 'rating':
        if (data.rating?.topUsers?.length > 0) {
          const top = data.rating.topUsers[0];
          return `👑 ${top.name}: ${top.xp.toLocaleString()} XP`;
        }
        return card.defaultPreview;
      
      case 'groupBuy':
        return data.groupBuy?.activeDeals > 0
          ? `${data.groupBuy.activeDeals} активных предложений • до -${data.groupBuy.maxDiscount}%`
          : card.defaultPreview;
      
      case 'articles':
        return data.articles?.totalArticles > 0
          ? `${data.articles.totalArticles} статей и гайдов`
          : card.defaultPreview;
      
      default:
        return card.defaultPreview;
    }
  };

  const getBadge = (card) => {
    if (card.dataKey === 'groupBuy' && data?.groupBuy?.activeDeals > 0) {
      return `${data.groupBuy.activeDeals} active`;
    }
    return card.badge;
  };

  return (
    <section className="quick-access-section">
      <div className="quick-access-grid">
        {cardConfigs.map((card, index) => {
          const Icon = card.icon;
          
          return (
            <Link
              key={card.id}
              to={card.link}
              className={`quick-access-card scroll-reveal ${isLoading ? 'quick-access-card--loading' : ''}`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="card-header">
                <div className="card-icon">
                  <Icon size={24} />
                </div>
                {card.badge && (
                  <span className={`card-badge ${card.badgeLive ? 'card-badge--live' : ''}`}>
                    {getBadge(card)}
                  </span>
                )}
              </div>
              
              <h3 className="card-title">{card.title}</h3>
              
              <div className="card-preview">
                {getCardPreview(card)}
              </div>
              
              <div className="card-arrow">
                <ArrowRight size={18} />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default QuickAccessGrid;
