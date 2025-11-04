import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Folder, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';
const WS_URL = API_URL.replace('http', 'ws');

const ChatWindow = ({ onClose, onNewMessage }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [showSessionMenu, setShowSessionMenu] = useState(null);
  
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize WebSocket connection
  useEffect(() => {
    // Generate or get session ID
    const storedSessionId = localStorage.getItem('current_chat_session');
    const newSessionId = storedSessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!storedSessionId) {
      localStorage.setItem('current_chat_session', newSessionId);
    }
    
    setSessionId(newSessionId);

    // Connect to WebSocket
    const ws = new WebSocket(`${WS_URL}/api/ws/support-chat/${newSessionId}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'system') {
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'bot',
          text: data.message,
          timestamp: new Date(data.timestamp)
        }]);
      } else if (data.type === 'user_message') {
        setMessages(prev => [...prev, {
          ...data.message,
          timestamp: new Date(data.message.timestamp)
        }]);
      } else if (data.type === 'bot_message') {
        setIsTyping(false);
        const botMsg = {
          ...data.message,
          timestamp: new Date(data.message.timestamp)
        };
        setMessages(prev => [...prev, botMsg]);
        onNewMessage?.(botMsg);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  // Load chat sessions
  const loadChatSessions = async () => {
    try {
      const headers = {};
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
      
      const response = await fetch(`${API_URL}/api/support-chat/sessions`, { headers });
      if (response.ok) {
        const sessions = await response.json();
        setChatSessions(sessions);
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    }
  };

  // Delete session
  const deleteSession = async (sessionIdToDelete) => {
    try {
      const headers = {};
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
      
      const response = await fetch(`${API_URL}/api/support-chat/sessions/${sessionIdToDelete}`, {
        method: 'DELETE',
        headers
      });
      
      if (response.ok) {
        setChatSessions(prev => prev.filter(s => s.id !== sessionIdToDelete));
        
        // If deleting current session, create new one
        if (sessionIdToDelete === sessionId) {
          localStorage.removeItem('current_chat_session');
          window.location.reload(); // Reload to create new session
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!inputText.trim() || !wsRef.current) return;

    const message = {
      message: inputText,
      user_id: user?.id || null
    };

    wsRef.current.send(JSON.stringify(message));
    setInputText('');
    setIsTyping(true);
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="glass-strong"
      style={{
        position: 'fixed',
        bottom: '90px',
        right: '20px',
        width: '400px',
        height: '600px',
        borderRadius: '16px',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        animation: 'slideUp 0.3s ease-out',
        border: theme === 'dark' 
          ? '1px solid rgba(255, 255, 255, 0.1)' 
          : '1px solid rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem',
          borderBottom: theme === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: theme === 'dark' ? '#fff' : '#1a1a1a'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
              animation: 'pulse-dot 2s ease-in-out infinite'
            }}
          />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
              Support Chat
            </h3>
            <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: 0 }}>
              AI Assistant • Online
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => {
              setShowHistory(!showHistory);
              if (!showHistory) loadChatSessions();
            }}
            style={{
              background: 'transparent',
              border: '1px solid transparent',
              borderRadius: '6px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: theme === 'dark' ? '#fff' : '#1a1a1a'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.border = theme === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.2)'
                : '1px solid rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.border = '1px solid transparent';
            }}
          >
            <Folder size={18} />
          </button>
          
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid transparent',
              borderRadius: '6px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: theme === 'dark' ? '#fff' : '#1a1a1a'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.border = theme === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.2)'
                : '1px solid rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.border = '1px solid transparent';
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Chat History Panel */}
      {showHistory && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme === 'dark' 
              ? 'rgba(20, 20, 30, 0.98)' 
              : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            zIndex: 10,
            padding: '1rem',
            overflowY: 'auto'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            color: theme === 'dark' ? '#fff' : '#1a1a1a'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
              Chat History
            </h3>
            <button
              onClick={() => setShowHistory(false)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: theme === 'dark' ? '#fff' : '#1a1a1a'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {chatSessions.length === 0 ? (
            <p style={{
              textAlign: 'center',
              opacity: 0.6,
              fontSize: '0.875rem',
              color: theme === 'dark' ? '#fff' : '#1a1a1a'
            }}>
              No previous chats
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  style={{
                    padding: '0.875rem',
                    borderRadius: '8px',
                    border: session.id === sessionId
                      ? '1px solid rgba(139, 92, 246, 0.5)'
                      : theme === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)',
                    background: session.id === sessionId
                      ? 'rgba(139, 92, 246, 0.1)'
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (session.id !== sessionId) {
                      e.currentTarget.style.background = theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (session.id !== sessionId) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        marginBottom: '0.25rem',
                        color: theme === 'dark' ? '#fff' : '#1a1a1a'
                      }}>
                        {session.title}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        opacity: 0.7,
                        marginBottom: '0.25rem',
                        color: theme === 'dark' ? '#fff' : '#1a1a1a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {session.last_message || 'No messages'}
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        opacity: 0.5,
                        color: theme === 'dark' ? '#fff' : '#1a1a1a'
                      }}>
                        {session.messages_count} messages • {new Date(session.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ef4444',
                        opacity: 0.7,
                        transition: 'opacity 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              animation: 'fadeIn 0.3s ease-out'
            }}
          >
            <div
              style={{
                maxWidth: '75%',
                padding: '0.75rem 1rem',
                borderRadius: message.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: message.sender === 'user'
                  ? 'rgba(139, 92, 246, 0.2)'
                  : theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.05)',
                color: theme === 'dark' ? '#fff' : '#1a1a1a',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                wordWrap: 'break-word'
              }}
            >
              {message.text}
              <div style={{
                fontSize: '0.7rem',
                opacity: 0.6,
                marginTop: '0.25rem'
              }}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '16px 16px 16px 4px',
                background: theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.05)',
                display: 'flex',
                gap: '0.25rem'
              }}
            >
              <span className="typing-dot" style={{ animationDelay: '0s' }}>•</span>
              <span className="typing-dot" style={{ animationDelay: '0.2s' }}>•</span>
              <span className="typing-dot" style={{ animationDelay: '0.4s' }}>•</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '1rem',
          borderTop: theme === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          display: 'flex',
          gap: '0.75rem'
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid transparent',
            background: 'transparent',
            color: theme === 'dark' ? '#fff' : '#1a1a1a',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'all 0.3s ease'
          }}
          onFocus={(e) => {
            e.currentTarget.style.border = theme === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.2)'
              : '1px solid rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.background = theme === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.05)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = '1px solid transparent';
            e.currentTarget.style.background = 'transparent';
          }}
        />
        
        <button
          onClick={sendMessage}
          disabled={!inputText.trim()}
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid rgba(139, 92, 246, 0.5)',
            background: 'rgba(139, 92, 246, 0.2)',
            color: '#fff',
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            opacity: inputText.trim() ? 1 : 0.5,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            if (inputText.trim()) {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
