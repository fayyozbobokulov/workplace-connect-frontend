import { useState, useMemo } from 'react';
import axios from 'axios';
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

// Type for selected item - can be either a User or a custom email entry
type SelectedItem = User | { id: string; email: string; isCustomEmail: true };

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
      user.name.toLowerCase() === inputValue.toLowerCase()
    );
  }, [inputValue]);
  
  const handleAddCustomEmail = () => {
    if (isNewValidEmail) {
      const newEmailItem: SelectedItem = {
        id: `email-${Date.now()}`,
        email: inputValue,
        isCustomEmail: true
      };
      
      setSelectedItems(prev => [...prev, newEmailItem]);
      setInputValue('');
    }
  };
  
  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId));
  };
  
  const handleAddFriend = async () => {
      if (selectedItems.length === 0) return;
  
      // Call the onAddFriend prop with the selected items
      onAddFriend(selectedItems);

    const existingUsers = selectedItems.filter(item => !('isCustomEmail' in item));
   
    let successCount = 0;
    let errorCount = 0;

    for (const user of existingUsers) {
      try {
        await axios.post('/api/friend-requests', { recipientId: user.id }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        });
        successCount++;
      } catch {
        errorCount++;
      }
    }

    if (successCount > 0) {
      // Removed unused assignment to 'message'
    }
    if (errorCount > 0) {
      // Removed unused assignment to 'message'
    }

    handleClose();
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
                  key={item.id}
                  label={email}
                  color={isExistingUser ? 'primary' : 'default'}
                  onDelete={() => handleRemoveItem(item.id)}
                  avatar={isExistingUser ? <Avatar src={(item as User).avatar} /> : undefined}
                />
              );
            })}
          </Box>
        )}
        
        <Autocomplete
          id="friend-search"
          options={mockUsers.filter(user => 
            // Filter out users that are already selected
            !selectedItems.some(item => !('isCustomEmail' in item) && item.id === user.id)
          )}
          getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
          renderOption={(props, option) => {
           
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
              if (!selectedItems.some(item => !('isCustomEmail' in item) && item.id === user.id)) {
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
