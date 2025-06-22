import { useState, useRef, useCallback } from 'react';
import { 
  Box, 
  InputBase, 
  IconButton, 
  Paper,
  Tooltip
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
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);

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
          <IconButton sx={{ p: '10px' }}>
            <InsertEmoticonIcon />
          </IconButton>
        </Tooltip>
        
        <InputBase
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
