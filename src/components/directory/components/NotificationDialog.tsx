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
    allReceivedRequests,
    allSentRequests,
    notifications,
    loading,
    error,
    acceptFriendRequest,
    rejectFriendRequest,
    markNotificationAsRead,
    fetchReceivedFriendRequests,
    fetchSentFriendRequests,
    refreshNotifications
  } = useNotifications();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleReceivedFilterChange = (filter: 'all' | 'pending' | 'accepted' | 'rejected') => {
    setReceivedFilter(filter);
    // Fetch data based on filter selection
    fetchReceivedFriendRequests(filter);
  };

  const handleSentFilterChange = (filter: 'all' | 'pending' | 'accepted' | 'rejected') => {
    setSentFilter(filter);
    // Fetch data based on filter selection
    fetchSentFriendRequests(filter);
  };

  // Handle accept friend request with loading state
  const handleAcceptRequest = async (requestId: string) => {
    const success = await acceptFriendRequest(requestId);
    if (success) {
      // Refresh data to show updated status
      setTimeout(() => {
        if (receivedFilter === 'all') {
          fetchReceivedFriendRequests('all');
        }
      }, 500);
    }
  };

  // Handle reject friend request with loading state
  const handleRejectRequest = async (requestId: string) => {
    const success = await rejectFriendRequest(requestId);
    if (success) {
      // Refresh data to show updated status
      setTimeout(() => {
        if (receivedFilter === 'all') {
          fetchReceivedFriendRequests('all');
        }
      }, 500);
    }
  };

  // Get filtered requests based on current filter
  const getFilteredReceivedRequests = () => {
    const baseRequests = receivedFilter === 'all' ? allReceivedRequests : receivedFriendRequests;
    
    if (receivedFilter === 'all') {
      return baseRequests; // Already sorted by createdAt in the hook
    }
    
    return baseRequests.filter((request: FriendRequest) => {
      return request.status === receivedFilter;
    });
  };

  const getFilteredSentRequests = () => {
    const baseRequests = sentFilter === 'all' ? allSentRequests : sentFriendRequests;
    
    if (sentFilter === 'all') {
      return baseRequests; // Already sorted by createdAt in the hook
    }
    
    return baseRequests.filter((request: FriendRequest) => {
      return request.status === sentFilter;
    });
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

    // Get the target user based on request type
    const targetUser = type === 'received' ? request.senderDetails : request.recipientDetails;
    const isActionable = request.status === 'pending' && type === 'received';
    const isUpdated = request.updatedAt !== request.createdAt;

    // Generate fallback avatar if no profile picture
    const avatarSrc = targetUser?.profilePicture && targetUser.profilePicture.trim() !== '' 
      ? targetUser.profilePicture 
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser?.firstName || 'U')}+${encodeURIComponent(targetUser?.lastName || '')}&background=1976d2&color=fff&size=40`;

    return (
      <ListItem
        sx={{
          flexDirection: 'column',
          alignItems: 'stretch',
          py: 2,
          borderBottom: '1px solid #f0f0f0',
          bgcolor: request.status === 'pending' ? 'action.hover' : 'transparent',
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
          <ListItemAvatar>
            <Avatar
              src={avatarSrc}
              sx={{ bgcolor: 'primary.main' }}
            >
              {targetUser?.firstName?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {targetUser?.firstName || 'Unknown'} {targetUser?.lastName || 'User'}
                </Typography>
                {isUpdated && request.status !== 'pending' && (
                  <Chip 
                    label="Updated" 
                    size="small" 
                    color="info" 
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: '20px' }}
                  />
                )}
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {targetUser?.email || 'No email'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {type === 'received' ? 'Received' : 'Sent'} {formatTimeAgo(request.createdAt)}
                  {isUpdated && (
                    <>
                      {' • '}
                      {request.status === 'accepted' ? 'Accepted' : 'Updated'} {formatTimeAgo(request.updatedAt)}
                    </>
                  )}
                </Typography>
              </Box>
            }
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={getStatusIcon(request.status)}
              label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
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
              onClick={() => handleAcceptRequest(request._id)}
              disabled={loading}
              sx={{ minWidth: 100 }}
            >
              Accept
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RejectIcon />}
              onClick={() => handleRejectRequest(request._id)}
              color="error"
              disabled={loading}
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

  const receivedRequests = getFilteredReceivedRequests();
  const sentRequests = getFilteredSentRequests();

  // Get counts for each status
  const getReceivedCounts = () => {
    const counts = { all: 0, pending: 0, accepted: 0, rejected: 0 };
    allReceivedRequests.forEach(req => {
      counts.all++;
      if (req.status === 'pending') counts.pending++;
      else if (req.status === 'accepted') counts.accepted++;
      else if (req.status === 'rejected') counts.rejected++;
    });
    return counts;
  };

  const getSentCounts = () => {
    const counts = { all: 0, pending: 0, accepted: 0, rejected: 0 };
    allSentRequests.forEach(req => {
      counts.all++;
      if (req.status === 'pending') counts.pending++;
      else if (req.status === 'accepted') counts.accepted++;
      else if (req.status === 'rejected') counts.rejected++;
    });
    return counts;
  };

  const receivedCounts = getReceivedCounts();
  const sentCounts = getSentCounts();

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          Notifications
          {(receivedCounts.pending > 0 || sentCounts.pending > 0) && (
            <Badge
              badgeContent={receivedCounts.pending + sentCounts.pending}
              color="error"
              sx={{ 
                '& .MuiBadge-badge': { 
                  fontSize: '0.7rem',
                  minWidth: '18px',
                  height: '18px'
                }
              }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            onClick={refreshNotifications}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
          >
            Refresh
          </Button>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="notification tabs">
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Received Requests
                {receivedCounts.pending > 0 && (
                  <Chip 
                    label={receivedCounts.pending} 
                    size="small" 
                    color="error"
                    sx={{ fontSize: '0.7rem', height: '20px', minWidth: '20px' }}
                  />
                )}
              </Box>
            } 
            {...a11yProps(0)} 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Sent Requests
                {sentCounts.pending > 0 && (
                  <Chip 
                    label={sentCounts.pending} 
                    size="small" 
                    color="warning"
                    sx={{ fontSize: '0.7rem', height: '20px', minWidth: '20px' }}
                  />
                )}
              </Box>
            } 
            {...a11yProps(1)} 
          />
          <Tab label="Other Notifications" {...a11yProps(2)} />
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
              <Button size="small" onClick={refreshNotifications}>
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Received Friend Requests ({receivedRequests.length})
                </Typography>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel id="received-filter-label">Filter</InputLabel>
                  <Select
                    labelId="received-filter-label"
                    id="received-filter"
                    value={receivedFilter}
                    label="Filter"
                    onChange={(event) => handleReceivedFilterChange(event.target.value as 'all' | 'pending' | 'accepted' | 'rejected')}
                    size="small"
                  >
                    <MenuItem value="all">All ({receivedCounts.all})</MenuItem>
                    <MenuItem value="pending">Pending ({receivedCounts.pending})</MenuItem>
                    <MenuItem value="accepted">Accepted ({receivedCounts.accepted})</MenuItem>
                    <MenuItem value="rejected">Rejected ({receivedCounts.rejected})</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <List sx={{ py: 0, maxHeight: '400px', overflow: 'auto' }}>
                {receivedRequests.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <PersonAddIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      {receivedFilter === 'all' 
                        ? 'No friend requests received yet' 
                        : `No ${receivedFilter} friend requests`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      When someone sends you a friend request, it will appear here
                    </Typography>
                  </Box>
                ) : (
                  receivedRequests.map((request: FriendRequest) => (
                    <FriendRequestItem key={`received-${request._id}`} request={request} type="received" />
                  ))
                )}
              </List>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Sent Friend Requests ({sentRequests.length})
                </Typography>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel id="sent-filter-label">Filter</InputLabel>
                  <Select
                    labelId="sent-filter-label"
                    id="sent-filter"
                    value={sentFilter}
                    label="Filter"
                    onChange={(event) => handleSentFilterChange(event.target.value as 'all' | 'pending' | 'accepted' | 'rejected')}
                    size="small"
                  >
                    <MenuItem value="all">All ({sentCounts.all})</MenuItem>
                    <MenuItem value="pending">Pending ({sentCounts.pending})</MenuItem>
                    <MenuItem value="accepted">Accepted ({sentCounts.accepted})</MenuItem>
                    <MenuItem value="rejected">Rejected ({sentCounts.rejected})</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <List sx={{ py: 0, maxHeight: '400px', overflow: 'auto' }}>
                {sentRequests.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <SendIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      {sentFilter === 'all' 
                        ? 'No friend requests sent yet' 
                        : `No ${sentFilter} friend requests`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Use the "Add Friend" button to send friend requests
                    </Typography>
                  </Box>
                ) : (
                  sentRequests.map((request: FriendRequest) => (
                    <FriendRequestItem key={`sent-${request._id}`} request={request} type="sent" />
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
                      No other notifications yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      System notifications and messages will appear here
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
