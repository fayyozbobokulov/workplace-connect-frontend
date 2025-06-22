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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
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

  const handleDialogOpen = (content: 'profile' | 'notifications' | 'privacy') => {
    setDialogContent(content);
    setDialogOpen(true);
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
              <NotificationsIcon color="primary" />
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
          {dialogContent === 'notifications' && <p>Here are your notifications.</p>}
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
