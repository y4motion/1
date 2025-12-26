import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ 
  title = 'Что-то пошло не так',
  message = 'Не удалось загрузить данные',
  onRetry 
}) {
  return (
    <div style={{
      padding: '4rem 2rem',
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.6)'
    }}>
      <AlertCircle size={48} style={{ 
        marginBottom: '1rem', 
        color: 'rgba(255, 100, 100, 0.6)' 
      }} />
      
      <h3 style={{ 
        fontSize: '1.25rem', 
        fontWeight: 600, 
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: '0.5rem'
      }}>
        {title}
      </h3>
      
      <p style={{ 
        fontSize: '0.9375rem', 
        marginBottom: '1.5rem' 
      }}>
        {message}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '0.9375rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.05)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <RefreshCw size={18} />
          Попробовать снова
        </button>
      )}
    </div>
  );
}
