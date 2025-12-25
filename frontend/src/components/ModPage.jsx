import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Wrench, Sparkles, Palette, Cpu, Shield, Zap, User, Clock, TrendingUp } from 'lucide-react';

const ModPage = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // AI Greeting state
  const [greetingText, setGreetingText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showGreeting, setShowGreeting] = useState(true);

  // Generate smart AI greeting based on user context
  const generateSmartGreeting = useCallback(() => {
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    const userName = user?.username || user?.name || null;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Get user context from localStorage
    const lastVisit = localStorage.getItem('modPageLastVisit');
    const visitCount = parseInt(localStorage.getItem('modPageVisitCount') || '0') + 1;
    const lastService = localStorage.getItem('lastViewedService');
    const userInterests = JSON.parse(localStorage.getItem('userModInterests') || '[]');
    
    // Save visit
    localStorage.setItem('modPageLastVisit', Date.now().toString());
    localStorage.setItem('modPageVisitCount', visitCount.toString());
    
    // Time-based greetings
    const getTimeGreeting = () => {
      if (hour < 6) return language === 'ru' ? 'Ночной сёрфинг?' : 'Late night browsing?';
      if (hour < 12) return language === 'ru' ? 'Доброе утро' : 'Good morning';
      if (hour < 18) return language === 'ru' ? 'Добрый день' : 'Good afternoon';
      if (hour < 22) return language === 'ru' ? 'Добрый вечер' : 'Good evening';
      return language === 'ru' ? 'Поздний вечер' : 'Late evening';
    };

    // Build personalized greeting
    let greeting = '';
    
    if (isAuthenticated && userName) {
      // Authenticated user greeting
      if (visitCount === 1) {
        greeting = language === 'ru' 
          ? `${getTimeGreeting()}, ${userName}! Добро пожаловать в MOD HUB+. Я помогу подобрать идеальные модификации для твоего ПК.`
          : `${getTimeGreeting()}, ${userName}! Welcome to MOD HUB+. I'll help you find perfect mods for your PC.`;
      } else if (visitCount < 5) {
        greeting = language === 'ru'
          ? `${getTimeGreeting()}, ${userName}! Рад видеть тебя снова. Это твой ${visitCount}-й визит в MOD HUB+.`
          : `${getTimeGreeting()}, ${userName}! Great to see you again. This is your ${visitCount}th visit to MOD HUB+.`;
      } else {
        // Returning user with history
        if (lastService) {
          greeting = language === 'ru'
            ? `${getTimeGreeting()}, ${userName}! В прошлый раз ты смотрел "${lastService}". Хочешь продолжить?`
            : `${getTimeGreeting()}, ${userName}! Last time you checked "${lastService}". Want to continue?`;
        } else if (userInterests.length > 0) {
          greeting = language === 'ru'
            ? `${getTimeGreeting()}, ${userName}! Вижу тебя интересует ${userInterests[0]}. У нас есть новые предложения!`
            : `${getTimeGreeting()}, ${userName}! I see you're interested in ${userInterests[0]}. We have new offers!`;
        } else {
          greeting = language === 'ru'
            ? `${getTimeGreeting()}, ${userName}! Постоянный клиент MOD HUB+ — это приятно. Чем могу помочь сегодня?`
            : `${getTimeGreeting()}, ${userName}! A regular MOD HUB+ customer — nice to see you. How can I help today?`;
        }
      }
      
      // Weekend bonus
      if (isWeekend) {
        greeting += language === 'ru' 
          ? ' 🎉 В выходные скидка 10% на все услуги!'
          : ' 🎉 Weekend special: 10% off all services!';
      }
    } else {
      // Guest greeting
      if (visitCount === 1) {
        greeting = language === 'ru'
          ? `${getTimeGreeting()}! Добро пожаловать в MOD HUB+. Здесь ты найдёшь лучшие модификации для своего ПК. Авторизуйся для персональных рекомендаций.`
          : `${getTimeGreeting()}! Welcome to MOD HUB+. Find the best mods for your PC here. Sign in for personalized recommendations.`;
      } else {
        greeting = language === 'ru'
          ? `${getTimeGreeting()}! Снова в MOD HUB+. Авторизуйся, чтобы я мог запомнить твои предпочтения и предложить лучшие решения.`
          : `${getTimeGreeting()}! Back at MOD HUB+. Sign in so I can remember your preferences and suggest the best solutions.`;
      }
    }
    
    return greeting;
  }, [user, isAuthenticated, language]);

  // Typewriter effect for greeting
  useEffect(() => {
    const fullGreeting = generateSmartGreeting();
    let index = 0;
    setGreetingText('');
    setIsTyping(true);
    
    const typeChar = () => {
      if (index < fullGreeting.length) {
        setGreetingText(fullGreeting.slice(0, index + 1));
        index++;
        setTimeout(typeChar, 30); // Fast typing
      } else {
        setIsTyping(false);
      }
    };
    
    const startDelay = setTimeout(typeChar, 500);
    return () => clearTimeout(startDelay);
  }, [generateSmartGreeting]);

  // Track service views
  const trackServiceView = (serviceName) => {
    localStorage.setItem('lastViewedService', serviceName);
    const interests = JSON.parse(localStorage.getItem('userModInterests') || '[]');
    if (!interests.includes(serviceName)) {
      interests.unshift(serviceName);
      localStorage.setItem('userModInterests', JSON.stringify(interests.slice(0, 5)));
    }
  };

  const modCategories = [
    { id: 'all', name: language === 'ru' ? 'Все' : 'All', icon: Sparkles },
    { id: 'aesthetic', name: language === 'ru' ? 'Эстетические' : 'Aesthetic', icon: Palette },
    { id: 'performance', name: language === 'ru' ? 'Производительность' : 'Performance', icon: Zap },
    { id: 'cooling', name: language === 'ru' ? 'Охлаждение' : 'Cooling', icon: Cpu },
    { id: 'protection', name: language === 'ru' ? 'Защита' : 'Protection', icon: Shield },
  ];

  const modServices = [
    {
      id: 'rgb-custom',
      name: language === 'ru' ? 'Кастомная RGB подсветка' : 'Custom RGB Lighting',
      category: 'aesthetic',
      price: 149,
      duration: language === 'ru' ? '2-3 часа' : '2-3 hours',
      image: '💡',
      description: language === 'ru'
        ? 'Установка адресных RGB лент, синхронизация с материнской платой'
        : 'Install addressable RGB strips, sync with motherboard',
    },
    {
      id: 'watercooling',
      name: language === 'ru' ? 'Установка водяного охлаждения' : 'Water Cooling Installation',
      category: 'cooling',
      price: 299,
      duration: language === 'ru' ? '4-6 часов' : '4-6 hours',
      image: '💧',
      description: language === 'ru'
        ? 'Кастомная петля водяного охлаждения для CPU и GPU'
        : 'Custom water cooling loop for CPU and GPU',
    },
    {
      id: 'overclock',
      name: language === 'ru' ? 'Профессиональный разгон' : 'Professional Overclocking',
      category: 'performance',
      price: 199,
      duration: language === 'ru' ? '3-4 часа' : '3-4 hours',
      image: '⚡',
      description: language === 'ru'
        ? 'Разгон CPU и GPU с тестированием стабильности'
        : 'CPU and GPU overclocking with stability testing',
    },
    {
      id: 'cable-management',
      name: language === 'ru' ? 'Профессиональная укладка кабелей' : 'Professional Cable Management',
      category: 'aesthetic',
      price: 89,
      duration: language === 'ru' ? '1-2 часа' : '1-2 hours',
      image: '🔌',
      description: language === 'ru'
        ? 'Идеальная укладка кабелей для улучшения airflow'
        : 'Perfect cable management for improved airflow',
    },
    {
      id: 'custom-panel',
      name: language === 'ru' ? 'Кастомная боковая панель' : 'Custom Side Panel',
      category: 'aesthetic',
      price: 249,
      duration: language === 'ru' ? '1 неделя' : '1 week',
      image: '🎨',
      description: language === 'ru'
        ? 'Персонализированная гравировка или принт на панели'
        : 'Personalized engraving or print on side panel',
    },
    {
      id: 'dust-filter',
      name: language === 'ru' ? 'Установка пылевых фильтров' : 'Dust Filter Installation',
      category: 'protection',
      price: 59,
      duration: language === 'ru' ? '30 минут' : '30 minutes',
      image: '🛡️',
      description: language === 'ru'
        ? 'Магнитные пылевые фильтры для всех вентиляторов'
        : 'Magnetic dust filters for all fan intakes',
    },
  ];

  const filteredServices = selectedCategory === 'all'
    ? modServices
    : modServices.filter((service) => service.category === selectedCategory);

  const isDark = theme === 'minimal-mod' || theme === 'dark';

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '80px',
      background: isDark ? '#000000' : '#ffffff',
      color: isDark ? '#f1f1f1' : '#1a1a1a',
    }}>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .ai-greeting-cursor {
          display: inline-block;
          width: 2px;
          height: 1.2em;
          background: ${isDark ? '#fff' : '#000'};
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: blink 1s step-end infinite;
        }
        .greeting-container {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>

      {/* AI Greeting Hero */}
      <div style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        background: isDark
          ? 'linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, transparent 100%)'
          : 'linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, transparent 100%)',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
      }}>
        {/* AI Avatar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)',
          }}>
            <Sparkles size={28} color="#fff" />
          </div>
        </div>

        {/* AI Label */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.375rem 0.875rem',
          background: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
          borderRadius: '20px',
          marginBottom: '1rem',
          border: '1px solid rgba(139, 92, 246, 0.2)',
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            background: '#4ade80',
            borderRadius: '50%',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#8b5cf6',
            letterSpacing: '0.05em',
          }}>
            MOD AI
          </span>
        </div>

        {/* AI Greeting Text */}
        <div className="greeting-container" style={{
          maxWidth: '700px',
          margin: '0 auto',
          minHeight: '80px',
        }}>
          <p style={{
            fontSize: '1.25rem',
            lineHeight: '1.8',
            color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)',
            fontFamily: '"SF Mono", Monaco, monospace',
          }}>
            {greetingText}
            {isTyping && <span className="ai-greeting-cursor" />}
          </p>
        </div>

        {/* User Status Badge */}
        {!isTyping && (
          <div style={{
            marginTop: '1.5rem',
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            animation: 'fadeInUp 0.5s ease-out',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              borderRadius: '8px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            }}>
              <User size={14} style={{ opacity: 0.6 }} />
              <span style={{ fontSize: '0.8125rem', opacity: 0.7 }}>
                {isAuthenticated ? (user?.username || 'User') : (language === 'ru' ? 'Гость' : 'Guest')}
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              borderRadius: '8px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            }}>
              <TrendingUp size={14} style={{ opacity: 0.6 }} />
              <span style={{ fontSize: '0.8125rem', opacity: 0.7 }}>
                {language === 'ru' ? '6 услуг' : '6 services'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {modCategories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  padding: '1rem 1.5rem',
                  borderRadius: '12px',
                  border: isSelected
                    ? '1px solid rgba(139, 92, 246, 0.5)'
                    : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: isSelected ? '#8b5cf6' : 'inherit',
                }}
              >
                <IconComponent size={18} strokeWidth={2} />
                <span style={{ fontWeight: isSelected ? '700' : '500', fontSize: '0.9375rem' }}>
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem',
      }}>
        {filteredServices.map((service, index) => (
          <div
            key={service.id}
            onClick={() => trackServiceView(service.name)}
            style={{
              padding: '1.5rem',
              borderRadius: '12px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              animation: `fadeInUp 0.5s ease-out ${index * 0.1}s backwards`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(139, 92, 246, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>
              {service.image}
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {service.name}
            </h3>
            <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '1rem', minHeight: '40px' }}>
              {service.description}
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '1rem',
              borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                  {language === 'ru' ? 'Цена' : 'Price'}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8b5cf6' }}>
                  ${service.price}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                  {language === 'ru' ? 'Время' : 'Duration'}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{service.duration}</div>
              </div>
            </div>
            <button style={{
              width: '100%',
              marginTop: '1rem',
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: '#8b5cf6',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}>
              {language === 'ru' ? 'ЗАКАЗАТЬ' : 'ORDER SERVICE'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModPage;
