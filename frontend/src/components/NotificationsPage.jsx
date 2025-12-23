import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Package,
  Heart,
  MessageCircle,
  Trophy,
  Gift,
  Check,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/glassmorphism.css';

const NotificationsPage = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      icon: Package,
      title: language === 'ru' ? 'Заказ #12345 отправлен' : 'Order #12345 shipped',
      message:
        language === 'ru'
          ? 'Ваш заказ в пути. Ожидайте доставку 2-3 дня'
          : 'Your order is on the way. Expect delivery in 2-3 days',
      time: '5m',
      read: false,
    },
    {
      id: 2,
      type: 'like',
      icon: Heart,
      title: language === 'ru' ? 'Товар добавлен в избранное' : 'Product added to favorites',
      message:
        language === 'ru'
          ? 'Кто-то добавил ваш товар "RTX 4090" в избранное'
          : 'Someone added your product "RTX 4090" to favorites',
      time: '1h',
      read: false,
    },
    {
      id: 3,
      type: 'message',
      icon: MessageCircle,
      title: language === 'ru' ? 'Новое сообщение' : 'New message',
      message:
        language === 'ru'
          ? 'Support AI ответил на ваше сообщение'
          : 'Support AI replied to your message',
      time: '2h',
      read: true,
    },
    {
      id: 4,
      type: 'achievement',
      icon: Trophy,
      title: language === 'ru' ? 'Достижение разблокировано!' : 'Achievement unlocked!',
      message:
        language === 'ru'
          ? 'Вы получили "Первая покупка" +50 XP'
          : 'You earned "First Purchase" +50 XP',
      time: '1d',
      read: true,
    },
    {
      id: 5,
      type: 'reward',
      icon: Gift,
      title: language === 'ru' ? 'Бонусные монеты начислены' : 'Bonus coins credited',
      message: language === 'ru' ? '+100 🪙 за завершение квеста' : '+100 🪙 for completing quest',
      time: '2d',
      read: true,
    },
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: '5rem',
        background:
          theme === 'minimal-mod'
            ? 'rgba(0, 0, 0, 1)'
            : theme === 'dark'
              ? 'linear-gradient(135deg, #0a0a0b 0%, #151518 100%)'
              : 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
        fontFamily:
          theme === 'minimal-mod' ? '"SF Mono", Menlo, Consolas, Monaco, monospace' : 'inherit',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div
          className={theme === 'minimal-mod' ? '' : 'glass'}
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: theme === 'minimal-mod' ? '0' : '16px',
            background: theme === 'minimal-mod' ? 'rgba(0, 0, 0, 0.95)' : undefined,
            border: theme === 'minimal-mod' ? '1px solid rgba(241, 241, 241, 0.12)' : undefined,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: theme === 'minimal-mod' ? '0' : '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease',
                color: theme === 'dark' ? '#fff' : '#1a1a1a',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <ArrowLeft size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: theme === 'dark' ? '#fff' : '#1a1a1a',
                }}
              >
                {language === 'ru' ? 'Уведомления' : 'Notifications'}
              </h2>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: '#8b5cf6',
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    padding: '0.25rem 0.625rem',
                    borderRadius: theme === 'minimal-mod' ? '0' : '12px',
                    minWidth: '28px',
                    textAlign: 'center',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                padding: '0.625rem 1rem',
                background: 'transparent',
                border:
                  theme === 'minimal-mod'
                    ? '1px solid rgba(241, 241, 241, 0.2)'
                    : theme === 'dark'
                      ? '1px solid rgba(255, 255, 255, 0.2)'
                      : '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: theme === 'minimal-mod' ? '0' : '8px',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: '600',
                color: theme === 'dark' ? '#fff' : '#1a1a1a',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {language === 'ru' ? 'Отметить все как прочитанные' : 'Mark all as read'}
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((notification) => {
            const IconComponent = notification.icon;
            return (
              <div
                key={notification.id}
                className={theme === 'minimal-mod' ? '' : 'glass'}
                style={{
                  padding: '1.25rem',
                  borderRadius: theme === 'minimal-mod' ? '0' : '12px',
                  background: notification.read
                    ? theme === 'minimal-mod'
                      ? 'rgba(0, 0, 0, 0.95)'
                      : undefined
                    : theme === 'dark'
                      ? 'rgba(139, 92, 246, 0.08)'
                      : 'rgba(139, 92, 246, 0.05)',
                  border: notification.read
                    ? theme === 'minimal-mod'
                      ? '1px solid rgba(241, 241, 241, 0.12)'
                      : undefined
                    : `1px solid rgba(139, 92, 246, 0.3)`,
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'start',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  opacity: notification.read ? 0.7 : 1,
                }}
                onClick={() => markAsRead(notification.id)}
                onMouseEnter={(e) => {
                  if (theme !== 'minimal-mod') {
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background:
                      theme === 'dark' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#8b5cf6',
                  }}
                >
                  <IconComponent size={20} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      marginBottom: '0.375rem',
                      color: theme === 'dark' ? '#fff' : '#1a1a1a',
                    }}
                  >
                    {notification.title}
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      opacity: 0.7,
                      lineHeight: '1.5',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {notification.message}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{notification.time}</div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#4CAF50',
                        transition: 'background 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          theme === 'dark' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                      title={language === 'ru' ? 'Отметить как прочитанное' : 'Mark as read'}
                    >
                      <Check size={18} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(244, 67, 54, 0.1)';
                      e.currentTarget.style.color = '#F44336';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color =
                        theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
                    }}
                    title={language === 'ru' ? 'Удалить' : 'Delete'}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            );
          })}

          {notifications.length === 0 && (
            <div
              className={theme === 'minimal-mod' ? '' : 'glass'}
              style={{
                padding: '3rem 2rem',
                borderRadius: theme === 'minimal-mod' ? '0' : '16px',
                background: theme === 'minimal-mod' ? 'rgba(0, 0, 0, 0.95)' : undefined,
                border: theme === 'minimal-mod' ? '1px solid rgba(241, 241, 241, 0.12)' : undefined,
                textAlign: 'center',
              }}
            >
              <Bell size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {language === 'ru' ? 'Нет уведомлений' : 'No notifications'}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.6 }}>
                {language === 'ru'
                  ? 'Когда появятся новые уведомления, они будут здесь'
                  : "When you get notifications, they'll show up here"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
