import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import messagingService, { type Message, type Chat } from '../services/messaging.service';
import { authService } from '../services/auth.service';
import { useAuth } from '../components/auth/auth.provider';

export interface TypingUser {
  userId: string;
  type: 'direct' | 'group';
  groupId?: string;
}

export interface MessagingState {
  messages: Record<string, Message[]>; // chatId -> messages
  chats: Chat[];
  onlineUsers: string[];
  typingUsers: TypingUser[];
  socket: Socket | null;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
}

export interface MessagingActions {
  // Socket management
  connect: () => void;
  disconnect: () => void;
  
  // Message operations
  sendMessage: (content: string, chatId: string, isGroup?: boolean, receiverInfo?: { name: string; avatar?: string }) => void;
  loadMessages: (chatId: string, isGroup?: boolean, page?: number) => Promise<void>;
  markMessagesAsRead: (messageIds: string[]) => void;
  deleteMessage: (messageId: string) => void;
  
  // Chat operations
  loadConversations: () => Promise<void>;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  
  // Typing indicators
  startTyping: (chatId: string, isGroup?: boolean) => void;
  stopTyping: (chatId: string, isGroup?: boolean) => void;
  
  // Utility
  clearError: () => void;
  getChatMessages: (chatId: string) => Message[];
  getUnreadCount: (chatId: string) => number;
  isUserOnline: (userId: string) => boolean;
  isUserTyping: (userId: string, chatId?: string) => boolean;
}

