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
  ListItemButton,
  CircularProgress
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useAuth } from '../../components/auth/auth.provider';
import FilePicker from '../common/FilePicker';
import UploadedPicturePreview from '../common/UploadedPicturePreview';

// Define base URL for API calls
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ChatHeader = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { signOut, session } = useAuth();

  const user = session;

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSignOut = () => {
    signOut();
    setDrawerOpen(false);
  };

  const handleFileSelect = async (file: File) => {
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('profilePicture', file);

      // Get auth token from session
      const token = session?.token;
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Upload to backend
      const response = await axios.post(`${API_URL}/users/me/profile-picture`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to upload profile picture');
      }

      const result = response.data;
      
      // Update local state with the uploaded image URL from server
      if (result.profilePicture) {
        setProfileImage(result.profilePicture);
        // Also update the session/user context if needed
        // You might want to refresh user data here
      } else {
        // Fallback to local preview if server doesn't return URL
        const imageUrl = URL.createObjectURL(file);
        setProfileImage(imageUrl);
      }

      console.log('Profile picture uploaded successfully:', result);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      // alert(`Failed to upload profile picture: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Still show local preview on error for better UX
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    } finally {
      setIsUploading(false);
    }
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
            <FilePicker onFileSelect={handleFileSelect} disabled={isUploading}>
              {isUploading ? (
                <CircularProgress size={40} />
              ) : (
                <UploadedPicturePreview 
                  imageUrl={profileImage || undefined} 
                  alt="Profile picture"
                  fallbackText={user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                />
              )}
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
