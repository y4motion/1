/**
 * WebSocket Service для real-time обновлений
 * Используется в LiveActivityFeed для получения live событий
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.listeners = new Map();
    this.isConnecting = false;
    this.url = null;
  }

  /**
   * Подключиться к WebSocket серверу
   * @param {string} url - WebSocket URL (ws:// или wss://)
   */
  connect(url = null) {
    // Если URL не передан, используем из env
    if (!url) {
      const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
      const wsHost = baseUrl.replace(/^https?:\/\//, '');
      url = `${wsProtocol}://${wsHost}/ws/activity`;
    }

    this.url = url;

    // Если уже подключены
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket already connected');
      return;
    }

    // Если идёт подключение
    if (this.isConnecting) {
      console.log('⏳ WebSocket connection in progress...');
      return;
    }

    try {
      this.isConnecting = true;
      console.log(`🔌 Connecting to WebSocket: ${url}`);
      
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message:', data.type);
          this.emit('message', data);
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
          this.emit('error', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
        this.emit('error', error);
      };

      this.ws.onclose = (event) => {
        console.log(`🔌 WebSocket disconnected (code: ${event.code})`);
        this.isConnecting = false;
        this.emit('disconnected', event);
        
        // Пытаемся переподключиться
        if (event.code !== 1000) { // 1000 = normal closure
          this.attemptReconnect();
        }
      };
    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  /**
   * Попытка переподключения
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`❌ Max reconnection attempts reached (${this.maxReconnectAttempts})`);
      this.emit('reconnectFailed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        this.connect(this.url);
      }
    }, delay);
  }

  /**
   * Отправить сообщение на сервер
   * @param {object} data - Данные для отправки
   */
  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      console.log('📤 WebSocket sent:', data);
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
    }
  }

  /**
   * Подписаться на событие
   * @param {string} event - Название события ('connected', 'message', 'error', 'disconnected')
   * @param {function} callback - Callback функция
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Отписаться от события
   * @param {string} event - Название события
   * @param {function} callback - Callback функция
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Вызвать событие
   * @private
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in WebSocket callback for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Отключиться от WebSocket
   */
  disconnect() {
    if (this.ws) {
      console.log('🔌 Closing WebSocket connection...');
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.listeners.clear();
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  /**
   * Проверить статус подключения
   * @returns {boolean}
   */
  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Получить текущий статус
   * @returns {string} - 'CONNECTING', 'OPEN', 'CLOSING', 'CLOSED', 'NOT_INITIALIZED'
   */
  getStatus() {
    if (!this.ws) return 'NOT_INITIALIZED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }
}

// Singleton instance
const websocketService = new WebSocketService();

export default websocketService;
