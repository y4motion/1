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
    // First get user context from Mind
    const contextRes = await fetch(`${API_URL}/api/mind/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ include_suggestions: true })
    });
    
    const contextData = await contextRes.json();
    
    // Generate contextual response based on user message and context
    const lowerMessage = userMessage.toLowerCase();
    const category = (productCategory || '').toLowerCase();
    const suggestions = contextData.suggestions?.suggestions || [];
    
    // Smart response logic
    let response = null;
    let isAI = false;
    
    // Questions about compatibility
    if (lowerMessage.includes('compatible') || lowerMessage.includes('совместим') || 
        lowerMessage.includes('work with') || lowerMessage.includes('подойдет')) {
      isAI = true;
      if (category.includes('gpu') || category.includes('graphics')) {
        response = `🤖 For GPU compatibility, check your PSU wattage (this card needs 650W+ recommended) and PCIe slot availability. What\'s your current setup?`;
      } else if (category.includes('headphone') || category.includes('audio')) {
        response = `🤖 These headphones work with any device with Bluetooth 5.0+ or 3.5mm jack. For best audio quality, consider a DAC/amp combo!`;
      } else if (category.includes('keyboard') || category.includes('mouse')) {
        response = `🤖 Works with Windows, Mac, and Linux. The wireless receiver uses a standard USB-A port. Need adapter for USB-C only devices.`;
      } else {
        response = `🤖 I can help with compatibility! What device are you planning to use this with?`;
      }
    }
    
    // Questions about quality/worth
    else if (lowerMessage.includes('worth') || lowerMessage.includes('стоит') || 
             lowerMessage.includes('quality') || lowerMessage.includes('качество')) {
      isAI = true;
      const viewedCount = contextData.context?.total_views || 0;
      if (viewedCount > 3) {
        response = `🤖 I see you\'ve been researching! Based on reviews, this is excellent value. ${productTitle} has a 4.5+ average rating.`;
      } else {
        response = `🤖 Great question! Check the Reviews tab for verified buyer feedback. Most users rate the build quality highly.`;
      }
    }
    
    // Price questions
    else if (lowerMessage.includes('price') || lowerMessage.includes('цен') || 
             lowerMessage.includes('discount') || lowerMessage.includes('скидк') ||
             lowerMessage.includes('deal') || lowerMessage.includes('sale')) {
      isAI = true;
      response = `🤖 Pro tip: Add to wishlist to get notified about price drops! We also have promo codes occasionally - check the homepage banner.`;
    }
    
    // Shipping questions
    else if (lowerMessage.includes('ship') || lowerMessage.includes('доставк') || 
             lowerMessage.includes('delivery') || lowerMessage.includes('когда приедет')) {
      isAI = true;
      response = `🤖 Standard shipping is 3-5 business days. Express available at checkout. Free shipping on orders over $99!`;
    }
    
    // General tech questions - use bundle suggestions
    else if (lowerMessage.includes('recommend') || lowerMessage.includes('посоветуй') ||
             lowerMessage.includes('suggest') || lowerMessage.includes('what else')) {
      isAI = true;
      const bundleSuggestion = suggestions.find(s => s.type === 'bundle');
      if (bundleSuggestion) {
        const accessories = bundleSuggestion.recommended_accessories?.slice(0, 2).join(', ') || 'accessories';
        response = `🤖 Based on your browsing, I\'d suggest adding a ${accessories} to complete your setup! Perfect combo with ${productTitle}.`;
      } else {
        response = `🤖 Check the "Related Products" section below - we've curated items that pair well with this!`;
      }
    }
    
    // Return AI response or null for community response
    return { response, isAI };
    
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
