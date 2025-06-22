import { useRef, useEffect } from 'react';
import { Box, Typography, Avatar } from '@mui/material';

export interface Message {
  _id: string;
  text: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  timestamp: string;
  isOwn: boolean;
  readBy?: string[];
}

interface MessageWindowProps {
  messages: Message[];
  currentUserId: string;
  isTyping?: boolean;
}

const MessageWindow = ({ messages, currentUserId, isTyping }: MessageWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change or typing indicator appears
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Group messages by sender and time proximity
  const groupedMessages: Message[][] = [];
  let currentGroup: Message[] = [];
  let lastSenderId = '';
  let lastTimestamp = '';

  messages.forEach((message, index) => {
    const currentTimestamp = message.timestamp.split(' ')[0]; // Just compare the time part
    
    // Start a new group if sender changes or time gap is significant
    if (message.sender._id !== lastSenderId || currentTimestamp !== lastTimestamp) {
      if (currentGroup.length > 0) {
        groupedMessages.push([...currentGroup]);
        currentGroup = [];
      }
    }
    
    currentGroup.push(message);
    lastSenderId = message.sender._id;
    lastTimestamp = currentTimestamp;
    
    // Push the last group
    if (index === messages.length - 1 && currentGroup.length > 0) {
      groupedMessages.push([...currentGroup]);
    }
  });

  // Typing indicator component
  const TypingIndicator = () => (
    <Box 
      sx={{ 
        display: 'flex',
        alignItems: 'flex-end',
        alignSelf: 'flex-start',
        maxWidth: '70%',
        mb: 2
      }}
    >
      <Avatar 
        sx={{ width: 32, height: 32, mr: 1, bgcolor: 'grey.400' }}
      />
      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: 2,
          p: 1.5,
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}
      >
        <Typography variant="body2" color="text.secondary">
          typing
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[0, 1, 2].map((dot) => (
            <Box
              key={dot}
              sx={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                bgcolor: 'text.secondary',
                animation: 'typing 1.4s infinite',
                animationDelay: `${dot * 0.2}s`,
                '@keyframes typing': {
                  '0%, 60%, 100%': {
                    transform: 'translateY(0)',
                    opacity: 0.4
                  },
                  '30%': {
                    transform: 'translateY(-10px)',
                    opacity: 1
                  }
                }
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box 
      sx={{ 
        flex: 1, 
        p: 2, 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        bgcolor: '#f5f7fb'
      }}
    >
      {groupedMessages.map((group, groupIndex) => {
        const isOwn = group[0].sender._id === currentUserId;
        
        return (
          <Box 
            key={`group-${groupIndex}`}
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: isOwn ? 'flex-end' : 'flex-start',
              alignSelf: isOwn ? 'flex-end' : 'flex-start',
              maxWidth: '70%'
            }}
          >
            <Box sx={{ display: 'flex', mb: 1, alignItems: 'flex-end' }}>
              {!isOwn && (
                <Avatar 
                  src={group[0].sender.profilePicture} 
                  alt={`${group[0].sender.firstName} ${group[0].sender.lastName}`}
                  sx={{ width: 32, height: 32, mr: 1 }}
                />
              )}
              
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  {!isOwn && (
                    <Typography variant="subtitle2" sx={{ mr: 1 }}>
                      {`${group[0].sender.firstName} ${group[0].sender.lastName}`}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {group[0].timestamp}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                  {group.map((message) => (
                    <Box
                      key={message._id}
                      sx={{
                        bgcolor: isOwn ? '#1976d2' : '#fff',
                        color: isOwn ? '#fff' : 'inherit',
                        borderRadius: 2,
                        p: 1.5,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        maxWidth: '100%',
                        width: 'fit-content',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                      }}
                    >
                      <Typography variant="body1">{message.text}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
              
              {isOwn && (
                <Avatar 
                  src={group[0].sender.profilePicture} 
                  alt={`${group[0].sender.firstName} ${group[0].sender.lastName}`}
                  sx={{ width: 32, height: 32, ml: 1 }}
                />
              )}
            </Box>
          </Box>
        );
      })}
      
      {/* Typing Indicator */}
      {isTyping && <TypingIndicator />}
      
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default MessageWindow;
