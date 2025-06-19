import type { Chat } from '../chat-list';

// Helper function to convert timestamp to comparable value
export const getTimeValue = (timestamp: string): number => {
  // Handle relative timestamps like 'Yesterday'
  if (timestamp === 'Yesterday') {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.getTime();
  }
  
  // Handle time formats like '10:30 AM' or '04:50 PM'
  const timeRegex = /(\d+):(\d+)\s*(AM|PM)/i;
  const match = timestamp.match(timeRegex);
  
  if (match) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, hours, minutes, period] = match;
    const date = new Date();
    let hour = parseInt(hours, 10);
    
    // Convert to 24-hour format
    if (period.toUpperCase() === 'PM' && hour < 12) {
      hour += 12;
    } else if (period.toUpperCase() === 'AM' && hour === 12) {
      hour = 0;
    }
    
    date.setHours(hour, parseInt(minutes, 10), 0, 0);
    return date.getTime();
  }
  
  // Default fallback
  return 0;
};

// Sort function for chats based on timestamp
export const sortByLatestMessage = (a: Chat, b: Chat): number => {
  return getTimeValue(b.timestamp) - getTimeValue(a.timestamp);
};

// Filter chats based on search query
export const filterChatsByQuery = (chats: Chat[], query: string): Chat[] => {
  return chats.filter(chat => 
    chat.name.toLowerCase().includes(query.toLowerCase())
  );
};
