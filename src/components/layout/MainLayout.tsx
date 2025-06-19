import type { ReactNode } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Avatar, useTheme, useMediaQuery } from '@mui/material';
import { useAuth } from '../auth/auth.provider';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, signOut } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 600,
              background: 'linear-gradient(90deg, #1976d2 0%, #21CBF3 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Workplace Connect
          </Typography>
          
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          
          <IconButton color="inherit">
            <SettingsIcon />
          </IconButton>
          
          <IconButton 
            sx={{ ml: 1 }}
            onClick={() => {
              // Show profile or sign out menu
              if (confirm('Do you want to sign out?')) {
                signOut();
              }
            }}
          >
            <Avatar 
              alt={user?.firstName ? `${user.firstName} ${user.lastName}` : 'User - test'} 
              src="https://randomuser.me/api/portraits/men/11.jpg"
              sx={{ width: 32, height: 32 }}
            />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
