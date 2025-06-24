import { 
  Box, 
  Avatar, 
  Typography, 
  styled,
  Badge,
  ButtonBase
} from '@mui/material';
import { useState } from 'react';
import GroupAvatar from '../directory/components/group-avatar';
import { UserInfoDialog } from '../dialogs/user-info-dialog';
import { GroupParticipantsDialog } from '../dialogs/group-participants-dialog';

interface Participant {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  online?: boolean;
  role?: 'admin' | 'member';
  lastSeen?: string;
}

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  status: string;
  online?: boolean;
  isGroup?: boolean;
  participants?: Participant[];
  userId?: string;
  email?: string;
  groupDescription?: string;
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

const ChatHeader = ({ 
  name, 
  avatar, 
  status, 
  online, 
  isGroup, 
  participants, 
  userId, 
  email,
  groupDescription 
}: ChatHeaderProps) => {
  const [userInfoDialogOpen, setUserInfoDialogOpen] = useState(false);
  const [groupParticipantsDialogOpen, setGroupParticipantsDialogOpen] = useState(false);
  
  const initials = name.split(' ').map((word) => word.charAt(0)).join('');

  const handleHeaderClick = () => {
    if (isGroup) {
      setGroupParticipantsDialogOpen(true);
    } else {
      setUserInfoDialogOpen(true);
    }
  };

  // Create user object for UserInfoDialog
  const userInfo = {
    _id: userId || '',
    firstName: name.split(' ')[0] || '',
    lastName: name.split(' ').slice(1).join(' ') || '',
    email,
    profilePicture: avatar,
    online,
    status,
    lastSeen: online ? undefined : 'recently'
  };

  return (
    <>
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
        <ButtonBase
          onClick={handleHeaderClick}
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            borderRadius: 1,
            p: 0,
            flex: 1,
            justifyContent: 'flex-start',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
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
        </ButtonBase>
        <Box>
        </Box>
      </Box>

      {/* User Info Dialog for Private Chats */}
      {!isGroup && (
        <UserInfoDialog
          open={userInfoDialogOpen}
          onClose={() => setUserInfoDialogOpen(false)}
          user={userInfo}
        />
      )}

      {/* Group Participants Dialog for Group Chats */}
      {isGroup && (
        <GroupParticipantsDialog
          open={groupParticipantsDialogOpen}
          onClose={() => setGroupParticipantsDialogOpen(false)}
          groupName={name}
          participants={participants || []}
          groupDescription={groupDescription}
        />
      )}
    </>
  );
};

export default ChatHeader;
