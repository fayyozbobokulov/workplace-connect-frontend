import { 
  ListItem, 
  ListItemButton, 
  ListItemAvatar, 
  ListItemText 
} from '@mui/material';
import OnlineStatusBadge from './online-status-bar';
import type { Friend } from '../chat-list';

interface FriendItemProps {
  friend: Friend;
  onSelect: (friendId: string) => void;
}

const FriendItem = ({ friend, onSelect }: FriendItemProps) => {
  return (
    <ListItem 
      disablePadding
      sx={{
        '&:hover': { bgcolor: '#f0f7ff' }
      }}
    >
      <ListItemButton
        onClick={() => onSelect(friend._id)}
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
            name={friend.name} 
            avatar={friend.avatar} 
            online={friend.online} 
          />
        </ListItemAvatar>
        <ListItemText 
          primary={friend.name}
          sx={{ margin: 0 }}
        />
      </ListItemButton>
    </ListItem>
  );
};

export default FriendItem;
