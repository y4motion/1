/**
 * NeuralHub.jsx - ACRYLIC GHOST v8.0
 * 
 * FULL INTERNAL PANELS
 * Каждая кнопка открывает свою панель внутри меню
 * Профиль, Уведомления, Настройки, Инвентарь, Баланс и т.д.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Settings, Bell, Package, Gift, Target, 
  Trophy, Wallet, Shield, X, Mail, Star, Clock, 
  ChevronRight, ChevronLeft, Check, Trash2, Eye,
  Volume2, Moon, Globe, Lock, CreditCard, ArrowUpRight,
  ArrowDownLeft, Copy, ExternalLink, Camera, Edit3,
  ToggleLeft, ToggleRight, Smartphone, Monitor, Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import IdentityCore from '../social/IdentityCore';
import { GhostMessenger } from '../social/GhostMessenger';

// Premium Avatar URL
const AVATAR_URL = 'https://images.pexels.com/photos/27969612/pexels-photo-27969612.jpeg';

// ============================================
// SHARED COMPONENTS
// ============================================

const CornerGlow = () => (
  <>
    <div style={{ position: 'absolute', top: -1, left: -1, width: '180px', height: '180px', background: 'radial-gradient(ellipse at top left, rgba(255,255,255,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', top: -1, right: -1, width: '180px', height: '180px', background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: -1, left: -1, width: '150px', height: '150px', background: 'radial-gradient(ellipse at bottom left, rgba(255,255,255,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: -1, right: -1, width: '150px', height: '150px', background: 'radial-gradient(ellipse at bottom right, rgba(255,255,255,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', top: 0, left: '5%', right: '5%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', pointerEvents: 'none' }} />
  </>
);

const SubtleGrid = () => (
  <div style={{
    position: 'absolute', inset: 0,
    backgroundImage: `linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)`,
    backgroundSize: '60px 60px',
    pointerEvents: 'none',
  }} />
);

const MonoNum = ({ children, style = {} }) => (
  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontVariantNumeric: 'tabular-nums', ...style }}>
    {children}
  </span>
);

const StatBar = ({ label, value, max }) => (
  <div style={{ marginBottom: '16px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11px' }}>
      <span style={{ opacity: 0.4, fontWeight: '500', letterSpacing: '0.5px' }}>{label}</span>
      <MonoNum style={{ opacity: 0.7, fontSize: '11px' }}>{value}/{max}</MonoNum>
    </div>
    <div style={{ height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '1px', overflow: 'hidden' }}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(value/max) * 100}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ height: '100%', background: 'rgba(255,255,255,0.6)', boxShadow: '0 0 10px rgba(255,255,255,0.3)', borderRadius: '1px' }}
      />
    </div>
  </div>
);

// Panel Header
const PanelHeader = ({ title, onBack }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
    <motion.button
      onClick={onBack}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
      style={{
        width: '40px', height: '40px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: 'white',
      }}
    >
      <ChevronLeft size={18} />
    </motion.button>
    <span style={{ fontSize: '14px', fontWeight: '600', letterSpacing: '1px' }}>{title}</span>
  </div>
);

// Setting Row Toggle
const SettingToggle = ({ icon: Icon, label, description, enabled, onToggle }) => (
  <motion.div
    whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
    style={{
      padding: '16px 20px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '16px',
      display: 'flex', alignItems: 'center', gap: '16px',
      marginBottom: '12px',
    }}
  >
    <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={18} strokeWidth={1.5} style={{ opacity: 0.5 }} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '11px', opacity: 0.4 }}>{description}</div>
    </div>
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
      style={{
        width: '48px', height: '28px',
        background: enabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
    >
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        style={{
          width: '22px', height: '22px',
          background: 'white',
          borderRadius: '11px',
          position: 'absolute', top: '2px',
        }}
      />
    </motion.button>
  </motion.div>
);

// Setting Row Button
const SettingButton = ({ icon: Icon, label, description, onClick, value }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
    style={{
      width: '100%',
      padding: '16px 20px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '16px',
      display: 'flex', alignItems: 'center', gap: '16px',
      marginBottom: '12px',
      cursor: 'pointer',
      color: 'white',
      textAlign: 'left',
    }}
  >
    <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={18} strokeWidth={1.5} style={{ opacity: 0.5 }} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '11px', opacity: 0.4 }}>{description}</div>
    </div>
    {value && <span style={{ fontSize: '12px', opacity: 0.5, fontFamily: '"JetBrains Mono", monospace' }}>{value}</span>}
    <ChevronRight size={16} style={{ opacity: 0.3 }} />
  </motion.button>
);

// Notification Item
const NotificationItem = ({ icon: Icon, title, text, time, isNew, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    style={{
      padding: '16px 20px',
      background: isNew ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
      border: `1px solid rgba(255,255,255,${isNew ? '0.1' : '0.05'})`,
      borderRadius: '16px',
      marginBottom: '12px',
      position: 'relative',
    }}
  >
    {isNew && (
      <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '30px', background: 'white', borderRadius: '0 2px 2px 0' }} />
    )}
    <div style={{ display: 'flex', gap: '14px' }}>
      <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} strokeWidth={1.5} style={{ opacity: 0.5 }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '8px', lineHeight: 1.4 }}>{text}</div>
        <div style={{ fontSize: '10px', opacity: 0.3, fontFamily: '"JetBrains Mono", monospace' }}>{time}</div>
      </div>
      <motion.button
        onClick={onDismiss}
        whileHover={{ opacity: 0.8 }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', opacity: 0.3, padding: '4px' }}
      >
        <X size={14} />
      </motion.button>
    </div>
  </motion.div>
);

// Transaction Item
const TransactionItem = ({ type, title, amount, date, status }) => (
  <div style={{
    padding: '16px 20px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '16px',
    marginBottom: '12px',
    display: 'flex', alignItems: 'center', gap: '14px',
  }}>
    <div style={{
      width: '40px', height: '40px',
      background: type === 'in' ? 'rgba(76,175,80,0.1)' : 'rgba(255,255,255,0.04)',
      borderRadius: '12px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {type === 'in' ? <ArrowDownLeft size={18} style={{ color: '#4CAF50' }} /> : <ArrowUpRight size={18} style={{ opacity: 0.5 }} />}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '2px' }}>{title}</div>
      <div style={{ fontSize: '10px', opacity: 0.4, fontFamily: '"JetBrains Mono", monospace' }}>{date}</div>
    </div>
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '14px', fontWeight: '600', fontFamily: '"JetBrains Mono", monospace', color: type === 'in' ? '#4CAF50' : 'white' }}>
        {type === 'in' ? '+' : '-'}{amount}
      </div>
      <div style={{ fontSize: '10px', opacity: 0.4 }}>{status}</div>
    </div>
  </div>
);

// Inventory Item
const InventoryItem = ({ name, rarity, count, image }) => (
  <motion.div
    whileHover={{ borderColor: 'rgba(255,255,255,0.12)', y: -2 }}
    style={{
      padding: '16px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }}
  >
    <div style={{
      width: '60px', height: '60px',
      margin: '0 auto 12px',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: '14px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '28px',
    }}>
      {image}
    </div>
    <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>{name}</div>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
      <span style={{
        fontSize: '9px',
        padding: '2px 8px',
        background: rarity === 'legendary' ? 'rgba(255,215,0,0.15)' : rarity === 'rare' ? 'rgba(138,43,226,0.15)' : 'rgba(255,255,255,0.05)',
        color: rarity === 'legendary' ? '#FFD700' : rarity === 'rare' ? '#8A2BE2' : 'rgba(255,255,255,0.5)',
        borderRadius: '6px',
        fontFamily: '"JetBrains Mono", monospace',
        textTransform: 'uppercase',
      }}>
        {rarity}
      </span>
      <span style={{ fontSize: '10px', opacity: 0.4, fontFamily: '"JetBrains Mono", monospace' }}>×{count}</span>
    </div>
  </motion.div>
);

// Navigation Tile (for main view)
const NavTile = ({ icon: Icon, label, badge, onClick, isActive }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)', y: -2, borderColor: 'rgba(255,255,255,0.1)' }}
    whileTap={{ scale: 0.98 }}
    style={{
      padding: '20px 16px',
      background: isActive ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
      border: `1px solid rgba(255,255,255,${isActive ? '0.1' : '0.06'})`,
      borderRadius: '16px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
      cursor: 'pointer', color: 'white', position: 'relative', fontFamily: 'inherit',
    }}
  >
    <div style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '12px' }}>
      <Icon size={20} strokeWidth={1.5} style={{ opacity: 0.6 }} />
    </div>
    <span style={{ fontSize: '10px', fontWeight: '500', letterSpacing: '0.5px', opacity: 0.7 }}>{label}</span>
    {badge && (
      <span style={{
        position: 'absolute', top: '12px', right: '12px',
        minWidth: '18px', height: '18px', padding: '0 5px',
        background: 'rgba(255,255,255,0.9)', color: 'black',
        borderRadius: '9px', fontSize: '9px', fontWeight: '600',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"JetBrains Mono", monospace',
      }}>
        {badge}
      </span>
    )}
  </motion.button>
);

// ============================================
// PANEL COMPONENTS
// ============================================

// NOTIFICATIONS PANEL
const NotificationsPanel = ({ onBack }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, icon: Gift, title: 'Новая награда!', text: 'Вы получили достижение "Первопроходец"', time: '5 минут назад', isNew: true },
    { id: 2, icon: Package, title: 'Заказ доставлен', text: 'Ваш заказ #4521 успешно доставлен', time: '2 часа назад', isNew: true },
    { id: 3, icon: Trophy, title: 'Новый уровень', text: 'Поздравляем! Вы достигли 99 уровня', time: 'Вчера', isNew: true },
    { id: 4, icon: Star, title: 'Оценка товара', text: 'Покупатель оставил отзыв 5★', time: '2 дня назад', isNew: false },
    { id: 5, icon: Bell, title: 'Напоминание', text: 'Завершите ежедневные задания', time: '3 дня назад', isNew: false },
  ]);
  
  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PanelHeader title="УВЕДОМЛЕНИЯ" onBack={onBack} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '11px', opacity: 0.4 }}>{notifications.filter(n => n.isNew).length} новых</span>
        <motion.button
          whileHover={{ opacity: 0.8 }}
          style={{ background: 'none', border: 'none', color: 'white', opacity: 0.4, fontSize: '11px', cursor: 'pointer' }}
        >
          Прочитать все
        </motion.button>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <AnimatePresence>
          {notifications.map(n => (
            <NotificationItem key={n.id} {...n} onDismiss={() => dismissNotification(n.id)} />
          ))}
        </AnimatePresence>
        {notifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', opacity: 0.3 }}>
            <Bell size={40} strokeWidth={1} style={{ marginBottom: '16px' }} />
            <div>Нет уведомлений</div>
          </div>
        )}
      </div>
    </div>
  );
};

// SETTINGS PANEL
const SettingsPanel = ({ onBack }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PanelHeader title="НАСТРОЙКИ" onBack={onBack} />
      
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '10px', letterSpacing: '1px', opacity: 0.3, marginBottom: '12px', fontFamily: '"JetBrains Mono", monospace' }}>ИНТЕРФЕЙС</div>
        <SettingToggle icon={Moon} label="Тёмная тема" description="Всегда использовать тёмный режим" enabled={darkMode} onToggle={() => setDarkMode(!darkMode)} />
        <SettingToggle icon={Volume2} label="Звуки" description="Звуковые эффекты интерфейса" enabled={sounds} onToggle={() => setSounds(!sounds)} />
        <SettingButton icon={Globe} label="Язык" description="Язык интерфейса" value="Русский" />
        
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '24px 0' }} />
        
        <div style={{ fontSize: '10px', letterSpacing: '1px', opacity: 0.3, marginBottom: '12px', fontFamily: '"JetBrains Mono", monospace' }}>УВЕДОМЛЕНИЯ</div>
        <SettingToggle icon={Bell} label="Push-уведомления" description="Получать уведомления на устройство" enabled={notifications} onToggle={() => setNotifications(!notifications)} />
        <SettingButton icon={Mail} label="Email-рассылка" description="Настроить email уведомления" />
        
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '24px 0' }} />
        
        <div style={{ fontSize: '10px', letterSpacing: '1px', opacity: 0.3, marginBottom: '12px', fontFamily: '"JetBrains Mono", monospace' }}>БЕЗОПАСНОСТЬ</div>
        <SettingToggle icon={Lock} label="Двухфакторная аутентификация" description="Дополнительная защита аккаунта" enabled={twoFactor} onToggle={() => setTwoFactor(!twoFactor)} />
        <SettingButton icon={Smartphone} label="Активные сессии" description="Управление устройствами" value="3" />
        <SettingButton icon={Lock} label="Сменить пароль" description="Обновить пароль аккаунта" />
      </div>
    </div>
  );
};

// WALLET PANEL
const WalletPanel = ({ onBack }) => (
  <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <PanelHeader title="БАЛАНС" onBack={onBack} />
    
    {/* Balance Card */}
    <div style={{
      padding: '28px',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '24px',
      marginBottom: '24px',
    }}>
      <div style={{ fontSize: '11px', opacity: 0.4, marginBottom: '8px', fontFamily: '"JetBrains Mono", monospace' }}>ОСНОВНОЙ СЧЁТ</div>
      <div style={{ fontSize: '36px', fontWeight: '600', fontFamily: '"JetBrains Mono", monospace', marginBottom: '16px' }}>
        24,850 <span style={{ fontSize: '16px', opacity: 0.5 }}>₽</span>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <motion.button whileHover={{ scale: 1.02 }} style={{ flex: 1, padding: '12px', background: 'white', color: 'black', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>
          Пополнить
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontWeight: '500', cursor: 'pointer', fontSize: '12px' }}>
          Вывести
        </motion.button>
      </div>
    </div>
    
    {/* Bonus Balance */}
    <div style={{
      padding: '16px 20px',
      background: 'rgba(255,215,0,0.05)',
      border: '1px solid rgba(255,215,0,0.1)',
      borderRadius: '16px',
      marginBottom: '24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '4px' }}>Бонусный счёт</div>
        <div style={{ fontSize: '18px', fontWeight: '600', fontFamily: '"JetBrains Mono", monospace', color: '#FFD700' }}>1,250 ₽</div>
      </div>
      <Zap size={24} style={{ color: '#FFD700', opacity: 0.5 }} />
    </div>
    
    {/* Transactions */}
    <div style={{ fontSize: '10px', letterSpacing: '1px', opacity: 0.3, marginBottom: '12px', fontFamily: '"JetBrains Mono", monospace' }}>ИСТОРИЯ</div>
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <TransactionItem type="out" title="Заказ #4528" amount="12,500 ₽" date="Сегодня, 14:32" status="Завершён" />
      <TransactionItem type="in" title="Пополнение" amount="20,000 ₽" date="Вчера, 09:15" status="Завершён" />
      <TransactionItem type="out" title="Заказ #4521" amount="8,450 ₽" date="15 янв, 18:44" status="Завершён" />
      <TransactionItem type="in" title="Возврат" amount="2,500 ₽" date="12 янв, 11:20" status="Завершён" />
    </div>
  </div>
);

// INVENTORY PANEL
const InventoryPanel = ({ onBack }) => (
  <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <PanelHeader title="ИНВЕНТАРЬ" onBack={onBack} />
    
    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
      {['Все', 'Редкие', 'Легендарные'].map((tab, i) => (
        <motion.button
          key={tab}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          style={{
            padding: '8px 16px',
            background: i === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px',
            color: 'white',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          {tab}
        </motion.button>
      ))}
    </div>
    
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <InventoryItem name="Ghost Badge" rarity="legendary" count={1} image="👻" />
        <InventoryItem name="Void Keycap" rarity="rare" count={3} image="⌨️" />
        <InventoryItem name="Neon Frame" rarity="rare" count={1} image="🖼️" />
        <InventoryItem name="XP Boost" rarity="common" count={5} image="⚡" />
        <InventoryItem name="Lucky Coin" rarity="common" count={12} image="🪙" />
        <InventoryItem name="Mystery Box" rarity="rare" count={2} image="📦" />
      </div>
    </div>
  </div>
);

// TRUST PANEL
const TrustPanel = ({ onBack }) => (
  <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <PanelHeader title="ДОВЕРИЕ" onBack={onBack} />
    
    {/* Trust Score */}
    <div style={{
      padding: '32px',
      background: 'linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(76,175,80,0.02) 100%)',
      border: '1px solid rgba(76,175,80,0.2)',
      borderRadius: '24px',
      marginBottom: '24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '48px', fontWeight: '600', fontFamily: '"JetBrains Mono", monospace', color: '#4CAF50', marginBottom: '8px' }}>98</div>
      <div style={{ fontSize: '12px', opacity: 0.6 }}>Очень высокий уровень доверия</div>
    </div>
    
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ fontSize: '10px', letterSpacing: '1px', opacity: 0.3, marginBottom: '12px', fontFamily: '"JetBrains Mono", monospace' }}>ФАКТОРЫ</div>
      
      <StatBar label="Успешные сделки" value={156} max={156} />
      <StatBar label="Отзывы 5★" value={142} max={156} />
      <StatBar label="Время ответа" value={95} max={100} />
      <StatBar label="Верификация" value={100} max={100} />
      
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '24px 0' }} />
      
      <div style={{ fontSize: '10px', letterSpacing: '1px', opacity: 0.3, marginBottom: '12px', fontFamily: '"JetBrains Mono", monospace' }}>БЕЙДЖИ</div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['Верифицирован', 'Топ продавец', 'Быстрые ответы', '100+ сделок'].map(badge => (
          <span key={badge} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '10px' }}>
            {badge}
          </span>
        ))}
      </div>
    </div>
  </div>
);

