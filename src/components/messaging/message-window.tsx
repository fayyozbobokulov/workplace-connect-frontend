import { useRef, useEffect } from 'react';
import { Box, Typography, Avatar } from '@mui/material';

export interface Message {
  id: string;
  text: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: string;
  isOwn: boolean;
}

interface MessageWindowProps {
  messages: Message[];
  currentUserId: string;
}

const MessageWindow = ({ messages, currentUserId }: MessageWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Group messages by sender and time proximity
  const groupedMessages: Message[][] = [];
  let currentGroup: Message[] = [];
  let lastSenderId = '';
  let lastTimestamp = '';

  messages.forEach((message, index) => {
    const currentTimestamp = message.timestamp.split(' ')[0]; // Just compare the time part
    
    // Start a new group if sender changes or time gap is significant
    if (message.sender.id !== lastSenderId || currentTimestamp !== lastTimestamp) {
      if (currentGroup.length > 0) {
        groupedMessages.push([...currentGroup]);
        currentGroup = [];
      }
    }
    
    currentGroup.push(message);
    lastSenderId = message.sender.id;
    lastTimestamp = currentTimestamp;
    
    // Push the last group
    if (index === messages.length - 1 && currentGroup.length > 0) {
      groupedMessages.push([...currentGroup]);
    }
  });

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
        const isOwn = group[0].sender.id === currentUserId;
        
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
                  src={group[0].sender.avatar} 
                  alt={group[0].sender.name}
                  sx={{ width: 32, height: 32, mr: 1 }}
                />
              )}
              
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  {!isOwn && (
                    <Typography variant="subtitle2" sx={{ mr: 1 }}>
                      {group[0].sender.name}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {group[0].timestamp}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {group.map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        bgcolor: isOwn ? '#1976d2' : '#fff',
                        color: isOwn ? '#fff' : 'inherit',
                        borderRadius: 2,
                        p: 1.5,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      }}
                    >
                      <Typography variant="body1">{message.text}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
              
              {isOwn && (
                <Avatar 
                  src={group[0].sender.avatar} 
                  alt={group[0].sender.name}
                  sx={{ width: 32, height: 32, ml: 1 }}
                />
              )}
            </Box>
          </Box>
        );
      })}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default MessageWindow;
