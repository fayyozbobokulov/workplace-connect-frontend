import { useState, useMemo, useEffect } from 'react';
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
  Divider,
  CircularProgress
} from '@mui/material';
import { GroupOutlined } from '@mui/icons-material';
import { useAuth } from '../../components/auth/auth.provider';
import usersService, { type User } from '../../services/users.service';



// User interface is now imported from users.service.ts

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
  const { session } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<User[]>([]);
  const [groupName, setGroupName] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch users when dialog opens or search term changes
  useEffect(() => {
    if (!open) return;
    
    const fetchUsers = async () => {
      if (!session?.token) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await usersService.getUsers(session.token, 1, 50, searchTerm);
        setUsers(response.users || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [open, session?.token, searchTerm]);
  
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
    setSearchTerm('');
    setError(null);
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
          options={users.filter(user => 
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
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
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

        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 1, textAlign: 'center' }}>
            {error}
          </Typography>
        )}
        
        {selectedParticipants.length === 0 && !error && (
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
