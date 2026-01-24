import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Send,
  Paperclip,
  Bot,
  Users,
  MessageSquare,
  Headphones,
  Sparkles,
  MoreVertical,
  Minimize2,
  Maximize2,
  GripHorizontal,
  ExternalLink,
  Lightbulb,
  X,
  Ghost,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import './GlassyChatBar.css';

// Use relative URLs to avoid mixed content issues in HTTPS environments
const API_URL = process.env.REACT_APP_BACKEND_URL || '';
const WS_URL = (process.env.REACT_APP_BACKEND_URL || '').replace('http', 'ws');

// Agent status constants (from backend)
const AGENT_STATUS = {
  IDLE: 'idle',
  ANALYZING: 'analyzing',
  READY_TO_SUGGEST: 'ready_to_suggest'
};

// Tab configuration with priorities
const BASE_TABS = [
  { id: 'ai', icon: Bot, label: { en: 'AI', ru: 'AI' }, basePriority: 1 },
  { id: 'messages', icon: MessageSquare, label: { en: 'Messages', ru: 'Сообщения' }, basePriority: 2 },
  { id: 'community', icon: Users, label: { en: 'Community', ru: 'Сообщество' }, basePriority: 3 },
  { id: 'support', icon: Headphones, label: { en: 'Support', ru: 'Поддержка' }, basePriority: 4 },
];

// Panel modes
const PANEL_MODES = {
  COLLAPSED: 'collapsed',
  MINI: 'mini',      // 50% height
  EXPANDED: 'expanded', // 75% height
  FULLSCREEN: 'fullscreen', // 100% height
};

