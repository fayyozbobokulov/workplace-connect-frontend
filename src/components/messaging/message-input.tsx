import { useState } from 'react';
import { 
  Box, 
  InputBase, 
  IconButton, 
  Paper,
  Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
//import AttachFileIcon from '@mui/icons-material/AttachFile';
//import MicIcon from '@mui/icons-material/Mic';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import EmojiPicker from 'emoji-picker-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emoji: { emoji: string }) => {
    setMessage((prev) => prev + emoji.emoji);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

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
          <IconButton sx={{ p: '10px' }} onClick={toggleEmojiPicker}>
            <InsertEmoticonIcon />
          </IconButton>
        </Tooltip>
        {showEmojiPicker && (
          <Box sx={{ position: 'absolute', bottom: '60px', zIndex: 1000 }}>
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </Box>
        )}
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Type message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
        />
        
        {/*<Tooltip title="Attach file">
          <IconButton sx={{ p: '10px' }}>
            <AttachFileIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Voice message">
          <IconButton sx={{ p: '10px' }}>
            <MicIcon />
          </IconButton>
        </Tooltip>*/}
        
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
