import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Chip,
  Badge
} from '@mui/material';
import {
  Close as CloseIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Circle as CircleIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';

interface Participant {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  online?: boolean;
  role?: 'admin' | 'member';
  lastSeen?: string;
}

interface GroupParticipantsDialogProps {
  open: boolean;
  onClose: () => void;
  groupName: string;
  participants: Participant[];
  groupDescription?: string;
}

export const GroupParticipantsDialog: React.FC<GroupParticipantsDialogProps> = ({
  open,
  onClose,
  groupName,
  participants,
  groupDescription
}) => {
  const onlineCount = participants.filter(p => p.online).length;
  const totalCount = participants.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon color="primary" />
            <Typography variant="h6" component="div">
              Group Information
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ py: 1 }}>
          {/* Group Header */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Avatar
              sx={{ 
                width: 80, 
                height: 80, 
                mb: 2, 
                mx: 'auto',
                bgcolor: 'primary.main',
                fontSize: '2rem'
              }}
            >
              <GroupIcon fontSize="large" />
            </Avatar>
            
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              {groupName}
            </Typography>
            
            {groupDescription && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {groupDescription}
              </Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
              <Chip 
                icon={<PersonIcon />}
                label={`${totalCount} members`} 
                color="primary" 
                variant="outlined"
              />
              <Chip 
                icon={<CircleIcon sx={{ color: '#44b700' }} />}
                label={`${onlineCount} online`} 
                color="success" 
                variant="outlined"
              />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Participants List */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupIcon color="primary" fontSize="small" />
              Participants ({totalCount})
            </Typography>
            
            <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
              {participants.map((participant) => {
                const fullName = `${participant.firstName} ${participant.lastName}`;
                const initials = `${participant.firstName.charAt(0)}${participant.lastName.charAt(0)}`;
                
                return (
                  <ListItem key={participant._id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      {participant.online ? (
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            <CircleIcon sx={{ 
                              fontSize: 12, 
                              color: '#44b700',
                              bgcolor: 'white',
                              borderRadius: '50%'
                            }} />
                          }
                        >
                          <Avatar
                            src={participant.profilePicture}
                            alt={fullName}
                            sx={{ width: 40, height: 40 }}
                          >
                            {!participant.profilePicture && initials}
                          </Avatar>
                        </Badge>
                      ) : (
                        <Avatar
                          src={participant.profilePicture}
                          alt={fullName}
                          sx={{ width: 40, height: 40 }}
                        >
                          {!participant.profilePicture && initials}
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">
                            {fullName}
                          </Typography>
                          {participant.role === 'admin' && (
                            <Chip 
                              icon={<AdminIcon />}
                              label="Admin" 
                              size="small" 
                              color="primary"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CircleIcon 
                            sx={{ 
                              fontSize: 8, 
                              color: participant.online ? '#44b700' : '#ccc' 
                            }} 
                          />
                          <Typography variant="body2" color="text.secondary">
                            {participant.online 
                              ? 'Online' 
                              : `Last seen ${participant.lastSeen || 'recently'}`
                            }
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>

          {/* Group Stats */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              {onlineCount} of {totalCount} members are currently online
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
