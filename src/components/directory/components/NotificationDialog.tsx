import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Typography,
  IconButton,
  Badge,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import {
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  PersonAdd as PersonAddIcon,
  Send as SendIcon,
  Check as CheckIcon,
  Close as RejectIcon
} from '@mui/icons-material';
import { useNotifications, type FriendRequest, type Notification } from '../hooks/useNotifications';

interface NotificationDialogProps {
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `notification-tab-${index}`,
    'aria-controls': `notification-tabpanel-${index}`,
  };
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const NotificationDialog: React.FC<NotificationDialogProps> = ({ open, onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [receivedFilter, setReceivedFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [sentFilter, setSentFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  
  const {
    receivedFriendRequests,
    sentFriendRequests,
    notifications,
    loading,
    error,
    acceptFriendRequest,
    rejectFriendRequest,
    markNotificationAsRead,
    fetchReceivedFriendRequests,
    fetchSentFriendRequests
  } = useNotifications();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleReceivedFilterChange = (filter: 'all' | 'pending' | 'accepted' | 'rejected') => {
    setReceivedFilter(filter);
    if (filter === 'all') {
      fetchReceivedFriendRequests();
    } else {
      fetchReceivedFriendRequests(filter);
    }
  };

  const handleSentFilterChange = (filter: 'all' | 'pending' | 'accepted' | 'rejected') => {
    setSentFilter(filter);
    if (filter === 'all') {
      fetchSentFriendRequests();
    } else {
      fetchSentFriendRequests(filter);
    }
  };

  const FriendRequestItem: React.FC<{ request: FriendRequest; type?: 'received' | 'sent' }> = ({ request, type = 'received' }) => {
    const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
      switch (status) {
        case 'accepted': return 'success';
        case 'rejected': return 'error';
        case 'pending': return 'warning';
        default: return 'default';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'accepted': return <CheckIcon />;
        case 'rejected': return <RejectIcon />;
        case 'pending': return <PersonAddIcon />;
        default: return <PersonAddIcon />;
      }
    };

    const targetUser = type === 'received' ? request.from : request.to;
    const isActionable = request.status === 'pending' && type === 'received';

    return (
      <ListItem
        sx={{
          flexDirection: 'column',
          alignItems: 'stretch',
          py: 2,
          borderBottom: '1px solid #f0f0f0',
          bgcolor: request.status === 'pending' ? 'action.hover' : 'transparent'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
          <ListItemAvatar>
            <Avatar
              src={targetUser?.profilePicture || ''}
              sx={{ bgcolor: 'primary.main' }}
            >
              {targetUser?.firstName?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {targetUser?.firstName || 'Unknown'} {targetUser?.lastName || 'User'}
              </Typography>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {targetUser?.email || 'No email'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatTimeAgo(request.createdAt)}
                </Typography>
              </Box>
            }
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={getStatusIcon(request.status)}
              label={`${request.status.charAt(0).toUpperCase() + request.status.slice(1)} ${type === 'received' ? 'Request' : 'Sent'}`}
              size="small"
              color={getStatusColor(request.status)}
              variant={request.status === 'pending' ? 'filled' : 'outlined'}
            />
          </Box>
        </Box>
        
        {isActionable && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<CheckIcon />}
              onClick={() => acceptFriendRequest(request._id)}
              sx={{ minWidth: 100 }}
            >
              Accept
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RejectIcon />}
              onClick={() => rejectFriendRequest(request._id)}
              color="error"
              sx={{ minWidth: 100 }}
            >
              Reject
            </Button>
          </Box>
        )}
      </ListItem>
    );
  };

  const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => (
    <ListItem
      sx={{
        flexDirection: 'column',
        alignItems: 'stretch',
        py: 2,
        borderBottom: '1px solid #f0f0f0',
        bgcolor: notification.read ? 'transparent' : 'action.hover',
        cursor: notification.read ? 'default' : 'pointer'
      }}
      onClick={() => !notification.read && markNotificationAsRead(notification._id)}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            <NotificationsIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ fontWeight: notification.read ? 400 : 600 }}
              >
                {notification.title || 'Notification'}
              </Typography>
              {!notification.read && (
                <Badge
                  color="primary"
                  variant="dot"
                  sx={{ '& .MuiBadge-badge': { position: 'static', transform: 'none' } }}
                />
              )}
            </Box>
          }
          secondary={
            <Box>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                {notification.message || 'No message'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTimeAgo(notification.createdAt)}
              </Typography>
            </Box>
          }
        />
        <Chip
          label={notification.type?.replace('_', ' ') || 'notification'}
          size="small"
          color="default"
          variant="outlined"
        />
      </Box>
    </ListItem>
  );

  const receivedRequests = receivedFriendRequests.filter((request: FriendRequest) => {
    if (receivedFilter === 'all') return true;
    if (receivedFilter === 'pending') return request.status === 'pending';
    if (receivedFilter === 'accepted') return request.status === 'accepted';
    if (receivedFilter === 'rejected') return request.status === 'rejected';
    return false;
  });

  const sentRequests = sentFriendRequests.filter((request: FriendRequest) => {
    if (sentFilter === 'all') return true;
    if (sentFilter === 'pending') return request.status === 'pending';
    if (sentFilter === 'accepted') return request.status === 'accepted';
    if (sentFilter === 'rejected') return request.status === 'rejected';
    return false;
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '600px'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          fontWeight: 600
        }}
      >
        Notifications
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="notification tabs">
          <Tab label="Received Friend Requests" {...a11yProps(0)} />
          <Tab label="Sent Friend Requests" {...a11yProps(1)} />
          <Tab label="All Notifications" {...a11yProps(2)} />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 0, height: '100%', overflow: 'hidden' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error" action={
              <Button size="small" onClick={() => {
                fetchReceivedFriendRequests();
                fetchSentFriendRequests();
              }}>
                Retry
              </Button>
            }>
              {error}
            </Alert>
          </Box>
        )}

        {!loading && !error && (
          <>
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                <Typography variant="body1">Received Friend Requests</Typography>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel id="received-filter-label">Filter</InputLabel>
                  <Select
                    labelId="received-filter-label"
                    id="received-filter"
                    value={receivedFilter}
                    label="Filter"
                    onChange={(event) => handleReceivedFilterChange(event.target.value as 'all' | 'pending' | 'accepted' | 'rejected')}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="accepted">Accepted</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <List sx={{ py: 0, maxHeight: '400px', overflow: 'auto' }}>
                {receivedRequests.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <PersonAddIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No received friend requests
                    </Typography>
                  </Box>
                ) : (
                  receivedRequests.map((request: FriendRequest) => (
                    <FriendRequestItem key={request._id} request={request} type="received" />
                  ))
                )}
              </List>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                <Typography variant="body1">Sent Friend Requests</Typography>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel id="sent-filter-label">Filter</InputLabel>
                  <Select
                    labelId="sent-filter-label"
                    id="sent-filter"
                    value={sentFilter}
                    label="Filter"
                    onChange={(event) => handleSentFilterChange(event.target.value as 'all' | 'pending' | 'accepted' | 'rejected')}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="accepted">Accepted</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <List sx={{ py: 0, maxHeight: '400px', overflow: 'auto' }}>
                {sentRequests.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <SendIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No sent friend requests
                    </Typography>
                  </Box>
                ) : (
                  sentRequests.map((request: FriendRequest) => (
                    <FriendRequestItem key={request._id} request={request} type="sent" />
                  ))
                )}
              </List>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <List sx={{ py: 0, maxHeight: '400px', overflow: 'auto' }}>
                {notifications.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No notifications yet
                    </Typography>
                  </Box>
                ) : (
                  notifications.map((notification: Notification) => (
                    <NotificationItem key={notification._id} notification={notification} />
                  ))
                )}
              </List>
            </TabPanel>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDialog;
