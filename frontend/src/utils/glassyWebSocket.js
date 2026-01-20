/**
 * Glassy WebSocket Service
 * Real-time коммуникация для чата и уведомлений
 */

class GlassyWebSocket {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.listeners = new Map();
    this.messageQueue = [];
    this.isConnecting = false;
    this.userId = null;
  }

  /**
   * Подключение к WebSocket серверу
   */
  connect(userId) {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    if (this.isConnecting) return;

    this.userId = userId;
    this.isConnecting = true;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws?user_id=${userId || 'guest'}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('🔌 Glassy WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected', { userId });
        
        // Отправляем очередь сообщений
        while (this.messageQueue.length > 0) {
          const msg = this.messageQueue.shift();
          this.send(msg.type, msg.data);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (e) {
          console.warn('Invalid WebSocket message:', event.data);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code);
        this.isConnecting = false;
        this.emit('disconnected', { code: event.code });
        
        // Автопереподключение
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);
            this.connect(this.userId);
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.emit('error', { error });
      };

    } catch (e) {
      console.error('WebSocket connection failed:', e);
      this.isConnecting = false;
    }
  }

  /**
   * Отключение
   */
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'User disconnect');
      this.ws = null;
    }
  }

  /**
   * Отправка сообщения
   */
  send(type, data = {}) {
    const message = { type, data, timestamp: Date.now() };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Добавляем в очередь
      this.messageQueue.push({ type, data });
    }
  }

  /**
   * Обработка входящих сообщений
   */
  handleMessage(message) {
    const { type, data } = message;

    switch (type) {
      case 'chat_message':
        this.emit('chatMessage', data);
        break;

      case 'typing':
        this.emit('typing', data);
        break;

      case 'mind_event':
        // Триггер для Glassy Mind UI
        window.dispatchEvent(new CustomEvent('glassyMindEvent', { 
          detail: data 
        }));
        this.emit('mindEvent', data);
        break;

      case 'notification':
        this.emit('notification', data);
        break;

      case 'guild_activity':
        this.emit('guildActivity', data);
        break;

      case 'trade_update':
        this.emit('tradeUpdate', data);
        break;

      case 'presence':
        this.emit('presence', data);
        break;

      default:
        this.emit(type, data);
    }
  }

  /**
   * Подписка на события
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Отписка
   */
  off(event, callback) {
    this.listeners.get(event)?.delete(callback);
  }

  /**
   * Emit события
   */
  emit(event, data) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (e) {
        console.error(`Error in ${event} listener:`, e);
      }
    });
  }

  /**
   * Отправка сообщения в чат
   */
  sendChatMessage(mode, text, metadata = {}) {
    this.send('chat_message', {
      mode,
      text,
      metadata,
      userId: this.userId
    });
  }

  /**
   * Индикатор набора текста
   */
  sendTyping(mode, isTyping) {
    this.send('typing', {
      mode,
      isTyping,
      userId: this.userId
    });
  }

  /**
   * Подписка на комнату (гильдия, trade диалог)
   */
  joinRoom(roomId) {
    this.send('join_room', { roomId });
  }

  /**
   * Выход из комнаты
   */
  leaveRoom(roomId) {
    this.send('leave_room', { roomId });
  }

  /**
   * Статус соединения
   */
  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton
export const glassyWS = new GlassyWebSocket();

// React hook
export function useGlassyWebSocket() {
  return glassyWS;
}
