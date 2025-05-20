import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Autocomplete,
  Box,
  Typography,
  Avatar
} from '@mui/material';

// Mock user data for autocomplete
const mockUsers = [
  { id: 'u1', name: 'Emma Thompson', email: 'emma.thompson@example.com', avatar: 'https://randomuser.me/api/portraits/women/45.jpg' },
  { id: 'u2', name: 'Michael Chen', email: 'michael.chen@example.com', avatar: 'https://randomuser.me/api/portraits/men/42.jpg' },
  { id: 'u3', name: 'Sarah Johnson', email: 'sarah.johnson@example.com', avatar: 'https://randomuser.me/api/portraits/women/63.jpg' },
  { id: 'u4', name: 'David Wilson', email: 'david.wilson@example.com', avatar: 'https://randomuser.me/api/portraits/men/57.jpg' },
  { id: 'u5', name: 'Jessica Brown', email: 'jessica.brown@example.com', avatar: 'https://randomuser.me/api/portraits/women/33.jpg' }
];

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AddFriendDialogProps {
  open: boolean;
  onClose: () => void;
  onAddFriend: (user: User | null, email?: string) => void;
}

const AddFriendDialog = ({ open, onClose, onAddFriend }: AddFriendDialogProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inputValue, setInputValue] = useState('');
  
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  // Check if input is a valid email not associated with existing users
  const isNewValidEmail = useMemo(() => {
    if (!inputValue) return false;
    if (!isValidEmail(inputValue)) return false;
    return !mockUsers.some(user => user.email.toLowerCase() === inputValue.toLowerCase());
  }, [inputValue]);

  // Check if input matches an existing user
  const matchesExistingUser = useMemo(() => {
    return mockUsers.some(user => 
      user.email.toLowerCase() === inputValue.toLowerCase() ||
      user.name.toLowerCase() === inputValue.toLowerCase()
    );
  }, [inputValue]);
  
  const handleAddFriend = () => {
    if (selectedUser) {
      // Add existing user as friend
      onAddFriend(selectedUser);
      handleClose();
    } else if (isNewValidEmail) {
      // Send invitation to email
      onAddFriend(null, inputValue);
      handleClose();
    }
  };
  
  const handleClose = () => {
    setSelectedUser(null);
    setInputValue('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Friend</DialogTitle>
      <DialogContent>
        <Autocomplete
          id="friend-search"
          options={mockUsers}
          getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
          renderOption={(props, option) => {
            // Since we're using the options array which only contains User objects,
            // we know option is a User here, but TypeScript needs the check
            if (typeof option === 'string') return null;
            
            return (
              <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                <Avatar src={option.avatar} sx={{ width: 32, height: 32, mr: 2 }} />
                <Box>
                  <Typography variant="body1">{option.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{option.email}</Typography>
                </Box>
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search for friends or enter email to invite"
              placeholder="Name or email address"
              fullWidth
              margin="normal"
              variant="outlined"
              error={inputValue !== '' && isValidEmail(inputValue) && !isNewValidEmail}
              helperText={
                inputValue !== '' && isValidEmail(inputValue) && !isNewValidEmail
                  ? 'This email is already associated with an existing user'
                  : isValidEmail(inputValue) && isNewValidEmail
                  ? 'Valid email for invitation'
                  : inputValue && !isValidEmail(inputValue) && !matchesExistingUser
                  ? 'Enter a valid email to send invitation'
                  : ''
              }
            />
          )}
          value={selectedUser}
          onChange={(_, newValue) => {
            // Only set User objects or null as selectedUser
            if (newValue === null || typeof newValue === 'object') {
              setSelectedUser(newValue as User | null);
            }
            // If it's a string, we don't set it as selectedUser
            // It will be handled as an email input instead
          }}
          inputValue={inputValue}
          onInputChange={(_, newInputValue) => {
            setInputValue(newInputValue);
          }}
          freeSolo
        />
        
        {inputValue && !selectedUser && !matchesExistingUser && isValidEmail(inputValue) && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            No matching users found. An invitation will be sent to this email.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleAddFriend} 
          variant="contained" 
          disabled={!selectedUser && !isNewValidEmail}
        >
          {selectedUser ? 'Add Friend' : isNewValidEmail ? 'Send Invitation' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFriendDialog;
