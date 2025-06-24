import { useState, useEffect, useCallback } from 'react';
import { Box, useTheme, useMediaQuery, Snackbar, Alert, CircularProgress, Backdrop } from '@mui/material';
import { useAuth } from '../components/auth/auth.provider';
import { useMessagingContext } from '../contexts/messaging.context';
import ChatList, { type Chat, type Friend } from '../components/directory/chat-list';
import { type GroupData } from '../components/directory/create-group.dialog';
import ChatContainer from '../components/messaging/chat-container';
import type { Message } from '../components/messaging/message-window';
import usersService, { type User } from '../services/users.service';
import groupsService, { type Group } from '../services/groups.service';
import { AxiosError } from 'axios';

const Home = () => {
  const { session } = useAuth();
  const messaging = useMessagingContext();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [enrichedChats, setEnrichedChats] = useState<Chat[]>([]);
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Convert User to Friend format
  const convertUserToFriend = useCallback((user: User): Friend => ({
    _id: user._id,
    name: `${user.firstName} ${user.lastName}`,
    avatar: user.profilePicture && user.profilePicture.trim() !== '' 
      ? user.profilePicture 
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&background=random`,
    lastMessage: '',
    timestamp: '',
    online: messaging.isUserOnline(user._id)
  }), [messaging]);

  // Convert Group to Chat format with populated participants
  const convertGroupToChat = async (group: Group): Promise<Chat> => {
    try {
      // Fetch user details for all members
      const memberPromises = group.members.map(async (memberId) => {
        try {
          const userResponse = await usersService.getUserById(memberId, session!.token);
          const user = userResponse.data.user;
          return {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            online: messaging.isUserOnline(user._id),
            role: group.admins.includes(user._id) ? 'admin' as const : 'member' as const,
            lastSeen: messaging.isUserOnline(user._id) ? undefined : 'recently'
          };
        } catch (error) {
          console.error(`Failed to fetch user ${memberId}:`, error);
          // Return a fallback participant if user fetch fails
          return {
            _id: memberId,
            firstName: 'Unknown',
            lastName: 'User',
            profilePicture: undefined,
            online: false,
            role: group.admins.includes(memberId) ? 'admin' as const : 'member' as const,
            lastSeen: 'unknown'
          };
        }
      });

      const participants = await Promise.all(memberPromises);

      return {
        _id: group._id,
        name: group.name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name)}&background=random`,
        lastMessage: '',
        timestamp: '',
        unread: 0,
        isPinned: false,
        isGroup: true,
        participants
      };
    } catch (error) {
      console.error('Error converting group to chat:', error);
      // Return chat with empty participants if conversion fails
      return {
        _id: group._id,
        name: group.name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name)}&background=random`,
        lastMessage: '',
        timestamp: '',
        unread: 0,
        isPinned: false,
        isGroup: true,
        participants: []
      };
    }
  };

  // Effect to build enriched chats with populated group participants
  useEffect(() => {
    const buildEnrichedChats = async () => {
      if (!session?.token) return;

      // Create chat map with messaging chats
      const chatMap = new Map<string, Chat>();
      
      // Add messaging chats first
      messaging.chats.forEach(chat => {
        // Find corresponding friend data for better avatar/info
        const friend = friends.find(f => f._id === chat._id);
        
        chatMap.set(chat._id, {
          _id: chat._id,
          name: chat.name,
          avatar: friend?.avatar || chat.avatar, // Prefer friend avatar if available
          lastMessage: chat.lastMessage,
          timestamp: chat.timestamp,
          unread: chat.unread,
          online: chat.isGroup ? undefined : messaging.isUserOnline(chat._id),
          isPinned: false,
          isGroup: chat.isGroup,
          participants: chat.participants
        });
      });

      // Add groups that don't have active conversations yet
      const groupsToAdd = groups.filter(group => !chatMap.has(group._id));
      if (groupsToAdd.length > 0) {
        console.log('Converting groups to chats with participants:', groupsToAdd.length);
        try {
          const convertedGroups = await Promise.all(
            groupsToAdd.map(group => convertGroupToChat(group))
          );
          
          // Add converted groups to chat map
          convertedGroups.forEach(chat => {
            chatMap.set(chat._id, chat);
          });
        } catch (error) {
          console.error('Error converting groups to chats:', error);
        }
      }

      // Update enriched chats state
      const newEnrichedChats = Array.from(chatMap.values());
      setEnrichedChats(newEnrichedChats);
    };

    buildEnrichedChats();
  }, [groups, messaging.chats, friends, session?.token, messaging.isUserOnline]);

  // Debug logging for chat construction
  console.log('🏠 Home allChats construction:', {
    messagingChats: messaging.chats.length,
    groupsWithoutChats: groups.filter(group => !enrichedChats.find(chat => chat._id === group._id)).length,
    totalAllChats: enrichedChats.length,
    allChatIds: enrichedChats.map(c => ({ id: c._id, name: c.name, isGroup: c.isGroup, hasAvatar: !!c.avatar }))
  });

  // Get current messages for selected chat
  const messages: Message[] = selectedChatId ? messaging.getChatMessages(selectedChatId) : [];

  // Load users and groups on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!session?.token) return;
      
      setLoading(true);
      try {
        // Load users (potential friends)
        const usersResponse = await usersService.getUsers(session.token, 1, 100);
        
        const allUsers = usersResponse?.users;
        
        // Only proceed if users data is available
        if (allUsers && Array.isArray(allUsers)) {
          // Filter out current user
          const otherUsers = allUsers.filter(user => user._id !== session._id);
          
          // Convert users to friends format
          const friendsList = otherUsers.map(convertUserToFriend);
          
          setFriends(friendsList);
        } else {
          setFriends([]);
        }

        // Load groups
        const groupsResponse = await groupsService.getGroups(session.token);
        console.log('Groups API Response:', groupsResponse);
        const groupsData = groupsResponse?.groups || groupsResponse?.data?.groups;
        
        // Only proceed if groups data is available
        if (groupsData && Array.isArray(groupsData)) {
          setGroups(groupsData);
        } else {
          setGroups([]);
        }
      } catch (error) {
        console.error('Error loading users and groups:', error);
        setShowError(true);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    loadData();
  }, [session?.token, session?._id, convertUserToFriend]);

  // Update friends online status when online users change
  useEffect(() => {
    setFriends(prevFriends => 
      prevFriends.map(friend => ({
        ...friend,
        online: messaging.isUserOnline(friend._id)
      }))
    );
  }, [messaging.onlineUsers]);

  // Show error snackbar when messaging error occurs
  useEffect(() => {
    if (messaging.error) {
      setShowError(true);
    }
  }, [messaging.error]);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChatId) {
      const selectedChat = enrichedChats.find(chat => chat._id === selectedChatId);
      const isGroup = selectedChat?.isGroup || false;
      
      // Load messages for the selected chat
      messaging.loadMessages(selectedChatId, isGroup);
      
      // Join group room if it's a group chat
      if (isGroup) {
        messaging.joinGroup(selectedChatId);
      }
      
      // Mark messages as read
      const unreadMessages = messages.filter(msg => !msg.isOwn && !msg.readBy?.includes(session!._id));
      if (unreadMessages.length > 0) {
        messaging.markMessagesAsRead(unreadMessages.map(msg => msg._id));
      }
    }
  }, [selectedChatId, session?._id]);

  // Handle chat selection
  const handleSelectChat = (chatId: string) => {
    console.log('Chat selected:', chatId);
    console.log('Available chats:', enrichedChats.map(c => ({ id: c._id, name: c.name })));
    setSelectedChatId(chatId);
  };

  // Get selected chat object (from allChats or convert friend to chat format)
  const selectedChat = enrichedChats.find(chat => chat._id === selectedChatId) || 
    (selectedChatId ? (() => {
      const friend = friends.find(friend => friend._id === selectedChatId);
      if (friend) {
        // Convert friend to chat format
        return {
          _id: friend._id,
          name: friend.name,
          avatar: friend.avatar,
          lastMessage: friend.lastMessage,
          timestamp: friend.timestamp,
          unread: 0,
          online: friend.online,
          isPinned: false,
          isGroup: false,
          participants: undefined
        } as Chat;
      }
      return null;
    })() : null);

  // Debug: Log selected chat
  console.log('Selected chat resolved to:', selectedChat);

  // Handle sending messages
  const handleSendMessage = (text: string, chatId: string) => {
    console.log('handleSendMessage called:', { text, chatId });
    
    // Find the chat in allChats to determine if it's a group
    const targetChat = enrichedChats.find(chat => chat._id === chatId);
    let isGroup = false;
    
    if (targetChat) {
      isGroup = targetChat.isGroup || false;
      console.log('Found in allChats:', { name: targetChat.name, isGroup });
    } else {
      // Check if it's a friend (direct message)
      const friend = friends.find(f => f._id === chatId);
      if (friend) {
        isGroup = false; // Friends are never groups
        console.log('Found in friends:', { name: friend.name, isGroup });
      } else {
        console.error('Chat/Friend not found for ID:', chatId);
        return;
      }
    }
    
    console.log('Sending via messaging.sendMessage:', { text, chatId, isGroup });
    
    // Send message via real-time socket
    messaging.sendMessage(text, chatId, isGroup);
  };

  // Handle group creation
  const handleCreateGroup = async (groupData: GroupData) => {
    if (!session?.token) return;
    
    try {
      setLoading(true);
      
      // Extract emails from participants
      const memberEmails = groupData.participants.map(participant => participant.email);
      
      // Create group via API
      const response = await groupsService.createGroup(
        session.token,
        groupData.name || `New Group`, // Ensure name is not undefined
        undefined, // description - GroupData doesn't include description
        memberEmails
      );
      
      if (response && response.data && response.data.group) {
        // Add the new group to local state
        setGroups(prev => [...prev, response.data.group]);
        
        // Log success information
        console.log('Group created successfully:', response.data.group);
        
        // Check if there were any failed member additions
        if (response.data.memberResults && response.data.memberResults.failed && response.data.memberResults.failed.length > 0) {
          console.warn('Some members could not be added:', response.data.memberResults.failed);
        }
      } else {
        console.error('Invalid response format from group creation API');
        setShowError(true);
      }
      
    } catch (error) {
      console.error('Error creating group:', error);
      // Log more detailed error information if available
      if (error instanceof AxiosError && error.response) {
        console.error('Error response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle typing indicators
  const handleStartTyping = (chatId: string) => {
    const selectedChat = enrichedChats.find(chat => chat._id === chatId);
    const isGroup = selectedChat?.isGroup || false;
    messaging.startTyping(chatId, isGroup);
  };

  const handleStopTyping = (chatId: string) => {
    const selectedChat = enrichedChats.find(chat => chat._id === chatId);
    const isGroup = selectedChat?.isGroup || false;
    messaging.stopTyping(chatId, isGroup);
  };

  // Close error snackbar
  const handleCloseError = () => {
    setShowError(false);
    messaging.clearError();
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      {initialLoading ? (
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={initialLoading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      ) : (
        <>
          {/* Chat List */}
          <Box 
            sx={{ 
              width: isMobile && selectedChatId ? '0' : '300px',
              display: isMobile && selectedChatId ? 'none' : 'block',
              transition: 'width 0.3s ease'
            }}
          >
            <ChatList 
              chats={enrichedChats} 
              selectedChatId={selectedChatId} 
              onSelectChat={handleSelectChat}
              friends={friends} 
              onCreateGroup={handleCreateGroup}
            />
          </Box>

          {/* Chat Container */}
          <Box 
            sx={{ 
              flex: 1,
              display: 'flex'
            }}
          >
            <ChatContainer 
              chat={selectedChat} 
              currentUserId={session!._id}
              messages={messages}
              onSendMessage={handleSendMessage}
              onStartTyping={() => selectedChatId && handleStartTyping(selectedChatId)}
              onStopTyping={() => selectedChatId && handleStopTyping(selectedChatId)}
              isTyping={selectedChatId ? messaging.isUserTyping(selectedChatId) : false}
              isOnline={selectedChat && !selectedChat.isGroup ? messaging.isUserOnline(selectedChat._id) : undefined}
            />
          </Box>

          {/* Error Snackbar */}
          <Snackbar
            open={showError}
            autoHideDuration={6000}
            onClose={handleCloseError}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert 
              onClose={handleCloseError} 
              severity="error" 
              sx={{ width: '100%' }}
            >
              {messaging.error}
            </Alert>
          </Snackbar>

          {/* Connection Status Indicator */}
          {!messaging.isConnected && session?.token && (
            <Box
              sx={{
                position: 'fixed',
                top: 16,
                right: 16,
                bgcolor: 'warning.main',
                color: 'warning.contrastText',
                px: 2,
                py: 1,
                borderRadius: 1,
                fontSize: '0.875rem',
                zIndex: 1000
              }}
            >
              Reconnecting...
            </Box>
          )}

          {/* Loading Indicator */}
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        </>
      )}
    </Box>
  );
};

export default Home;