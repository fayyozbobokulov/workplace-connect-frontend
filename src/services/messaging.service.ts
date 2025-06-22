import axios from 'axios';
import { io, Socket } from 'socket.io-client';

// Define base URL for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

// Message interface matching the backend
export interface Message {
  _id: string;
  text: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  receiver?: string;
  group?: string;
  timestamp: string;
  isOwn: boolean;
  readBy?: string[];
}

// Chat interface for conversations
export interface Chat {
  _id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  online?: boolean;
  isPinned?: boolean;
  isGroup?: boolean;
  participants?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  }>;
}

// Conversation response interface
export interface ConversationResponse {
  success: boolean;
  message: string;
  data: {
    conversations: Array<{
      _id: string;
      text: string;
      sender: {
        _id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
      };
      timestamp: string;
      isOwn: boolean;
      conversationType: 'direct' | 'group';
      conversationId: string;
      conversationName: string;
      conversationAvatar?: string;
      unreadCount: number;
      participants?: Array<{
        _id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
      }>;
    }>;
    totalCount: number;
  };
}

// Messages response interface
export interface MessagesResponse {
  success: boolean;
  message: string;
  data: {
    messages: Message[];
    totalCount: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

// Online users response interface
export interface OnlineUsersResponse {
  success: boolean;
  message: string;
  data: {
    onlineUsers: string[];
    count: number;
  };
}

// User status response interface
export interface UserStatusResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    isOnline: boolean;
    status: 'online' | 'offline';
  };
}

// Socket event interfaces
export interface SocketEvents {
  // Client to server events
  'send-message': (data: {
    content: string;
    receiver?: string;
    group?: string;
  }) => void;
  'join-group': (groupId: string) => void;
  'leave-group': (groupId: string) => void;
  'typing-start': (data: { receiverId?: string; groupId?: string }) => void;
  'typing-stop': (data: { receiverId?: string; groupId?: string }) => void;
  'mark-messages-read': (data: { messageIds: string[] }) => void;

  // Server to client events
  'direct-message': (message: Message) => void;
  'group-message': (message: Message) => void;
  'message-sent': (response: { success: boolean; message: Message }) => void;
  'user-typing': (data: { userId: string; type: 'direct' | 'group'; groupId?: string }) => void;
  'user-stopped-typing': (data: { userId: string; type: 'direct' | 'group'; groupId?: string }) => void;
  'user-status': (data: { userId: string; status: 'online' | 'offline' }) => void;
  'user-joined-group': (data: { userId: string; groupId: string }) => void;
  'user-left-group': (data: { userId: string; groupId: string }) => void;
  'message-deleted': (data: { messageId: string; groupId?: string }) => void;
  'messages-marked-read': (data: { messageIds: string[]; readBy: string }) => void;
  'error': (error: { message: string }) => void;
}

class MessagingService {
  private socket: Socket | null = null;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  private eventListeners: Map<string, Function[]> = new Map();


  // Initialize socket connection
  initializeSocket(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Set up default event listeners
    this.setupDefaultEventListeners();

    return this.socket;
  }

  // Disconnect socket
  disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }

  // Set up default event listeners
  private setupDefaultEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Event listener management
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    if (!this.socket) {
      console.warn('Socket not initialized. Call initializeSocket first.');
      return;
    }

    this.socket.on(event as string, callback);
    
    // Store listener for cleanup
    if (!this.eventListeners.has(event as string)) {
      this.eventListeners.set(event as string, []);
    }
    this.eventListeners.get(event as string)?.push(callback);
  }

  off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]): void {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event as string, callback);
      
      // Remove from stored listeners
      const listeners = this.eventListeners.get(event as string);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    } else {
      this.socket.off(event as string);
      this.eventListeners.delete(event as string);
    }
  }

  // Emit events
  emit<K extends keyof SocketEvents>(event: K, ...args: Parameters<SocketEvents[K]>): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected. Cannot emit event:', event);
      return;
    }

    this.socket.emit(event as string, ...args);
  }

  // REST API Methods

  // Send message via REST API
  async sendMessage(content: string, token: string, receiver?: string, group?: string): Promise<Message> {
    try {
      const response = await axios.post(`${API_BASE_URL}/messages`, {
        content,
        receiver,
        group
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get direct messages
  async getDirectMessages(userId: string, token: string, page = 1, limit = 50): Promise<MessagesResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/direct/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching direct messages:', error);
      throw error;
    }
  }

  // Get group messages
  async getGroupMessages(groupId: string, token: string, page = 1, limit = 50): Promise<MessagesResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/group/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching group messages:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(messageIds: string[], token: string): Promise<void> {
    try {
      await axios.put(`${API_BASE_URL}/messages/read`, 
        { messageIds },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Get unread count for direct conversation
  async getDirectUnreadCount(userId: string, token: string): Promise<number> {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/unread/direct/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data.data.unreadCount;
    } catch (error) {
      console.error('Error fetching direct unread count:', error);
      throw error;
    }
  }

  // Get unread count for group
  async getGroupUnreadCount(groupId: string, token: string): Promise<number> {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/unread/group/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data.data.unreadCount;
    } catch (error) {
      console.error('Error fetching group unread count:', error);
      throw error;
    }
  }

  // Get recent conversations
  async getConversations(token: string, limit = 20): Promise<ConversationResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  // Get online users
  async getOnlineUsers(token: string): Promise<OnlineUsersResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/online-users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching online users:', error);
      throw error;
    }
  }

  // Get user status
  async getUserStatus(userId: string, token: string): Promise<UserStatusResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/user-status/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user status:', error);
      throw error;
    }
  }

  // Delete message
  async deleteMessage(messageId: string, token: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/messages/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Socket-based messaging methods

  // Send message via socket
  sendMessageSocket(content: string, receiver?: string, group?: string): void {
    this.emit('send-message', { content, receiver, group });
  }

  // Join group room
  joinGroup(groupId: string): void {
    this.emit('join-group', groupId);
  }

  // Leave group room
  leaveGroup(groupId: string): void {
    this.emit('leave-group', groupId);
  }

  // Start typing indicator
  startTyping(receiverId?: string, groupId?: string): void {
    this.emit('typing-start', { receiverId, groupId });
  }

  // Stop typing indicator
  stopTyping(receiverId?: string, groupId?: string): void {
    this.emit('typing-stop', { receiverId, groupId });
  }

  // Mark messages as read via socket
  markMessagesAsReadSocket(messageIds: string[]): void {
    this.emit('mark-messages-read', { messageIds });
  }
}

export const messagingService = new MessagingService();
export default messagingService;
