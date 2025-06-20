import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Drawer, 
  Button, 
  List, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  IconButton, 
  ListItemButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../components/auth/auth.provider';
import FilePicker from '../common/FilePicker';
import UploadedPicturePreview from '../common/UploadedPicturePreview';

const ChatHeader = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { signOut, session } = useAuth();

  const user = session;

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSignOut = () => {
    signOut();
    setDrawerOpen(false);
  };

  const handleFileSelect = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
  };

  const handleDeleteImage = () => {
    if (profileImage) {
      URL.revokeObjectURL(profileImage);
      setProfileImage(null);
    }
  };

  return (
    <>
      <Box 
        sx={{ 
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: '#f5f7fb'
          }
        }}
        onClick={toggleDrawer}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MenuIcon sx={{ color: 'text.secondary', fontSize: '24px' }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              fontSize: '1.25rem',
              background: 'linear-gradient(90deg, #1976d2 0%, #21CBF3 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Workplace Connect
          </Typography>
        </Box>
        
      </Box>

      {/* Settings Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        slotProps={{
          paper: {
            sx: {
              width: '100%', // Same width as the chat list
              maxWidth: '320px',
              borderRight: '1px solid #eaeaea',
              p: 0
            }
          }
        }}
        ModalProps={{
          keepMounted: true // Better performance on mobile
        }}
      >
        {/* Drawer Header */}
        <Box sx={{ 
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Settings
          </Typography>
          <IconButton onClick={toggleDrawer} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* User Profile Section */}
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilePicker onFileSelect={handleFileSelect}>
              <UploadedPicturePreview 
                imageUrl={profileImage || undefined} 
                alt="Profile picture"
                fallbackText={user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
              />
            </FilePicker>
            {profileImage && (
              <IconButton
                onClick={handleDeleteImage}
                size="small"
                sx={{
                  backgroundColor: 'error.main',
                  color: 'white',
                  width: 28,
                  height: 28,
                  '&:hover': {
                    backgroundColor: 'error.dark',
                  },
                  ml: 1
                }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {user ? `${user.firstName} ${user.lastName}` : 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email || 'user@example.com'}
          </Typography>
        </Box>

        <Divider />

        {/* Settings Menu */}
        <List sx={{ p: 0 }}>
          <ListItemButton sx={{ py: 1.5 }}>
            <ListItemIcon>
              <AccountCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
          <ListItemButton sx={{ py: 1.5 }}>
            <ListItemIcon>
              <NotificationsIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Notifications" />
          </ListItemButton>
          <ListItemButton sx={{ py: 1.5 }}>
            <ListItemIcon>
              <SecurityIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Privacy & Security" />
          </ListItemButton>
          <ListItemButton sx={{ py: 1.5 }}>
            <ListItemIcon>
              <HelpIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Help & Support" />
          </ListItemButton>
        </List>

        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #f0f0f0' }}>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={handleSignOut}
            sx={{ 
              justifyContent: 'flex-start',
              py: 1.5,
              color: 'text.secondary'
            }}
          >
            Sign Out
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default ChatHeader;