const GlassyChatBar = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();

  // Panel State
  const [panelMode, setPanelMode] = useState(PANEL_MODES.COLLAPSED);
  const [customHeight, setCustomHeight] = useState(null); // For drag resize
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [peekMessage, setPeekMessage] = useState(null);
  
  // Chat State
  const [activeTab, setActiveTab] = useState('ai');
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({ ai: 0, messages: 0, community: 0, support: 0 });
  const [lastMessageSource, setLastMessageSource] = useState(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  
  // Agent Status State (for "Living Bar" feature)
  const [agentStatus, setAgentStatus] = useState(AGENT_STATUS.IDLE);
  const [agentSuggestion, setAgentSuggestion] = useState(null);
  const [showSuggestionPopup, setShowSuggestionPopup] = useState(false);
  
  // Private Chat State (for Swap)
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  
  // Dynamic Tab Priorities
  const [tabPriorities, setTabPriorities] = useState({
    ai: 1,
    messages: 2,
    community: 3,
    support: 4
  });

  // Refs
  const wsRef = useRef(null);
  const wsInitialized = useRef(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const panelRef = useRef(null);
  const lastInteractionRef = useRef(Date.now());
  const autoCollapseTimerRef = useRef(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const isDraggingRef = useRef(false); // Ref for drag state to avoid closure issues
  
  // ========================================
  // DYNAMIC TAB SORTING
  // ========================================
  
  // Calculate dynamic tab order based on context, unread, and activity
  const getSortedTabs = useCallback(() => {
    const context = location.pathname;
    const dynamicPriorities = { ...tabPriorities };
    
    // Boost priority based on context
    if (context.startsWith('/glassy-swap')) {
      dynamicPriorities.messages = 0; // Messages first on Swap pages
      dynamicPriorities.community = 1;
    } else if (context.startsWith('/pc-builder')) {
      dynamicPriorities.ai = 0; // AI first on Builder
      dynamicPriorities.support = 1;
    } else if (context.includes('/product/')) {
      dynamicPriorities.community = 0; // Community first on product pages
      dynamicPriorities.ai = 1;
    }
    
    // Boost tabs with unread messages
    Object.keys(unreadCounts).forEach(tabId => {
      if (unreadCounts[tabId] > 0) {
        dynamicPriorities[tabId] = Math.max(0, dynamicPriorities[tabId] - 2);
      }
    });
    
    // Sort tabs by priority
    return [...BASE_TABS].sort((a, b) => {
      const priorityA = dynamicPriorities[a.id] ?? a.basePriority;
      const priorityB = dynamicPriorities[b.id] ?? b.basePriority;
      return priorityA - priorityB;
    });
  }, [location.pathname, tabPriorities, unreadCounts]);
  
  // Memoized sorted tabs
  const sortedTabs = getSortedTabs();
  
  // Update priorities when context changes
  useEffect(() => {
    const context = location.pathname;
    
    if (context.startsWith('/glassy-swap')) {
      setTabPriorities({ messages: 0, community: 1, ai: 2, support: 3 });
    } else if (context.startsWith('/pc-builder')) {
      setTabPriorities({ ai: 0, support: 1, community: 2, messages: 3 });
    } else if (context.includes('/product/')) {
      setTabPriorities({ community: 0, ai: 1, messages: 2, support: 3 });
    } else {
      setTabPriorities({ ai: 1, messages: 2, community: 3, support: 4 });
    }
  }, [location.pathname]);

  // ========================================
  // AUTO-COLLAPSE LOGIC
  // ========================================
  
  const resetAutoCollapseTimer = useCallback(() => {
    lastInteractionRef.current = Date.now();
    if (autoCollapseTimerRef.current) {
      clearTimeout(autoCollapseTimerRef.current);
    }
  }, []);

  // Track user interaction
  const handleInteraction = useCallback(() => {
    resetAutoCollapseTimer();
  }, [resetAutoCollapseTimer]);

  // Auto-collapse on scroll after 15s of inactivity
  useEffect(() => {
    if (panelMode === PANEL_MODES.COLLAPSED) return;

    const handleScroll = () => {
      const timeSinceLastInteraction = Date.now() - lastInteractionRef.current;
      if (timeSinceLastInteraction > 15000) { // 15 seconds
        setPanelMode(PANEL_MODES.COLLAPSED);
        setCustomHeight(null);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [panelMode]);

  // ========================================
  // AGENT STATUS POLLING (Living Bar)
  // ========================================
  
  const fetchAgentStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/mind/agent-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAgentStatus(data.status);
          
          // If agent has a suggestion, show popup
          if (data.status === AGENT_STATUS.READY_TO_SUGGEST && data.suggestion) {
            setAgentSuggestion(data.suggestion);
            setShowSuggestionPopup(true);
          }
        }
      }
    } catch (error) {
      // Silent fail - polling shouldn't break the UI
      console.debug('Agent status fetch failed:', error);
    }
  }, []);

  // Function to send events to the Mind API
  const sendMindEvent = useCallback(async (eventType, metadata = {}) => {
    try {
      const response = await fetch(`${API_URL}/api/mind/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          event_type: eventType,
          metadata
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAgentStatus(data.current_mind_state);
          
          // If ready to suggest, show popup
          if (data.current_mind_state === AGENT_STATUS.READY_TO_SUGGEST && data.suggestion) {
            setAgentSuggestion(data.suggestion);
            setShowSuggestionPopup(true);
          }
        }
      }
    } catch (error) {
      console.debug('Mind event send failed:', error);
    }
  }, []);

  // Track page navigation as events
  useEffect(() => {
    const path = location.pathname;
    
    // Determine event type based on path
    if (path.startsWith('/product/')) {
      sendMindEvent('view', { page: 'product', id: path.split('/')[2] });
    } else if (path.startsWith('/marketplace')) {
      sendMindEvent('view', { page: 'marketplace' });
    } else if (path.startsWith('/pc-builder')) {
      sendMindEvent('view', { page: 'pc-builder' });
    } else if (path.startsWith('/glassy-swap')) {
      sendMindEvent('view', { page: 'glassy-swap' });
    }
  }, [location.pathname, sendMindEvent]);

  // Poll every 10 seconds
  useEffect(() => {
    // Initial fetch
    fetchAgentStatus();
    
    // Set up interval
    const intervalId = setInterval(fetchAgentStatus, 10000);
    
    return () => clearInterval(intervalId);
  }, [fetchAgentStatus]);

  // Dismiss suggestion handler
  const dismissSuggestion = useCallback(async () => {
    setShowSuggestionPopup(false);
    setAgentSuggestion(null);
    setAgentStatus(AGENT_STATUS.IDLE);
    
    // Notify backend
    try {
      await fetch(`${API_URL}/api/mind/agent-status/dismiss`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });
    } catch (e) {
      // Silent fail
    }
  }, []);

  // Open chat with suggestion
  const openChatWithSuggestion = useCallback(() => {
    setPanelMode(PANEL_MODES.MINI);
    setActiveTab('ai');
    setShowSuggestionPopup(false);
    handleInteraction();
    
    // Add suggestion as bot message (using setMessages directly to avoid circular dep)
    if (agentSuggestion) {
      setMessages(prev => ({
        ...prev,
        ai: [...(prev.ai || []), {
          id: Date.now(),
          sender: 'bot',
          text: `💡 ${agentSuggestion}`,
          timestamp: new Date(),
        }]
      }));
    }
    
    dismissSuggestion();
  }, [agentSuggestion, handleInteraction, dismissSuggestion]);

  // ========================================
  // GESTURE HANDLERS
  // ========================================

  // Touch start for swipe detection
  const touchStartRef = useRef({ y: 0, time: 0 });

  const handleTouchStart = (e) => {
    touchStartRef.current = {
      y: e.touches[0].clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e) => {
    const deltaY = touchStartRef.current.y - e.changedTouches[0].clientY;
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    // Swipe up from collapsed bar
    if (panelMode === PANEL_MODES.COLLAPSED && deltaY > 50 && deltaTime < 300) {
      setPanelMode(PANEL_MODES.MINI); // Open in Mini Mode (50% height) by default
      handleInteraction();
    }
    // Swipe down from expanded panel
    else if (panelMode !== PANEL_MODES.COLLAPSED && deltaY < -50 && deltaTime < 300) {
      setPanelMode(PANEL_MODES.COLLAPSED);
      setCustomHeight(null);
    }
  };

  // Double tap to toggle mini/fullscreen
  const lastTapRef = useRef(0);
  
  const handleHeaderDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected
      if (panelMode === PANEL_MODES.FULLSCREEN) {
        setPanelMode(PANEL_MODES.MINI);
      } else {
        setPanelMode(PANEL_MODES.FULLSCREEN);
      }
      setCustomHeight(null);
      handleInteraction();
    }
    lastTapRef.current = now;
  };

  // ========================================
  // DRAG RESIZE
  // ========================================

  const handleDragMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    
    const currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    const deltaY = dragStartY.current - currentY;
    const newHeight = Math.min(
      Math.max(dragStartHeight.current + deltaY, window.innerHeight * 0.3),
      window.innerHeight * 0.95
    );
    
    setCustomHeight(newHeight);
    setPanelMode(PANEL_MODES.EXPANDED); // Switch to expanded mode when dragging
  }, []);

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
    handleInteraction();
  }, [handleDragMove, handleInteraction]);

  const handleDragStart = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartY.current = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    dragStartHeight.current = panelRef.current?.offsetHeight || window.innerHeight * 0.5;
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('touchend', handleDragEnd);
  };

  // ========================================
  // EXTERNAL OPEN EVENT
  // ========================================

  useEffect(() => {
    const handleOpenChat = (event) => {
      setPanelMode(PANEL_MODES.MINI); // Open in Mini Mode (50% height) by default
      if (event.detail?.tab) {
        setActiveTab(event.detail.tab);
      }
      if (event.detail?.message) {
        // Add welcome message from bot
        const welcomeMsg = {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: event.detail.message,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => ({
          ...prev,
          ai: [...(prev.ai || []), welcomeMsg]
        }));
      }
      handleInteraction();
    };
    
    window.addEventListener('openGlassyChat', handleOpenChat);
    return () => window.removeEventListener('openGlassyChat', handleOpenChat);
  }, [handleInteraction]);

  // ========================================
  // AUTO-OPEN ON PC BUILDER PAGE
  // ========================================
  
  useEffect(() => {
    const path = location.pathname;
    
    // Auto-open chat bar (collapsed but visible) on PC Builder page
    if (path.startsWith('/pc-builder')) {
      // Only show welcome on first visit to PC Builder in this session
      const hasSeenBuilderWelcome = sessionStorage.getItem('pcbuilder_chat_shown');
      
      if (!hasSeenBuilderWelcome) {
        // Delay to let page load first
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('openGlassyChat', { 
            detail: { 
              tab: 'ai',
              message: language === 'ru' 
                ? '🔧 Привет! Я помогу тебе собрать идеальный ПК. Расскажи, для каких задач тебе нужен компьютер — игры, работа, стриминг? Или могу подсказать по совместимости компонентов!'
                : '🔧 Hey! I\'m here to help you build the perfect PC. Tell me what you need it for — gaming, work, streaming? I can also help with component compatibility!'
            }
          }));
          sessionStorage.setItem('pcbuilder_chat_shown', 'true');
        }, 1500);
      }
    }
  }, [location.pathname, language]);

  // ========================================
  // SPEECH RECOGNITION
  // ========================================

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'ru' ? 'ru-RU' : 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(prev => prev + transcript);
        setIsRecording(false);
      };
      
      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, [language]);

  // ========================================
  // WEBSOCKET
  // ========================================

  const addMessage = useCallback((tab, message) => {
    setMessages(prev => {
      const tabMessages = prev[tab] || [];
      if (message.id && tabMessages.some(m => m.id === message.id)) {
        return prev;
      }
      return { ...prev, [tab]: [...tabMessages, message] };
    });
  }, []);

  useEffect(() => {
    if (wsInitialized.current) return;
    wsInitialized.current = true;
    
    const storedSessionId = localStorage.getItem('glassy_chat_session');
    const newSessionId = storedSessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!storedSessionId) {
      localStorage.setItem('glassy_chat_session', newSessionId);
    }
    setSessionId(newSessionId);

    let systemMessageReceived = false;
    
    const connectWebSocket = () => {
      const ws = new WebSocket(`${WS_URL}/api/ws/support-chat/${newSessionId}`);
      
      ws.onopen = () => console.log('GlassyChatBar WebSocket connected');
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'system') {
          if (!systemMessageReceived) {
            systemMessageReceived = true;
            addMessage('ai', {
              id: Date.now(),
              sender: 'bot',
              text: data.message,
              timestamp: new Date(data.timestamp),
            });
          }
        } else if (data.type === 'bot_message') {
          setIsTyping(false);
          const newMsg = {
            ...data.message,
            timestamp: new Date(data.message.timestamp),
          };
          addMessage('ai', newMsg);
          
          // Update unread + indicators
          setUnreadCounts(prev => ({ ...prev, ai: prev.ai + 1 }));
          setLastMessageSource('ai');
          setHasNewMessage(true);
          
          // Show peek preview if collapsed
          if (panelMode === PANEL_MODES.COLLAPSED) {
            setPeekMessage(data.message.text?.substring(0, 60) + '...');
            setTimeout(() => setPeekMessage(null), 3000);
          }
          
          setTimeout(() => {
            setLastMessageSource(null);
            setHasNewMessage(false);
          }, 5000);
        }
      };
      
      ws.onerror = (error) => console.error('WebSocket error:', error);
      ws.onclose = () => setTimeout(connectWebSocket, 3000);
      
      wsRef.current = ws;
    };
    
    connectWebSocket();
    
    return () => wsRef.current?.close();
  }, [addMessage, panelMode]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  // Clear unread when tab is active
  useEffect(() => {
    if (panelMode !== PANEL_MODES.COLLAPSED) {
      setUnreadCounts(prev => ({ ...prev, [activeTab]: 0 }));
    }
  }, [activeTab, panelMode]);

  // ========================================
  // CONTEXT DETECTION
  // ========================================

  const getPageContext = useCallback(() => {
    const path = location.pathname;
    
    if (path.startsWith('/product/')) {
      const productId = path.split('/')[2];
      return { type: 'product', id: productId, label: language === 'ru' ? 'Вопросы о товаре' : 'Product Questions' };
    }
    if (path.startsWith('/marketplace')) {
      return { type: 'marketplace', label: language === 'ru' ? 'Обсуждение маркетплейса' : 'Marketplace Discussion' };
    }
    if (path.match(/^\/glassy-swap\/[^/]+$/)) {
      // On specific listing page - extract listing ID
      const listingId = path.split('/')[2];
      return { 
        type: 'swap_listing', 
        id: listingId, 
        label: language === 'ru' ? 'Обсуждение объявления' : 'Listing Discussion',
        icon: 'listing'
      };
    }
    if (path.startsWith('/glassy-swap')) {
      return { 
        type: 'swap', 
        label: language === 'ru' ? 'Swap Сообщество' : 'Swap Community',
        icon: 'swap'
      };
    }
    if (path.startsWith('/pc-builder')) {
      return { type: 'pcbuilder', label: language === 'ru' ? 'Помощь со сборкой' : 'Build Help' };
    }
    
    return { type: 'general', label: language === 'ru' ? 'Общий чат' : 'General Chat' };
  }, [location.pathname, language]);

  // ========================================
  // PRIVATE CHAT FUNCTIONS (Swap)
  // ========================================

  // Fetch user's conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    setLoadingConversations(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/swap/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        
        // Calculate total unread for messages tab
        const totalUnread = data.reduce((sum, c) => sum + (c.unread || 0), 0);
        setUnreadCounts(prev => ({ ...prev, messages: totalUnread }));
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  // Start conversation with seller (from listing page)
  const startConversation = useCallback(async (listingId) => {
    if (!user) {
      alert(language === 'ru' ? 'Войдите, чтобы написать продавцу' : 'Login to message seller');
      return null;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/swap/chat/conversations/${listingId}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const conv = await res.json();
        setActiveConversation(conv);
        await fetchConversationMessages(conv.id);
        return conv;
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
    }
    return null;
  }, [user, language]);

  // Fetch messages for a conversation
  const fetchConversationMessages = useCallback(async (conversationId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/swap/chat/conversations/${conversationId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const msgs = await res.json();
        setConversationMessages(msgs);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, []);

  // Send private message
  const sendPrivateMessage = useCallback(async () => {
    if (!inputMessage.trim() || !activeConversation) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/swap/chat/conversations/${activeConversation.id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: inputMessage })
      });
      
      if (res.ok) {
        const msg = await res.json();
        setConversationMessages(prev => [...prev, msg]);
        setInputMessage('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  }, [inputMessage, activeConversation]);

  // Fetch conversations when Messages tab is opened
  useEffect(() => {
    if (activeTab === 'messages' && user) {
      fetchConversations();
    }
  }, [activeTab, user, fetchConversations]);

  // Auto-start conversation on swap listing page
  useEffect(() => {
    const context = getPageContext();
    if (activeTab === 'messages' && context.type === 'swap_listing' && user && !activeConversation) {
      startConversation(context.id);
    }
  }, [activeTab, getPageContext, user, activeConversation, startConversation]);

  // ========================================
  // MESSAGE HANDLERS
  // ========================================

  const handleSendMessage = () => {
    // Handle private chat messages
    if (activeTab === 'messages' && activeConversation) {
      sendPrivateMessage();
      return;
    }
    
    // Handle AI/Community/Support messages via WebSocket
    if (!inputMessage.trim() || !wsRef.current) return;
    
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date(),
    };
    
    addMessage(activeTab, userMessage);
    
    wsRef.current.send(JSON.stringify({
      message: inputMessage,
      user_id: user?.id || null,
      language: language,
      context: { tab: activeTab, page: getPageContext() }
    }));
    
    setInputMessage('');
    setIsTyping(true);
    handleInteraction();
  };

  const handleVoiceInput = () => {
    if (!speechSupported) return;
    
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.lang = language === 'ru' ? 'ru-RU' : 'en-US';
      recognitionRef.current?.start();
      setIsRecording(true);
    }
    handleInteraction();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ========================================
  // MENU ACTIONS
  // ========================================

  const handleMenuAction = (action) => {
    setShowMenu(false);
    switch (action) {
      case 'collapse':
        setPanelMode(PANEL_MODES.COLLAPSED);
        setCustomHeight(null);
        break;
      case 'mini':
        setPanelMode(PANEL_MODES.MINI);
        setCustomHeight(null);
        break;
      case 'fullscreen':
        setPanelMode(PANEL_MODES.FULLSCREEN);
        setCustomHeight(null);
        break;
      case 'ghostmessenger':
        // Open Ghost Messenger
        window.dispatchEvent(new CustomEvent('openGhostMessenger'));
        break;
      case 'popout':
        // Open in new window (if supported)
        const chatUrl = `${window.location.origin}/chat?popout=true`;
        window.open(chatUrl, 'GlassyChat', 'width=400,height=600,resizable=yes');
        break;
      default:
        break;
    }
    handleInteraction();
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMenu && !e.target.closest('.panel-menu')) {
        setShowMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  // ========================================
  // COMPUTED VALUES
  // ========================================

  const currentMessages = messages[activeTab] || [];
  const pageContext = getPageContext();
  const isMinimalMod = theme === 'minimal-mod';
  const isDark = theme === 'dark' || isMinimalMod;

  const getPanelHeight = () => {
    if (customHeight) return `${customHeight}px`;
    switch (panelMode) {
      case PANEL_MODES.MINI: return '50vh';
      case PANEL_MODES.FULLSCREEN: return '100vh';
      case PANEL_MODES.EXPANDED: return '75vh';
      default: return 'auto';
    }
  };

  const isCollapsed = panelMode === PANEL_MODES.COLLAPSED;

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className={`glassy-chat-bar ${panelMode} ${isMinimalMod ? 'minimal-mod' : ''} ${hasNewMessage ? 'has-new-message' : ''} ${isTyping ? 'ai-typing' : ''} ${isDragging ? 'dragging' : ''} agent-${agentStatus}`}
      style={{
        '--chat-bg': isDark ? 'rgba(10, 10, 15, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        '--chat-border': isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        '--chat-text': isDark ? '#ffffff' : '#1a1a1a',
        '--chat-text-muted': isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        '--chat-accent': '#8b5cf6',
        '--panel-height': getPanelHeight(),
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ========== COLLAPSED BAR ========== */}
      {isCollapsed && (
        <div 
          className="chat-collapsed-bar"
          onClick={() => {
            setPanelMode(PANEL_MODES.MINI); // Open in Mini Mode (50% height) by default
            handleInteraction();
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Center section - text only on hover */}
          <div className="bar-center">
            <span className={`status-text ${isHovered ? 'visible' : ''}`}>
              {agentStatus === AGENT_STATUS.ANALYZING ? (language === 'ru' ? 'Анализирую...' : 'Analyzing...') : 'Chat'}
            </span>
          </div>
          
          {/* Right section - mic only on hover */}
          <div className={`bar-right ${isHovered ? 'visible' : ''}`}>
            <button
              className={`voice-btn ${isRecording ? 'recording' : ''} ${!speechSupported ? 'disabled' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleVoiceInput();
              }}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>
          
          {/* Peek Preview */}
          {peekMessage && (
            <div className="peek-preview">
              <Bot size={14} />
              <span>{peekMessage}</span>
            </div>
          )}
          
          {/* Agent Suggestion Popup - "Есть идея!" */}
          {showSuggestionPopup && agentSuggestion && (
            <div className="agent-suggestion-popup" data-testid="agent-suggestion-popup">
              <button 
                className="suggestion-close"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissSuggestion();
                }}
              >
                <X size={14} />
              </button>
              <div 
                className="suggestion-content"
                onClick={(e) => {
                  e.stopPropagation();
                  openChatWithSuggestion();
                }}
              >
                <Lightbulb size={16} className="suggestion-icon" />
                <span className="suggestion-title">
                  {language === 'ru' ? 'Есть идея!' : 'Got an idea!'}
                </span>
                <span className="suggestion-text">{agentSuggestion}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== EXPANDED PANEL ========== */}
      {!isCollapsed && (
        <div 
          ref={panelRef}
          className="chat-expanded-panel"
          style={{ height: getPanelHeight() }}
          onClick={handleInteraction}
        >
          {/* Drag Handle */}
          <div 
            className={`drag-handle ${isDragging ? 'active' : ''}`}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onClick={handleHeaderDoubleTap}
          >
            <GripHorizontal size={20} className="grip-icon" />
          </div>
          
          {/* Header with Tabs */}
          <div className="chat-header">
            <div className="chat-tabs">
              {sortedTabs.map((tab, index) => (
                <button
                  key={tab.id}
                  className={`chat-tab ${activeTab === tab.id ? 'active' : ''} ${index === 0 ? 'priority-tab' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    handleInteraction();
                  }}
                  style={{
                    // Smooth position transition
                    order: index,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <tab.icon size={16} />
                  <span>{tab.label[language] || tab.label.en}</span>
                  {unreadCounts[tab.id] > 0 && (
                    <span className="tab-badge">{unreadCounts[tab.id]}</span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Collapse Button + Ghost Messenger + Menu Button */}
            <div className="panel-controls">
              {/* Open Ghost Messenger Button */}
              {/* Expand to Ghost Messenger Button */}
              <button 
                className="expand-btn"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openGhostMessenger', {
                    detail: { activeTab, messages, conversations }
                  }));
                  handleInteraction();
                }}
                title={language === 'ru' ? 'Развернуть' : 'Expand'}
                data-testid="expand-ghost-messenger"
              >
                <Maximize2 size={18} />
              </button>
              
              {/* Collapse Button */}
              <button 
                className="collapse-btn"
                onClick={() => {
                  setPanelMode(PANEL_MODES.COLLAPSED);
                  setCustomHeight(null);
                  handleInteraction();
                }}
                title={language === 'ru' ? 'Свернуть' : 'Collapse'}
              >
                <Minimize2 size={18} />
              </button>
              
              <div className="panel-menu">
                <button 
                  className="menu-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                >
                  <MoreVertical size={18} />
                </button>
                
                {showMenu && (
                  <div className="menu-dropdown">
                    <button onClick={() => handleMenuAction('mini')}>
                      <span className="mini-icon">½</span>
                      <span>{language === 'ru' ? 'Мини-режим' : 'Mini Mode'}</span>
                    </button>
                    <button onClick={() => handleMenuAction('fullscreen')}>
                      <Maximize2 size={14} />
                      <span>{language === 'ru' ? 'На весь экран' : 'Full Screen'}</span>
                    </button>
                    <div className="menu-divider" />
                    <button onClick={() => handleMenuAction('popout')}>
                      <ExternalLink size={14} />
                      <span>{language === 'ru' ? 'Открепить' : 'Pop Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Context Header for Community */}
          {activeTab === 'community' && (
            <div className="context-header">
              <Sparkles size={14} />
              <span>{pageContext.label}</span>
              {pageContext.type === 'swap' && (
                <span className="context-badge">
                  {language === 'ru' ? 'Помощь с обменами' : 'Trade Help'}
                </span>
              )}
              {pageContext.type === 'swap_listing' && (
                <span className="context-badge">
                  {language === 'ru' ? 'Вопросы по объявлению' : 'About this listing'}
                </span>
              )}
            </div>
          )}

          {/* Messages Tab - Private Chats */}
          {activeTab === 'messages' ? (
            <div className="messages-container">
              {/* If on swap listing page - show chat with seller */}
              {pageContext.type === 'swap_listing' ? (
                activeConversation ? (
                  // Show conversation messages
                  <div className="private-chat">
                    <div className="conversation-header">
                      <button 
                        className="back-btn"
                        onClick={() => setActiveConversation(null)}
                      >
                        ←
                      </button>
                      <span>{language === 'ru' ? 'Чат с продавцом' : 'Chat with Seller'}</span>
                    </div>
                    
                    <div className="chat-messages">
                      {conversationMessages.length === 0 ? (
                        <div className="empty-chat">
                          <MessageSquare size={32} strokeWidth={1.5} />
                          <p>{language === 'ru' ? 'Начните диалог с продавцом' : 'Start a conversation with seller'}</p>
                        </div>
                      ) : (
                        conversationMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`message ${msg.sender_id === user?.id ? 'user' : 'bot'}`}
                          >
                            <div className="message-avatar">
                              <span>{msg.sender_id === user?.id ? '👤' : '🏪'}</span>
                            </div>
                            <div className="message-content">
                              <div className="message-bubble">{msg.text}</div>
                              <div className="message-time">
                                {new Date(msg.created_at).toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  // Show prompt to start conversation
                  <div className="seller-chat-prompt">
                    <div className="seller-chat-card">
                      <div className="seller-avatar">
                        <MessageSquare size={24} />
                      </div>
                      <div className="seller-info">
                        <h4>{language === 'ru' ? 'Написать продавцу' : 'Message Seller'}</h4>
                        <p>{language === 'ru' 
                          ? 'Задайте вопрос о товаре или предложите сделку'
                          : 'Ask about the item or make an offer'}</p>
                      </div>
                    </div>
                    
                    {/* Quick message templates */}
                    <div className="quick-messages">
                      <p className="quick-title">{language === 'ru' ? 'Быстрые сообщения:' : 'Quick messages:'}</p>
                      <button 
                        className="quick-btn"
                        onClick={() => {
                          setInputMessage(language === 'ru' ? 'Привет! Товар ещё в наличии?' : 'Hi! Is this item still available?');
                          startConversation(pageContext.id);
                        }}
                      >
                        {language === 'ru' ? '🔍 Ещё в наличии?' : '🔍 Still available?'}
                      </button>
                      <button 
                        className="quick-btn"
                        onClick={() => {
                          setInputMessage(language === 'ru' ? 'Какая минимальная цена?' : 'What\'s the lowest price?');
                          startConversation(pageContext.id);
                        }}
                      >
                        {language === 'ru' ? '💰 Минимальная цена?' : '💰 Lowest price?'}
                      </button>
                      <button 
                        className="quick-btn"
                        onClick={() => {
                          setInputMessage(language === 'ru' ? 'Готов к обмену на...' : 'Interested in trading for...');
                          startConversation(pageContext.id);
                        }}
                      >
                        {language === 'ru' ? '🔄 Предложить обмен' : '🔄 Offer trade'}
                      </button>
                    </div>
                  </div>
                )
              ) : (
                // Show conversations list
                <div className="conversations-list">
                  {loadingConversations ? (
                    <div className="loading-conversations">
                      <div className="spinner" />
                    </div>
                  ) : conversations.length > 0 ? (
                    conversations.map(conv => (
                      <div 
                        key={conv.id}
                        className="conversation-item"
                        onClick={() => {
                          setActiveConversation(conv);
                          fetchConversationMessages(conv.id);
                        }}
                      >
                        <div className="conv-image">
                          {conv.listing_image ? (
                            <img src={conv.listing_image} alt="" />
                          ) : (
                            <MessageSquare size={20} />
                          )}
                        </div>
                        <div className="conv-info">
                          <div className="conv-title">{conv.listing_title}</div>
                          <div className="conv-last">{conv.last_message || (language === 'ru' ? 'Нет сообщений' : 'No messages')}</div>
                        </div>
                        {conv.unread > 0 && (
                          <div className="conv-unread">{conv.unread}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="coming-soon-container">
                      <div className="coming-soon-card">
                        <MessageSquare size={48} strokeWidth={1.5} />
                        <h3>{language === 'ru' ? 'Нет сообщений' : 'No Messages'}</h3>
                        <p>
                          {language === 'ru' 
                            ? 'Начните чат с продавцом на странице любого объявления в Glassy Swap!'
                            : 'Start chatting with sellers from any listing page in Glassy Swap!'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Chat Area */}
              <div className="chat-messages">
                {currentMessages.length === 0 && (
                  <div className="empty-chat">
                    <Bot size={40} strokeWidth={1.5} />
                    <p>
                      {activeTab === 'ai' && (language === 'ru' 
                        ? 'Привет! Я Core AI. Спроси меня о чём угодно — помогу с выбором, сборкой ПК или просто поболтаем.'
                        : "Hi! I'm Core AI. Ask me anything — I'll help with recommendations, PC builds, or just chat.")}
                      {activeTab === 'community' && (language === 'ru'
                        ? `${pageContext.label}. Задай вопрос сообществу или Core AI ответит первым!`
                        : `${pageContext.label}. Ask the community or Core AI will answer first!`)}
                      {activeTab === 'support' && (language === 'ru'
                        ? 'Служба поддержки. Опишите вашу проблему, и мы поможем!'
                        : 'Support team. Describe your issue and we\'ll help!')}
                    </p>
                  </div>
                )}
                
                {currentMessages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`message ${msg.sender === 'user' ? 'user' : 'bot'}`}
                  >
                    <div className="message-avatar">
                      {msg.sender === 'bot' ? <Bot size={18} /> : <span>👤</span>}
                    </div>
                    <div className="message-content">
                      <div className="message-bubble">{msg.text}</div>
                      <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="message bot">
                    <div className="message-avatar">
                      <Bot size={18} />
                    </div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="chat-input-area">
                <button className="attach-btn" title={language === 'ru' ? 'Прикрепить файл' : 'Attach file'}>
                  <Paperclip size={18} />
                </button>
                
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    handleInteraction();
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={language === 'ru' ? 'Напишите сообщение...' : 'Type a message...'}
                  rows={1}
                />
                
                <button
                  className={`voice-btn-input ${isRecording ? 'recording' : ''} ${!speechSupported ? 'disabled' : ''}`}
                  onClick={handleVoiceInput}
                >
                  {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                
                <button
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GlassyChatBar;
