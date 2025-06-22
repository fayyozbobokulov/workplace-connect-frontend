import { useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import messagingService, { type Message, type Chat, type ConversationResponse } from '../services/messaging.service';
import authService from '../services/auth.service';
import { useAuth } from '../components/auth/auth.provider';

export interface MessagingState {
  socket: Socket | null;
  isConnected: boolean;
  messages: Record<string, Message[]>; // chatId -> messages
  chats: Chat[];
  onlineUsers: string[];
  typingUsers: Record<string, string[]>; // chatId -> userIds
  loading: boolean;
  error: string | null;
}

export interface MessagingActions {
  // Socket management
  connect: () => void;
  disconnect: () => void;
  
  // Message operations
  sendMessage: (content: string, chatId: string, isGroup?: boolean) => void;
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

const initialState: MessagingState = {
  socket: null,
  isConnected: false,
  messages: {},
  chats: [],
  onlineUsers: [],
  typingUsers: {},
  loading: false,
  error: null,
};

export const useMessaging = (): MessagingState & MessagingActions => {
  const [state, setState] = useState<MessagingState>(initialState);
  const { session } = useAuth();

  // Connect to socket
  const connect = useCallback(() => {
    if (!session?.token || state.socket?.connected) return;

    try {
      const socket = messagingService.initializeSocket(session.token);
      
      // Set up event listeners
      socket.on('connect', () => {
        setState(prev => ({ ...prev, isConnected: true, error: null }));
      });

      socket.on('disconnect', () => {
        setState(prev => ({ ...prev, isConnected: false }));
      });

      socket.on('direct-message', (message: Message) => {
        handleNewMessage(message, false);
      });

      socket.on('group-message', (message: Message) => {
        handleNewMessage(message, true);
      });

      socket.on('message-sent', (response: { success: boolean; message: Message }) => {
        if (response.success) {
          handleMessageSent(response.message);
        }
      });

      socket.on('user-status', (data: { userId: string; status: 'online' | 'offline' }) => {
        setState(prev => ({
          ...prev,
          onlineUsers: data.status === 'online' 
            ? [...prev.onlineUsers.filter(id => id !== data.userId), data.userId]
            : prev.onlineUsers.filter(id => id !== data.userId)
        }));
      });

      socket.on('user-typing', (data: { userId: string; type: 'direct' | 'group'; groupId?: string }) => {
        const chatId = data.type === 'group' ? data.groupId! : data.userId;
        setState(prev => ({
          ...prev,
          typingUsers: {
            ...prev.typingUsers,
            [chatId]: [...(prev.typingUsers[chatId] || []).filter(id => id !== data.userId), data.userId]
          }
        }));
      });

      socket.on('user-stopped-typing', (data: { userId: string; type: 'direct' | 'group'; groupId?: string }) => {
        const chatId = data.type === 'group' ? data.groupId! : data.userId;
        setState(prev => ({
          ...prev,
          typingUsers: {
            ...prev.typingUsers,
            [chatId]: (prev.typingUsers[chatId] || []).filter(id => id !== data.userId)
          }
        }));
      });

      setState(prev => ({ ...prev, socket }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to connect'
      }));
    }
  }, [session?.token, state.socket?.connected]);

  // Disconnect from socket
  const disconnect = useCallback(() => {
    if (state.socket) {
      messagingService.disconnectSocket();
      setState(prev => ({ ...prev, socket: null, isConnected: false }));
    }
  }, [state.socket]);

  // Handle new incoming message
  const handleNewMessage = useCallback((message: Message, isGroup: boolean) => {
    let chatId: string;
    
    if (isGroup) {
      // For group messages, we need the group ID from the message context
      // This is a limitation of the current message structure - we need group ID
      chatId = 'group-id-needed'; // TODO: Fix when group ID is available in message
    } else {
      // For direct messages, use the other person's ID as chat ID
      // If it's our own message, we need to determine who we're talking to
      // If it's a received message, use sender's ID
      chatId = message.sender._id;
    }
    
    // Check if this message already exists to prevent duplicates
    let shouldAddMessage = false;
    let shouldUpdateChat = false;
    
    setState(prev => {
      const existingMessages = prev.messages[chatId] || [];
      const messageExists = existingMessages.some(msg => 
        msg._id === message._id || 
        (msg._id.startsWith('temp-') && msg.text === message.text && msg.sender._id === message.sender._id)
      );
      
      if (messageExists) {
        return prev; // Don't add duplicate message
      }
      
      shouldAddMessage = true;
      const chatExists = prev.chats.some(chat => chat._id === chatId);
      shouldUpdateChat = !message.isOwn || !chatExists;
      
      return {
        ...prev,
        messages: {
          ...prev.messages,
          [chatId]: [...existingMessages, message]
        }
      };
    });

    // Update chat last message if needed
    if (shouldAddMessage && shouldUpdateChat) {
      updateChatLastMessage(chatId, message, isGroup);
    }
  }, []);

  // Handle message sent confirmation
  const handleMessageSent = useCallback((message: Message) => {
    // For sent messages, we need to find the correct chat ID
    // This should match the chatId used when sending the message
    // The message should contain enough info to determine the correct chat
    
    // For now, we'll update all chats that have a temporary message
    setState(prev => {
      const newMessages = { ...prev.messages };
      
      Object.keys(newMessages).forEach(chatId => {
        const chatMessages = newMessages[chatId];
        const hasTemp = chatMessages.some(msg => msg._id.startsWith('temp-'));
        
        if (hasTemp) {
          newMessages[chatId] = chatMessages.map(msg => 
            msg._id.startsWith('temp-') && msg.text === message.text ? message : msg
          );
        }
      });
      
      return {
        ...prev,
        messages: newMessages
      };
    });
  }, []);

  // Update chat's last message
  const updateChatLastMessage = useCallback((chatId: string, message: Message, isGroup = false) => {
    setState(prev => {
      // Check if chat already exists by _id
      const existingChatIndex = prev.chats.findIndex(chat => chat._id === chatId);
      
      if (existingChatIndex === -1) {
        // Create new chat entry only if it doesn't exist
        const newChat: Chat = {
          _id: chatId,
          name: isGroup ? 'Group Chat' : `${message.sender.firstName} ${message.sender.lastName}`,
          avatar: message.sender.profilePicture || '',
          lastMessage: message.text,
          timestamp: message.timestamp,
          unread: message.isOwn ? 0 : 1,
          isGroup,
          participants: isGroup ? [] : [{
            _id: message.sender._id,
            firstName: message.sender.firstName,
            lastName: message.sender.lastName,
            profilePicture: message.sender.profilePicture
          }]
        };
        
        return {
          ...prev,
          chats: [newChat, ...prev.chats]
        };
      } else {
        // Update existing chat
        const updatedChats = [...prev.chats];
        updatedChats[existingChatIndex] = {
          ...updatedChats[existingChatIndex],
          lastMessage: message.text,
          timestamp: message.timestamp,
          unread: message.isOwn ? updatedChats[existingChatIndex].unread : (updatedChats[existingChatIndex].unread || 0) + 1
        };
        
        return { ...prev, chats: updatedChats };
      }
    });
  }, []);

  // Send message
  const sendMessage = useCallback((content: string, chatId: string, isGroup = false) => {
    if (!state.socket?.connected) {
      setState(prev => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    // Prevent sending empty messages
    if (!content.trim()) {
      return;
    }

    // Check for recent duplicate messages to prevent rapid sending
    const recentMessages = state.messages[chatId] || [];
    const lastMessage = recentMessages[recentMessages.length - 1];
    const now = Date.now();
    
    if (lastMessage && 
        lastMessage.text === content.trim() && 
        lastMessage.isOwn && 
        (now - new Date(lastMessage.timestamp).getTime()) < 1000) {
      console.log(' Preventing duplicate message send');
      return; // Prevent sending duplicate message within 1 second
    }

    // Create optimistic message for immediate UI feedback
    const optimisticMessage: Message = {
      _id: `temp-${Date.now()}`,
      text: content,
      sender: {
        _id: session?._id || '',
        firstName: session?.firstName || '',
        lastName: session?.lastName || '',
        profilePicture: session?.profilePicture || ''
      },
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

    // Update chat last message
    updateChatLastMessage(chatId, optimisticMessage, isGroup);

    // Send via socket
    console.log(' Sending message:', { content, chatId, isGroup });
    if (isGroup) {
      messagingService.sendMessageSocket(content, undefined, chatId);
    } else {
      messagingService.sendMessageSocket(content, chatId, undefined);
    }
  }, [state.socket, state.messages, session, updateChatLastMessage]);

  // Load messages for a chat
  const loadMessages = useCallback(async (chatId: string, isGroup = false, page = 1) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      let response;
      if (isGroup) {
        response = await messagingService.getGroupMessages(chatId, token, page);
      } else {
        response = await messagingService.getDirectMessages(chatId, token, page);
      }

      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [chatId]: page === 1 ? response.data.messages : [...response.data.messages, ...(prev.messages[chatId] || [])]
        }
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load messages'
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

      const response: ConversationResponse = await messagingService.getConversations(token);
      
      // Convert conversations to Chat objects
      const chats: Chat[] = response.data.conversations.map(conv => {
        if (conv.type === 'direct' && conv.participant) {
          return {
            _id: conv.participant._id, // Use participant ID as chat ID
            name: `${conv.participant.firstName} ${conv.participant.lastName}`,
            avatar: conv.participant.profilePicture || '',
            lastMessage: conv.lastMessage.text,
            timestamp: conv.lastMessage.timestamp,
            unread: conv.unreadCount,
            isGroup: false,
            participants: [conv.participant]
          };
        } else if (conv.type === 'group' && conv.group) {
          return {
            _id: conv.group._id,
            name: conv.group.name,
            avatar: '', // Groups might not have avatars in current structure
            lastMessage: conv.lastMessage.text,
            timestamp: conv.lastMessage.timestamp,
            unread: conv.unreadCount,
            isGroup: true,
            participants: []
          };
        }
        return null;
      }).filter(Boolean) as Chat[];

      setState(prev => ({ ...prev, chats, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load conversations'
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
    if (state.socket?.connected) {
      if (isGroup) {
        messagingService.startTyping(undefined, chatId);
      } else {
        messagingService.startTyping(chatId, undefined);
      }
    }
  }, [state.socket]);

  // Stop typing
  const stopTyping = useCallback((chatId: string, isGroup = false) => {
    if (state.socket?.connected) {
      if (isGroup) {
        messagingService.stopTyping(undefined, chatId);
      } else {
        messagingService.stopTyping(chatId, undefined);
      }
    }
  }, [state.socket]);

  // Utility functions
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const getChatMessages = useCallback((chatId: string): Message[] => {
    return state.messages[chatId] || [];
  }, [state.messages]);

  const getUnreadCount = useCallback((chatId: string): number => {
    const chat = state.chats.find(c => c._id === chatId);
    return chat?.unread || 0;
  }, [state.chats]);

  const isUserOnline = useCallback((userId: string): boolean => {
    return state.onlineUsers.includes(userId);
  }, [state.onlineUsers]);

  const isUserTyping = useCallback((userId: string, chatId?: string): boolean => {
    if (chatId) {
      return (state.typingUsers[chatId] || []).includes(userId);
    }
    return Object.values(state.typingUsers).some(users => users.includes(userId));
  }, [state.typingUsers]);

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
    startTyping,
    stopTyping,
    clearError,
    getChatMessages,
    getUnreadCount,
    isUserOnline,
    isUserTyping,
  };
};
