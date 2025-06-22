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

const Home = () => {
  const { session } = useAuth();
  const messaging = useMessagingContext();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
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

  // Convert Group to Chat format
  const convertGroupToChat = (group: Group): Chat => ({
    _id: group._id,
    name: group.name,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name)}&background=random`,
    lastMessage: '',
    timestamp: '',
    unread: 0,
    isPinned: false,
    isGroup: true,
    participants: [] // This would be populated with member details if needed
  });

  // Convert messaging chats to Chat format and combine with groups (but NOT friends)
  const allChats: Chat[] = [
    // Existing messaging chats (from real-time conversations)
    ...messaging.chats.map(chat => ({
      _id: chat._id,
      name: chat.name,
      avatar: chat.avatar,
      lastMessage: chat.lastMessage,
      timestamp: chat.timestamp,
      unread: chat.unread,
      online: chat.isGroup ? undefined : messaging.isUserOnline(chat._id),
      isPinned: false,
      isGroup: chat.isGroup,
      participants: chat.participants
    })),
    // Add groups that don't have active conversations yet
    ...groups
      .filter(group => !messaging.chats.some(chat => chat._id === group._id))
      .map(convertGroupToChat)
    // NOTE: Friends are NOT included here - they will appear in "START NEW CONVERSATION" section
  ];

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
      const selectedChat = allChats.find(chat => chat._id === selectedChatId);
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
    setSelectedChatId(chatId);
  };

  // Get selected chat object
  const selectedChat = allChats.find(chat => chat._id === selectedChatId) || null;

  // Handle sending messages
  const handleSendMessage = (chatId: string, text: string) => {
    const selectedChat = allChats.find(chat => chat._id === chatId);
    const isGroup = selectedChat?.isGroup || false;
    
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
        groupData.name,
        undefined, // description - GroupData doesn't include description
        memberEmails
      );
      
      // Add the new group to local state
      setGroups(prev => [...prev, response.data.group]);
      
      // The group should also appear in messaging.chats automatically
      // through real-time updates when the first message is sent
      
    } catch (error) {
      console.error('Error creating group:', error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle typing indicators
  const handleStartTyping = (chatId: string) => {
    const selectedChat = allChats.find(chat => chat._id === chatId);
    const isGroup = selectedChat?.isGroup || false;
    messaging.startTyping(chatId, isGroup);
  };

  const handleStopTyping = (chatId: string) => {
    const selectedChat = allChats.find(chat => chat._id === chatId);
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
              chats={allChats} 
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
              display: isMobile && !selectedChatId ? 'none' : 'flex'
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