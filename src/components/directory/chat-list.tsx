import { useState } from 'react';
import { 
  Box, 
  List, 
  ListItemButton, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  Typography, 
  InputBase, 
  Badge,
  styled,
  ListItem,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import ChatHeader from './chat-header';
import AddFriendDialog from './add-friend.dialog';
import SearchIcon from '@mui/icons-material/Search';

// Import or define the User interface
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

// Define chat interface
export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  online?: boolean;
  isPinned?: boolean;
}

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const ChatList = ({ chats, selectedChatId, onSelectChat }: ChatListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Helper function to convert timestamp to comparable value
  const getTimeValue = (timestamp: string): number => {
    // Handle relative timestamps like 'Yesterday'
    if (timestamp === 'Yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.getTime();
    }
    
    // Handle time formats like '10:30 AM' or '04:50 PM'
    const timeRegex = /(\d+):(\d+)\s*(AM|PM)/i;
    const match = timestamp.match(timeRegex);
    
    if (match) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, hours, minutes, period] = match;
      const date = new Date();
      let hour = parseInt(hours, 10);
      
      // Convert to 24-hour format
      if (period.toUpperCase() === 'PM' && hour < 12) {
        hour += 12;
      } else if (period.toUpperCase() === 'AM' && hour === 12) {
        hour = 0;
      }
      
      date.setHours(hour, parseInt(minutes, 10), 0, 0);
      return date.getTime();
    }
    
    // Default fallback
    return 0;
  };
  
  // Sort function for chats based on timestamp
  const sortByLatestMessage = (a: Chat, b: Chat): number => {
    return getTimeValue(b.timestamp) - getTimeValue(a.timestamp);
  };

  // Filter chats based on search query
  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
    
  const regularChats = filteredChats
    .filter(chat => !chat.isPinned)
    .sort(sortByLatestMessage);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Type for selected item - can be either a User or a custom email entry
  type SelectedItem = User | { id: string; email: string; isCustomEmail: true };

  const handleAddFriend = (selections: SelectedItem[]) => {
    if (selections.length === 0) return;
    
    // Count existing users and custom emails
    const existingUsers = selections.filter(item => !('isCustomEmail' in item));
    const customEmails = selections.filter(item => 'isCustomEmail' in item);
    
    let message = '';
    
    if (existingUsers.length > 0 && customEmails.length > 0) {
      message = `Friend requests sent to ${existingUsers.length} user(s) and invitations sent to ${customEmails.length} email(s)`;
    } else if (existingUsers.length > 0) {
      if (existingUsers.length === 1) {
        const user = existingUsers[0] as User;
        message = `Friend request sent to ${user.name}`;
      } else {
        message = `Friend requests sent to ${existingUsers.length} users`;
      }
    } else if (customEmails.length > 0) {
      if (customEmails.length === 1) {
        message = `Invitation sent to ${customEmails[0].email}`;
      } else {
        message = `Invitations sent to ${customEmails.length} email addresses`;
      }
    }
    
    setSnackbarMessage(message);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#fff',
      width: '100%', // Changed from fixed 320px to 100% to match parent container
      borderRight: '1px solid #eaeaea',
      overflow: 'hidden' // Prevent outer container from scrolling
    }}>
      {/* Header with Logo */}
      <ChatHeader />

      {/* Search Bar */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          bgcolor: '#f5f7fb', 
          borderRadius: '8px',
          px: 1.5,
          flex: 1,
          height: '40px',
          border: '1px solid #e0e0e0'
        }}>
          <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: '20px' }} />
          <InputBase
            placeholder="Search messages, people"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ 
              flex: 1, 
              fontSize: '0.875rem',
              '& input::placeholder': {
                opacity: 0.8,
                color: 'text.secondary'
              }
            }}
          />
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenDialog}
          sx={{ 
            minWidth: '40px', 
            width: '40px', 
            height: '40px',
            borderRadius: '8px',
            p: 0,
            '& .MuiButton-startIcon': {
              margin: 0
            }
          }}
        >
          <AddIcon />
        </Button>
      </Box>

      {/* Chat List Section */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* All Messages Header (only shown if there are pinned chats) */}
        <Box sx={{ 
            px: 2, 
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderTop: '1px solid #f0f0f0',
            mt: 1
          }}>
            <ChatBubbleOutlineIcon sx={{ fontSize: '16px', color: 'text.secondary' }} />
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
              ALL MESSAGES
            </Typography>
          </Box>
        
        {/* Combined List with Scrolling */}
        <List 
          sx={{ 
            flex: 1, 
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0,0,0,0.05)',
            }
          }} 
          disablePadding
        >
          {/* Regular Chats */}
          {regularChats.map((chat) => (
            <ListItem 
              key={chat.id}
              disablePadding
              sx={{
                bgcolor: selectedChatId === chat.id ? '#e3f2fd' : 'transparent',
                '&:hover': { bgcolor: '#f0f7ff' }
              }}
            >
              <ListItemButton
                selected={selectedChatId === chat.id}
                onClick={() => onSelectChat(chat.id)}
                sx={{ 
                  px: 2, 
                  py: 1,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ListItemAvatar>
                  {chat.online ? (
                    <StyledBadge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                    >
                      <Avatar alt={chat.name} src={chat.avatar} />
                    </StyledBadge>
                  ) : (
                    <Avatar alt={chat.name} src={chat.avatar} />
                  )}
                </ListItemAvatar>
                <ListItemText 
                  primary={chat.name}
                  secondary={
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      noWrap
                      sx={{ 
                        fontWeight: chat.unread ? 'bold' : 'normal',
                        color: chat.unread ? 'text.primary' : 'text.secondary'
                      }}
                    >
                      {chat.lastMessage}
                    </Typography>
                  }
                  sx={{ margin: 0 }}
                />
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-end', 
                  justifyContent: 'space-between',
                  height: '100%',
                  ml: 1,
                  minWidth: '60px',
                  py: 0.5
                }}>
                  <Typography variant="caption" color="text.secondary">
                    {chat.timestamp}
                  </Typography>
                  <Box sx={{ minHeight: '20px', display: 'flex', alignItems: 'center' }}>
                    {chat.unread && (
                      <Badge 
                        badgeContent={chat.unread} 
                        color="primary" 
                      />
                    )}
                  </Box>
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      
      {/* Add Friend Dialog */}
      <AddFriendDialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        onAddFriend={handleAddFriend} 
      />
      
      {/* Notification Snackbar */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatList;
