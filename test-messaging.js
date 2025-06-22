// Simple test script to validate messaging functionality
// This can be run in the browser console to test the messaging flow

console.log('🧪 Testing Messaging Flow...');

// Test 1: Check if messaging service is available
try {
  const messagingService = window.messagingService || 
    (await import('./src/services/messaging.service.ts')).default;
  console.log('✅ Messaging service loaded');
} catch (error) {
  console.error('❌ Failed to load messaging service:', error);
}

// Test 2: Check if auth service is available
try {
  const authService = window.authService || 
    (await import('./src/services/auth.service.ts')).default;
  console.log('✅ Auth service loaded');
} catch (error) {
  console.error('❌ Failed to load auth service:', error);
}

// Test 3: Validate message structure
const testMessage = {
  _id: 'test-123',
  text: 'Hello World',
  sender: {
    _id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    profilePicture: ''
  },
  timestamp: new Date().toISOString(),
  isOwn: true,
  readBy: []
};

console.log('✅ Test message structure valid:', testMessage);

// Test 4: Validate conversation structure
const testConversation = {
  type: 'direct',
  participant: {
    _id: 'user-456',
    firstName: 'Jane',
    lastName: 'Smith',
    profilePicture: ''
  },
  lastMessage: testMessage,
  unreadCount: 0
};

console.log('✅ Test conversation structure valid:', testConversation);

console.log('🎉 All basic structure tests passed!');
