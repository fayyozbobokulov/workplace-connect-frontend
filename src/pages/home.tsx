import { useState, useEffect } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useAuth } from '../components/auth/auth.provider';
import ChatList, { type Chat } from '../components/directory/ChatList';
import ChatContainer from '../components/messaging/ChatContainer';
import type { Message } from '../components/messaging/MessageWindow';

// Mock data for chats
const mockChats: Chat[] = [
  {
    id: '1',
    name: 'Liam Anderson',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    lastMessage: 'typing...',
    timestamp: '04:50 PM',
    online: false,
    isPinned: true
  },
  {
    id: '2',
    name: 'Lucas Williams',
    avatar: 'https://randomuser.me/api/portraits/men/68.jpg',
    lastMessage: 'Hey, how\'s it going?',
    timestamp: '10:30 AM',
    unread: 2,
    isPinned: true
  },
  {
    id: '3',
    name: 'Grace Miller',
    avatar: 'https://randomuser.me/api/portraits/women/54.jpg',
    lastMessage: 'Can\'t wait for the weekend!',
    timestamp: '10:25 AM',
    online: true,
    isPinned: true
  },
  {
    id: '4',
    name: 'Sophia Chen',
    avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
    lastMessage: 'Remember that concert last year?',
    timestamp: '07:23 PM',
    online: false
  },
  {
    id: '5',
    name: 'Benjamin Knight',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    lastMessage: 'Just got back from a hiking trip!',
    timestamp: '08:45 PM',
    unread: 1,
    online: false
  },
  {
    id: '6',
    name: 'Olivia Foster',
    avatar: 'https://randomuser.me/api/portraits/women/85.jpg',
    lastMessage: 'Excited for the upcoming vacation!',
    timestamp: 'Yesterday',
    online: false
  },
  {
    id: '7',
    name: 'Jackson Adams',
    avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
    lastMessage: 'Looking forward to the weekend!',
    timestamp: 'Yesterday',
    online: false
  },
  {
    id: '8',
    name: 'Ethan Sullivan',
    avatar: 'https://randomuser.me/api/portraits/men/91.jpg',
    lastMessage: 'Finished reading a captivating novel.',
    timestamp: 'Yesterday',
    online: false
  },
  {
    id: '9',
    name: 'Ethan Sullivan',
    avatar: 'https://randomuser.me/api/portraits/men/91.jpg',
    lastMessage: 'Finished reading a captivating novel.',
    timestamp: 'Yesterday',
    online: false
  }
];

// Mock conversation with Grace Miller
const mockConversation: Record<string, Message[]> = {
  '3': [
    {
      id: 'm1',
      text: 'Hi Jack! I\'m doing well, thanks. Can\'t wait for the weekend!',
      sender: {
        id: '3',
        name: 'Grace Miller',
        avatar: 'https://randomuser.me/api/portraits/women/54.jpg'
      },
      timestamp: '10:30 AM',
      isOwn: false
    },
    {
      id: 'm2',
      text: 'Hey Grace, how\'s it going?',
      sender: {
        id: 'current-user',
        name: 'Jack Raymonds',
        avatar: 'https://randomuser.me/api/portraits/men/11.jpg'
      },
      timestamp: '10:30 AM',
      isOwn: true
    },
    {
      id: 'm3',
      text: 'I know, right? Weekend plans are the best. Any exciting plans on your end?',
      sender: {
        id: 'current-user',
        name: 'Jack Raymonds',
        avatar: 'https://randomuser.me/api/portraits/men/11.jpg'
      },
      timestamp: '10:30 AM',
      isOwn: true
    },
    {
      id: 'm4',
      text: 'Absolutely! I\'m thinking of going for a hike on Saturday. How about you?',
      sender: {
        id: '3',
        name: 'Grace Miller',
        avatar: 'https://randomuser.me/api/portraits/women/54.jpg'
      },
      timestamp: '10:30 AM',
      isOwn: false
    },
    {
      id: 'm5',
      text: 'Hiking sounds amazing! I might catch up on some reading and also meet up with a few friends on Sunday.',
      sender: {
        id: 'current-user',
        name: 'Jack Raymonds',
        avatar: 'https://randomuser.me/api/portraits/men/11.jpg'
      },
      timestamp: '10:30 AM',
      isOwn: true
    },
    {
      id: 'm6',
      text: 'That sounds like a great plan! Excited 😊',
      sender: {
        id: '3',
        name: 'Grace Miller',
        avatar: 'https://randomuser.me/api/portraits/women/54.jpg'
      },
      timestamp: '10:30 AM',
      isOwn: false
    },
    {
      id: 'm7',
      text: 'Can\'t wait for the weekend!',
      sender: {
        id: 'current-user',
        name: 'Jack Raymonds',
        avatar: 'https://randomuser.me/api/portraits/men/11.jpg'
      },
      timestamp: '10:30 AM',
      isOwn: true
    }
  ],
  '2': [
    {
      id: 'l1',
      text: 'Hey, how\'s it going?',
      sender: {
        id: '2',
        name: 'Lucas Williams',
        avatar: 'https://randomuser.me/api/portraits/men/68.jpg'
      },
      timestamp: '10:30 AM',
      isOwn: false
    }
  ]
};

const Home = () => {
  const { user } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>(mockChats);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Current user mock data
  const currentUser = {
    id: 'current-user',
    name: user?.firstName ? `${user.firstName} ${user.lastName}` : 'Jack Raymonds',
    avatar: 'https://randomuser.me/api/portraits/men/11.jpg'
  };

  // Load messages when selected chat changes
  useEffect(() => {
    if (selectedChatId && mockConversation[selectedChatId]) {
      setMessages(mockConversation[selectedChatId]);
      
      // Mark messages as read
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === selectedChatId ? { ...chat, unread: undefined } : chat
        )
      );
    } else {
      setMessages([]);
    }
  }, [selectedChatId]);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleSendMessage = (chatId: string, text: string) => {
    const newMessage: Message = {
      id: `m${Date.now()}`,
      text,
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };

    // Update messages state
    setMessages(prevMessages => [...prevMessages, newMessage]);

    // Update chat list with new message
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId 
          ? { ...chat, lastMessage: text, timestamp: newMessage.timestamp }
          : chat
      )
    );

    // Add to mock conversation for persistence during the session
    if (mockConversation[chatId]) {
      mockConversation[chatId].push(newMessage);
    } else {
      mockConversation[chatId] = [newMessage];
    }
  };

  const selectedChat = chats.find(chat => chat.id === selectedChatId) || null;

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      {/* Chat List */}
      <Box 
        sx={{ 
          width: isMobile && selectedChatId ? '0' : '300px',
          display: isMobile && selectedChatId ? 'none' : 'block',
          transition: 'width 0.3s ease'
        }}
      >
        <ChatList 
          chats={chats} 
          selectedChatId={selectedChatId} 
          onSelectChat={handleSelectChat} 
        />
      </Box>

      {/* Chat Container */}
      <Box 
        sx={{ 
          flex: 1,
          display: isMobile && !selectedChatId ? 'none' : 'flex'
        }}
      >
        <ChatContainer 
          chat={selectedChat} 
          currentUserId={currentUser.id}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </Box>
    </Box>
  );
};

export default Home;