// ============================================
// MAIN NEURAL HUB COMPONENT
// ============================================
export const NeuralHub = ({ isOpen, onClose, triggerRef }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const hubRef = useRef(null);
  const [activePanel, setActivePanel] = useState(null);
  const [showIdentityCore, setShowIdentityCore] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (hubRef.current && !hubRef.current.contains(e.target)) {
        if (triggerRef?.current && !triggerRef.current.contains(e.target)) {
          onClose();
        }
      }
    };
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, triggerRef]);

  // Reset panel when closing
  useEffect(() => {
    if (!isOpen) setActivePanel(null);
  }, [isOpen]);

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  // Panel content renderer
  const renderPanel = () => {
    const goBack = () => setActivePanel(null);
    switch (activePanel) {
      case 'notifications': return <NotificationsPanel onBack={goBack} />;
      case 'settings': return <SettingsPanel onBack={goBack} />;
      case 'wallet': return <WalletPanel onBack={goBack} />;
      case 'inventory': return <InventoryPanel onBack={goBack} />;
      case 'trust': return <TrustPanel onBack={goBack} />;
      default: return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {/* Backdrop */}
          <motion.div 
            onClick={onClose}
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ backdropFilter: 'blur(30px)' }}
            exit={{ backdropFilter: 'blur(0px)' }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.7)' }}
          />
          
          {/* Container */}
          <motion.div
            ref={hubRef}
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'relative',
              width: '1000px', height: '620px',
              background: 'rgba(18, 18, 18, 0.85)',
              backdropFilter: 'blur(60px)',
              WebkitBackdropFilter: 'blur(60px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '32px',
              boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 0 60px -15px rgba(255,255,255,0.08), 0 25px 80px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)`,
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: activePanel ? '1fr' : '340px 1fr',
              fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              color: 'white',
            }}
            data-testid="neural-hub"
          >
            <SubtleGrid />
            <CornerGlow />

            <AnimatePresence mode="wait">
              {activePanel ? (
                <motion.div
                  key="panel"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.2 }}
                  style={{ padding: '40px', height: '100%', overflow: 'hidden' }}
                >
                  {renderPanel()}
                </motion.div>
              ) : (
                <>
                  {/* LEFT PANEL: IDENTITY */}
                  <motion.div
                    key="identity"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      padding: '40px 36px',
                      background: 'rgba(0,0,0,0.15)',
                      borderRight: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex', flexDirection: 'column',
                    }}
                  >
                    {/* Avatar */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
                      <motion.div
                        animate={{ boxShadow: ['0 0 30px rgba(255,255,255,0.08)', '0 0 50px rgba(255,255,255,0.12)', '0 0 30px rgba(255,255,255,0.08)'] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        style={{ width: '100px', height: '100px', borderRadius: '24px', border: '2px solid rgba(255,255,255,0.12)', overflow: 'hidden', marginBottom: '16px' }}
                      >
                        <img src={AVATAR_URL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(30%)' }} />
                      </motion.div>
                      <div style={{ fontSize: '18px', fontWeight: '600', letterSpacing: '1px', marginBottom: '6px' }}>VOID_ARCHITECT</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10px', padding: '4px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', fontFamily: '"JetBrains Mono", monospace' }}>LVL 99</span>
                        <span style={{ fontSize: '10px', opacity: 0.4, fontFamily: '"JetBrains Mono", monospace' }}>ORIGIN</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', opacity: 0.3 }}>
                        <Clock size={11} />
                        <span>Участник с <MonoNum>2024</MonoNum></span>
                      </div>
                    </div>
                    
                    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', margin: '4px 0 20px' }} />
                    
                    {/* Stats */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '9px', letterSpacing: '2px', opacity: 0.3, marginBottom: '14px', fontFamily: '"JetBrains Mono", monospace' }}>СТАТИСТИКА</div>
                      <StatBar label="Резонанс" value={4850} max={5000} />
                      <StatBar label="Репутация" value={99} max={100} />
                      <StatBar label="Активность" value={92} max={100} />
                    </div>
                    
                    {/* Achievements */}
                    <div>
                      <div style={{ fontSize: '9px', letterSpacing: '2px', opacity: 0.3, marginBottom: '12px', fontFamily: '"JetBrains Mono", monospace' }}>ДОСТИЖЕНИЯ</div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {[Star, Shield, Trophy, Gift, Target].map((Icon, i) => (
                          <div key={i} style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                            <Icon size={16} strokeWidth={1.5} style={{ opacity: 0.5 }} />
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: '10px', opacity: 0.3, marginTop: '10px', fontFamily: '"JetBrains Mono", monospace' }}><MonoNum>24</MonoNum> из <MonoNum>24</MonoNum></div>
                    </div>
                    
                    <div style={{ flex: 1 }} />
                    
                    {/* Logout */}
                    <motion.button
                      onClick={() => { logout(); onClose(); }}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                      style={{ padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '11px' }}
                    >
                      Выйти
                    </motion.button>
                  </motion.div>
                  
                  {/* RIGHT PANEL: OPERATIONS */}
                  <motion.div
                    key="operations"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column' }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <div style={{ fontSize: '9px', letterSpacing: '2px', opacity: 0.3, fontFamily: '"JetBrains Mono", monospace' }}>ПАНЕЛЬ УПРАВЛЕНИЯ</div>
                      <motion.button
                        onClick={onClose}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', opacity: 0.5 }}
                      >
                        <X size={16} />
                      </motion.button>
                    </div>
                    
                    {/* Quick Actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', y: -2 }}
                        style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', cursor: 'pointer', color: 'white', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}
                      >
                        <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '30px', background: 'white', borderRadius: '0 2px 2px 0' }} />
                        <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Gift size={22} strokeWidth={1.5} style={{ opacity: 0.6 }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>Награды</div>
                          <div style={{ fontSize: '11px', opacity: 0.4, fontFamily: '"JetBrains Mono", monospace' }}>3 новых</div>
                        </div>
                      </motion.button>
                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', y: -2 }}
                        style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', cursor: 'pointer', color: 'white', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '16px' }}
                      >
                        <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Target size={22} strokeWidth={1.5} style={{ opacity: 0.6 }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>Задания</div>
                          <div style={{ fontSize: '11px', opacity: 0.4, fontFamily: '"JetBrains Mono", monospace' }}>2/5</div>
                        </div>
                      </motion.button>
                    </div>
                    
                    {/* Navigation Grid */}
                    <div style={{ fontSize: '9px', letterSpacing: '2px', opacity: 0.3, marginBottom: '14px', fontFamily: '"JetBrains Mono", monospace' }}>НАВИГАЦИЯ</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', flex: 1 }}>
                      <NavTile icon={User} label="Профиль" onClick={() => { onClose(); setShowIdentityCore(true); }} />
                      <NavTile icon={Bell} label="Уведомления" badge="3" onClick={() => setActivePanel('notifications')} />
                      <NavTile icon={Mail} label="Сообщения" onClick={() => { onClose(); setShowMessenger(true); }} />
                      <NavTile icon={Package} label="Инвентарь" onClick={() => setActivePanel('inventory')} />
                      <NavTile icon={Trophy} label="Рейтинг" onClick={() => handleNavigate('/rating')} />
                      <NavTile icon={Wallet} label="Баланс" onClick={() => setActivePanel('wallet')} />
                      <NavTile icon={Shield} label="Доверие" onClick={() => setActivePanel('trust')} />
                      <NavTile icon={Settings} label="Настройки" onClick={() => setActivePanel('settings')} />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
      
      {/* IDENTITY CORE - Full-screen profile overlay (renders outside menu) */}
      <IdentityCore 
        isOpen={showIdentityCore} 
        onClose={() => setShowIdentityCore(false)} 
      />
      
      {/* GHOST MESSENGER - Unified chat hub */}
      <GhostMessenger 
        isOpen={showMessenger} 
        onClose={() => setShowMessenger(false)} 
      />
    </AnimatePresence>
  );
};

export default NeuralHub;
