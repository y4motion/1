/**
 * SmartChannelSwitcher - Horizontal bubbles for switching guilds/sellers
 * 
 * Like Instagram stories but for chat channels:
 * - Guilds mode: Show user's guilds
 * - Trade mode: Show active seller/buyer conversations
 * 
 * Features:
 * - Pulsing animation for unread messages
 * - Neon glow for active channel
 * - Horizontal scroll with smooth animation
 */

import React, { useState, useEffect } from 'react';
import { Shield, ShoppingBag, Store, User, Crown, Zap, Pickaxe, Gamepad } from 'lucide-react';
import './SmartChannelSwitcher.css';

// Mock data for guilds
const MOCK_GUILDS = [
  {
    id: 'guild_1',
    name: 'CyberSamurai',
    icon: '⚔️',
    color: '#ef4444',
    members: 1240,
    unread: 3,
    level_required: 5,
  },
  {
    id: 'guild_2', 
    name: 'Miners United',
    icon: '⛏️',
    color: '#f59e0b',
    members: 856,
    unread: 0,
    level_required: 3,
  },
  {
    id: 'guild_3',
    name: 'RGB Masters',
    icon: '🌈',
    color: '#8b5cf6',
    members: 2100,
    unread: 12,
    level_required: 10,
  },
];

// Mock data for trade conversations
const MOCK_TRADERS = [
  {
    id: 'trader_1',
    name: 'TechZone Store',
    avatar: '🏪',
    type: 'store',
    color: '#3b82f6',
    unread: 2,
    lastMessage: 'RTX 5090 in stock!',
    isOnline: true,
  },
  {
    id: 'trader_2',
    name: 'MaxGPU',
    avatar: '👤',
    type: 'seller',
    color: '#22c55e',
    unread: 0,
    lastMessage: 'Deal confirmed',
    isOnline: true,
  },
  {
    id: 'trader_3',
    name: 'SwapMaster99',
    avatar: '🔄',
    type: 'swapper',
    color: '#f59e0b',
    unread: 5,
    lastMessage: 'Interested in your GPU',
    isOnline: false,
  },
  {
    id: 'trader_4',
    name: 'PC Parts Pro',
    avatar: '🖥️',
    type: 'store',
    color: '#ef4444',
    unread: 0,
    lastMessage: 'Order shipped',
    isOnline: true,
  },
];

const SmartChannelSwitcher = ({ 
  mode, 
  activeChannel, 
  onChannelChange,
  userLevel = 1 
}) => {
  const [channels, setChannels] = useState([]);
  
  // Load channels based on mode
  useEffect(() => {
    if (mode === 'guilds') {
      // Filter guilds by user level
      const accessible = MOCK_GUILDS.filter(g => userLevel >= g.level_required);
      setChannels(accessible);
    } else if (mode === 'trade') {
      setChannels(MOCK_TRADERS);
    }
  }, [mode, userLevel]);
  
  // Get icon for channel type
  const getChannelIcon = (channel) => {
    if (mode === 'guilds') {
      return channel.icon;
    }
    
    switch (channel.type) {
      case 'store':
        return <Store size={16} />;
      case 'seller':
        return <User size={16} />;
      case 'swapper':
        return <Zap size={16} />;
      default:
        return <ShoppingBag size={16} />;
    }
  };
  
  if (channels.length === 0) {
    return (
      <div className="smart-switcher empty">
        <span>
          {mode === 'guilds' 
            ? '🔒 No guilds available at your level' 
            : '💬 No active conversations'}
        </span>
      </div>
    );
  }
  
  return (
    <div className="smart-switcher" data-testid="smart-channel-switcher">
      <div className="switcher-scroll">
        {channels.map((channel) => {
          const isActive = activeChannel?.id === channel.id;
          const hasUnread = channel.unread > 0;
          
          return (
            <button
              key={channel.id}
              className={`channel-bubble ${isActive ? 'active' : ''} ${hasUnread ? 'has-unread' : ''}`}
              onClick={() => onChannelChange(channel)}
              style={{ '--channel-color': channel.color }}
              data-testid={`channel-${channel.id}`}
            >
              {/* Avatar/Icon */}
              <div className="bubble-avatar">
                {typeof getChannelIcon(channel) === 'string' ? (
                  <span className="emoji-icon">{getChannelIcon(channel)}</span>
                ) : (
                  getChannelIcon(channel)
                )}
                
                {/* Online indicator for traders */}
                {mode === 'trade' && channel.isOnline && (
                  <span className="online-dot" />
                )}
              </div>
              
              {/* Unread badge */}
              {hasUnread && (
                <span className="unread-badge">
                  {channel.unread > 9 ? '9+' : channel.unread}
                </span>
              )}
              
              {/* Name (visible on hover or when active) */}
              <span className="bubble-name">{channel.name}</span>
              
              {/* Pulse animation ring */}
              {hasUnread && <span className="pulse-ring" />}
            </button>
          );
        })}
      </div>
      
      {/* Active channel indicator */}
      {activeChannel && (
        <div className="active-channel-info">
          <span className="channel-label">
            {mode === 'guilds' ? 'Guild:' : 'Chat with:'}
          </span>
          <span 
            className="channel-name"
            style={{ color: activeChannel.color }}
          >
            {activeChannel.name}
          </span>
          {mode === 'guilds' && (
            <span className="member-count">
              {activeChannel.members?.toLocaleString()} members
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartChannelSwitcher;
