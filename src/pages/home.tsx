import { useState, useEffect } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useAuth } from '../components/auth/auth.provider';
import ChatList, { type Chat,type Friend } from '../components/directory/chat-list';
import { type GroupData } from '../components/directory/create-group.dialog';
import ChatContainer from '../components/messaging/chat-container';
import type { Message } from '../components/messaging/message-window';

// Mock data for chats
const mockChats: Chat[] = [
  {
    _id: '1',
    name: 'Liam Anderson',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    lastMessage: 'typing...',
    timestamp: '04:50 PM',
    online: false,
    isPinned: true
  },
  {
    _id: '2',
    name: 'Lucas Williams',
    avatar: 'https://randomuser.me/api/portraits/men/68.jpg',
    lastMessage: 'Hey, how\'s it going?',
    timestamp: '10:30 AM',
    unread: 2,
    isPinned: true
  },
  {
    _id: '3',
    name: 'Grace Miller',
    avatar: 'https://randomuser.me/api/portraits/women/54.jpg',
    lastMessage: 'Can\'t wait for the weekend!',
    timestamp: '10:25 AM',
    online: true,
    isPinned: true
  },
  {
    _id: '4',
    name: 'Sophia Chen',
    avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
    lastMessage: 'Remember that concert last year?',
    timestamp: '07:23 PM',
    online: false
  },
  {
    _id: '5',
    name: 'Benjamin Knight',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    lastMessage: 'Just got back from a hiking trip!',
    timestamp: '08:45 PM',
    unread: 1,
    online: false
  },
  {
    _id: '6',
    name: 'Olivia Foster',
    avatar: 'https://randomuser.me/api/portraits/women/85.jpg',
    lastMessage: 'Excited for the upcoming vacation!',
    timestamp: 'Yesterday',
    online: false
  },
  {
    _id: '7',
    name: 'Jackson Adams',
    avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
    lastMessage: 'Looking forward to the weekend!',
    timestamp: 'Yesterday',
    online: false
  },
  {
    _id: '8',
    name: 'Ethan Sullivan',
    avatar: 'https://randomuser.me/api/portraits/men/91.jpg',
    lastMessage: 'Finished reading a captivating novel.',
    timestamp: 'Yesterday',
    online: false
  },
  {
    _id: '9',
    name: 'Ethan Sullivan',
    avatar: 'https://randomuser.me/api/portraits/men/91.jpg',
    lastMessage: 'Finished reading a captivating novel.',
    timestamp: 'Yesterday',
    online: false
  },
  // Group chats
  {
    _id: 'group1',
    name: 'Project Team',
    lastMessage: 'Sarah: Let\'s schedule a meeting for tomorrow',
    timestamp: '02:30 PM',
    unread: 3,
    isGroup: true,
    participants: [
      {
        _id: 'user1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        profilePicture: 'https://randomuser.me/api/portraits/women/20.jpg'
      },
      {
        _id: 'user2',
        firstName: 'Mike',
        lastName: 'Chen',
        profilePicture: 'https://randomuser.me/api/portraits/men/25.jpg'
      },
      {
        _id: 'user3',
        firstName: 'Emily',
        lastName: 'Davis',
        profilePicture: 'https://randomuser.me/api/portraits/women/30.jpg'
      }
    ]
  },
  {
    _id: 'group2',
    name: 'Family Chat',
    lastMessage: 'Mom: Don\'t forget dinner on Sunday!',
    timestamp: '11:45 AM',
    unread: 1,
    isGroup: true,
    participants: [
      {
        _id: 'mom',
        firstName: 'Linda',
        lastName: 'Smith',
        profilePicture: 'https://randomuser.me/api/portraits/women/55.jpg'
      },
      {
        _id: 'dad',
        firstName: 'Robert',
        lastName: 'Smith',
        profilePicture: 'https://randomuser.me/api/portraits/men/60.jpg'
      }
    ]
  },
  {
    _id: 'group3',
    name: 'Weekend Squad',
    lastMessage: 'Alex: Beach volleyball this Saturday?',
    timestamp: 'Yesterday',
    isGroup: true,
    participants: [
      {
        _id: 'alex',
        firstName: 'Alex',
        lastName: 'Thompson',
        profilePicture: 'https://randomuser.me/api/portraits/men/35.jpg'
      },
      {
        _id: 'jessica',
        firstName: 'Jessica',
        lastName: 'Wilson',
        profilePicture: 'https://randomuser.me/api/portraits/women/40.jpg'
      },
      {
        _id: 'david',
        firstName: 'David',
        lastName: 'Brown',
        profilePicture: 'https://randomuser.me/api/portraits/men/50.jpg'
      },
      {
        _id: 'lisa',
        firstName: 'Lisa',
        lastName: 'Garcia',
        profilePicture: 'https://randomuser.me/api/portraits/women/45.jpg'
      }
    ]
  }
];
// Mock data for friends
const mockFriends: Friend[] = [
  {
    _id: '10',
    name: 'Emma Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    lastMessage:'',
    timestamp: '',
    online: true
  },
  {
    _id: '11',
    name: 'Noah Brown',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    lastMessage:'',
    timestamp: '',
    online: false
  },
  {
    _id: '12',
    name: 'Ava Davis',
    avatar: 'https://randomuser.me/api/portraits/women/46.jpg',
    lastMessage:'',
    timestamp: '',
    online: true
  },
  {
    _id: '13',
    name: 'William Garcia',
    avatar: 'https://randomuser.me/api/portraits/men/47.jpg',
    lastMessage:'',
    timestamp: '',
    online: false
  },
  {
    _id: '14',
    name: 'Sophia Martinez',
    avatar: 'https://randomuser.me/api/portraits/women/48.jpg',
    lastMessage:'',
    timestamp: '',
    online: true
  },
  {
    _id: '15',
    name: 'James Rodriguez',
    avatar: 'https://randomuser.me/api/portraits/men/49.jpg',
    lastMessage:'',
    timestamp: '',
    online: false
  }
];
// Mock conversation with Grace Miller
const mockConversation: Record<string, Message[]> = {
  '3': [
    {
      _id: 'm1',
      text: 'Hi Jack! I\'m doing well, thanks. Can\'t wait for the weekend!',
      sender: {
        _id: '3',
        firstName: 'Grace',
        lastName: 'Miller',
        profilePicture: 'https://randomuser.me/api/portraits/women/54.jpg'
      },
      timestamp: '10:30 AM',
      isOwn: false
    },
    {
      _id: 'm2',
      text: 'Hey Grace, how\'s it going?',
      sender: {
        _id: '685550fdde379d8a82fd8418',
        firstName: 'Jack',
        lastName: 'Raymonds',
        profilePicture: 'http://localhost:5001/files/192fce39-74ae-4670-ac23-befffe689a1e.png'
      },
      timestamp: '10:30 AM',
      isOwn: true
    },
    {
      _id: 'm3',
      text: 'I know, right? Weekend plans are the best. Any exciting plans on your end?',
      sender: {
        _id: '685550fdde379d8a82fd8418',
        firstName: 'Jack',
        lastName: 'Raymonds',
        profilePicture: 'http://localhost:5001/files/192fce39-74ae-4670-ac23-befffe689a1e.png'
      },
      timestamp: '10:30 AM',
      isOwn: true
    },
    {
      _id: 'm4',
      text: 'Absolutely! I\'m thinking of going for a hike on Saturday. How about you?',
      sender: {
        _id: '3',
        firstName: 'Grace',
        lastName: 'Miller',
        profilePicture: 'https://randomuser.me/api/portraits/women/54.jpg'
      },
      timestamp: '10:30 AM',
      isOwn: false
    },
    {
      _id: 'm5',
      text: 'Hiking sounds amazing! I might catch up on some reading and also meet up with a few friends on Sunday.',
      sender: {
        _id: '685550fdde379d8a82fd8418',
        firstName: 'Jack',
        lastName: 'Raymonds',
        profilePicture: 'http://localhost:5001/files/192fce39-74ae-4670-ac23-befffe689a1e.png'
      },
      timestamp: '10:30 AM',
      isOwn: true
    },
    {
      _id: 'm6',
      text: 'That sounds like a great plan! Excited 😊',
      sender: {
        _id: '3',
        firstName: 'Grace',
        lastName: 'Miller',
        profilePicture: 'https://randomuser.me/api/portraits/women/54.jpg'
      },
      timestamp: '10:30 AM',
      isOwn: false
    },
    {
      _id: 'm7',
      text: 'Can\'t wait for the weekend!',
      sender: {
        _id: '685550fdde379d8a82fd8418',
        firstName: 'Jack',
        lastName: 'Raymonds',
        profilePicture: 'http://localhost:5001/files/192fce39-74ae-4670-ac23-befffe689a1e.png'
      },
      timestamp: '10:30 AM',
      isOwn: true
    }
  ],
  '2': [
    {
      _id: 'l1',
      text: 'Hey, how\'s it going?',
      sender: {
        _id: '2',
        firstName: 'Lucas',
        lastName: 'Williams',
        profilePicture: 'https://randomuser.me/api/portraits/men/68.jpg'
      },
      timestamp: '10:30 AM',
      isOwn: false
    }
  ],
  // Group conversation examples
  'group1': [
    {
      _id: 'gm1',
      text: 'Hey everyone! How\'s the project coming along?',
      sender: {
        _id: 'user1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        profilePicture: 'https://randomuser.me/api/portraits/women/20.jpg'
      },
      timestamp: '01:15 PM',
      isOwn: false
    },
    {
      _id: 'gm2',
      text: 'Making good progress on the frontend!',
      sender: {
        _id: 'user2',
        firstName: 'Mike',
        lastName: 'Chen',
        profilePicture: 'https://randomuser.me/api/portraits/men/25.jpg'
      },
      timestamp: '01:20 PM',
      isOwn: false
    },
    {
      _id: 'gm3',
      text: 'Great! I\'ve finished the API documentation.',
      sender: {
        _id: '685550fdde379d8a82fd8418',
        firstName: 'Jack',
        lastName: 'Raymonds',
        profilePicture: 'http://localhost:5001/files/192fce39-74ae-4670-ac23-befffe689a1e.png'
      },
      timestamp: '01:25 PM',
      isOwn: true
    },
    {
      _id: 'gm4',
      text: 'Let\'s schedule a meeting for tomorrow to review everything',
      sender: {
        _id: 'user1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        profilePicture: 'https://randomuser.me/api/portraits/women/20.jpg'
      },
      timestamp: '02:30 PM',
      isOwn: false
    }
  ],
  'group2': [
    {
      _id: 'fm1',
      text: 'Hi everyone! Hope you\'re all doing well 😊',
      sender: {
        _id: 'mom',
        firstName: 'Linda',
        lastName: 'Smith',
        profilePicture: 'https://randomuser.me/api/portraits/women/55.jpg'
      },
      timestamp: '09:00 AM',
      isOwn: false
    },
    {
      _id: 'fm2',
      text: 'Morning Mom! All good here.',
      sender: {
        _id: '685550fdde379d8a82fd8418',
        firstName: 'Jack',
        lastName: 'Raymonds',
        profilePicture: 'http://localhost:5001/files/192fce39-74ae-4670-ac23-befffe689a1e.png'
      },
      timestamp: '09:30 AM',
      isOwn: true
    },
    {
      _id: 'fm3',
      text: 'Don\'t forget dinner on Sunday! 🍽️',
      sender: {
        _id: 'mom',
        firstName: 'Linda',
        lastName: 'Smith',
        profilePicture: 'https://randomuser.me/api/portraits/women/55.jpg'
      },
      timestamp: '11:45 AM',
      isOwn: false
    }
  ]
};

