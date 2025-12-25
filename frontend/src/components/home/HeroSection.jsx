import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mic, Sparkles, Clock, ChevronDown, Menu, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import coreAI from '../../utils/coreAI';

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showMultiMenu, setShowMultiMenu] = useState(false);
  const [activeMultiTool, setActiveMultiTool] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [showHint, setShowHint] = useState(!localStorage.getItem('searchHintShown'));
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  // Typewriter placeholder state
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('');
  
  // Easter egg state
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  
  // Response bubble state (for AI and History)
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleContent, setBubbleContent] = useState({ type: null, data: null });
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  // === TYPING REACTION STATE ===
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  
  // === IDLE ANIMATION STATE ===
  const [idleTime, setIdleTime] = useState(0);
  const [activeIdleAnimation, setActiveIdleAnimation] = useState(null);
  const [idleAnimationPhase, setIdleAnimationPhase] = useState(null);
  const idleTimerRef = useRef(null);
  const konamiCodeRef = useRef([]);
  
  const searchInputRef = useRef(null);
  const multiMenuRef = useRef(null);
  const searchContainerRef = useRef(null);
  const heroRef = useRef(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Particles
  const particles = useMemo(() => 
    [...Array(50)].map((_, i) => ({
      id: i,
      size: 1 + Math.random() * 3,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      fadeDuration: 6 + Math.random() * 8,
      fadeDelay: Math.random() * 10,
      driftDuration: 15 + Math.random() * 25,
      driftDelay: Math.random() * 15,
      driftIndex: Math.floor(Math.random() * 4)
    })), []
  );

  // === IDLE ANIMATIONS CONFIG ===
  const idleAnimations = useMemo(() => [
    { id: 'eye', name: 'The Eye', rarity: 'rare', duration: 4000, emoji: '👁️' },
    { id: 'vibration', name: 'Vibration', rarity: 'common', duration: 1000, emoji: '📳' },
    { id: 'pokeball', name: 'Pokeball', rarity: 'legendary', duration: 5000, emoji: '⚪' },
    { id: 'gravity', name: 'Gravity Drop', rarity: 'uncommon', duration: 4000, emoji: '⬇️' },
    { id: 'spin', name: 'Spin', rarity: 'common', duration: 3000, emoji: '🌀' },
    { id: 'teleport', name: 'Teleport', rarity: 'rare', duration: 3500, emoji: '✨' },
    { id: 'bubble', name: 'Bubble', rarity: 'epic', duration: 4500, emoji: '🫧' },
    { id: 'soundwave', name: 'Sound Wave', rarity: 'uncommon', duration: 2500, emoji: '🔊' }
  ], []);

  const rarityWeights = useMemo(() => ({
    common: 35,
    uncommon: 25,
    rare: 20,
    epic: 15,
    legendary: 5
  }), []);

  // Select random animation based on rarity
  const selectRandomAnimation = useCallback(() => {
    const totalWeight = Object.values(rarityWeights).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    let selectedRarity;
    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      random -= weight;
      if (random <= 0) {
        selectedRarity = rarity;
        break;
      }
    }
    
    const availableAnimations = idleAnimations.filter(
      anim => anim.rarity === selectedRarity
    );
    
    return availableAnimations[Math.floor(Math.random() * availableAnimations.length)];
  }, [idleAnimations, rarityWeights]);

  // Track discovered easter eggs
  const trackEasterEggDiscovery = useCallback((animationId) => {
    const discovered = JSON.parse(localStorage.getItem('easterEggsFound') || '{}');
    discovered[animationId] = (discovered[animationId] || 0) + 1;
    localStorage.setItem('easterEggsFound', JSON.stringify(discovered));
    
    // Check if all 8 discovered - achievement!
    if (Object.keys(discovered).length === 8) {
      console.log('🏆 Achievement Unlocked: Easter Egg Hunter!');
    }
  }, []);

  // Reset idle timer on user interaction
  const resetIdleTimer = useCallback(() => {
    setIdleTime(0);
    setActiveIdleAnimation(null);
    setIdleAnimationPhase(null);
    
    if (idleTimerRef.current) {
      clearInterval(idleTimerRef.current);
    }
    
    // Only start timer if search is not active
    if (!isSearchActive) {
      idleTimerRef.current = setInterval(() => {
        setIdleTime(prev => prev + 1);
      }, 1000);
    }
  }, [isSearchActive]);

  // Trigger all animations (Konami code)
  const triggerAllEasterEggs = useCallback(() => {
    console.log('🎮 KONAMI CODE ACTIVATED! Playing all animations...');
    let index = 0;
    
    const playNext = () => {
      if (index < idleAnimations.length) {
        const anim = idleAnimations[index];
        setActiveIdleAnimation(anim);
        trackEasterEggDiscovery(anim.id);
        
        setTimeout(() => {
          setActiveIdleAnimation(null);
          index++;
          setTimeout(playNext, 500);
        }, anim.duration);
      }
    };
    
    playNext();
  }, [idleAnimations, trackEasterEggDiscovery]);

  // Idle timer effect
  useEffect(() => {
    if (idleTime >= 30 && !activeIdleAnimation && !isSearchActive) {
      // Wait random time (5-15 sec) before animation
      const randomDelay = 5000 + Math.random() * 10000;
      
      const timeout = setTimeout(() => {
        const animation = selectRandomAnimation();
        setActiveIdleAnimation(animation);
        trackEasterEggDiscovery(animation.id);
        
        console.log(`🎭 Easter Egg: ${animation.name} (${animation.rarity}) ${animation.emoji}`);
        
        // Remove animation after duration
        setTimeout(() => {
          setActiveIdleAnimation(null);
          resetIdleTimer();
        }, animation.duration);
      }, randomDelay);
      
      return () => clearTimeout(timeout);
    }
  }, [idleTime, activeIdleAnimation, isSearchActive, selectRandomAnimation, trackEasterEggDiscovery, resetIdleTimer]);

  // Setup idle detection
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      if (!activeIdleAnimation) {
        resetIdleTimer();
      }
    };
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });
    
    // Initial timer
    resetIdleTimer();
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (idleTimerRef.current) {
        clearInterval(idleTimerRef.current);
      }
    };
  }, [resetIdleTimer, activeIdleAnimation]);

  // Konami Code detection
  useEffect(() => {
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    const handleKeyDown = (e) => {
      konamiCodeRef.current.push(e.key);
      if (konamiCodeRef.current.length > 10) {
        konamiCodeRef.current.shift();
      }
      
      if (konamiCodeRef.current.join(',') === konamiSequence.join(',')) {
        triggerAllEasterEggs();
        konamiCodeRef.current = [];
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerAllEasterEggs]);

  // Default placeholder suggestions
  const defaultPlaceholders = useMemo(() => [
    'RTX 5090 — цены и наличие',
    'Сборка до 150k с высоким FPS',
    'Лучший процессор для игр 2025',
    'Совместимость DDR5 с материнкой',
    'Готовая сборка для стриминга',
    'Тихое охлаждение для дома',
    'Ryzen 9 9950X vs Intel i9-14900K',
    'Видеокарта для 4K гейминга',
    'Бюджетный ПК для работы',
    'Материнка с Wi-Fi 7',
    'SSD NVMe 2TB — что выбрать?',
    'Корпус с хорошим airflow',
    'БП 1000W модульный',
    'Монитор 240Hz для CS2',
    'Оперативка для Ryzen — какую?'
  ], []);

  // Dynamic placeholders: user history + popular + defaults
  const [placeholders, setPlaceholders] = useState(defaultPlaceholders);

  // Load user search history and popular queries
  useEffect(() => {
    const loadDynamicPlaceholders = async () => {
      const combined = [];
      
      // 1. User's recent searches (from localStorage)
      const userHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      if (userHistory.length > 0) {
        // Take last 5 unique searches
        const recentSearches = [...new Set(userHistory)].slice(0, 5);
        combined.push(...recentSearches);
      }
      
      // 2. Try to get popular searches from API
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/homepage/data`);
        if (response.ok) {
          const data = await response.json();
          if (data['trending-searches']?.length > 0) {
            const popularTerms = data['trending-searches'].map(t => t.term).slice(0, 5);
            combined.push(...popularTerms);
          }
        }
      } catch (error) {
        console.log('Using default placeholders');
      }
      
      // 3. Add defaults to fill the rest
      combined.push(...defaultPlaceholders);
      
      // Remove duplicates and set
      const unique = [...new Set(combined)];
      setPlaceholders(unique);
    };
    
    loadDynamicPlaceholders();
  }, [defaultPlaceholders]);

  // Save search to history
  const saveSearchToHistory = useCallback((query) => {
    if (!query.trim()) return;
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    // Add to beginning, remove duplicates, keep max 20
    const updated = [query, ...history.filter(h => h !== query)].slice(0, 20);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  }, []);

  // Init
  useEffect(() => {
    coreAI.init(user);
    localStorage.setItem('lastVisit', Date.now().toString());
  }, [user]);

  // Typewriter placeholder effect - fixed cycling
  useEffect(() => {
    if (!isSearchActive || searchQuery || placeholders.length === 0) return;
    
    let charIdx = 0;
    let isActive = true;
    const currentText = placeholders[placeholderIndex % placeholders.length];
    
    // Reset placeholder
    setDisplayedPlaceholder('');
    
    const typeChar = () => {
      if (!isActive) return;
      
      if (charIdx < currentText.length) {
        setDisplayedPlaceholder(currentText.slice(0, charIdx + 1));
        charIdx++;
        setTimeout(typeChar, 70);
      } else {
        // Finished typing, wait then move to next
        setTimeout(() => {
          if (!isActive) return;
          // Move to next placeholder
          setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 2500);
      }
    };
    
    // Start typing after small delay
    setTimeout(typeChar, 300);
    
    return () => { isActive = false; };
  }, [placeholderIndex, isSearchActive, searchQuery, placeholders.length]);

  // Hide hint after timeout
  useEffect(() => {
    if (showHint && !isSearchActive) {
      const timer = setTimeout(() => {
        setShowHint(false);
        localStorage.setItem('searchHintShown', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showHint, isSearchActive]);

  // Close multi menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (multiMenuRef.current && !multiMenuRef.current.contains(e.target)) {
        setShowMultiMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Particle explosion effect
  const triggerParticleExplosion = useCallback((x, y) => {
    const container = heroRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const localX = x - rect.left;
    const localY = y - rect.top;
    
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'reaction-particle';
      
      const angle = (Math.PI * 2 * i) / 15;
      const velocity = 50 + Math.random() * 80;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      
      particle.style.cssText = `
        position: absolute;
        left: ${localX}px;
        top: ${localY}px;
        width: ${2 + Math.random() * 3}px;
        height: ${2 + Math.random() * 3}px;
        background: rgba(255, 255, 255, ${0.5 + Math.random() * 0.5});
        border-radius: 50%;
        pointer-events: none;
        z-index: 100;
        animation: particleExplode 1s ease-out forwards;
        --vx: ${vx}px;
        --vy: ${vy}px;
      `;
      
      container.appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    }
  }, []);

  // Easter egg
  const triggerEasterEgg = useCallback(() => {
    setShowEasterEgg(true);
    triggerParticleExplosion(window.innerWidth / 2, window.innerHeight / 2);
    setTimeout(() => setShowEasterEgg(false), 3000);
  }, [triggerParticleExplosion]);

  const handleSearchActivate = useCallback((e) => {
    triggerParticleExplosion(e.clientX, e.clientY);
    setIsSearchActive(true);
    setShowHint(false);
    localStorage.setItem('searchHintShown', 'true');
    setTimeout(() => searchInputRef.current?.focus(), 400);
  }, [triggerParticleExplosion]);

  const handleSearchFocus = () => setIsSearchFocused(true);

  const handleSearchBlur = () => {
    setTimeout(() => {
      if (!searchQuery && searchContainerRef.current && 
          !searchContainerRef.current.contains(document.activeElement)) {
        setIsSearchFocused(false);
      }
    }, 200);
  };

  // Show search history in bubble
  const showSearchHistory = useCallback(() => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setBubbleContent({ type: 'history', data: history });
    setShowBubble(true);
  }, []);

  // Handle AI query
  const handleAiQuery = useCallback(async (query) => {
    if (!query.trim()) return;
    
    setIsAiThinking(true);
    setBubbleContent({ type: 'ai', data: null });
    setShowBubble(true);
    
    try {
      // Simulate AI response (replace with real API call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse = `Отличный вопрос про "${query}"! Вот что я нашёл:\n\n• Проверьте раздел Marketplace для актуальных цен\n• Посмотрите готовые сборки в разделе Builds\n• Задайте вопрос сообществу для живого обсуждения`;
      
      setBubbleContent({ type: 'ai', data: aiResponse });
    } catch (error) {
      setBubbleContent({ type: 'ai', data: 'Не удалось получить ответ. Попробуйте ещё раз.' });
    } finally {
      setIsAiThinking(false);
    }
  }, []);

  const handleSearch = useCallback((query) => {
    if (!query.trim()) return;
    
    // Easter egg check
    if (query.toLowerCase() === 'sudo make me a sandwich') {
      triggerEasterEgg();
      return;
    }
    
    // Save to search history for future placeholders
    saveSearchToHistory(query);
    
    // If AI mode is active, send to AI instead of navigating
    if (activeMultiTool === 'ai') {
      handleAiQuery(query);
      return;
    }
    
    coreAI.trackAction('search', { query });
    navigate(`/marketplace?search=${encodeURIComponent(query)}`);
  }, [navigate, triggerEasterEgg, saveSearchToHistory, activeMultiTool, handleAiQuery]);

  const handleMultiToolSelect = (tool) => {
    setActiveMultiTool(tool);
    setShowMultiMenu(false);
    
    // Hide bubble when switching tools (except for history)
    if (tool !== 'history') {
      setShowBubble(false);
    }
    
    // Show bubble for history immediately
    if (tool === 'history') {
      showSearchHistory();
    }
  };

  // Execute the selected tool's action
  const executeToolAction = useCallback((tool) => {
    switch (tool) {
      case 'voice':
        startVoiceRecognition();
        break;
      case 'ai':
        // AI mode - will respond when user submits query
        setShowBubble(false);
        searchInputRef.current?.focus();
        break;
      case 'history':
        showSearchHistory();
        break;
      default:
        break;
    }
  }, [showSearchHistory]);

  // Voice recognition
  const startVoiceRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Голосовой ввод не поддерживается в этом браузере');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
    };
    
    recognition.onerror = () => {
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  }, []);

  // Handle main button click
  const handleMultiToolClick = useCallback(() => {
    if (activeMultiTool) {
      // Tool selected - execute its action
      executeToolAction(activeMultiTool);
    } else {
      // No tool selected - show menu
      setShowMultiMenu(prev => !prev);
    }
  }, [activeMultiTool, executeToolAction]);

  // Handle chevron click to open menu
  const handleMenuToggle = useCallback((e) => {
    e.stopPropagation();
    setShowMultiMenu(prev => !prev);
  }, []);

  const multiToolConfig = {
    voice: { icon: Mic, label: 'Голосовой поиск' },
    ai: { icon: Sparkles, label: 'Спросить CORE AI' },
    history: { icon: Clock, label: 'История поиска' }
  };

  // Get current icon - Menu if no tool selected, otherwise the tool icon
  const CurrentIcon = activeMultiTool ? multiToolConfig[activeMultiTool].icon : Menu;

  const quickActions = [
    { text: 'Начать сборку', link: '/assembly' },
    { text: 'Готовые билды', link: '/builds' },
    { text: 'Сообщество', link: '/community' }
  ];

  return (
    <div 
      ref={heroRef}
      className="hero-section"
      style={{ 
        height: '100vh', 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        overflow: 'hidden',
        background: '#000'
      }}
    >
      <style>{heroStyles}</style>

      {/* Video Background */}
      <video
        autoPlay muted loop playsInline
        onLoadedData={() => setVideoLoaded(true)}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: videoLoaded ? 0.4 : 0,
          transition: 'opacity 1s ease', zIndex: 0, filter: 'brightness(0.3) contrast(1.1)'
        }}
      >
        <source src="https://cdn.coverr.co/videos/coverr-typing-on-a-keyboard-in-the-dark-5378/1080p.mp4" type="video/mp4" />
      </video>

      {/* Dark gradient base */}
      <div style={{ 
        position: 'absolute', inset: 0, 
        background: 'radial-gradient(ellipse at center, rgba(8,8,12,0.9) 0%, rgba(0,0,0,1) 100%)', 
        zIndex: 1 
      }} />

      {/* Floating particles - always visible */}
      <div 
        className="particles-container"
        style={{ 
          position: 'absolute', inset: 0, zIndex: 2, 
          overflow: 'hidden', pointerEvents: 'none'
        }}
      >
        {particles.map((p) => (
          <div
            key={p.id}
            className="hero-particle"
            style={{
              position: 'absolute',
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: `rgba(255,255,255,${0.3 + Math.random() * 0.4})`,
              borderRadius: '50%',
              left: `${p.startX}%`,
              top: `${p.startY}%`,
              animation: `drift${p.driftIndex + 1} ${p.driftDuration}s ease-in-out infinite, particleFade ${p.fadeDuration}s ease-in-out infinite`,
              animationDelay: `${p.driftDelay}s, ${p.fadeDelay}s`,
              willChange: 'opacity'
            }}
          />
        ))}
      </div>

      {/* Easter Egg Message */}
      {showEasterEgg && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 1000, padding: '2rem 3rem', background: 'rgba(0,0,0,0.9)',
          border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px',
          animation: 'fadeInScale 0.3s ease-out'
        }}>
          <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '0.5rem' }}>🥪</div>
          <div style={{ 
            color: 'rgba(255,255,255,0.9)', fontSize: '1.25rem', 
            fontFamily: '"SF Mono", monospace', textAlign: 'center'
          }}>
            Okay! Here's your sandwich!
          </div>
        </div>
      )}

      {/* DYNAMIC SEARCH INTERFACE */}
      <div 
        ref={searchContainerRef}
        className="hero-search-container entrance"
          style={{
            position: 'relative', zIndex: 10, width: '100%', maxWidth: '750px',
            padding: '2rem', textAlign: 'center'
          }}
        >
          {/* INITIAL STATE: Search Icon with Idle Animations */}
          {!isSearchActive && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button
                onClick={handleSearchActivate}
                className={`search-icon-initial ${activeIdleAnimation ? `idle-${activeIdleAnimation.id}` : ''}`}
                aria-label="Открыть поиск"
              >
                {/* Render different content based on active idle animation */}
                {!activeIdleAnimation && (
                  <Search size={32} strokeWidth={1.5} />
                )}
                
                {/* THE EYE Animation */}
                {activeIdleAnimation?.id === 'eye' && (
                  <div className="idle-eye-container">
                    <div className="idle-eye">
                      <div className="idle-eye-white" />
                      <div className="idle-eye-pupil" />
                      <div className="idle-eye-lid-top" />
                      <div className="idle-eye-lid-bottom" />
                    </div>
                  </div>
                )}
                
                {/* VIBRATION Animation */}
                {activeIdleAnimation?.id === 'vibration' && (
                  <div className="idle-vibration">
                    <Search size={32} strokeWidth={1.5} />
                  </div>
                )}
                
                {/* POKEBALL Animation */}
                {activeIdleAnimation?.id === 'pokeball' && (
                  <div className="idle-pokeball-container">
                    <div className="idle-pokeball">
                      <div className="pokeball-top" />
                      <div className="pokeball-bottom" />
                      <div className="pokeball-center" />
                      <div className="pokeball-button" />
                    </div>
                    <div className="mew-particles">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="mew-particle" style={{ '--i': i }} />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* GRAVITY DROP Animation */}
                {activeIdleAnimation?.id === 'gravity' && (
                  <div className="idle-gravity">
                    <Search size={32} strokeWidth={1.5} />
                  </div>
                )}
                
                {/* SPIN Animation */}
                {activeIdleAnimation?.id === 'spin' && (
                  <div className="idle-spin">
                    <Search size={32} strokeWidth={1.5} />
                  </div>
                )}
                
                {/* TELEPORT Animation */}
                {activeIdleAnimation?.id === 'teleport' && (
                  <div className="idle-teleport">
                    <Search size={32} strokeWidth={1.5} />
                    <div className="teleport-particles">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="teleport-particle" style={{ '--i': i }} />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* BUBBLE Animation */}
                {activeIdleAnimation?.id === 'bubble' && (
                  <div className="idle-bubble">
                    <div className="bubble-icon">
                      <Search size={32} strokeWidth={1.5} />
                    </div>
                    <div className="bubble-pop-particles">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className="pop-particle" style={{ '--i': i }} />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* SOUNDWAVE Animation */}
                {activeIdleAnimation?.id === 'soundwave' && (
                  <div className="idle-soundwave">
                    <Search size={32} strokeWidth={1.5} />
                    <div className="soundwave-rings">
                      <div className="soundwave-ring" style={{ '--delay': '0s' }} />
                      <div className="soundwave-ring" style={{ '--delay': '0.4s' }} />
                      <div className="soundwave-ring" style={{ '--delay': '0.8s' }} />
                    </div>
                  </div>
                )}
              </button>

              {/* Hint */}
              {showHint && !activeIdleAnimation && (
                <div className="search-hint">
                  Нажми для поиска
                </div>
              )}
              
              {/* Animation rarity badge (only during animation) */}
              {activeIdleAnimation && (
                <div className={`idle-rarity-badge rarity-${activeIdleAnimation.rarity}`}>
                  {activeIdleAnimation.emoji} {activeIdleAnimation.rarity.toUpperCase()}
                </div>
              )}
            </div>
          )}

          {/* ACTIVE STATE: Search Bar + Actions */}
          {isSearchActive && (
            <div className="search-bar-container">
              {/* Search Bar */}
              <div className={`search-bar ${isSearchFocused ? 'focused' : ''}`}>
                {/* Search Icon */}
                <Search size={20} style={{ color: 'rgba(255, 255, 255, 0.4)', flexShrink: 0 }} />

                {/* Input with typewriter placeholder */}
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                    className="search-input"
                    placeholder=""
                  />
                  {!searchQuery && (
                    <div className="typewriter-placeholder">
                      {displayedPlaceholder}
                      <span className="typewriter-cursor">|</span>
                    </div>
                  )}
                </div>

                {/* Multi-Tool Button */}
                <div ref={multiMenuRef} style={{ position: 'relative' }}>
                  <div className="multi-tool-wrapper">
                    {/* Main action button */}
                    <button
                      onClick={handleMultiToolClick}
                      className={`multi-tool-btn ${isListening ? 'listening' : ''}`}
                      title={activeMultiTool ? multiToolConfig[activeMultiTool].label : 'Выбрать инструмент'}
                    >
                      <CurrentIcon size={18} />
                      {activeMultiTool === 'ai' && <span className="ai-indicator" />}
                      {isListening && <span className="listening-indicator" />}
                    </button>
                    
                    {/* Menu toggle button */}
                    <button
                      onClick={handleMenuToggle}
                      className="multi-tool-chevron"
                      title="Выбрать инструмент"
                    >
                      <ChevronDown size={12} />
                    </button>
                  </div>

                  {/* Multi-Tool Menu */}
                  {showMultiMenu && (
                    <div className="multi-tool-menu">
                      {Object.entries(multiToolConfig).map(([key, { icon: Icon, label }]) => (
                        <button
                          key={key}
                          onClick={() => handleMultiToolSelect(key)}
                          className={`multi-tool-option ${activeMultiTool === key ? 'active' : ''}`}
                        >
                          <Icon size={18} />
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className={`quick-actions ${isSearchFocused ? 'visible' : ''}`}>
                {quickActions.map((action, i) => (
                  <a
                    key={i}
                    href={action.link}
                    className="quick-action"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {action.text}
                  </a>
                ))}
              </div>

              {/* Response Bubble - AI responses & History */}
              {showBubble && (
                <div className="response-bubble">
                  {/* AI Response */}
                  {bubbleContent.type === 'ai' && (
                    <div className="bubble-content bubble-ai">
                      <div className="bubble-header">
                        <Sparkles size={16} />
                        <span>CORE AI</span>
                      </div>
                      {isAiThinking ? (
                        <div className="bubble-thinking">
                          <span className="thinking-dot" />
                          <span className="thinking-dot" />
                          <span className="thinking-dot" />
                        </div>
                      ) : (
                        <div className="bubble-text">
                          {bubbleContent.data?.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Search History */}
                  {bubbleContent.type === 'history' && (
                    <div className="bubble-content bubble-history">
                      <div className="bubble-header">
                        <Clock size={16} />
                        <span>История поиска</span>
                      </div>
                      {bubbleContent.data?.length > 0 ? (
                        <div className="history-list">
                          {bubbleContent.data.slice(0, 8).map((query, i) => (
                            <button
                              key={i}
                              className="history-item"
                              onClick={() => {
                                setSearchQuery(query);
                                setShowBubble(false);
                                searchInputRef.current?.focus();
                              }}
                            >
                              <Search size={14} />
                              <span>{query}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="bubble-empty">
                          История пуста. Начни искать!
                        </div>
                      )}
                    </div>
                  )}

                  {/* Close button */}
                  <button 
                    className="bubble-close"
                    onClick={() => setShowBubble(false)}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  );
}

const heroStyles = `
  /* Particles fade in */
  .particles-container {
    animation: particlesFadeIn 1s ease-out forwards;
  }

  @keyframes particlesFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* Search container entrance */
  .hero-search-container.entrance {
    animation: searchEntrance 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes searchEntrance {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Search Icon Initial (Zen State) */
  .search-icon-initial {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    animation: breathe 4s ease-in-out infinite, fadeInScale 0.6s ease-out;
    position: relative;
  }

  .search-icon-initial::before {
    content: '';
    position: absolute;
    inset: -8px;
    background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.6s ease;
    animation: pulseRing 3s ease-in-out infinite;
  }

  .search-icon-initial:hover {
    transform: scale(1.15);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 50px rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.95);
  }

  .search-icon-initial:hover::before {
    opacity: 1;
  }

  .search-icon-initial:active {
    transform: scale(1.05);
  }

  /* Search Hint */
  .search-hint {
    margin-top: 1.5rem;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.4);
    font-family: 'SF Mono', Monaco, monospace;
    letter-spacing: 0.02em;
    animation: fadeIn 0.8s ease-out 1s backwards, pulse 2s ease-in-out infinite;
  }

  /* Search Bar Container */
  .search-bar-container {
    animation: expandSearch 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  /* Search Bar */
  .search-bar {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 1.75rem;
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(32px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden; /* Prevent shine animation from bleeding outside */
  }

  .search-bar::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.6s ease;
    pointer-events: none; /* Don't interfere with clicks */
    border-radius: inherit; /* Match parent border-radius */
  }

  .search-bar.focused {
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 
      0 0 0 1px rgba(255, 255, 255, 0.05),
      0 8px 40px rgba(255, 255, 255, 0.08),
      0 0 80px rgba(255, 255, 255, 0.04);
  }

  .search-bar.focused::before {
    left: 100%;
  }

  /* Search Input */
  .search-input {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    color: rgba(255, 255, 255, 0.95);
    font-size: 1.0625rem;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    letter-spacing: -0.01em;
    font-weight: 400;
  }

  /* Typewriter Placeholder */
  .typewriter-placeholder {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.35);
    font-size: 1.0625rem;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    pointer-events: none;
    white-space: nowrap;
  }

  .typewriter-cursor {
    animation: blink 1s step-end infinite;
    margin-left: 1px;
  }

  /* Multi-Tool Wrapper */
  .multi-tool-wrapper {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  /* Multi-Tool Button */
  .multi-tool-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px 0 0 10px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    flex-shrink: 0;
  }

  .multi-tool-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  }

  .multi-tool-btn:active {
    transform: scale(0.95);
  }

  .multi-tool-btn.listening {
    background: rgba(255, 100, 100, 0.15);
    border-color: rgba(255, 100, 100, 0.3);
    animation: listeningPulse 1.5s ease-in-out infinite;
  }

  /* Chevron button */
  .multi-tool-chevron {
    width: 24px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-left: none;
    border-radius: 0 10px 10px 0;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .multi-tool-chevron:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
  }

  .ai-indicator {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 6px;
    height: 6px;
    background: #4ade80;
    border-radius: 50%;
    animation: pulseGlow 2s ease infinite;
  }

  .listening-indicator {
    position: absolute;
    inset: -3px;
    border: 2px solid rgba(255, 100, 100, 0.5);
    border-radius: 12px;
    animation: listeningRing 1s ease-out infinite;
  }

  /* Multi-Tool Menu */
  .multi-tool-menu {
    position: absolute;
    top: calc(100% + 0.75rem);
    right: 0;
    min-width: 220px;
    background: rgba(8, 8, 12, 0.98);
    backdrop-filter: blur(32px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    padding: 0.5rem;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08);
    animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 9999;
  }

  .multi-tool-option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.875rem 1rem;
    background: transparent;
    border: none;
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9375rem;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    text-align: left;
  }

  .multi-tool-option:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.95);
    transform: translateX(4px);
  }

  .multi-tool-option.active {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 1);
    font-weight: 500;
  }

  /* Quick Actions */
  .quick-actions {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 2rem;
    flex-wrap: wrap;
    opacity: 0;
    transform: translateY(15px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
  }

  .quick-actions.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .quick-action {
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    font-size: 0.9375rem;
    font-family: 'SF Mono', monospace;
    padding: 0.625rem 1.25rem;
    border-radius: 10px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  }

  .quick-action:hover {
    color: rgba(255, 255, 255, 0.95);
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
  }

  /* Response Bubble */
  .response-bubble {
    position: relative;
    margin-top: 1.5rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(32px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    text-align: left;
  }

  .bubble-content {
    max-height: 300px;
    overflow-y: auto;
  }

  .bubble-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .bubble-text {
    font-size: 0.9375rem;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.85);
  }

  .bubble-text p {
    margin: 0 0 0.75rem 0;
  }

  .bubble-text p:last-child {
    margin-bottom: 0;
  }

  .bubble-empty {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.4);
    text-align: center;
    padding: 1rem 0;
  }

  .bubble-close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.875rem;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  .bubble-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  /* Thinking animation */
  .bubble-thinking {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  .thinking-dot {
    width: 8px;
    height: 8px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    animation: thinkingBounce 1.4s ease-in-out infinite;
  }

  .thinking-dot:nth-child(1) { animation-delay: 0s; }
  .thinking-dot:nth-child(2) { animation-delay: 0.2s; }
  .thinking-dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes thinkingBounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
    40% { transform: translateY(-6px); opacity: 1; }
  }

  /* History List */
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .history-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.875rem;
    font-family: 'SF Mono', monospace;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
  }

  .history-item:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateX(4px);
  }

  .history-item svg {
    color: rgba(255, 255, 255, 0.4);
    flex-shrink: 0;
  }

  .history-item span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ANIMATIONS */
  @keyframes breathe {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.08);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 0 35px rgba(255, 255, 255, 0.15);
    }
  }

  @keyframes pulseRing {
    0% { transform: scale(1); opacity: 0; }
    50% { transform: scale(1.4); opacity: 0.3; }
    100% { transform: scale(1.6); opacity: 0; }
  }

  @keyframes expandSearch {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeInScale {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.7; }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 6px rgba(74, 222, 128, 0.4); }
    50% { box-shadow: 0 0 12px rgba(74, 222, 128, 0.8); }
  }

  @keyframes particleFade {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 0.6; }
  }

  @keyframes drift1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(10px, -15px); } }
  @keyframes drift2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-12px, 8px); } }
  @keyframes drift3 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(8px, 12px); } }
  @keyframes drift4 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-10px, -10px); } }

  @keyframes particleExplode {
    0% { transform: translate(0, 0); opacity: 1; }
    100% { transform: translate(var(--vx), var(--vy)); opacity: 0; }
  }

  @keyframes listeningPulse {
    0%, 100% { background: rgba(255, 100, 100, 0.15); }
    50% { background: rgba(255, 100, 100, 0.25); }
  }

  @keyframes listeningRing {
    0% { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(1.3); opacity: 0; }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .search-icon-initial {
      width: 64px;
      height: 64px;
    }

    .search-icon-initial svg {
      width: 24px;
      height: 24px;
    }

    .search-bar {
      padding: 1rem 1.25rem;
    }

    .search-input, .typewriter-placeholder {
      font-size: 0.9375rem;
    }

    .quick-actions {
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .quick-action {
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
    }
  }

  /* ============================================
     IDLE ANIMATIONS - Secret Life of Search Icon
     ============================================ */

  /* Rarity Badge */
  .idle-rarity-badge {
    margin-top: 1rem;
    padding: 0.375rem 0.875rem;
    border-radius: 20px;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    animation: fadeInUp 0.3s ease-out, pulse 1.5s ease-in-out infinite;
  }

  .rarity-common {
    background: rgba(156, 163, 175, 0.2);
    color: #9ca3af;
    border: 1px solid rgba(156, 163, 175, 0.3);
  }

  .rarity-uncommon {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .rarity-rare {
    background: rgba(59, 130, 246, 0.2);
    color: #3b82f6;
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  .rarity-epic {
    background: rgba(168, 85, 247, 0.2);
    color: #a855f7;
    border: 1px solid rgba(168, 85, 247, 0.3);
  }

  .rarity-legendary {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3));
    color: #fbbf24;
    border: 1px solid rgba(251, 191, 36, 0.5);
    animation: fadeInUp 0.3s ease-out, legendaryGlow 1.5s ease-in-out infinite;
  }

  @keyframes legendaryGlow {
    0%, 100% { box-shadow: 0 0 10px rgba(251, 191, 36, 0.3); }
    50% { box-shadow: 0 0 25px rgba(251, 191, 36, 0.6); }
  }

  /* === 1. THE EYE ANIMATION === */
  .idle-eye-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .idle-eye {
    width: 40px;
    height: 40px;
    position: relative;
    animation: eyeAppear 0.3s ease-out;
  }

  @keyframes eyeAppear {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .idle-eye-white {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #fff 0%, #e5e5e5 100%);
    border-radius: 50%;
    box-shadow: inset 0 2px 8px rgba(0,0,0,0.2);
  }

  .idle-eye-pupil {
    position: absolute;
    width: 16px;
    height: 16px;
    background: radial-gradient(circle at 30% 30%, #333, #000);
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: eyeLook 4s ease-in-out forwards;
  }

  @keyframes eyeLook {
    0% { transform: translate(-50%, -50%); }
    15% { transform: translate(calc(-50% - 8px), -50%); }
    30% { transform: translate(calc(-50% + 8px), -50%); }
    45% { transform: translate(-50%, calc(-50% - 6px)); }
    55% { transform: translate(-50%, -50%); }
    /* Blink 1 */
    60% { transform: translate(-50%, -50%); }
    62% { transform: translate(-50%, -50%) scaleY(0.1); }
    64% { transform: translate(-50%, -50%); }
    /* Blink 2 */
    75% { transform: translate(-50%, -50%); }
    77% { transform: translate(-50%, -50%) scaleY(0.1); }
    79% { transform: translate(-50%, -50%); }
    100% { transform: translate(-50%, -50%); }
  }

  .idle-eye-lid-top, .idle-eye-lid-bottom {
    position: absolute;
    left: 0;
    right: 0;
    height: 50%;
    background: rgba(255, 255, 255, 0.03);
    overflow: hidden;
  }

  .idle-eye-lid-top {
    top: 0;
    border-radius: 50% 50% 0 0;
    animation: eyeBlinkTop 4s ease-in-out forwards;
  }

  .idle-eye-lid-bottom {
    bottom: 0;
    border-radius: 0 0 50% 50%;
    animation: eyeBlinkBottom 4s ease-in-out forwards;
  }

  @keyframes eyeBlinkTop {
    0%, 59%, 65%, 74%, 80%, 100% { transform: translateY(-100%); }
    62%, 77% { transform: translateY(0); }
  }

  @keyframes eyeBlinkBottom {
    0%, 59%, 65%, 74%, 80%, 100% { transform: translateY(100%); }
    62%, 77% { transform: translateY(0); }
  }

  /* === 2. VIBRATION ANIMATION === */
  .idle-vibration {
    animation: vibrate 0.5s linear 2;
  }

  @keyframes vibrate {
    0%, 100% { transform: translate(0, 0); }
    10% { transform: translate(-2px, -1px); }
    20% { transform: translate(2px, 1px); }
    30% { transform: translate(-2px, 1px); }
    40% { transform: translate(2px, -1px); }
    50% { transform: translate(-1px, -2px); }
    60% { transform: translate(1px, 2px); }
    70% { transform: translate(-2px, 1px); }
    80% { transform: translate(2px, -1px); }
    90% { transform: translate(-1px, -1px); }
  }

  /* === 3. POKEBALL ANIMATION === */
  .idle-pokeball-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .idle-pokeball {
    width: 44px;
    height: 44px;
    position: relative;
    animation: pokeballShake 5s ease-in-out forwards;
  }

  .pokeball-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
    border-radius: 50% 50% 0 0;
    animation: pokeballOpenTop 5s ease-in-out forwards;
    transform-origin: bottom center;
  }

  .pokeball-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(135deg, #fff 0%, #ccc 100%);
    border-radius: 0 0 50% 50%;
    animation: pokeballOpenBottom 5s ease-in-out forwards;
    transform-origin: top center;
  }

  .pokeball-center {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 4px;
    background: #333;
    transform: translateY(-50%);
  }

  .pokeball-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 14px;
    height: 14px;
    background: #fff;
    border: 3px solid #333;
    border-radius: 50%;
    z-index: 2;
    animation: pokeballButton 5s ease-in-out forwards;
  }

  @keyframes pokeballShake {
    0%, 10% { transform: rotate(0); }
    12% { transform: rotate(-10deg); }
    14% { transform: rotate(10deg); }
    16% { transform: rotate(-10deg); }
    18%, 100% { transform: rotate(0); }
  }

  @keyframes pokeballOpenTop {
    0%, 20% { transform: translateY(0) rotate(0); }
    25% { transform: translateY(-8px) rotate(-20deg); }
    70% { transform: translateY(-8px) rotate(-20deg); }
    80%, 100% { transform: translateY(0) rotate(0); }
  }

  @keyframes pokeballOpenBottom {
    0%, 20% { transform: translateY(0) rotate(0); }
    25% { transform: translateY(4px) rotate(5deg); }
    70% { transform: translateY(4px) rotate(5deg); }
    80%, 100% { transform: translateY(0) rotate(0); }
  }

  @keyframes pokeballButton {
    0%, 20% { box-shadow: none; }
    25% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.8); }
    70% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.9); }
    80%, 100% { box-shadow: none; }
  }

  .mew-particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .mew-particle {
    position: absolute;
    width: 6px;
    height: 6px;
    background: linear-gradient(135deg, #ff69b4, #ff1493);
    border-radius: 50%;
    top: 50%;
    left: 50%;
    opacity: 0;
    animation: mewEscape 5s ease-out forwards;
    animation-delay: calc(var(--i) * 0.05s);
    --angle: calc(var(--i) * 30deg);
  }

  @keyframes mewEscape {
    0%, 25% { 
      opacity: 0;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0);
    }
    30% {
      opacity: 1;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateX(20px);
    }
    60% {
      opacity: 1;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateX(50px);
    }
    75%, 100% {
      opacity: 0;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateX(70px);
    }
  }

  /* === 4. GRAVITY DROP ANIMATION === */
  .idle-gravity {
    animation: gravityDrop 4s ease-in-out forwards;
  }

  @keyframes gravityDrop {
    0% { transform: translateY(0); }
    15% { transform: translateY(150px); }
    20% { transform: translateY(120px); }
    25% { transform: translateY(150px); }
    30% { transform: translateY(140px) translateX(0) rotate(0deg); }
    40% { transform: translateY(150px) translateX(30px) rotate(180deg); }
    50% { transform: translateY(150px) translateX(60px) rotate(360deg); }
    55% { transform: translateY(140px) translateX(60px) rotate(360deg); }
    60% { transform: translateY(150px) translateX(40px) rotate(360deg); }
    70% { transform: translateY(150px) translateX(0px) rotate(360deg); }
    75% { transform: translateY(100px) rotate(360deg); }
    80% { transform: translateY(0) scale(0.9) rotate(360deg); }
    85% { transform: translateY(0) scale(1.1) rotate(360deg); }
    90% { transform: translateY(0) scale(0.95) rotate(360deg); }
    100% { transform: translateY(0) scale(1) rotate(360deg); }
  }

  /* === 5. SPIN ANIMATION === */
  .idle-spin {
    animation: spinFast 3s ease-in-out forwards;
  }

  @keyframes spinFast {
    0% { transform: rotate(0deg); filter: blur(0); }
    10% { transform: rotate(180deg); filter: blur(0); }
    20% { transform: rotate(540deg); filter: blur(1px); }
    40% { transform: rotate(1080deg); filter: blur(3px); }
    60% { transform: rotate(1620deg); filter: blur(2px); }
    80% { transform: rotate(2160deg); filter: blur(1px); }
    90% { transform: rotate(2340deg); filter: blur(0); }
    100% { transform: rotate(2520deg); filter: blur(0); }
  }

  /* === 6. TELEPORT ANIMATION === */
  .idle-teleport {
    position: relative;
    animation: teleportSequence 3.5s ease-in-out forwards;
  }

  @keyframes teleportSequence {
    0% { opacity: 1; transform: translate(0, 0); }
    10% { opacity: 0; transform: translate(0, 0) scale(0.5); }
    20% { opacity: 0; transform: translate(100px, -50px) scale(0.5); }
    30% { opacity: 1; transform: translate(100px, -50px) scale(1.1); }
    35% { transform: translate(100px, -50px) scale(1); }
    40% { transform: translate(100px, -60px); }
    45% { transform: translate(100px, -50px); }
    50% { transform: translate(100px, -55px); }
    55% { opacity: 1; transform: translate(100px, -50px); }
    65% { opacity: 0; transform: translate(100px, -50px) scale(0.5); }
    75% { opacity: 0; transform: translate(0, 0) scale(0.5); }
    85% { opacity: 1; transform: translate(0, 0) scale(1.1); }
    100% { opacity: 1; transform: translate(0, 0) scale(1); }
  }

  .teleport-particles {
    position: absolute;
    inset: -20px;
    pointer-events: none;
  }

  .teleport-particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    top: 50%;
    left: 50%;
    animation: teleportParticle 3.5s ease-out forwards;
    --angle: calc(var(--i) * 45deg);
  }

  @keyframes teleportParticle {
    0%, 5% { 
      opacity: 0;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0);
    }
    10% {
      opacity: 1;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateX(15px);
    }
    20% {
      opacity: 0;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateX(30px);
    }
    60%, 65% { 
      opacity: 0;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0);
    }
    70% {
      opacity: 1;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateX(15px);
    }
    80%, 100% {
      opacity: 0;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateX(30px);
    }
  }

  /* === 7. BUBBLE ANIMATION === */
  .idle-bubble {
    position: relative;
    animation: bubbleFloat 4.5s ease-in-out forwards;
  }

  .bubble-icon {
    animation: bubbleTransform 4.5s ease-in-out forwards;
  }

  @keyframes bubbleFloat {
    0% { transform: translateY(0); }
    20% { transform: translateY(-5px); }
    40% { transform: translateY(-30px); }
    60% { transform: translateY(-60px); }
    70% { transform: translateY(-70px); }
    75% { transform: translateY(-70px) scale(1.2); }
    80% { transform: translateY(-70px) scale(0); }
    85% { transform: translateY(0) scale(0); }
    100% { transform: translateY(0) scale(1); }
  }

  @keyframes bubbleTransform {
    0% { 
      filter: none;
      opacity: 1;
    }
    20% { 
      filter: drop-shadow(0 0 10px rgba(100, 200, 255, 0.5));
      border-radius: 50%;
    }
    40% {
      filter: drop-shadow(0 0 20px rgba(100, 200, 255, 0.7)) 
             drop-shadow(2px 2px 4px rgba(255, 100, 255, 0.3));
    }
    70% {
      filter: drop-shadow(0 0 25px rgba(100, 200, 255, 0.8))
             drop-shadow(-2px -2px 6px rgba(255, 200, 100, 0.4));
      opacity: 0.9;
    }
    78% { opacity: 1; }
    80% { opacity: 0; }
    85% { opacity: 0; }
    100% { opacity: 1; filter: none; }
  }

  .bubble-pop-particles {
    position: absolute;
    inset: -30px;
    pointer-events: none;
  }

  .pop-particle {
    position: absolute;
    width: 5px;
    height: 5px;
    background: linear-gradient(135deg, rgba(100, 200, 255, 0.9), rgba(255, 100, 255, 0.9));
    border-radius: 50%;
    top: 50%;
    left: 50%;
    opacity: 0;
    animation: popParticle 4.5s ease-out forwards;
    --angle: calc(var(--i) * 22.5deg);
    --distance: calc(30px + var(--i) * 5px);
  }

  @keyframes popParticle {
    0%, 75% {
      opacity: 0;
      transform: translate(-50%, calc(-50% - 70px)) rotate(var(--angle)) translateX(0);
    }
    78% {
      opacity: 1;
      transform: translate(-50%, calc(-50% - 70px)) rotate(var(--angle)) translateX(calc(var(--distance) * 0.5));
    }
    90% {
      opacity: 0.5;
      transform: translate(-50%, calc(-50% - 70px)) rotate(var(--angle)) translateX(var(--distance));
    }
    100% {
      opacity: 0;
      transform: translate(-50%, calc(-50% - 70px)) rotate(var(--angle)) translateX(calc(var(--distance) * 1.2));
    }
  }

  /* === 8. SOUNDWAVE ANIMATION === */
  .idle-soundwave {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .idle-soundwave svg {
    animation: soundwavePulse 2.5s ease-in-out forwards;
  }

  @keyframes soundwavePulse {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(0.95); }
    50% { transform: scale(1.05); }
    75% { transform: scale(0.98); }
  }

  .soundwave-rings {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .soundwave-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px;
    height: 40px;
    border: 2px solid rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: soundWaveExpand 2.5s ease-out forwards;
    animation-delay: var(--delay);
    opacity: 0;
  }

  @keyframes soundWaveExpand {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0;
    }
    10% {
      opacity: 0.6;
    }
    100% {
      transform: translate(-50%, -50%) scale(3);
      opacity: 0;
    }
  }

  /* Stop breathing animation during idle animations */
  .search-icon-initial.idle-eye,
  .search-icon-initial.idle-vibration,
  .search-icon-initial.idle-pokeball,
  .search-icon-initial.idle-gravity,
  .search-icon-initial.idle-spin,
  .search-icon-initial.idle-teleport,
  .search-icon-initial.idle-bubble,
  .search-icon-initial.idle-soundwave {
    animation: none !important;
  }
`;
