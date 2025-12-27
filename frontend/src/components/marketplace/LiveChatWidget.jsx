import React, { useState, useRef, useMemo } from 'react';
import { MessageCircle, Send, X, Users } from 'lucide-react';
import './LiveChatWidget.css';

// Generate initial data based on productId
const getInitialData = (productId) => {
  const hash = (productId || 'default').split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return {
    onlineCount: Math.abs(hash % 10) + 1,
    messages: [
      { 
        id: 1, 
        username: 'GamerPro', 
        text: 'Anyone using this for competitive gaming?', 
        time: '5 min ago',
        avatar: '🎮'
      },
      { 
        id: 2, 
        username: 'TechReviewer', 
        text: 'Yes! Great for FPS games, very responsive', 
        time: '3 min ago',
        avatar: '🔧'
      },
      { 
        id: 3, 
        username: 'NewUser', 
        text: 'How\'s the build quality?', 
        time: '1 min ago',
        avatar: '👤'
      }
    ]
  };
};

const LiveChatWidget = ({ productId, productTitle }) => {
  const initialData = useMemo(() => getInitialData(productId), [productId]);
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialData.messages);
  const [newMessage, setNewMessage] = useState('');
  const [onlineCount] = useState(initialData.onlineCount);
  const messagesEndRef = useRef(null);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      username: 'You',
      text: newMessage,
      time: 'Just now',
      avatar: '😊',
      isOwn: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    // Simulate response
    setTimeout(() => {
      const responses = [
        'Great question!',
        'I had the same thought 👍',
        'Check the specs tab for more info',
        'Works perfectly for me!'
      ];
      const randomUser = ['GamerPro', 'TechFan', 'ProUser'][Math.floor(Math.random() * 3)];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        username: randomUser,
        text: randomResponse,
        time: 'Just now',
        avatar: ['🎮', '💻', '🎯'][Math.floor(Math.random() * 3)]
      }]);
    }, 2000);
  };

  return (
    <div className="live-chat-widget">
      {!isOpen ? (
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
          <MessageCircle size={20} />
          <span>Live Chat</span>
          <span className="online-badge">
            <span className="online-dot"></span>
            {onlineCount} online
          </span>
        </button>
      ) : (
        <div className="chat-container">
          <div className="chat-header">
            <div className="chat-header-left">
              <MessageCircle size={18} />
              <span className="chat-title">Live Chat</span>
            </div>
            <div className="chat-header-right">
              <span className="online-count">
                <Users size={14} />
                {onlineCount} viewing
              </span>
              <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="chat-messages">
            <div className="chat-welcome">
              💬 Discuss <strong>{productTitle || 'this product'}</strong> with other viewers
            </div>
            
            {messages.map(msg => (
              <div key={msg.id} className={`chat-message ${msg.isOwn ? 'own' : ''}`}>
                <span className="message-avatar">{msg.avatar}</span>
                <div className="message-content">
                  <div className="message-header">
                    <strong>{msg.username}</strong>
                    <span className="message-time">{msg.time}</span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="chat-input"
            />
            <button 
              className="chat-send-btn" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveChatWidget;