const Home = () => {
  const { session } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [friends, setFriends] = useState<Friend[]>([]);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Load messages when selected chat changes
  useEffect(() => {
    if (selectedChatId && mockConversation[selectedChatId]) {
      setMessages(mockConversation[selectedChatId]);
      
      // Mark messages as read
      setChats(prevChats => 
        prevChats.map(chat => 
          chat._id === selectedChatId ? { ...chat, unread: undefined } : chat
        )
      );
    } else {
      setMessages([]);
    }
  }, [selectedChatId]);

  useEffect(() => {
    // Fetch friends from API
    //fetchFriends().then((data) => setFriends(data));
    setFriends(mockFriends);
  }, []);

  const handleSelectChat = (chatId: string) => {
    console.log('Selected Chat ID:',chatId)
    setSelectedChatId(chatId);
  };

  const selectedChat = chats.find(chat => chat._id === selectedChatId)||friends.find(friend=> friend._id === selectedChatId) || null;
  const handleSendMessage = (chatId: string, text: string) => {
    const newMessage: Message = {
      _id: `m${Date.now()}`,
      text,
      sender: {
        _id: session!._id,
        firstName: session!.firstName,
        lastName: session!.lastName,
        profilePicture: session!.profilePicture
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };
  
    // Update messages state
    setMessages(prevMessages => [...prevMessages, newMessage]);
  
    // Check if the chat already exists in the chat list
    const chatExists = chats.some(chat => chat._id === chatId);
  
    if (chatExists) {
      // Update existing chat with the new message
      setChats(prevChats => 
        prevChats.map(chat => 
          chat._id === chatId 
            ? { ...chat, lastMessage: text, timestamp: newMessage.timestamp }
            : chat
        )
      );
    } else {
      // Add a new chat for the friend
      const friend = friends.find(friend => friend._id === chatId);
      if (friend) {
        const newChat: Chat = {
          _id: friend._id,
          name: friend.name,
          avatar: friend.avatar,
          lastMessage: text,
          timestamp: newMessage.timestamp,
          online: friend.online
        };
        setChats(prevChats => [newChat, ...prevChats]); // Add the new chat to the top of the list
      }
    }
  
    // Add to mock conversation for persistence during the session
    if (mockConversation[chatId]) {
      mockConversation[chatId].push(newMessage);
    } else {
      mockConversation[chatId] = [newMessage];
    }
  };

  const handleCreateGroup = (groupData: GroupData) => {
    // Generate unique group ID
    const groupId = `group-${Date.now()}`;
    
    // Create new group chat
    const newGroupChat: Chat = {
      _id: groupId,
      name: groupData.name,
      lastMessage: 'Group created',
      timestamp: new Date().toISOString(),
      isGroup: true,
      participants: groupData.participants,
      unread: 0
    };

    // Add group to chats list
    setChats(prevChats => [newGroupChat, ...prevChats]);
    
    // Initialize empty conversation for the group
    mockConversation[groupId] = [];
    
    // Auto-select the new group
    setSelectedChatId(groupId);
  };

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
          friends={friends} 
          onCreateGroup={handleCreateGroup}
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
          currentUserId={session!._id}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </Box>
    </Box>
  );
};

export default Home;