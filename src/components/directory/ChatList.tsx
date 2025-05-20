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
  Divider,
  styled,
  ListItem,
  Button
} from '@mui/material';
import ChatHeader from './ChatHeader';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PushPinIcon from '@mui/icons-material/PushPin';
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

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter(chat => chat.isPinned);
  const regularChats = filteredChats.filter(chat => !chat.isPinned);

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
        {/* Pinned Chats Header */}
        {pinnedChats.length > 0 && (
          <Box sx={{ 
            px: 2, 
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <PushPinIcon sx={{ fontSize: '16px', color: 'text.secondary' }} />
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
              PINNED CHATS
            </Typography>
          </Box>
        )}
        
        {/* All Messages Header (only shown if there are pinned chats) */}
        {pinnedChats.length > 0 && regularChats.length > 0 && (
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
        )}
        
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
          {/* Pinned Chats */}
          {pinnedChats.map((chat) => (
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
                  width: '100%'
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
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ml: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {chat.timestamp}
                  </Typography>
                  {chat.unread && (
                    <Badge 
                      badgeContent={chat.unread} 
                      color="primary" 
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
          
          {/* Divider between pinned and regular chats */}
          {pinnedChats.length > 0 && regularChats.length > 0 && <Divider />}
          
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
                  width: '100%'
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
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ml: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {chat.timestamp}
                  </Typography>
                  {chat.unread && (
                    <Badge 
                      badgeContent={chat.unread} 
                      color="primary" 
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default ChatList;
