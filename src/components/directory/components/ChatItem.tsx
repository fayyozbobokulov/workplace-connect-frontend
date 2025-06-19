import { 
  ListItem, 
  ListItemButton, 
  ListItemAvatar, 
  ListItemText, 
  Typography, 
  Box, 
  Badge 
} from '@mui/material';
import OnlineStatusBadge from './OnlineStatusBadge';
import type { Chat } from '../chat-list';

interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onSelect: (chatId: string) => void;
}

const ChatItem = ({ chat, isSelected, onSelect }: ChatItemProps) => {
  return (
    <ListItem 
      disablePadding
      sx={{
        bgcolor: isSelected ? '#e3f2fd' : 'transparent',
        '&:hover': { bgcolor: '#f0f7ff' }
      }}
    >
      <ListItemButton
        selected={isSelected}
        onClick={() => onSelect(chat._id)}
        sx={{ 
          px: 2, 
          py: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <ListItemAvatar>
          <OnlineStatusBadge 
            name={chat.name} 
            avatar={chat.avatar} 
            online={chat.online} 
          />
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
  );
};

export default ChatItem;
