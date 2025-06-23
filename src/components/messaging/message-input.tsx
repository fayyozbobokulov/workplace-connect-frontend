import { useState, useRef, useCallback } from 'react';
import { 
  Box, 
  InputBase, 
  IconButton, 
  Paper,
  Tooltip,
  Popover,
  Tab,
  Tabs,
  Grid
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onStartTyping?: () => void;
  onStopTyping?: () => void;
}

const MessageInput = ({ onSendMessage, onStartTyping, onStopTyping }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [selectedEmojiTab, setSelectedEmojiTab] = useState(0);
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Emoji categories
  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓'],
    'Gestures': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
    'Activities': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽'],
    'Objects': ['📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⏳', '⌛', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳']
  };

  const emojiTabNames = Object.keys(emojiCategories);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      
      // Stop typing indicator when message is sent
      if (isTypingRef.current && onStopTyping) {
        onStopTyping();
        isTypingRef.current = false;
      }
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicators
    if (value.trim() && onStartTyping && onStopTyping) {
      // Start typing if not already typing
      if (!isTypingRef.current) {
        onStartTyping();
        isTypingRef.current = true;
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        if (isTypingRef.current && onStopTyping) {
          onStopTyping();
          isTypingRef.current = false;
        }
        typingTimeoutRef.current = null;
      }, 1000); // Stop typing after 1 second of inactivity
    } else if (!value.trim() && isTypingRef.current && onStopTyping) {
      // Stop typing immediately if input is empty
      onStopTyping();
      isTypingRef.current = false;
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  }, [onStartTyping, onStopTyping]);

  const handleEmojiClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setEmojiAnchorEl(event.currentTarget);
  };

  const handleEmojiClose = () => {
    setEmojiAnchorEl(null);
  };

  const handleEmojiSelect = (emoji: string) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newMessage = message.slice(0, start) + emoji + message.slice(end);
      setMessage(newMessage);
      
      // Focus back to input and set cursor position after emoji
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setMessage(prev => prev + emoji);
    }
    
    handleEmojiClose();
  };

  const handleEmojiTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedEmojiTab(newValue);
  };

  const isEmojiPopoverOpen = Boolean(emojiAnchorEl);

  return (
    <Box sx={{ p: 2, bgcolor: '#fff', borderTop: '1px solid #e0e0e0' }}>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: '2px 4px',
          borderRadius: '24px',
          border: '1px solid #e0e0e0',
        }}
      >
        <Tooltip title="Add emoji">
          <IconButton 
            sx={{ p: '10px' }}
            onClick={handleEmojiClick}
            color={isEmojiPopoverOpen ? 'primary' : 'default'}
          >
            <InsertEmoticonIcon />
          </IconButton>
        </Tooltip>
        
        <Popover
          open={isEmojiPopoverOpen}
          anchorEl={emojiAnchorEl}
          onClose={handleEmojiClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          PaperProps={{
            sx: {
              width: 320,
              maxHeight: 400,
              p: 1,
            }
          }}
        >
          <Box>
            <Tabs
              value={selectedEmojiTab}
              onChange={handleEmojiTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ minHeight: 36, mb: 1 }}
            >
              {emojiTabNames.map((category) => (
                <Tab
                  key={category}
                  label={category}
                  sx={{ 
                    minHeight: 36, 
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    minWidth: 60
                  }}
                />
              ))}
            </Tabs>
            
            <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
              <Grid container spacing={0.5}>
                {emojiCategories[emojiTabNames[selectedEmojiTab] as keyof typeof emojiCategories].map((emoji, index) => (
                  <Grid key={index}>
                    <IconButton
                      size="small"
                      onClick={() => handleEmojiSelect(emoji)}
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '1.2rem',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          transform: 'scale(1.2)',
                        },
                        transition: 'all 0.1s ease-in-out',
                      }}
                    >
                      {emoji}
                    </IconButton>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </Popover>
        
        <InputBase
          ref={inputRef}
          sx={{ ml: 1, flex: 1 }}
          placeholder="Type message..."
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          multiline
          maxRows={4}
        />
        
        <Tooltip title="Send">
          <IconButton 
            color="primary" 
            sx={{ p: '10px' }}
            onClick={handleSendMessage}
            disabled={!message.trim()}
          >
            <SendIcon />
          </IconButton>
        </Tooltip>
      </Paper>
    </Box>
  );
};

export default MessageInput;
