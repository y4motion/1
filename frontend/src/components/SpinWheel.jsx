import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const SpinWheel = ({ onClose, onWin }) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);

  // Glassmorphism prizes - minimalist and clean
  const prizes = [
    { id: 1, name: '50 Coins', nameRu: '50 монет', value: '50', type: 'coins' },
    { id: 2, name: '100 XP', nameRu: '100 опыта', value: '100', type: 'xp' },
    { id: 3, name: '5% Off', nameRu: '5% скидка', value: '5%', type: 'discount' },
    { id: 4, name: 'Free Ship', nameRu: 'Дост. free', value: '✓', type: 'shipping' },
    { id: 5, name: '200 Coins', nameRu: '200 монет', value: '200', type: 'coins' },
    { id: 6, name: '10% Off', nameRu: '10% скидка', value: '10%', type: 'discount' },
  ];

  const handleSpin = () => {
    if (spinning) return;

    setSpinning(true);
    setResult(null);

    // Random selection
    const selectedPrize = prizes[Math.floor(Math.random() * prizes.length)];

    // Calculate rotation
    const prizeIndex = prizes.findIndex((p) => p.id === selectedPrize.id);
    const segmentAngle = 360 / prizes.length;
    const targetRotation = 360 * 5 + prizeIndex * segmentAngle;

    setRotation(targetRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(selectedPrize);
      if (onWin) onWin(selectedPrize);
    }, 4000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(20px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-strong"
        style={{
          maxWidth: '500px',
          width: '100%',
          borderRadius: '24px',
          padding: '2.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ice crystals effect overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              theme === 'dark'
                ? 'radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(200, 230, 255, 0.03) 0%, transparent 50%)'
                : 'radial-gradient(circle at 20% 30%, rgba(200, 230, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(150, 200, 255, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              letterSpacing: '0.5px',
            }}
          >
            {language === 'en' ? 'Fortune Wheel' : 'Колесо фортуны'}
          </h2>

          {!result && (
            <p
              style={{
                opacity: 0.6,
                marginBottom: '2rem',
                fontSize: '0.875rem',
              }}
            >
              {language === 'en' ? 'Weekly spin available!' : 'Еженедельное вращение доступно!'}
            </p>
          )}

          {/* Minimalist Wheel */}
          <div
            style={{
              position: 'relative',
              width: '320px',
              height: '320px',
              margin: '0 auto 2rem',
            }}
          >
            {/* Pointer */}
            <div
              style={{
                position: 'absolute',
                top: '-5px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)',
                  boxShadow:
                    theme === 'dark'
                      ? '0 0 20px rgba(255, 255, 255, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)'
                      : '0 0 20px rgba(200, 230, 255, 0.6), 0 4px 12px rgba(0, 0, 0, 0.2)',
                }}
              />
            </div>

            {/* Glassmorphism Wheel */}
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                position: 'relative',
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                background:
                  theme === 'dark'
                    ? 'radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
                    : 'radial-gradient(circle at center, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 100%)',
                backdropFilter: 'blur(10px)',
                border:
                  theme === 'dark'
                    ? '2px solid rgba(255, 255, 255, 0.1)'
                    : '2px solid rgba(255, 255, 255, 0.4)',
                boxShadow:
                  theme === 'dark'
                    ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 8px 32px rgba(200, 230, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                overflow: 'hidden',
              }}
            >
              {/* Segments with subtle dividers */}
              {prizes.map((prize, index) => {
                const segmentAngle = 360 / prizes.length;
                const rotation = index * segmentAngle;

                return (
                  <div
                    key={prize.id}
                    style={{
                      position: 'absolute',
                      width: '50%',
                      height: '50%',
                      left: '50%',
                      top: '50%',
                      transformOrigin: '0 0',
                      transform: `rotate(${rotation}deg)`,
                      borderRight:
                        theme === 'dark'
                          ? '1px solid rgba(255, 255, 255, 0.05)'
                          : '1px solid rgba(200, 230, 255, 0.15)',
                    }}
                  />
                );
              })}

              {/* Center glass circle */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background:
                    theme === 'dark'
                      ? 'radial-gradient(circle at center, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)'
                      : 'radial-gradient(circle at center, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.5) 100%)',
                  backdropFilter: 'blur(20px)',
                  border:
                    theme === 'dark'
                      ? '2px solid rgba(255, 255, 255, 0.15)'
                      : '2px solid rgba(255, 255, 255, 0.6)',
                  boxShadow:
                    theme === 'dark'
                      ? '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.1)'
                      : '0 4px 16px rgba(200, 230, 255, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  zIndex: 5,
                }}
              >
                ✨
              </div>

              {/* Prize labels with glassmorphism */}
              {prizes.map((prize, index) => {
                const segmentAngle = 360 / prizes.length;
                const rotation = index * segmentAngle + segmentAngle / 2;

                return (
                  <div
                    key={`label-${prize.id}`}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${rotation}deg) translateY(-120px)`,
                      transformOrigin: '0 0',
                      zIndex: 2,
                    }}
                  >
                    <div
                      style={{
                        background:
                          theme === 'dark'
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(255, 255, 255, 0.5)',
                        backdropFilter: 'blur(10px)',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '8px',
                        border:
                          theme === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1px solid rgba(255, 255, 255, 0.4)',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {prize.value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Result with glassmorphism */}
          {result && (
            <div
              className="glass"
              style={{
                padding: '1.5rem',
                borderRadius: '16px',
                marginBottom: '1rem',
                animation: 'fadeIn 0.5s ease-in',
                background:
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)',
                border:
                  theme === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✨</div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  marginBottom: '0.5rem',
                  background:
                    theme === 'dark'
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(200, 230, 255, 0.8))'
                      : 'linear-gradient(135deg, rgba(100, 150, 255, 0.9), rgba(50, 100, 200, 0.8))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {language === 'en' ? 'You Won!' : 'Вы выиграли!'}
              </h3>
              <p
                style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                }}
              >
                {language === 'en' ? result.name : result.nameRu}
              </p>
            </div>
          )}

          {/* Glassmorphism Button */}
          <button
            onClick={result ? onClose : handleSpin}
            disabled={spinning}
            className="glass"
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: '700',
              borderRadius: '12px',
              border:
                theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.15)'
                  : '1px solid rgba(255, 255, 255, 0.4)',
              background:
                theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(10px)',
              opacity: spinning ? 0.5 : 1,
              cursor: spinning ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow:
                theme === 'dark'
                  ? '0 4px 16px rgba(0, 0, 0, 0.2)'
                  : '0 4px 16px rgba(200, 230, 255, 0.3)',
            }}
            onMouseEnter={(e) => {
              if (!spinning) {
                e.currentTarget.style.background =
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.7)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.5)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {result
              ? language === 'en'
                ? 'Close'
                : 'Закрыть'
              : spinning
                ? language === 'en'
                  ? 'Spinning...'
                  : 'Крутится...'
                : language === 'en'
                  ? 'SPIN!'
                  : 'КРУТИТЬ!'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpinWheel;