export const useMessaging = (): MessagingState & MessagingActions => {
  const [state, setState] = useState<MessagingState>({
    messages: {},
    chats: [],
    onlineUsers: [],
    typingUsers: [],
    socket: null,
    isConnected: false,
    loading: false,
    error: null,
  });

  const { session } = useAuth();

  const typingTimeouts = useRef<Map<string, number>>(new Map());
  const loadedChats = useRef<Set<string>>(new Set());

  // Connect to socket
  const connect = useCallback(() => {
    const token = authService.getToken();
    if (!token) {
      setState(prev => ({ ...prev, error: 'No authentication token found' }));
      return;
    }

    try {
      const socket = messagingService.initializeSocket(token);
      setState(prev => ({ ...prev, socket, isConnected: socket.connected }));

      // Set up event listeners
      setupSocketListeners(socket);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to connect to socket' 
      }));
    }
  }, []);

  // Disconnect from socket
  const disconnect = useCallback(() => {
    messagingService.disconnectSocket();
    setState(prev => ({ 
      ...prev, 
      socket: null, 
      isConnected: false,
      typingUsers: []
    }));
    
    // Clear typing timeouts
    typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
    typingTimeouts.current.clear();
  }, []);

  // Set up socket event listeners
  const setupSocketListeners = useCallback((socket: Socket) => {
    // Connection events
    socket.on('connect', () => {
      setState(prev => ({ ...prev, isConnected: true, error: null }));
    });

    socket.on('disconnect', () => {
      setState(prev => ({ ...prev, isConnected: false }));
    });

    socket.on('error', (error: { message: string }) => {
      setState(prev => ({ ...prev, error: error.message }));
    });

    // Message events
    socket.on('direct-message', (message: Message) => {
      handleNewMessage(message, false);
    });

    socket.on('group-message', (message: Message) => {
      handleNewMessage(message, true);
    });

    socket.on('message-sent', (response: { success: boolean; message: Message }) => {
      if (response.success) {
        let chatId: string;
        
        if (response.message.group) {
          chatId = response.message.group || '';
        } else {
          // For direct messages, use the other person's ID as chatId
          // If it's our own message, use receiver ID; if it's from someone else, use sender ID
          chatId = response.message.isOwn ? (response.message.receiver || '') : response.message.sender._id;
        }
        
        if (chatId) {
          setState(prev => ({
            ...prev,
            messages: {
              ...prev.messages,
              [chatId]: (prev.messages[chatId] || []).map((msg, index, arr) => {
                // Replace the last optimistic message (temp ID) with the server response
                if (index === arr.length - 1 && msg._id.startsWith('temp-')) {
                  return response.message;
                }
                return msg;
              })
            }
          }));
          updateChatLastMessage(chatId, response.message);
        }
      }
    });

    // Typing events
    socket.on('user-typing', (data: { userId: string; type: 'direct' | 'group'; groupId?: string }) => {
      setState(prev => ({
        ...prev,
        typingUsers: [
          ...prev.typingUsers.filter(user => user.userId !== data.userId),
          data
        ]
      }));
    });

    socket.on('user-stopped-typing', (data: { userId: string; type: 'direct' | 'group'; groupId?: string }) => {
      setState(prev => ({
        ...prev,
        typingUsers: prev.typingUsers.filter(user => user.userId !== data.userId)
      }));
    });

    // User status events
    socket.on('user-status', (data: { userId: string; status: 'online' | 'offline' }) => {
      setState(prev => ({
        ...prev,
        onlineUsers: data.status === 'online' 
          ? [...prev.onlineUsers.filter(id => id !== data.userId), data.userId]
          : prev.onlineUsers.filter(id => id !== data.userId),
        chats: prev.chats.map(chat => 
          chat._id === data.userId 
            ? { ...chat, online: data.status === 'online' }
            : chat
        )
      }));
    });

    // Message operations
    socket.on('message-deleted', (data: { messageId: string; groupId?: string }) => {
      setState(prev => {
        const newMessages = { ...prev.messages };
        Object.keys(newMessages).forEach(chatId => {
          newMessages[chatId] = newMessages[chatId].filter(msg => msg._id !== data.messageId);
        });
        return { ...prev, messages: newMessages };
      });
    });

    socket.on('messages-marked-read', (data: { messageIds: string[]; readBy: string }) => {
      setState(prev => {
        const newMessages = { ...prev.messages };
        Object.keys(newMessages).forEach(chatId => {
          newMessages[chatId] = newMessages[chatId].map(msg => 
            data.messageIds.includes(msg._id) 
              ? { ...msg, readBy: [...(msg.readBy || []), data.readBy] }
              : msg
          );
        });
        return { ...prev, messages: newMessages };
      });
    });

    // Group events
    socket.on('user-joined-group', (data: { userId: string; groupId: string }) => {
      // Handle user joining group
      console.log('User joined group:', data);
    });

    socket.on('user-left-group', (data: { userId: string; groupId: string }) => {
      // Handle user leaving group
      console.log('User left group:', data);
    });
  }, []);

  // Handle new incoming message
  const handleNewMessage = useCallback((message: Message, isGroup: boolean) => {
    let chatId: string;
    
    if (isGroup) {
      chatId = message.group || '';
    } else {
      // For direct messages, use the other person's ID as chatId
      // If it's our own message, use receiver ID; if it's from someone else, use sender ID
      chatId = message.isOwn ? (message.receiver || '') : message.sender._id;
    }
    
    if (!chatId) return;

    setState(prev => ({
      ...prev,
      messages: {
        ...prev.messages,
        [chatId]: [...(prev.messages[chatId] || []), message]
      }
    }));

    updateChatLastMessage(chatId, message);
  }, []);

  // Update chat's last message
  const updateChatLastMessage = useCallback((chatId: string, message: Message) => {
    setState(prev => {
      const existingChat = prev.chats.find(chat => chat._id === chatId);
      
      if (!existingChat) {
        // For new chats, we need to determine the chat name and avatar
        let chatName = '';
        let chatAvatar = '';
        
        if (message.group) {
          // Group chat
          chatName = 'Group Chat'; // This should be improved to get actual group name
          chatAvatar = '';
        } else {
          // Direct chat - use the other person's info
          if (message.isOwn && message.receiver) {
            // We sent the message, so the chat is with the receiver
            // We'll need to get receiver info from somewhere else
            chatName = `User ${message.receiver}`; // Fallback name
            chatAvatar = '';
          } else {
            // We received the message, so the chat is with the sender
            chatName = `${message.sender.firstName} ${message.sender.lastName}`;
            chatAvatar = message.sender.profilePicture || '';
          }
        }
        
        const newChat: Chat = {
          _id: chatId,
          name: chatName,
          avatar: chatAvatar,
          lastMessage: message.text,
          timestamp: message.timestamp,
          unread: message.isOwn ? 0 : 1,
          isGroup: !!message.group,
          participants: message.group ? [] : [message.sender]
        };
        
        return { ...prev, chats: [...prev.chats, newChat] };
      } else {
        // Update existing chat
        return {
          ...prev,
          chats: prev.chats.map(chat => 
            chat._id === chatId 
              ? { 
                  ...chat, 
                  lastMessage: message.text,
                  timestamp: message.timestamp,
                  unread: message.isOwn ? chat.unread : (chat.unread || 0) + 1
                }
              : chat
          )
        };
      }
    });
  }, []);

  // Send message
  const sendMessage = useCallback((content: string, chatId: string, isGroup = false, receiverInfo?: { name: string; avatar?: string }) => {
    if (!state.socket?.connected) {
      setState(prev => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    // Create optimistic message for immediate UI feedback
    const optimisticMessage: Message = {
      _id: `temp-${Date.now()}`, // Temporary ID
      text: content,
      sender: {
        _id: session?._id || '',
        firstName: session?.firstName || '',
        lastName: session?.lastName || '',
        profilePicture: session?.profilePicture || ''
      },
      receiver: isGroup ? undefined : chatId,
      group: isGroup ? chatId : undefined,
      timestamp: new Date().toISOString(),
      isOwn: true,
      readBy: []
    };

    // Add message to local state immediately
    setState(prev => ({
      ...prev,
      messages: {
        ...prev.messages,
        [chatId]: [...(prev.messages[chatId] || []), optimisticMessage]
      }
    }));

    // Update chat last message (and create chat if it doesn't exist)
    if (receiverInfo && !isGroup) {
      // Check if chat already exists
      const existingChat = state.chats.find(chat => chat._id === chatId);
      if (!existingChat) {
        // Create new chat with proper receiver info
        const newChat: Chat = {
          _id: chatId,
          name: receiverInfo.name,
          avatar: receiverInfo.avatar || '',
          lastMessage: content,
          timestamp: new Date().toISOString(),
          unread: 0,
          isGroup: false,
          participants: []
        };
        setState(prev => ({ ...prev, chats: [...prev.chats, newChat] }));
      } else {
        // Update existing chat
        updateChatLastMessage(chatId, optimisticMessage);
      }
    } else {
      updateChatLastMessage(chatId, optimisticMessage);
    }

    // Send via socket
    if (isGroup) {
      messagingService.sendMessageSocket(content, undefined, chatId);
    } else {
      messagingService.sendMessageSocket(content, chatId, undefined);
    }
  }, [state.socket, state.chats]);

  // Load messages for a chat
  const loadMessages = useCallback(async (chatId: string, isGroup = false, page = 1) => {
    if (loadedChats.current.has(`${chatId}-${page}`)) return;

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = isGroup 
        ? await messagingService.getGroupMessages(chatId, token, page)
        : await messagingService.getDirectMessages(chatId, token, page);

      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [chatId]: page === 1 
            ? response.data.messages 
            : [...response.data.messages, ...(prev.messages[chatId] || [])]
        },
        loading: false
      }));

      loadedChats.current.add(`${chatId}-${page}`);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load messages'
      }));
    }
  }, []);

  // Mark messages as read
  const markMessagesAsRead = useCallback((messageIds: string[]) => {
    if (state.socket?.connected) {
      messagingService.markMessagesAsReadSocket(messageIds);
    } else {
      const token = authService.getToken();
      if (token) {
        messagingService.markMessagesAsRead(messageIds, token);
      }
    }
  }, [state.socket]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      await messagingService.deleteMessage(messageId, token);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to delete message'
      }));
    }
  }, []);

  // Load conversations
  const loadConversations = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const response = await messagingService.getConversations(token);

      console.log('RESPONSE', response );
      
      
      const chats: Chat[] = response.data.conversations.map(conv => ({
        _id: conv.conversationId,
        name: conv.conversationName,
        avatar: conv.conversationAvatar,
        lastMessage: conv.text,
        timestamp: conv.timestamp,
        unread: conv.unreadCount,
        isGroup: conv.conversationType === 'group',
        participants: conv.participants
      }));

      setState(prev => ({ ...prev, chats, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load conversations'
      }));
    }
  }, []);

  // Join group
  const joinGroup = useCallback((groupId: string) => {
    if (state.socket?.connected) {
      messagingService.joinGroup(groupId);
    }
  }, [state.socket]);

  // Leave group
  const leaveGroup = useCallback((groupId: string) => {
    if (state.socket?.connected) {
      messagingService.leaveGroup(groupId);
    }
  }, [state.socket]);

  // Start typing
  const startTyping = useCallback((chatId: string, isGroup = false) => {
    if (!state.socket?.connected) return;

    if (isGroup) {
      messagingService.startTyping(undefined, chatId);
    } else {
      messagingService.startTyping(chatId, undefined);
    }
  }, [state.socket]);

  // Stop typing
  const stopTyping = useCallback((chatId: string, isGroup = false) => {
    if (!state.socket?.connected) return;

    if (isGroup) {
      messagingService.stopTyping(undefined, chatId);
    } else {
      messagingService.stopTyping(chatId, undefined);
    }
  }, [state.socket]);

  // Auto-stop typing after timeout
  const autoStopTyping = useCallback((chatId: string, isGroup = false) => {
    const key = `${chatId}-${isGroup}`;
    
    // Clear existing timeout
    if (typingTimeouts.current.has(key)) {
      clearTimeout(typingTimeouts.current.get(key)!);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      stopTyping(chatId, isGroup);
      typingTimeouts.current.delete(key);
    }, 3000);

    typingTimeouts.current.set(key, timeout);
  }, [stopTyping]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Get messages for a chat
  const getChatMessages = useCallback((chatId: string): Message[] => {
    return state.messages[chatId] || [];
  }, [state.messages]);

  // Get unread count for a chat
  const getUnreadCount = useCallback((chatId: string): number => {
    const chat = state.chats.find(c => c._id === chatId);
    return chat?.unread || 0;
  }, [state.chats]);

  // Check if user is online
  const isUserOnline = useCallback((userId: string): boolean => {
    return state.onlineUsers.includes(userId);
  }, [state.onlineUsers]);

  // Check if user is typing
  const isUserTyping = useCallback((userId: string, chatId?: string): boolean => {
    return state.typingUsers.some(user => 
      user.userId === userId && 
      (!chatId || user.groupId === chatId || user.type === 'direct')
    );
  }, [state.typingUsers]);

  // Load online users on connect
  useEffect(() => {
    if (state.isConnected) {
      const token = authService.getToken();
      if (token) {
        messagingService.getOnlineUsers(token)
          .then(response => {
            setState(prev => ({ 
              ...prev, 
              onlineUsers: response.data.onlineUsers 
            }));
          })
          .catch(error => {
            console.error('Failed to load online users:', error);
          });
      }
    }
  }, [state.isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
      typingTimeouts.current.clear();
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    loadMessages,
    markMessagesAsRead,
    deleteMessage,
    loadConversations,
    joinGroup,
    leaveGroup,
    startTyping: (chatId: string, isGroup = false) => {
      startTyping(chatId, isGroup);
      autoStopTyping(chatId, isGroup);
    },
    stopTyping,
    clearError,
    getChatMessages,
    getUnreadCount,
    isUserOnline,
    isUserTyping,
  };
};
