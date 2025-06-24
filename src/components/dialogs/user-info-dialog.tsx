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
  ListItemIcon,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Circle as CircleIcon
} from '@mui/icons-material';

interface UserInfoDialogProps {
  open: boolean;
  onClose: () => void;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    profilePicture?: string;
    online?: boolean;
    status?: string;
    lastSeen?: string;
  };
}

export const UserInfoDialog: React.FC<UserInfoDialogProps> = ({
  open,
  onClose,
  user
}) => {
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

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
            <PersonIcon color="primary" />
            <Typography variant="h6" component="div">
              User Information
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
          {/* User Profile Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={user.profilePicture}
              alt={fullName}
              sx={{ 
                width: 120, 
                height: 120, 
                mb: 2,
                fontSize: '2rem',
                bgcolor: 'primary.main'
              }}
            >
              {!user.profilePicture && initials}
            </Avatar>
            
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              {fullName}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CircleIcon 
                sx={{ 
                  fontSize: 12, 
                  color: user.online ? '#44b700' : '#ccc' 
                }} 
              />
              <Typography variant="body2" color="text.secondary">
                {user.online ? 'Online' : 'Offline'}
              </Typography>
              {user.online && (
                <Chip 
                  label="Active" 
                  color="success" 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              )}
            </Box>

            {/* {user.status && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                "{user.status}"
              </Typography>
            )} */}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* User Details */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" fontSize="small" />
              Contact Information
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon color="action" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Full Name"
                  secondary={fullName}
                />
              </ListItem>
              
              {user.email && (
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="action" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={user.email}
                  />
                </ListItem>
              )}
              
              <ListItem>
                <ListItemIcon>
                  <ScheduleIcon color="action" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Status"
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircleIcon 
                        sx={{ 
                          fontSize: 8, 
                          color: user.online ? '#44b700' : '#ccc' 
                        }} 
                      />
                      {user.online ? 'Currently online' : `Last seen ${user.lastSeen || 'recently'}`}
                    </Box>
                  }
                />
              </ListItem>
            </List>
          </Box>

          {/* Additional Information */}
          {!user.online && user.lastSeen && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                Last seen: {user.lastSeen}
              </Typography>
            </Box>
          )}
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
