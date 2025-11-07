import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Wrench, Sparkles, Palette, Cpu, Shield, Zap } from 'lucide-react';

const ModPage = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  
  const [selectedCategory, setSelectedCategory] = useState('all');

  const modCategories = [
    { 
      id: 'all', 
      name: language === 'ru' ? 'Все' : 'All',
      icon: Sparkles 
    },
    { 
      id: 'aesthetic', 
      name: language === 'ru' ? 'Эстетические' : 'Aesthetic',
      icon: Palette,
      description: language === 'ru' ? 'RGB, кастомные панели, водяное охлаждение' : 'RGB, custom panels, water cooling'
    },
    { 
      id: 'performance', 
      name: language === 'ru' ? 'Производительность' : 'Performance',
      icon: Zap,
      description: language === 'ru' ? 'Разгон, обновление BIOS, оптимизация' : 'Overclocking, BIOS updates, optimization'
    },
    { 
      id: 'cooling', 
      name: language === 'ru' ? 'Охлаждение' : 'Cooling',
      icon: Cpu,
      description: language === 'ru' ? 'Кастомные петли, вентиляторы, термопасты' : 'Custom loops, fans, thermal compounds'
    },
    { 
      id: 'protection', 
      name: language === 'ru' ? 'Защита' : 'Protection',
      icon: Shield,
      description: language === 'ru' ? 'Пылевые фильтры, защита от перенапряжения' : 'Dust filters, surge protection'
    }
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
        : 'Install addressable RGB strips, sync with motherboard'
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
        : 'Custom water cooling loop for CPU and GPU'
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
        : 'CPU and GPU overclocking with stability testing'
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
        : 'Perfect cable management for improved airflow'
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
        : 'Personalized engraving or print on side panel'
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
        : 'Magnetic dust filters for all fan intakes'
    }
  ];

  const filteredServices = selectedCategory === 'all' 
    ? modServices 
    : modServices.filter(service => service.category === selectedCategory);

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '80px',
      background: theme === 'minimal-mod' ? '#000000' : (theme === 'dark' ? '#0a0a0a' : '#ffffff'),
      color: theme === 'minimal-mod' ? '#f1f1f1' : (theme === 'dark' ? '#ffffff' : '#1a1a1a')
    }}>
      {/* Hero Section */}
      <div style={{
        padding: '4rem 2rem 2rem',
        textAlign: 'center',
        background: theme === 'dark' 
          ? 'linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, rgba(10, 10, 10, 0) 100%)'
          : 'linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, rgba(255, 255, 255, 0) 100%)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <Wrench size={48} color="#8b5cf6" strokeWidth={2} />
        </div>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          marginBottom: '1rem',
          letterSpacing: '1px'
        }}>
          {language === 'ru' ? 'MOD HUB+' : 'MOD HUB+'}
        </h1>
        <p style={{
          fontSize: '1.125rem',
          opacity: 0.7,
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          {language === 'ru' 
            ? 'Кастомные модификации и профессиональные услуги для вашего ПК'
            : 'Custom modifications and professional services for your PC'}
        </p>
      </div>

      {/* Category Filter */}
      <div style={{
        maxWidth: '1200px',
        margin: '2rem auto',
        padding: '0 2rem'
      }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto',
          paddingBottom: '1rem'
        }}>
          {modCategories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="glass-subtle"
                style={{
                  padding: '1rem 1.5rem',
                  borderRadius: '12px',
                  border: isSelected 
                    ? '1px solid rgba(139, 92, 246, 0.5)'
                    : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)'),
                  background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: isSelected ? '#8b5cf6' : 'inherit'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = theme === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
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
        gap: '1.5rem'
      }}>
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="glass"
            style={{
              padding: '1.5rem',
              borderRadius: '12px',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = theme === 'dark' 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(0, 0, 0, 0.08)';
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
              borderTop: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)'
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
                <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  {service.duration}
                </div>
              </div>
            </div>
            <button
              style={{
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
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#7c3aed';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#8b5cf6';
              }}
            >
              {language === 'ru' ? 'ЗАКАЗАТЬ' : 'ORDER SERVICE'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModPage;
