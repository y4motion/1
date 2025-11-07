import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();

  const footerLinks = {
    column1: [
      { label_en: 'Best Products', label_ru: 'Лучшие товары', path: '/best-products' },
      { label_en: 'Builds', label_ru: 'Сборки', path: '/builds' },
      { label_en: 'Team', label_ru: 'Команда', path: '/team' },
      { label_en: 'Your Guild', label_ru: 'Ваша гильдия', path: '/join-guild' },
      { label_en: 'Personal Developments', label_ru: 'Личные разработки', path: '/developments' }
    ],
    column2: [
      { label_en: 'Contact Information', label_ru: 'Контактная информация', path: '/contact' },
      { label_en: 'Support', label_ru: 'Поддержка', path: '/support' },
      { label_en: 'Suggest an Idea', label_ru: 'Предложить идею', path: '/suggest' },
      { label_en: 'News', label_ru: 'Новости', path: '/news' },
      { label_en: 'Downloads', label_ru: 'Загрузки', path: '/downloads' }
    ],
    column3: [
      { label_en: 'Privacy Policy', label_ru: 'Политика конфиденциальности', path: '/privacy' },
      { label_en: 'Cookie Policy', label_ru: 'Политика в отношении файлов cookie', path: '/cookies' },
      { label_en: 'Special Features', label_ru: 'Специальные возможности', path: '/accessibility' },
      { label_en: 'Advertising Info', label_ru: 'Информация о рекламе', path: '/ads' }
    ]
  };

  return (
    <footer
      style={{
        background: theme === 'minimal-mod'
          ? 'rgba(0, 0, 0, 0.98)'
          : (theme === 'dark' ? 'rgba(10, 10, 15, 0.95)' : 'rgba(255, 255, 255, 0.95)'),
        backdropFilter: theme === 'minimal-mod' ? 'none' : 'blur(20px)',
        borderTop: theme === 'minimal-mod'
          ? '1px solid rgba(241, 241, 241, 0.12)'
          : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)'),
        padding: '3rem 2rem 2rem',
        marginTop: '4rem',
        fontFamily: theme === 'minimal-mod' ? '"SF Mono", Menlo, Consolas, Monaco, monospace' : 'inherit'
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}
      >
        {/* Column 1 */}
        <div>
          {footerLinks.column1.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              style={{
                display: 'block',
                padding: '0.5rem 0',
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme === 'dark' ? '#fff' : '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
              }}
            >
              {language === 'ru' ? link.label_ru : link.label_en}
            </Link>
          ))}
        </div>

        {/* Column 2 */}
        <div>
          {footerLinks.column2.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              style={{
                display: 'block',
                padding: '0.5rem 0',
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme === 'dark' ? '#fff' : '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
              }}
            >
              {language === 'ru' ? link.label_ru : link.label_en}
            </Link>
          ))}
        </div>

        {/* Column 3 */}
        <div>
          {footerLinks.column3.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              style={{
                display: 'block',
                padding: '0.5rem 0',
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme === 'dark' ? '#fff' : '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
              }}
            >
              {language === 'ru' ? link.label_ru : link.label_en}
            </Link>
          ))}
        </div>

        {/* More info */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{
            fontSize: '0.75rem',
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
          }}>
            {language === 'ru' ? 'Ещё...' : 'More...'}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'
          }}>
            © 2025 X Corp.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
