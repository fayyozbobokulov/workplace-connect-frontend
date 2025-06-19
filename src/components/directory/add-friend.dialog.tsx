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
  Avatar,
  Chip
} from '@mui/material';

// Mock user data for autocomplete
const mockUsers = [
  { _id: 'u1', firstName: 'Emma', lastName: 'Thompson', email: 'emma.thompson@example.com', profilePicture: 'https://randomuser.me/api/portraits/women/45.jpg' },
  { _id: 'u2', firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@example.com', profilePicture: 'https://randomuser.me/api/portraits/men/42.jpg' },
  { _id: 'u3', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@example.com', profilePicture: 'https://randomuser.me/api/portraits/women/63.jpg' },
  { _id: 'u4', firstName: 'David', lastName: 'Wilson', email: 'david.wilson@example.com', profilePicture: 'https://randomuser.me/api/portraits/men/57.jpg' },
  { _id: 'u5', firstName: 'Jessica', lastName: 'Brown', email: 'jessica.brown@example.com', profilePicture: 'https://randomuser.me/api/portraits/women/33.jpg' }
];

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
}

// Type for selected item - can be either a User or a custom email entry
type SelectedItem = User | { _id: string; email: string; isCustomEmail: true };

interface AddFriendDialogProps {
  open: boolean;
  onClose: () => void;
  onAddFriend: (selections: SelectedItem[]) => void;
}

const AddFriendDialog = ({ open, onClose, onAddFriend }: AddFriendDialogProps) => {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  // Check if input is a valid email not associated with existing users
  const isNewValidEmail = useMemo(() => {
    if (!inputValue) return false;
    if (!isValidEmail(inputValue)) return false;
    
    // Check if email is already in our selections
    const isAlreadySelected = selectedItems.some(item => 
      'email' in item && item.email.toLowerCase() === inputValue.toLowerCase()
    );
    
    // Check if email matches an existing user
    const matchesExistingUser = mockUsers.some(user => 
      user.email.toLowerCase() === inputValue.toLowerCase()
    );
    
    return !isAlreadySelected && !matchesExistingUser;
  }, [inputValue, selectedItems]);

  // Check if input matches an existing user
  const matchesExistingUser = useMemo(() => {
    return mockUsers.some(user => 
      user.email.toLowerCase() === inputValue.toLowerCase() ||
      `${user.firstName} ${user.lastName}`.toLowerCase() === inputValue.toLowerCase()
    );
  }, [inputValue]);
  
  const handleAddCustomEmail = () => {
    if (isNewValidEmail) {
      const newEmailItem: SelectedItem = {
        _id: `email-${Date.now()}`,
        email: inputValue,
        isCustomEmail: true
      };
      
      setSelectedItems(prev => [...prev, newEmailItem]);
      setInputValue('');
    }
  };
  
  const handleRemoveItem = (_id: string) => {
    setSelectedItems(prev => prev.filter(item => item._id !== _id));
  };
  
  const handleAddFriend = () => {
    if (selectedItems.length > 0) {
      onAddFriend(selectedItems);
      handleClose();
    }
  };
  
  const handleClose = () => {
    setSelectedItems([]);
    setInputValue('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Friends</DialogTitle>
      <DialogContent>
        {/* Selected items displayed as chips */}
        {selectedItems.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, mt: 1 }}>
            {selectedItems.map((item) => {
              const isExistingUser = !('isCustomEmail' in item);
              const email = isExistingUser ? (item as User).email : item.email;
              
              return (
                <Chip
                  key={item._id}
                  label={email}
                  color={isExistingUser ? 'primary' : 'default'}
                  onDelete={() => handleRemoveItem(item._id)}
                  avatar={isExistingUser ? <Avatar src={(item as User).profilePicture} /> : undefined}
                />
              );
            })}
          </Box>
        )}
        
        <Autocomplete
          id="friend-search"
          options={mockUsers.filter(user => 
            // Filter out users that are already selected
            !selectedItems.some(item => !('isCustomEmail' in item) && item._id === user._id)
          )}
          getOptionLabel={(option) => typeof option === 'string' ? option : `${option.firstName} ${option.lastName}`}
          renderOption={(props, option) => {
            // Since we're using the options array which only contains User objects,
            // we know option is a User here, but TypeScript needs the check
            if (typeof option === 'string') return null;
            
            return (
              <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                <Avatar src={option.profilePicture} sx={{ width: 32, height: 32, mr: 2 }} />
                <Box>
                  <Typography variant="body1">{`${option.firstName} ${option.lastName}`}</Typography>
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
                  ? 'This email is already in use or selected'
                  : isValidEmail(inputValue) && isNewValidEmail
                  ? 'Press Enter to add this email'
                  : inputValue && !isValidEmail(inputValue) && !matchesExistingUser
                  ? 'Enter a valid email to send invitation'
                  : ''
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isNewValidEmail) {
                  e.preventDefault();
                  handleAddCustomEmail();
                }
              }}
            />
          )}
          value={null} // Always null since we're managing selections separately
          onChange={(_, newValue) => {
            // Add the selected user to our selections
            if (newValue && typeof newValue === 'object') {
              const user = newValue as User;
              // Check if already selected
              if (!selectedItems.some(item => !('isCustomEmail' in item) && item._id === user._id)) {
                setSelectedItems(prev => [...prev, user]);
              }
              setInputValue('');
            }
          }}
          inputValue={inputValue}
          onInputChange={(_, newInputValue) => {
            setInputValue(newInputValue);
          }}
          freeSolo
        />
        
        {inputValue && !matchesExistingUser && isValidEmail(inputValue) && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            No matching users found. Press Enter to add this email for invitation.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleAddFriend} 
          variant="contained" 
          disabled={selectedItems.length === 0 && !isNewValidEmail}
        >
          {isNewValidEmail ? 'Add & Send Invitations' : selectedItems.length > 0 ? 'Add Friends' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFriendDialog;
