import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { spinPrizes } from '../mockData';

const SpinWheel = ({ onClose, onWin }) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);

  const handleSpin = () => {
    if (spinning) return;
    
    setSpinning(true);
    setResult(null);

    // Random prize selection based on probability
    const random = Math.random();
    let cumulativeProbability = 0;
    let selectedPrize = spinPrizes[0];

    for (const prize of spinPrizes) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        selectedPrize = prize;
        break;
      }
    }

    // Calculate rotation
    const prizeIndex = spinPrizes.findIndex(p => p.id === selectedPrize.id);
    const segmentAngle = 360 / spinPrizes.length;
    const targetRotation = 360 * 5 + (prizeIndex * segmentAngle); // 5 full rotations + target
    
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
        background: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
      onClick={onClose}
    >
      <div
        className="glass-strong"
        style={{
          maxWidth: '500px',
          width: '100%',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '800',
          marginBottom: '1rem'
        }}>
          {language === 'en' ? 'Spin the Wheel!' : 'Крутите колесо!'}
        </h2>
        
        {!result && (
          <p style={{
            opacity: 0.7,
            marginBottom: '2rem',
            fontSize: '0.875rem'
          }}>
            {language === 'en' ? 'Try your luck once per day!' : 'Попробуйте удачу раз в день!'}
          </p>
        )}

        {/* Wheel Container */}
        <div style={{
          position: 'relative',
          width: '300px',
          height: '300px',
          margin: '0 auto 2rem'
        }}>
          {/* Pointer */}
          <div style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '15px solid transparent',
            borderRight: '15px solid transparent',
            borderTop: '25px solid #F44336',
            zIndex: 10,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }} />

          {/* Wheel */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'relative',
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
          >
            {spinPrizes.map((prize, index) => {
              const segmentAngle = 360 / spinPrizes.length;
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
                    transform: `rotate(${rotation}deg) skewY(${90 - segmentAngle}deg)`,
                    background: prize.color,
                    borderRight: '2px solid rgba(255, 255, 255, 0.2)'
                  }}
                />
              );
            })}

            {/* Center circle */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: theme === 'dark' ? '#1a1a1a' : '#fff',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              zIndex: 5
            }}>
              🎰
            </div>

            {/* Prize labels */}
            {spinPrizes.map((prize, index) => {
              const segmentAngle = 360 / spinPrizes.length;
              const rotation = index * segmentAngle + segmentAngle / 2;
              
              return (
                <div
                  key={`label-${prize.id}`}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${rotation}deg) translateY(-100px)`,
                    transformOrigin: '0 0',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: '#fff',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {language === 'en' ? prize.name : prize.nameRu}
                </div>
              );
            })}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="glass" style={{
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1rem',
            animation: 'fadeIn 0.5s ease-in'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
              🎉
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '0.5rem'
            }}>
              {language === 'en' ? 'You Won!' : 'Вы выиграли!'}
            </h3>
            <p style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: result.color
            }}>
              {language === 'en' ? result.name : result.nameRu}
            </p>
          </div>
        )}

        {/* Spin Button */}
        <button
          onClick={result ? onClose : handleSpin}
          disabled={spinning}
          className="lvl-button-permanent"
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1rem',
            opacity: spinning ? 0.5 : 1,
            cursor: spinning ? 'not-allowed' : 'pointer'
          }}
        >
          {result 
            ? (language === 'en' ? 'Close' : 'Закрыть')
            : spinning 
              ? (language === 'en' ? 'Spinning...' : 'Крутится...')
              : (language === 'en' ? 'SPIN!' : 'КРУТИТЬ!')
          }
        </button>
      </div>
    </div>
  );
};

export default SpinWheel;
