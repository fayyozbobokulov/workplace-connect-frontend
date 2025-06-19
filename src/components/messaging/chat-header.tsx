import { 
  Box, 
  Avatar, 
  Typography, 
  styled,
  Badge
} from '@mui/material';
import GroupAvatar from '../directory/components/GroupAvatar';

interface Participant {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  status: string;
  online?: boolean;
  isGroup?: boolean;
  participants?: Participant[];
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

const ChatHeader = ({ name, avatar, status, online, isGroup, participants }: ChatHeaderProps) => {
  const initials = name.split(' ').map((word) => word.charAt(0)).join('');

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid #e0e0e0',
        bgcolor: '#fff'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {isGroup ? (
          <GroupAvatar participants={participants || []} />
        ) : online ? (
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
          >
            <Avatar 
              alt={name} 
              src={avatar} 
              sx={{ width: 40, height: 40 }}
            >
              {!avatar && initials}
            </Avatar>
          </StyledBadge>
        ) : (
          <Avatar 
            alt={name} 
            src={avatar} 
            sx={{ width: 40, height: 40 }}
          >
            {!avatar && initials}
          </Avatar>
        )}
        <Box sx={{ ml: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {status}
          </Typography>
        </Box>
      </Box>
      <Box>
      </Box>
    </Box>
  );
};

export default ChatHeader;
