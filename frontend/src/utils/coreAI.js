// Core AI Assistant System for personalized onboarding and continuous assistance

class CoreAI {
  constructor() {
    this.userName = null;
    this.userContext = {};
    this.conversationHistory = [];
  }

  // Initialize AI with user data
  init(user) {
    this.userName = user?.username || 'Гость';
    this.loadUserContext();
    this.loadConversationHistory();
  }

  // Load user context from localStorage and user data
  loadUserContext() {
    try {
      const viewedProducts = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
      const savedBuilds = JSON.parse(localStorage.getItem('savedBuilds') || '[]');
      const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const lastVisit = localStorage.getItem('lastVisit');
      const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');

      this.userContext = {
        viewedProducts,
        savedBuilds,
        searchHistory,
        lastVisit,
        preferences,
        isNewUser: !lastVisit,
        daysSinceLastVisit: lastVisit ? Math.floor((Date.now() - new Date(lastVisit)) / (1000 * 60 * 60 * 24)) : 0
      };

      localStorage.setItem('lastVisit', new Date().toISOString());
    } catch (error) {
      console.error('Failed to load user context:', error);
      this.userContext = { isNewUser: true };
    }
  }

  // Load conversation history
  loadConversationHistory() {
    try {
      this.conversationHistory = JSON.parse(localStorage.getItem('aiConversationHistory') || '[]');
    } catch (error) {
      this.conversationHistory = [];
    }
  }

  // Save conversation
  saveConversation(message, role = 'user') {
    this.conversationHistory.push({
      role,
      message,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('aiConversationHistory', JSON.stringify(this.conversationHistory.slice(-50)));
  }

  // Generate personalized greeting
  async generateGreeting() {
    const ctx = this.userContext;
    const greetingLines = ['System online.', `Привет, ${this.userName}.`];

    let contextMessage = '';

    if (ctx.isNewUser) {
      contextMessage = 'Готов помочь собрать то, что нужно именно тебе.';
    } else if (ctx.savedBuilds && ctx.savedBuilds.length > 0) {
      const build = ctx.savedBuilds[0];
      contextMessage = `У тебя есть сохранённая сборка${build.price ? ` за ${Math.round(build.price / 1000)}к` : ''}. Довести до идеала?`;
    } else if (ctx.viewedProducts && ctx.viewedProducts.length > 0) {
      const recent = ctx.viewedProducts[0];
      if (recent.category?.toLowerCase().includes('gpu') || recent.category?.toLowerCase().includes('видеокарт')) {
        contextMessage = 'Вижу, ты интересовался видеокартами. Продолжим подбор под твои игры?';
      } else if (recent.category?.toLowerCase().includes('монитор') || recent.category?.toLowerCase().includes('monitor')) {
        contextMessage = 'Замечаю интерес к мониторам. Показать новые OLED?';
      } else {
        contextMessage = 'Продолжим подбор компонентов?';
      }
    } else if (ctx.daysSinceLastVisit > 30) {
      contextMessage = 'Соскучился. Появились новые OLED-мониторы и RTX 50-series — показать?';
    } else if (ctx.daysSinceLastVisit > 1) {
      const messages = [
        'Давай найдём то, что поднимет твой сетап на новый уровень.',
        'Здесь я помогу избежать ошибок и выбрать лучшее.',
        'Готов помочь с железом мечты. С чего начнём?'
      ];
      contextMessage = messages[Math.floor(Math.random() * messages.length)];
    } else {
      contextMessage = 'С возвращением. Что на этот раз ищем?';
    }

    greetingLines.push(contextMessage);
    return { lines: greetingLines };
  }

  // Generate smart search suggestions based on context
  getSearchSuggestions() {
    const ctx = this.userContext;
    const suggestions = [];

    // Based on saved builds
    if (ctx.savedBuilds && ctx.savedBuilds.length > 0) {
      suggestions.push('Продолжим твою сборку?');
    }

    // Based on viewed products
    if (ctx.viewedProducts && ctx.viewedProducts.length > 0) {
      const recent = ctx.viewedProducts[0];
      suggestions.push(`Похожее на ${recent.name?.substring(0, 30)}...`);
    }

    // Based on search history
    if (ctx.searchHistory && ctx.searchHistory.length > 0) {
      suggestions.push(`"${ctx.searchHistory[0]}" — найти ещё?`);
    }

    // Contextual suggestions
    suggestions.push(
      'Лучшие мониторы для 4K гейминга 2025',
      'Сборка до 150к с высоким FPS',
      'Покажи новые OLED-панели',
      'RTX 5090 — цены и наличие'
    );

    return suggestions.slice(0, 6);
  }

  // Generate proactive message after inactivity
  getProactiveMessage() {
    const ctx = this.userContext;

    if (ctx.savedBuilds && ctx.savedBuilds.length > 0) {
      return {
        message: 'У тебя есть незавершённая сборка. Продолжим?',
        actions: [
          { label: 'Да, продолжим', path: '/pc-builder' },
          { label: 'Не сейчас', dismiss: true }
        ]
      };
    }

    if (ctx.viewedProducts && ctx.viewedProducts.length > 0) {
      return {
        message: 'Кстати, вышла новая RTX 50-series. Показать оптимальные сборки?',
        actions: [
          { label: 'Показать', path: '/marketplace?category=gpu' },
          { label: 'Не сейчас', dismiss: true }
        ]
      };
    }

    return {
      message: 'Нужна помощь с выбором? Могу подобрать идеальную сборку под твои задачи.',
      actions: [
        { label: 'Да, помоги', path: '/pc-builder' },
        { label: 'Сам справлюсь', dismiss: true }
      ]
    };
  }

  // Track action
  trackAction(action, data) {
    try {
      switch (action) {
        case 'view_product':
          const viewedProducts = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
          viewedProducts.unshift({
            id: data.id,
            name: data.name,
            category: data.category,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem('viewedProducts', JSON.stringify(viewedProducts.slice(0, 50)));
          break;

        case 'save_build':
          const savedBuilds = JSON.parse(localStorage.getItem('savedBuilds') || '[]');
          savedBuilds.unshift(data);
          localStorage.setItem('savedBuilds', JSON.stringify(savedBuilds.slice(0, 10)));
          break;

        case 'search':
          const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
          if (!searchHistory.includes(data.query)) {
            searchHistory.unshift(data.query);
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory.slice(0, 20)));
          }
          break;

        case 'set_preference':
          const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
          preferences[data.key] = data.value;
          localStorage.setItem('userPreferences', JSON.stringify(preferences));
          break;
      }
    } catch (error) {
      console.error('Failed to track action:', error);
    }
  }

  // Get quick actions
  getQuickActions() {
    const ctx = this.userContext;
    const actions = [];

    if (ctx.savedBuilds && ctx.savedBuilds.length > 0) {
      actions.push({ label: 'Продолжить сборку', path: '/pc-builder', icon: '🔧' });
    } else {
      actions.push({ label: 'Начать сборку', path: '/pc-builder', icon: '⚡' });
    }

    actions.push(
      { label: 'Готовые билды', path: '/marketplace', icon: '🎮' },
      { label: 'Сообщество', path: '/feed', icon: '💬' }
    );

    return actions.slice(0, 3);
  }
}

export default new CoreAI();

