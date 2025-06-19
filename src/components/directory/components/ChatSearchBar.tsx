import { Box, InputBase, Button, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

interface ChatSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddFriend: () => void;
  onCreateGroup: () => void;
}

const ChatSearchBar = ({ searchQuery, onSearchChange, onAddFriend, onCreateGroup }: ChatSearchBarProps) => {
  return (
    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        bgcolor: '#f5f7fb', 
        borderRadius: '8px',
        px: 1.5,
        flex: 1,
        height: '40px',
        border: '1px solid #e0e0e0'
      }}>
        <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: '20px' }} />
        <InputBase
          placeholder="Search messages, people"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ 
            flex: 1, 
            fontSize: '0.875rem',
            '& input::placeholder': {
              opacity: 0.8,
              color: 'text.secondary'
            }
          }}
        />
      </Box>
      
      <Tooltip title="Add Friend">
        <Button
          variant="outlined"
          color="primary"
          onClick={onAddFriend}
          sx={{ 
            minWidth: '40px', 
            width: '40px', 
            height: '40px',
            borderRadius: '8px',
            p: 0,
            '& .MuiButton-startIcon': {
              margin: 0
            }
          }}
        >
          <PersonAddIcon />
        </Button>
      </Tooltip>
      
      <Tooltip title="Create Group">
        <Button
          variant="contained"
          color="primary"
          onClick={onCreateGroup}
          sx={{ 
            minWidth: '40px', 
            width: '40px', 
            height: '40px',
            borderRadius: '8px',
            p: 0,
            '& .MuiButton-startIcon': {
              margin: 0
            }
          }}
        >
          <GroupAddIcon />
        </Button>
      </Tooltip>
    </Box>
  );
};

export default ChatSearchBar;
