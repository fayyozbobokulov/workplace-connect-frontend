import { useState, useEffect } from 'react';
import axios from 'axios';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Badge
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../components/auth/auth.provider';

const ChatHeader = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { signOut, session } = useAuth();
  const user = session?.user;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<'profile' | 'notifications' | 'privacy'>('profile');
  const [userDetails, setUserDetails] = useState({ firstName: '', lastName: '', email: '' });
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      setUserDetails({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSignOut = () => {
    signOut();
    setDrawerOpen(false);
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        params: { page: 1, limit: 10, isRead: false }
      });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markNotificationsAsRead = async (notificationIds: string[]) => {
    try {
      await axios.put('/api/notifications/read', { notificationIds }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const deleteNotifications = async (notificationIds: string[]) => {
    try {
      await axios.delete('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        data: { notificationIds }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    }
  };

  const handleDialogOpen = (content: 'profile' | 'notifications' | 'privacy') => {
    setDialogContent(content);
    setDialogOpen(true);
    if (content === 'notifications') {
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleUserDetailsChange = (field: string, value: string) => {
    setUserDetails((prev) => ({ ...prev, [field]: value }));
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
        PaperProps={{
          sx: {
            width: '100%', // Same width as the chat list
            maxWidth: '320px',
            borderRight: '1px solid #eaeaea',
            p: 0
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
          <Box 
            sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              bgcolor: 'primary.main', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}
          >
            {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
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
          <ListItemButton sx={{ py: 1.5 }} onClick={() => handleDialogOpen('profile')}>
            <ListItemIcon>
              <AccountCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
          <ListItemButton sx={{ py: 1.5 }} onClick={() => handleDialogOpen('notifications')}>
            <ListItemIcon>
              <Badge 
                badgeContent={unreadCount} 
                color="error" 
                overlap="circular"
              >
                <NotificationsIcon color="primary" />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Notifications" />
          </ListItemButton>
          <ListItemButton sx={{ py: 1.5 }} onClick={() => handleDialogOpen('privacy')}>
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

      {/* Reusable Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>
          {dialogContent === 'profile' && 'Edit Profile'}
          {dialogContent === 'notifications' && 'Notifications'}
          {dialogContent === 'privacy' && 'Privacy & Security'}
        </DialogTitle>
        <DialogContent>
          {dialogContent === 'profile' && (
            <>
              <TextField
                label="First Name"
                value={userDetails.firstName}
                onChange={(e) => handleUserDetailsChange('firstName', e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Last Name"
                value={userDetails.lastName}
                onChange={(e) => handleUserDetailsChange('lastName', e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Email"
                value={userDetails.email}
                onChange={(e) => handleUserDetailsChange('email', e.target.value)}
                fullWidth
                margin="normal"
              />
            </>
          )}
          {dialogContent === 'notifications' && (
            <>
              <Box>
                {notifications.map((notification) => (
                  <Box key={notification.id} sx={{ mb: 2 }}>
                    <Typography variant="body1">{notification.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{notification.message}</Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => markNotificationsAsRead([notification.id])}
                    >
                      Mark as Read
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => deleteNotifications([notification.id])}
                    >
                      Delete
                    </Button>
                  </Box>
                ))}
              </Box>
            </>
          )}
          {dialogContent === 'privacy' && <p>Terms will be changed according to the organization.</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
          {dialogContent === 'profile' && <Button onClick={() => alert('Profile updated!')}>Save</Button>}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChatHeader;
