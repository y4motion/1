import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, ShoppingCart, Eye, TrendingUp, 
  RefreshCw, Zap, Brain, TestTube, MessageSquare 
} from 'lucide-react';
import './MindDashboard.css';

const API_URL = '';

const MindDashboard = () => {
  const [stats, setStats] = useState(null);
  const [abResults, setAbResults] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      
      // Fetch all data in parallel
      const [statusRes, abRes, eventsRes] = await Promise.all([
        fetch(`${API_URL}/api/mind/status`),
        fetch(`${API_URL}/api/mind/ab-test/results`),
        fetch(`${API_URL}/api/mind/analytics/events?limit=20`)
      ]);
      
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setStats(statusData);
      }
      
      if (abRes.ok) {
        const abData = await abRes.json();
        setAbResults(abData.results);
      }
      
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setRecentEvents(eventsData.events || []);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchData, 10000); // Refresh every 10s
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="mind-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Загрузка Glassy Mind Dashboard...</p>
      </div>
    );
  }

  const observer = stats?.components?.observer || {};
  const expert = stats?.components?.expert || {};
  const aiChat = stats?.components?.ai_chat || {};
  const features = stats?.features || {};

  return (
    <div className="mind-dashboard" data-testid="mind-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <Brain className="header-icon" />
          <div>
            <h1>Glassy Mind Dashboard</h1>
            <p className="status-badge">
              <span className={`status-dot ${stats?.status === 'operational' ? 'online' : 'offline'}`}></span>
              {stats?.status || 'unknown'}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className={`auto-refresh-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw size={16} className={autoRefresh ? 'spinning' : ''} />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button className="refresh-btn" onClick={fetchData}>
            <RefreshCw size={16} />
            Обновить
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ Ошибка загрузки: {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon views">
            <Eye size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{observer.total_views || 0}</span>
            <span className="stat-label">Просмотров</span>
          </div>
          {observer.views_last_24h !== undefined && (
            <span className="stat-badge">+{observer.views_last_24h} за 24ч</span>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-icon carts">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{observer.total_cart_adds || 0}</span>
            <span className="stat-label">Добавлений в корзину</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon sessions">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{observer.total_sessions || 0}</span>
            <span className="stat-label">Сессий</span>
          </div>
          <span className="stat-badge storage">{observer.storage || 'unknown'}</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon events">
            <Zap size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{observer.total_events || 0}</span>
            <span className="stat-label">Событий</span>
          </div>
        </div>
      </div>

      {/* Features Status */}
      <div className="features-section">
        <h2><Zap size={20} /> Активные функции</h2>
        <div className="features-grid">
          <div className={`feature-card ${features.mongodb_persistence ? 'enabled' : 'disabled'}`}>
            <span className="feature-icon">🗄️</span>
            <span className="feature-name">MongoDB Persistence</span>
            <span className={`feature-status ${features.mongodb_persistence ? 'on' : 'off'}`}>
              {features.mongodb_persistence ? 'ON' : 'OFF'}
            </span>
          </div>
          <div className={`feature-card ${features.deepseek_ai ? 'enabled' : 'disabled'}`}>
            <span className="feature-icon">🤖</span>
            <span className="feature-name">AI Chat ({aiChat.model || 'N/A'})</span>
            <span className={`feature-status ${aiChat.enabled ? 'on' : 'off'}`}>
              {aiChat.enabled ? 'ON' : 'OFF'}
            </span>
          </div>
          <div className={`feature-card ${features.ab_testing ? 'enabled' : 'disabled'}`}>
            <span className="feature-icon">🧪</span>
            <span className="feature-name">A/B Testing</span>
            <span className={`feature-status ${features.ab_testing ? 'on' : 'off'}`}>
              {features.ab_testing ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>

      {/* A/B Test Results */}
      <div className="ab-test-section">
        <h2><TestTube size={20} /> A/B Тест: Стратегии рекомендаций</h2>
        
        {abResults ? (
          <div className="ab-results">
            <div className="ab-groups">
              {/* Group A */}
              <div className={`ab-group ${abResults.winner === 'A' ? 'winner' : ''}`}>
                <div className="group-header">
                  <span className="group-name">Группа A</span>
                  {abResults.winner === 'A' && <span className="winner-badge">🏆 Лидер</span>}
                </div>
                <p className="group-strategy">Прямые рекомендации</p>
                <div className="group-stats">
                  <div className="group-stat">
                    <span className="label">Пользователей</span>
                    <span className="value">{abResults.group_a?.users || 0}</span>
                  </div>
                  <div className="group-stat">
                    <span className="label">Добавлений в корзину</span>
                    <span className="value">{abResults.group_a?.cart_adds || 0}</span>
                  </div>
                  <div className="group-stat highlight">
                    <span className="label">Конверсия</span>
                    <span className="value">{abResults.group_a?.conversion_rate || 0}%</span>
                  </div>
                </div>
                <div className="conversion-bar">
                  <div 
                    className="conversion-fill a" 
                    style={{ width: `${Math.min(abResults.group_a?.conversion_rate || 0, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* VS Divider */}
              <div className="vs-divider">VS</div>

              {/* Group B */}
              <div className={`ab-group ${abResults.winner === 'B' ? 'winner' : ''}`}>
                <div className="group-header">
                  <span className="group-name">Группа B</span>
                  {abResults.winner === 'B' && <span className="winner-badge">🏆 Лидер</span>}
                </div>
                <p className="group-strategy">Вопросы-вовлечение</p>
                <div className="group-stats">
                  <div className="group-stat">
                    <span className="label">Пользователей</span>
                    <span className="value">{abResults.group_b?.users || 0}</span>
                  </div>
                  <div className="group-stat">
                    <span className="label">Добавлений в корзину</span>
                    <span className="value">{abResults.group_b?.cart_adds || 0}</span>
                  </div>
                  <div className="group-stat highlight">
                    <span className="label">Конверсия</span>
                    <span className="value">{abResults.group_b?.conversion_rate || 0}%</span>
                  </div>
                </div>
                <div className="conversion-bar">
                  <div 
                    className="conversion-fill b" 
                    style={{ width: `${Math.min(abResults.group_b?.conversion_rate || 0, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="no-data">Нет данных A/B теста</p>
        )}
      </div>

      {/* Recent Events */}
      <div className="events-section">
        <h2><BarChart3 size={20} /> Последние события</h2>
        
        {recentEvents.length > 0 ? (
          <div className="events-table">
            <div className="events-header">
              <span>Тип</span>
              <span>Пользователь</span>
              <span>Данные</span>
              <span>Время</span>
            </div>
            {recentEvents.map((event, index) => (
              <div key={index} className="event-row">
                <span className={`event-type ${event.event_type}`}>
                  {event.event_type === 'view' && <Eye size={14} />}
                  {event.event_type === 'cart_add' && <ShoppingCart size={14} />}
                  {event.event_type === 'dwell' && <TrendingUp size={14} />}
                  {event.event_type}
                </span>
                <span className="event-user">{event.user_id?.slice(0, 12)}...</span>
                <span className="event-data">
                  {event.data?.product_id || event.data?.page_id || '-'}
                </span>
                <span className="event-time">
                  {new Date(event.timestamp).toLocaleTimeString('ru-RU')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">Нет недавних событий</p>
        )}
      </div>

      {/* Knowledge Base Summary */}
      <div className="knowledge-section">
        <h2><Brain size={20} /> База знаний эксперта</h2>
        <div className="knowledge-tags">
          {expert.knowledge_categories?.map((cat, index) => (
            <span key={index} className="knowledge-tag">{cat}</span>
          ))}
        </div>
        <div className="checks-list">
          <h4>Поддерживаемые проверки:</h4>
          <ul>
            {expert.supported_checks?.map((check, index) => (
              <li key={index}>✓ {check}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MindDashboard;
