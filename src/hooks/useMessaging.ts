/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useCallback, useEffect } from 'react';
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
  version: number; // Version counter to force re-renders
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
  markAllRead: (chatId: string) => Promise<void>;
  
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
  debugChatMessages: (chatId: string) => void;
  refreshUnreadCounts: () => void;
  fetchOnlineUsers: () => void;
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
  version: 0,
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
        console.log('🔌 Socket connected, fetching initial online users...');
        setState(prev => ({ ...prev, isConnected: true, error: null }));
        
        // Fetch initial online users when we connect
        fetchOnlineUsers();
      });

      socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
        setState(prev => ({ ...prev, isConnected: false }));
      });

      // Listen for online users list (initial or updated)
      socket.on('online-users', (data: { users: string[] }) => {
        console.log('👥 Received online users list:', data.users);
        setState(prev => ({
          ...prev,
          onlineUsers: data.users,
          version: prev.version + 1
        }));
      });

      socket.on('user-status', (data: { userId: string; status: 'online' | 'offline' }) => {
        console.log(`👤 User ${data.userId} is now ${data.status}`);
        setState(prev => ({
          ...prev,
          onlineUsers: data.status === 'online' 
            ? [...prev.onlineUsers.filter(id => id !== data.userId), data.userId]
            : prev.onlineUsers.filter(id => id !== data.userId),
          version: prev.version + 1
        }));
      });

      socket.on('direct-message', (message: Message) => {
        handleNewMessage(message, false);
      });

      socket.on('group-message', (data: { message: Message; groupId: string }) => {
        handleNewMessage(data.message, true, data.groupId);
      });

      socket.on('message-sent', (response: { success: boolean; message: Message; groupId?: string }) => {
        if (response.success) {
          handleMessageSent(response.message, response.groupId);
        }
      });

      socket.on('user-typing', (data: { userId: string; type: 'direct' | 'group'; groupId?: string }) => {
        let chatId: string;
        if (data.type === 'group') {
          if (!data.groupId) {
            console.warn('⚠️ Group typing event received without groupId, skipping');
            return;
          }
          chatId = data.groupId;
        } else {
          chatId = data.userId;
        }
        
        setState(prev => ({
          ...prev,
          typingUsers: {
            ...prev.typingUsers,
            [chatId]: [...(prev.typingUsers[chatId] || []).filter(id => id !== data.userId), data.userId]
          }
        }));
      });

      socket.on('user-stopped-typing', (data: { userId: string; type: 'direct' | 'group'; groupId?: string }) => {
        let chatId: string;
        if (data.type === 'group') {
          if (!data.groupId) {
            console.warn('⚠️ Group stopped-typing event received without groupId, skipping');
            return;
          }
          chatId = data.groupId;
        } else {
          chatId = data.userId;
        }
        
        setState(prev => ({
          ...prev,
          typingUsers: {
            ...prev.typingUsers,
            [chatId]: (prev.typingUsers[chatId] || []).filter(id => id !== data.userId)
          }
        }));
      });

      socket.on('messages-read', (data: { messageIds: string[]; userId: string }) => {
        console.log('📖 Received messages-read event:', data);
        setState(prev => {
          const updatedMessages = { ...prev.messages };
          const affectedChats = new Set<string>();
          
          // Update readBy for all affected messages and track which chats are affected
          Object.keys(updatedMessages).forEach(chatId => {
            const chatMessages = updatedMessages[chatId];
            if (!chatMessages || !Array.isArray(chatMessages)) {
              return; // Skip if no messages for this chat
            }
            
            let chatHasUpdates = false;
            updatedMessages[chatId] = chatMessages.map(message => {
              if (data.messageIds.includes(message._id)) {
                const readBy = message.readBy || [];
                if (!readBy.includes(data.userId)) {
                  chatHasUpdates = true;
                  affectedChats.add(chatId);
                  return {
                    ...message,
                    readBy: [...readBy, data.userId]
                  };
                }
              }
              return message;
            });
          });

          // Update unread counts for affected chats
          const updatedChats = prev.chats.map(chat => {
            if (affectedChats.has(chat._id)) {
              // Recalculate unread count for this chat
              const chatMessages = updatedMessages[chat._id] || [];
              const currentUserId = data.userId; // The user who marked messages as read
              const unreadCount = chatMessages.filter(msg => 
                msg.sender._id !== currentUserId && 
                !msg.readBy?.includes(currentUserId)
              ).length;
              
              return { ...chat, unread: unreadCount };
            }
            return chat;
          });

          console.log(`🔄 Updated ${affectedChats.size} chats from messages-read event`);
          return {
            ...prev,
            messages: updatedMessages,
            chats: updatedChats,
            version: prev.version + 1
          };
        });
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
  const handleNewMessage = useCallback((message: Message, isGroup: boolean, groupId?: string) => {
    try {
      let chatId: string;
      
      if (isGroup) {
        if (!groupId) {
          console.error('⚠️ Group message received without groupId, using fallback');
          chatId = 'group-id-needed'; // Fallback to prevent crash
        } else {
          chatId = groupId;
        }
        console.log(`📨 Received group message for group ${chatId}:`, message);
      } else {
        // For direct messages, use the other person's ID as chat ID
        // If it's our own message, we need to determine who we're talking to
        // If it's a received message, use sender's ID
        chatId = message.sender._id;
        console.log(`📨 Received direct message for chat ${chatId}:`, message);
      }
      
      // Validate message structure
      if (!message || !message.sender || !message.sender._id) {
        console.error('⚠️ Invalid message structure received:', message);
        return;
      }
      
      // Validate chatId
      if (!chatId || typeof chatId !== 'string') {
        console.error('⚠️ Invalid chatId determined:', chatId);
        return;
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
          console.log(`⚠️ Duplicate message detected for chat ${chatId}, skipping`);
          return prev; // Don't add duplicate message
        }
        
        shouldAddMessage = true;
        const chatExists = prev.chats.some(chat => chat._id === chatId);
        shouldUpdateChat = !message.isOwn || !chatExists;
        
        console.log(`✅ Adding new message to chat ${chatId}, will update chat: ${shouldUpdateChat}`);
        
        return {
          ...prev,
          messages: {
            ...prev.messages,
            [chatId]: [...existingMessages, message]
          },
          version: prev.version + 1
        };
      });

      // Update chat last message if needed
      if (shouldAddMessage && shouldUpdateChat) {
        updateChatLastMessage(chatId, message, isGroup);
      }
    } catch (error) {
      console.error('❌ Error in handleNewMessage:', error);
      console.error('Message data:', message);
    }
  }, []);

  // Handle message sent confirmation
  const handleMessageSent = useCallback((message: Message, groupId?: string) => {
    // Determine the correct chat ID for the sent message
    const targetChatId = groupId || message.sender._id;
    
    console.log(`📤 Message sent confirmation for chat ${targetChatId}:`, message);
    
    setState(prev => {
      const newMessages = { ...prev.messages };
      
      // Update the specific chat if we have the target chat ID
      if (newMessages[targetChatId] && Array.isArray(newMessages[targetChatId])) {
        newMessages[targetChatId] = newMessages[targetChatId].map(msg => 
          msg._id.startsWith('temp-') && msg.text === message.text ? message : msg
        );
      } else {
        // Fallback: update all chats that have a temporary message with matching text
        Object.keys(newMessages).forEach(chatId => {
          const chatMessages = newMessages[chatId];
          if (!chatMessages || !Array.isArray(chatMessages)) {
            return; // Skip if no messages for this chat
          }
          
          const hasMatchingTemp = chatMessages.some(msg => 
            msg._id.startsWith('temp-') && msg.text === message.text
          );
          
          if (hasMatchingTemp) {
            newMessages[chatId] = chatMessages.map(msg => 
              msg._id.startsWith('temp-') && msg.text === message.text ? message : msg
            );
          }
        });
      }
      
      return {
        ...prev,
        messages: newMessages,
        version: prev.version + 1
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
          chats: [newChat, ...prev.chats],
          version: prev.version + 1
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
        
        return { ...prev, chats: updatedChats, version: prev.version + 1 };
      }
    });
  }, []);

  // Fetch online users
  const fetchOnlineUsers = useCallback(async () => {
    if (!session?.token) {
      console.warn('⚠️ No session token available for fetching online users');
      return;
    }

    try {
      console.log('🔄 Fetching online users...');
      const response = await messagingService.getOnlineUsers(session.token);
      
      if (response.success) {
        console.log('✅ Successfully fetched online users:', response.data.onlineUsers);
        setState(prev => ({
          ...prev,
          onlineUsers: response.data.onlineUsers,
          version: prev.version + 1
        }));
      } else {
        console.error('❌ Failed to fetch online users:', response.message);
      }
    } catch (error) {
      console.error('❌ Error fetching online users:', error);
    }
  }, [session?.token]);

  // Send message
  const sendMessage = useCallback((content: string, chatId: string, isGroup = false) => {
    try {
      if (!state.socket?.connected) {
        setState(prev => ({ ...prev, error: 'Not connected to server' }));
        return;
      }

      // Prevent sending empty messages
      if (!content.trim()) {
        return;
      }

      // Validate required parameters
      if (!chatId) {
        console.error('❌ Cannot send message: chatId is required');
        return;
      }

      if (!session?._id) {
        console.error('❌ Cannot send message: user session is required');
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
          _id: session._id,
          firstName: session.firstName || '',
          lastName: session.lastName || '',
          profilePicture: session.profilePicture || ''
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
        },
        version: prev.version + 1
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
    } catch (error) {
      console.error(' Error in sendMessage:', error);
      setState(prev => ({ ...prev, error: 'Failed to send message' }));
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

      setState(prev => {
        const updatedMessages = {
          ...prev.messages,
          [chatId]: page === 1 ? response.data.messages : [...response.data.messages, ...(prev.messages[chatId] || [])]
        };

        // Recalculate unread count for this chat after loading messages
        const currentUserId = session?._id;
        const updatedChats = currentUserId ? prev.chats.map(chat => {
          if (chat._id === chatId) {
            const chatMessages = updatedMessages[chatId] || [];
            const unreadCount = chatMessages.filter(msg => 
              msg.sender._id !== currentUserId && 
              !msg.readBy?.includes(currentUserId)
            ).length;
            
            return { ...chat, unread: unreadCount };
          }
          return chat;
        }) : prev.chats;

        return {
          ...prev,
          messages: updatedMessages,
          chats: updatedChats
        };
      });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load messages'
      }));
    }
  }, [session]);

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

      setState(prev => ({ ...prev, chats, loading: false, version: prev.version + 1 }));
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

  // Mark all messages in a chat as read
  const markAllRead = useCallback(async (chatId: string) => {
    try {
      console.log(` markAllRead called for chatId: ${chatId}`);
      
      // Get all messages in the chat
      const chatMessages = state.messages[chatId] || [];
      console.log(` Found ${chatMessages.length} total messages in chat`);
      
      if (chatMessages.length === 0) {
        console.log(' No messages found in chat, loading messages first...');
        // Try to load messages if none exist
        await loadMessages(chatId, false);
        // After loading, try again with the loaded messages
        const newChatMessages = state.messages[chatId] || [];
        if (newChatMessages.length === 0) {
          console.log(' Still no messages after loading');
          return;
        }
      }

      // Filter unread messages more carefully
      const currentUserId = session?._id;
      if (!currentUserId) {
        console.error(' No current user ID available');
        return;
      }

      const currentMessages = state.messages[chatId] || [];
      const unreadMessages = currentMessages.filter(msg => 
        msg.sender._id !== currentUserId && !msg.readBy?.includes(currentUserId)
      );
      
      const unreadMessageIds = unreadMessages.map(msg => msg._id);
      console.log(` Found ${unreadMessages.length} unread messages:`, unreadMessageIds);

      if (unreadMessageIds.length === 0) {
        console.log(' No unread messages to mark as read');
        // Still update the chat unread count to 0 in case it's out of sync
        setState(prev => ({
          ...prev,
          chats: prev.chats.map(chat => 
            chat._id === chatId ? { ...chat, unread: 0 } : chat
          ),
          version: prev.version + 1
        }));
        return;
      }

      // OPTIMISTIC UPDATE: Immediately update local state for instant UI feedback
      console.log(' Applying optimistic update...');
      setState(prev => {
        const updatedMessages = { ...prev.messages };
        if (updatedMessages[chatId] && Array.isArray(updatedMessages[chatId])) {
          updatedMessages[chatId] = updatedMessages[chatId].map(message => {
            if (unreadMessageIds.includes(message._id)) {
              return {
                ...message,
                readBy: [...(message.readBy || []), currentUserId]
              };
            }
            return message;
          });
        }

        // Update chat unread count to 0
        const updatedChats = prev.chats.map(chat => 
          chat._id === chatId 
            ? { ...chat, unread: 0 }
            : chat
        );

        console.log(' Applied optimistic update to local state');
        return {
          ...prev,
          messages: updatedMessages,
          chats: updatedChats,
          version: prev.version + 1
        };
      });

      // Then make the API/socket call
      console.log(' Sending mark as read request...');
      if (state.socket?.connected) {
        console.log(' Using socket connection');
        messagingService.markMessagesAsReadSocket(unreadMessageIds);
      } else {
        console.log(' Using HTTP API');
        const token = authService.getToken();
        if (token) {
          await messagingService.markMessagesAsRead(unreadMessageIds, token);
        } else {
          throw new Error('No authentication token available');
        }
      }

      console.log(` Successfully marked ${unreadMessageIds.length} messages as read in chat ${chatId}`);
    } catch (error) {
      console.error(' Error marking all messages as read:', error);
      
      // Revert optimistic update on error
      setState(prev => {
        // Reload the original state or handle error appropriately
        return {
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to mark messages as read'
        };
      });
    }
  }, [state.socket, state.messages, session, loadMessages]);

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
    const isOnline = state.onlineUsers.includes(userId);
    console.log(` Checking if user ${userId} is online:`, {
      isOnline,
      onlineUsers: state.onlineUsers,
      totalOnlineUsers: state.onlineUsers.length
    });
    return isOnline;
  }, [state.onlineUsers]);

  const isUserTyping = useCallback((userId: string, chatId?: string): boolean => {
    if (chatId) {
      return (state.typingUsers[chatId] || []).includes(userId);
    }
    return Object.values(state.typingUsers).some(users => users.includes(userId));
  }, [state.typingUsers]);

  const debugChatMessages = useCallback((chatId: string) => {
    const chatMessages = state.messages[chatId] || [];
    const currentUserId = session?._id;
    
    console.log(` DEBUG: Chat ${chatId} analysis:`);
    console.log(` Current user ID: ${currentUserId}`);
    console.log(` Total messages: ${chatMessages.length}`);
    
    chatMessages.forEach((message, index) => {
      const isOwnMessage = message.sender._id === currentUserId;
      const isReadByUs = message.readBy?.includes(currentUserId || '') || false;
      
      console.log(` Message ${index + 1}:`, {
        id: message._id,
        text: message.text.substring(0, 50) + '...',
        senderId: message.sender._id,
        senderName: `${message.sender.firstName} ${message.sender.lastName}`,
        isOwnMessage,
        isReadByUs,
        readBy: message.readBy || [],
        timestamp: message.timestamp
      });
    });
    
    const unreadMessages = chatMessages.filter(msg => 
      msg.sender._id !== currentUserId && !msg.readBy?.includes(currentUserId || '')
    );
    
    console.log(` Unread messages count: ${unreadMessages.length}`);
    console.log(` Unread message IDs:`, unreadMessages.map(m => m._id));
  }, [state.messages, session]);

  const refreshUnreadCounts = useCallback(() => {
    const currentUserId = session?._id;
    if (!currentUserId) return;

    console.log(' Refreshing unread counts for all chats...');
    
    setState(prev => {
      const updatedChats = prev.chats.map(chat => {
        const chatMessages = prev.messages[chat._id] || [];
        const unreadCount = chatMessages.filter(msg => 
          msg.sender._id !== currentUserId && 
          !msg.readBy?.includes(currentUserId)
        ).length;
        
        if (chat.unread !== unreadCount) {
          console.log(` Chat ${chat._id}: ${chat.unread} → ${unreadCount} unread`);
          return { ...chat, unread: unreadCount };
        }
        return chat;
      });

      return {
        ...prev,
        chats: updatedChats,
        version: prev.version + 1
      };
    });
  }, [session, state.messages, state.chats]);

  // Effect to automatically sync unread counts when messages change
  useEffect(() => {
    const currentUserId = session?._id;
    if (!currentUserId || state.chats.length === 0) return;

    console.log(' Auto-syncing unread counts due to message changes...');
    
    // Check if any chat's unread count is out of sync
    let needsUpdate = false;
    const updatedChats = state.chats.map(chat => {
      const chatMessages = state.messages[chat._id] || [];
      const actualUnreadCount = chatMessages.filter(msg => 
        msg.sender._id !== currentUserId && 
        !msg.readBy?.includes(currentUserId)
      ).length;
      
      if (chat.unread !== actualUnreadCount) {
        needsUpdate = true;
        console.log(` Chat ${chat._id}: ${chat.unread} → ${actualUnreadCount} unread`);
        return { ...chat, unread: actualUnreadCount };
      }
      return chat;
    });

    // Only update state if there are actual changes
    if (needsUpdate) {
      setState(prev => ({
        ...prev,
        chats: updatedChats,
        version: prev.version + 1
      }));
    }
  }, [state.messages, session?._id]); // Only depend on messages and user ID, not chats to avoid loops

  // Periodically refresh online users to ensure consistency
  useEffect(() => {
    if (!state.isConnected || !session?.token) return;

    // Refresh online users every 30 seconds
    const interval = setInterval(() => {
      console.log(' Periodic refresh of online users...');
      fetchOnlineUsers();
    }, 30000);

    return () => clearInterval(interval);
  }, [state.isConnected, session?.token, fetchOnlineUsers]);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    loadMessages,
    markMessagesAsRead,
    markAllRead,
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
    debugChatMessages,
    refreshUnreadCounts,
    fetchOnlineUsers,
  };
};
