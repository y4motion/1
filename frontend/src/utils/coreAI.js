// Core AI Assistant System for personalized onboarding

class CoreAI {
  constructor() {
    this.userName = null;
    this.userContext = {};
  }

  // Initialize AI with user data
  init(user) {
    this.userName = user?.username || 'Гость';
    this.loadUserContext();
  }

  // Load user context from localStorage and user data
  loadUserContext() {
    try {
      // Get from localStorage
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

      // Update last visit
      localStorage.setItem('lastVisit', new Date().toISOString());
    } catch (error) {
      console.error('Failed to load user context:', error);
      this.userContext = { isNewUser: true };
    }
  }

  // Generate personalized greeting based on context
  async generateGreeting() {
    const ctx = this.userContext;

    // System online header
    const greetingLines = ['System online.', `Привет, ${this.userName}.`];

    // Determine context-based message
    let contextMessage = '';

    // New user
    if (ctx.isNewUser) {
      contextMessage = 'Готов помочь собрать то, что нужно именно тебе.';
    }
    // Has incomplete build
    else if (ctx.savedBuilds && ctx.savedBuilds.length > 0) {
      const build = ctx.savedBuilds[0];
      contextMessage = `У тебя есть сохранённая сборка${build.price ? ` за ${Math.round(build.price / 1000)}к` : ''}. Довести до идеала?`;
    }
    // Recently viewed specific category
    else if (ctx.viewedProducts && ctx.viewedProducts.length > 0) {
      const recentCategory = ctx.viewedProducts[0].category;
      if (recentCategory?.includes('GPU') || recentCategory?.includes('видеокарт')) {
        contextMessage = 'Вижу, ты интересовался видеокартами. Продолжим подбор под твои игры?';
      } else if (recentCategory?.includes('монитор') || recentCategory?.includes('monitor')) {
        contextMessage = 'Замечаю интерес к мониторам. Показать новые OLED и high refresh?';
      } else {
        contextMessage = 'Продолжим подбор компонентов для твоей идеальной сборки?';
      }
    }
    // Returning after long time
    else if (ctx.daysSinceLastVisit > 30) {
      contextMessage = 'Соскучился. Появились новые OLED-мониторы и RTX 50-series — показать лучшее?';
    }
    // Returning user, no specific context
    else if (ctx.daysSinceLastVisit > 1) {
      const messages = [
        'Давай найдём то, что поднимет твой сетап на новый уровень.',
        'Здесь я помогу избежать ошибок и выбрать лучшее.',
        'Анализирую твои предпочтения... Готов предложить идеальное.',
        'Готов помочь с железом мечты. С чего начнём?'
      ];
      contextMessage = messages[Math.floor(Math.random() * messages.length)];
    }
    // Very active user
    else {
      contextMessage = 'С возвращением. Что на этот раз ищем?';
    }

    greetingLines.push(contextMessage);

    return {
      lines: greetingLines,
      totalDuration: greetingLines.reduce((sum, line) => sum + (line.length * 60), 0) + 1500 // 60ms per char + pauses
    };
  }

  // Track user action
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
          searchHistory.unshift(data.query);
          localStorage.setItem('searchHistory', JSON.stringify(searchHistory.slice(0, 20)));
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

  // Get recommendations based on context
  getQuickActions() {
    const ctx = this.userContext;
    const actions = [];

    if (ctx.savedBuilds && ctx.savedBuilds.length > 0) {
      actions.push({ label: 'Продолжить сборку', path: '/pc-builder', icon: '🔧' });
    } else {
      actions.push({ label: 'Начать сборку', path: '/pc-builder', icon: '⚡' });
    }

    actions.push(
      { label: 'Готовые билды', path: '/marketplace?featured=builds', icon: '🎮' },
      { label: 'Сообщество', path: '/feed', icon: '💬' }
    );

    return actions.slice(0, 3);
  }
}

export default new CoreAI();
