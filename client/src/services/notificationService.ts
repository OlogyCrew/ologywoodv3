// Real-Time Notification Service with WebSocket Support

export interface Notification {
  id: string;
  type: 'artist_available' | 'booking_request' | 'booking_accepted' | 'booking_rejected' | 'message' | 'payment';
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface NotificationListener {
  (notification: Notification): void;
}

class NotificationService {
  private ws: WebSocket | null = null;
  private listeners: Set<NotificationListener> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private notifications: Notification[] = [];
  private userId: string | null = null;

  /**
   * Initialize WebSocket connection for real-time notifications
   */
  connect(userId: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.userId = userId;
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/notifications?userId=${userId}&token=${token}`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[Notifications] WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const notification = JSON.parse(event.data) as Notification;
            notification.createdAt = new Date(notification.createdAt);
            this.handleNotification(notification);
          } catch (error) {
            console.error('[Notifications] Failed to parse message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[Notifications] WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[Notifications] WebSocket disconnected');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming notification
   */
  private handleNotification(notification: Notification): void {
    // Add to notifications list
    this.notifications.unshift(notification);

    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications.pop();
    }

    // Notify all listeners
    this.listeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (error) {
        console.error('[Notifications] Listener error:', error);
      }
    });

    // Show browser notification if permitted
    this.showBrowserNotification(notification);

    // Play sound if enabled
    this.playNotificationSound(notification);
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(notification: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        tag: notification.type,
      });
    }
  }

  /**
   * Play notification sound
   */
  private playNotificationSound(notification: Notification): void {
    // Only play sound for important notifications
    if (['booking_request', 'booking_accepted', 'artist_available'].includes(notification.type)) {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch((error) => console.log('[Notifications] Audio play failed:', error));
    }
  }

  /**
   * Attempt to reconnect WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[Notifications] Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        if (this.userId) {
          // Get fresh token from auth service
          this.connect(this.userId, '').catch((error) => {
            console.error('[Notifications] Reconnection failed:', error);
          });
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  /**
   * Subscribe to notifications
   */
  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get all notifications
   */
  getNotifications(): Notification[] {
    return this.notifications;
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.forEach((n) => {
      n.read = true;
    });
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications = [];
  }

  /**
   * Send notification (for testing)
   */
  sendNotification(notification: Notification): void {
    this.handleNotification(notification);
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  /**
   * Request browser notification permission
   */
  static async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        return true;
      }

      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
    }

    return false;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
