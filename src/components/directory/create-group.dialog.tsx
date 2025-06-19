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
  Chip,
  Divider
} from '@mui/material';
import { GroupOutlined } from '@mui/icons-material';

// Mock user data for autocomplete
const mockUsers = [
  { _id: 'u1', firstName: 'Emma', lastName: 'Thompson', email: 'emma.thompson@example.com', profilePicture: 'https://randomuser.me/api/portraits/women/45.jpg' },
  { _id: 'u2', firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@example.com', profilePicture: 'https://randomuser.me/api/portraits/men/42.jpg' },
  { _id: 'u3', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@example.com', profilePicture: 'https://randomuser.me/api/portraits/women/63.jpg' },
  { _id: 'u4', firstName: 'David', lastName: 'Wilson', email: 'david.wilson@example.com', profilePicture: 'https://randomuser.me/api/portraits/men/57.jpg' },
  { _id: 'u5', firstName: 'Jessica', lastName: 'Brown', email: 'jessica.brown@example.com', profilePicture: 'https://randomuser.me/api/portraits/women/33.jpg' },
  { _id: 'u6', firstName: 'Alex', lastName: 'Garcia', email: 'alex.garcia@example.com', profilePicture: 'https://randomuser.me/api/portraits/men/28.jpg' },
  { _id: 'u7', firstName: 'Lisa', lastName: 'Martinez', email: 'lisa.martinez@example.com', profilePicture: 'https://randomuser.me/api/portraits/women/52.jpg' },
  { _id: 'u8', firstName: 'Ryan', lastName: 'Taylor', email: 'ryan.taylor@example.com', profilePicture: 'https://randomuser.me/api/portraits/men/35.jpg' }
];

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
}

export interface GroupData {
  name: string;
  participants: User[];
}

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateGroup?: (groupData: GroupData) => void;
}

const CreateGroupDialog = ({ open, onClose, onCreateGroup }: CreateGroupDialogProps) => {
  const [selectedParticipants, setSelectedParticipants] = useState<User[]>([]);
  const [groupName, setGroupName] = useState('');
  const [inputValue, setInputValue] = useState('');
  
  // Generate default group name based on participants
  const defaultGroupName = useMemo(() => {
    if (selectedParticipants.length === 0) return '';
    if (selectedParticipants.length === 1) {
      return `${selectedParticipants[0].firstName} & You`;
    }
    if (selectedParticipants.length === 2) {
      return `${selectedParticipants[0].firstName}, ${selectedParticipants[1].firstName} & You`;
    }
    return `${selectedParticipants[0].firstName}, ${selectedParticipants[1].firstName} & ${selectedParticipants.length - 1} others`;
  }, [selectedParticipants]);

  const handleRemoveParticipant = (userId: string) => {
    setSelectedParticipants(prev => prev.filter(user => user._id !== userId));
  };
  
  const handleCreateGroup = () => {
    if (selectedParticipants.length > 0) {
      const finalGroupName = groupName.trim() || defaultGroupName;
      if (onCreateGroup) {
        onCreateGroup({
          name: finalGroupName,
          participants: selectedParticipants
        });
      }
      handleClose();
    }
  };
  
  const handleClose = () => {
    setSelectedParticipants([]);
    setGroupName('');
    setInputValue('');
    onClose();
  };

  const canCreateGroup = selectedParticipants.length >= 1;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <GroupOutlined color="primary" />
        Create Group Chat
      </DialogTitle>
      <DialogContent>
        {/* Group Name Input */}
        <TextField
          label="Group Name (Optional)"
          placeholder={defaultGroupName || "Enter group name"}
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          helperText={!groupName.trim() && defaultGroupName ? `Default: ${defaultGroupName}` : ''}
        />

        <Divider sx={{ my: 2 }} />

        {/* Selected participants displayed as chips */}
        {selectedParticipants.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Group Members ({selectedParticipants.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedParticipants.map((user) => (
                <Chip
                  key={user._id}
                  label={`${user.firstName} ${user.lastName}`}
                  color="primary"
                  onDelete={() => handleRemoveParticipant(user._id)}
                  avatar={
                    <Avatar 
                      src={user.profilePicture} 
                      sx={{ width: 24, height: 24 }}
                    >
                      {user.firstName[0]}
                    </Avatar>
                  }
                />
              ))}
            </Box>
          </Box>
        )}
        
        {/* User Search */}
        <Autocomplete
          id="user-search"
          options={mockUsers.filter(user => 
            // Filter out users that are already selected
            !selectedParticipants.some(participant => participant._id === user._id)
          )}
          getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
          renderOption={(props, option) => (
            <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
              <Avatar 
                src={option.profilePicture} 
                sx={{ width: 32, height: 32, mr: 2 }}
              >
                {option.firstName[0]}
              </Avatar>
              <Box>
                <Typography variant="body1">{`${option.firstName} ${option.lastName}`}</Typography>
                <Typography variant="body2" color="text.secondary">{option.email}</Typography>
              </Box>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Add people to group"
              placeholder="Search by name or email"
              fullWidth
              margin="normal"
              variant="outlined"
            />
          )}
          value={null} // Always null since we're managing selections separately
          onChange={(_, newValue) => {
            // Add the selected user to our participants
            if (newValue) {
              // Check if already selected
              if (!selectedParticipants.some(participant => participant._id === newValue._id)) {
                setSelectedParticipants(prev => [...prev, newValue]);
              }
              setInputValue('');
            }
          }}
          inputValue={inputValue}
          onInputChange={(_, newInputValue) => {
            setInputValue(newInputValue);
          }}
          noOptionsText="No users found"
        />

        {selectedParticipants.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            Search and add at least one person to create a group chat
          </Typography>
        )}

        {selectedParticipants.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              💡 <strong>Tip:</strong> You can add more people to the group after creating it.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleCreateGroup} 
          variant="contained" 
          disabled={!canCreateGroup}
          startIcon={<GroupOutlined />}
        >
          Create Group ({selectedParticipants.length + 1})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroupDialog;
