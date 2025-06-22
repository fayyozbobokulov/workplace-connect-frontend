import { Box } from '@mui/material';
import ChatHeader from './chat-header';
import MessageWindow, { type Message } from './message-window';
import MessageInput from './message-input';
import type { Chat } from '../directory/chat-list';

interface ChatContainerProps {
  chat: Chat | null;
  currentUserId: string;
  messages: Message[];
  onSendMessage: (chatId: string, message: string) => void;
  onStartTyping?: () => void;
  onStopTyping?: () => void;
  isTyping?: boolean;
  isOnline?: boolean;
}

const ChatContainer = ({ 
  chat, 
  currentUserId, 
  messages, 
  onSendMessage,
  onStartTyping,
  onStopTyping,
  isTyping,
  isOnline
}: ChatContainerProps) => {
  if (!chat) {
    return (
      <Box 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: '#f5f7fb',
          color: 'text.secondary',
          fontSize: '1.2rem'
        }}
      >
        Select a conversation to start chatting
      </Box>
    );
  }

  const handleSendMessage = (message: string) => {
    onSendMessage(chat._id, message);
  };

  // Determine status text for header
  const getStatusText = () => {
    if (chat.isGroup) {
      return `${(chat.participants?.length || 0) + 1} members`;
    }
    
    if (isTyping) {
      return 'typing...';
    }
    
    if (isOnline !== undefined) {
      return isOnline ? 'Online' : 'Offline';
    }
    
    return chat.online ? 'Online' : 'Offline';
  };

  return (
    <Box 
      sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <ChatHeader 
        name={chat.name} 
        avatar={chat.avatar} 
        status={getStatusText()}
        online={isOnline !== undefined ? isOnline : chat.online}
        isGroup={chat.isGroup}
        participants={chat.participants}
      />
      <MessageWindow 
        messages={messages} 
        currentUserId={currentUserId}
        isTyping={isTyping}
      />
      <MessageInput 
        onSendMessage={handleSendMessage}
        onStartTyping={onStartTyping}
        onStopTyping={onStopTyping}
      />
    </Box>
  );
};

export default ChatContainer;
