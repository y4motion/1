import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MessageCircle, Send, X, Users, Sparkles } from 'lucide-react';
import './LiveChatWidget.css';

const API_URL = '';

// Generate initial data based on productId
const getInitialData = (productId) => {
  const hash = (productId || 'default').split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return {
    onlineCount: Math.abs(hash % 10) + 3,
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

// AI-powered response generation using Glassy Mind
const generateAIResponse = async (userMessage, productTitle, productCategory) => {
  try {
    // Call the new AI chat endpoint
    const response = await fetch(`${API_URL}/api/mind/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        product_info: {
          title: productTitle,
          category: productCategory
        }
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.response) {
        return {
          response: data.is_ai ? `🤖 ${data.response}` : data.response,
          isAI: data.is_ai || false,
          abGroup: data.ab_group
        };
      }
    }
    
    // Fallback to quick tip
    const tipResponse = await fetch(`${API_URL}/api/mind/quick-tip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: productTitle,
        category: productCategory
      })
    });
    
    if (tipResponse.ok) {
      const tipData = await tipResponse.json();
      if (tipData.tip) {
        return { response: tipData.tip, isAI: false, abGroup: tipData.ab_group };
      }
    }
    
    return { response: null, isAI: false };
    
  } catch (error) {
    console.log('AI response generation failed, using fallback');
    return { response: null, isAI: false };
  }
};

const LiveChatWidget = ({ productId, productTitle, productCategory }) => {
  const initialData = useMemo(() => getInitialData(productId), [productId]);
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialData.messages);
  const [newMessage, setNewMessage] = useState('');
  const [onlineCount] = useState(initialData.onlineCount);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessageText = newMessage;
    const message = {
      id: Date.now(),
      username: 'You',
      text: userMessageText,
      time: 'Just now',
      avatar: '😊',
      isOwn: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setIsTyping(true);

    // Try to get AI response first
    const { response: aiResponse, isAI } = await generateAIResponse(
      userMessageText, 
      productTitle, 
      productCategory
    );

    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      
      if (aiResponse && isAI) {
        // AI-powered response
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          username: 'Glassy AI',
          text: aiResponse,
          time: 'Just now',
          avatar: '🤖',
          isAI: true
        }]);
      } else {
        // Community response fallback
        const responses = [
          'Great question! I had the same thought 👍',
          'Check the specs tab for more details',
          'Works perfectly for me!',
          'Highly recommend based on my experience',
          'Been using it for a month now, no complaints!'
        ];
        const randomUser = ['GamerPro', 'TechFan', 'ProUser', 'AudioNerd'][Math.floor(Math.random() * 4)];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          username: randomUser,
          text: randomResponse,
          time: 'Just now',
          avatar: ['🎮', '💻', '🎯', '🎧'][Math.floor(Math.random() * 4)]
        }]);
      }
    }, isAI ? 1500 : 2000);
  };

  return (
    <>
      {/* Collapsed state - floating button */}
      {!isOpen && (
        <button 
          className="live-chat-fab"
          onClick={() => setIsOpen(true)}
          data-testid="live-chat-fab"
        >
          <MessageCircle size={20} />
          <span>Live Chat</span>
          <span className="fab-online">
            <span className="online-dot"></span>
            {onlineCount} online
          </span>
        </button>
      )}

      {/* Expanded state - full chat panel */}
      {isOpen && (
        <div className="live-chat-panel" data-testid="live-chat-panel">
          {/* Header */}
          <div className="chat-panel-header">
            <div className="chat-header-left">
              <MessageCircle size={18} />
              <span className="chat-title">Live Chat</span>
              <span className="ai-badge">
                <Sparkles size={12} />
                AI
              </span>
            </div>
            <div className="chat-header-right">
              <span className="online-count">
                <Users size={14} />
                {onlineCount} viewing
              </span>
              <button 
                className="chat-close-btn" 
                onClick={() => setIsOpen(false)}
                data-testid="chat-close-btn"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-panel-messages">
            <div className="chat-welcome">
              💬 Discuss <strong>{productTitle || 'this product'}</strong> with other viewers
              <span className="ai-hint">🤖 Ask me anything about compatibility!</span>
            </div>
            
            {messages.map(msg => (
              <div key={msg.id} className={`chat-message ${msg.isOwn ? 'own' : ''} ${msg.isAI ? 'ai-message' : ''}`}>
                <span className="message-avatar">{msg.avatar}</span>
                <div className="message-content">
                  <div className="message-header">
                    <strong>{msg.username}</strong>
                    {msg.isAI && <span className="ai-tag">AI Assistant</span>}
                    <span className="message-time">{msg.time}</span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="chat-message typing">
                <span className="message-avatar">💭</span>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-panel-input">
            <input
              type="text"
              placeholder="Ask about compatibility, shipping, quality..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="chat-input"
              data-testid="chat-input"
            />
            <button 
              className="chat-send-btn" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              data-testid="chat-send-btn"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveChatWidget;
