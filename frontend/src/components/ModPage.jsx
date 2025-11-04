import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const ModPage = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '80px',
      background: theme === 'dark' ? '#0a0a0a' : '#ffffff',
      color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          marginBottom: '1rem',
          letterSpacing: '1px'
        }}>
          MOD
        </h1>
        <p style={{
          fontSize: '1.125rem',
          opacity: 0.7
        }}>
          {language === 'ru' 
            ? 'Раздел модификаций и кастомизации находится в разработке'
            : 'Modifications and customization section coming soon'}
        </p>
      </div>
    </div>
  );
};

export default ModPage;
