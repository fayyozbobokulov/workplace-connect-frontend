import { useState, useEffect } from 'react';
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
  CircularProgress,
  Badge
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
import FilePicker from '../common/file-picker';
import UploadedPicturePreview from '../common/uploaded-picture-preview';
import NotificationDialog from './components/NotificationDialog';
import { useNotifications } from './hooks/useNotifications';

// Define base URL for API calls
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ChatHeader = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionTimestamp, setDeletionTimestamp] = useState<number>(0);
  const [uploadTimestamp, setUploadTimestamp] = useState<number>(0);
  const { signOut, session, updateUser } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(session?.profilePicture ?? null);
  const { unreadCount } = useNotifications();

  const user = session;

  // Sync local profileImage state with session, but don't override deliberate deletions
  useEffect(() => {
    // Only sync if we haven't deliberately deleted the image (deletionTimestamp > 0)
    if (deletionTimestamp === 0) {
      setProfileImage(session?.profilePicture ?? null);
    }
  }, [session?.profilePicture, deletionTimestamp]);

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

      // Check if the request was successful (status 200-299)
      // The backend might return just a message or different structure
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.data?.message || 'Failed to upload profile picture');
      }

      const result = response.data;
      
      // Update local state with the uploaded image URL from server
      if (result.profilePicture) {
        setProfileImage(result.profilePicture);
        setDeletionTimestamp(0); // Reset deletion timestamp so session sync works again
        setUploadTimestamp(Date.now()); // Set upload timestamp to force re-render
        
        // Update session and localStorage with new profile picture
        updateUser({ profilePicture: result.profilePicture });
      } else {
        // If backend doesn't return profilePicture URL, use local preview
        // This happens when backend returns just a success message
        const imageUrl = URL.createObjectURL(file);
        setProfileImage(imageUrl);
        setDeletionTimestamp(0); // Reset deletion timestamp
        setUploadTimestamp(Date.now()); // Set upload timestamp to force re-render
        
        // Update session with a placeholder or empty string for now
        // The actual URL should be fetched or the backend should return it
        updateUser({ profilePicture: imageUrl });
      }

      console.log('Profile picture uploaded successfully:', result);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      // alert(`Failed to upload profile picture: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Still show local preview on error for better UX
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      setDeletionTimestamp(0); // Reset deletion timestamp
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (profileImage) {
      setIsDeleting(true);
      try {
        // Get auth token from session
        const token = session?.token;
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Delete profile picture from backend
        const response = await axios.delete(`${API_URL}/users/me/profile-picture`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        // Check if the request was successful (status 200-299)
        // The backend might return just a message or different structure
        if (response.status < 200 || response.status >= 300) {
          throw new Error(response.data?.message || 'Failed to delete profile picture');
        }

        // Revoke blob URL if it's a local file upload
        if (profileImage.startsWith('blob:')) {
          URL.revokeObjectURL(profileImage);
        }

        // Clear local state immediately to update UI
        setProfileImage(null);
        setDeletionTimestamp(Date.now());
        
        // Update session and localStorage to clear profilePicture
        updateUser({ profilePicture: '' });
        
        console.log('Profile image deleted successfully, state cleared, session updated, timestamp:', Date.now());
        
      } catch (error) {
        console.error('Error deleting profile picture:', error);
        // Optionally show an error message to the user
      } finally {
        setIsDeleting(false);
      }
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
            <FilePicker onFileSelect={handleFileSelect} disabled={isUploading || isDeleting}>
              {isUploading ? (
                <CircularProgress size={40} />
              ) : (
                <UploadedPicturePreview 
                  imageUrl={profileImage ? `${profileImage}?t=${uploadTimestamp}` : undefined} 
                  alt="Profile picture"
                  fallbackText={user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                  key={`profile-${profileImage || 'deleted'}-${deletionTimestamp}-${uploadTimestamp}`}
                />
              )}
            </FilePicker>
            {profileImage && !isUploading && (
              <IconButton
                onClick={handleDeleteImage}
                size="small"
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'error.dark',
                  },
                  ml: 1
                }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <CircularProgress size={16} />
                ) : (
                  <DeleteIcon sx={{ fontSize: 16 }} />
                )}
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
          <ListItemButton sx={{ py: 1.5 }} onClick={() => setNotificationDialogOpen(true)}>
            <ListItemIcon>
              <Badge badgeContent={unreadCount} color="primary">
                <NotificationsIcon />
              </Badge>
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

      <NotificationDialog 
        open={notificationDialogOpen} 
        onClose={() => setNotificationDialogOpen(false)} 
      />
    </>
  );
};

export default ChatHeader;
