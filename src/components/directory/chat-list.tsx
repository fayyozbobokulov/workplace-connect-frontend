import { useState } from 'react';
import { Box } from '@mui/material';
import ChatHeader from './chat-header';
import AddFriendDialog from './add-friend.dialog';
import CreateGroupDialog, { type GroupData } from './create-group.dialog';
import ChatSearchBar from './components/chat-search-bar';
import SectionHeader from './components/section-header';
import ScrollableList from './components/scrollable-list';
import ChatItem from './components/chat-item';
import FriendItem from './components/friend-item';
import NotificationSnackbar from './components/notification-snackbar';
import { useFriendActions } from './hooks/user-friend-actions';
import { filterChatsByQuery, sortByLatestMessage } from './utils/chatUtils';

export interface Friend {
  _id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  online?: boolean;
}

// Define chat interface
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

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  friends: Friend[];
  onCreateGroup?: (groupData: GroupData) => void;
}

const ChatList = ({ chats, selectedChatId, onSelectChat, friends, onCreateGroup }: ChatListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  
  const {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    handleAddFriend,
    handleCloseSnackbar
  } = useFriendActions();

  // Filter and sort chats
  const filteredChats = filterChatsByQuery(chats, searchQuery);
  const regularChats = filteredChats
    .filter(chat => !chat.isPinned)
    .sort(sortByLatestMessage);

  // Filter friends without existing chats
  const friendsWithoutChat = (friends || []).filter(
    (friend) => !chats.some((chat) => chat._id === friend._id)
  );

  // Debug logging
  console.log('🔍 Chat filtering debug:', {
    totalFriends: friends?.length || 0,
    totalChats: chats?.length || 0,
    friendsWithoutChat: friendsWithoutChat?.length || 0,
    chatIds: chats?.map(c => c._id) || [],
    friendIds: friends?.map(f => f._id) || [],
    filteredFriendIds: friendsWithoutChat?.map(f => f._id) || []
  });

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenGroupDialog = () => {
    setGroupDialogOpen(true);
  };

  const handleCloseGroupDialog = () => {
    setGroupDialogOpen(false);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#fff',
      width: '100%',
      borderRight: '1px solid #eaeaea',
      overflow: 'hidden'
    }}>
      {/* Header with Logo */}
      <ChatHeader />

      {/* Search Bar */}
      <ChatSearchBar 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onAddFriend={handleOpenDialog}
        onCreateGroup={handleOpenGroupDialog}
      />

      {/* Chat List Section */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* All Messages Section */}
        <SectionHeader title="ALL MESSAGES" showIcon />
        
        <ScrollableList>
          {regularChats.map((chat) => (
            <ChatItem
              key={chat._id}
              chat={chat}
              isSelected={selectedChatId === chat._id}
              onSelect={onSelectChat}
            />
          ))}
        </ScrollableList>

        {/* Start New Conversation Section */}
        <SectionHeader title="START NEW CONVERSATION" />
        
        <ScrollableList>
          {friendsWithoutChat.map((friend) => (
            <FriendItem
              key={friend._id}
              friend={friend}
              onSelect={onSelectChat}
            />
          ))}
        </ScrollableList>
      </Box>
      
      {/* Add Friend Dialog */}
      <AddFriendDialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        onAddFriend={handleAddFriend} 
      />
      
      {/* Create Group Dialog */}
      <CreateGroupDialog 
        open={groupDialogOpen} 
        onClose={handleCloseGroupDialog} 
        onCreateGroup={onCreateGroup}
      />
      
      {/* Notification Snackbar */}
      <NotificationSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleCloseSnackbar}
      />
    </Box>
  );
};

export default ChatList;
