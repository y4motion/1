import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Cpu, Activity, Users, Trophy, Star, BookOpen, ArrowRight 
} from 'lucide-react';
import './QuickAccessGrid.css';

const cards = [
  {
    id: 'builder',
    icon: Cpu,
    title: 'Собрать ПК',
    preview: 'AI поможет подобрать совместимые комплектующие',
    badge: 'AI-помощник',
    link: '/assembly'
  },
  {
    id: 'feed',
    icon: Activity,
    title: 'Лента сообщества',
    preview: 'Обсуждения, сборки, вопросы энтузиастов',
    badge: 'LIVE',
    badgeLive: true,
    link: '/feed'
  },
  {
    id: 'groupbuy',
    icon: Users,
    title: 'Совместные покупки',
    preview: 'Скидки до 40% при групповом заказе',
    badge: 'Экономь',
    link: '/groupbuy'
  },
  {
    id: 'rating',
    icon: Trophy,
    title: 'Рейтинг',
    preview: 'TOP пользователей по XP и активности',
    link: '/rating'
  },
  {
    id: 'creators',
    icon: Star,
    title: 'Контент-мейкеры',
    preview: 'Популярные авторы и их работы',
    link: '/creators'
  },
  {
    id: 'articles',
    icon: BookOpen,
    title: 'Гайды и обзоры',
    preview: 'Статьи, руководства и сравнения',
    link: '/articles'
  }
];

const QuickAccessGrid = () => {
  return (
    <section className="quick-access-section">
      <div className="quick-access-grid">
        {cards.map((card, index) => {
          const Icon = card.icon;
          
          return (
            <Link
              key={card.id}
              to={card.link}
              className="quick-access-card"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="card-header">
                <div className="card-icon">
                  <Icon size={24} />
                </div>
                {card.badge && (
                  <span className={`card-badge ${card.badgeLive ? 'card-badge--live' : ''}`}>
                    {card.badge}
                  </span>
                )}
              </div>
              
              <h3 className="card-title">{card.title}</h3>
              
              <div className="card-preview">
                {card.preview}
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
