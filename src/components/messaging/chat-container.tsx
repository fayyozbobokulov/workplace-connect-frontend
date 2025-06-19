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
}

const ChatContainer = ({ chat, currentUserId, messages, onSendMessage }: ChatContainerProps) => {
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

  return (
    <Box 
      sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        // height: '100%',
        overflow: 'hidden'
      }}
    >
      <ChatHeader 
        name={chat.name} 
        avatar={chat.avatar} 
        status={chat.online ? 'Online' : 'Offline'} 
        online={chat.online}
      />
      <MessageWindow 
        messages={messages} 
        currentUserId={currentUserId}
      />
      <MessageInput onSendMessage={handleSendMessage} />
    </Box>
  );
};

export default ChatContainer;
