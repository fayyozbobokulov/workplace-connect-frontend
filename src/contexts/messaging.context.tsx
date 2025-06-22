import React, { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useMessaging, type MessagingState, type MessagingActions } from '../hooks/useMessaging';
import { useAuth } from '../components/auth/auth.provider';

interface MessagingContextType extends MessagingState, MessagingActions {}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

interface MessagingProviderProps {
  children: ReactNode;
}

export const MessagingProvider: React.FC<MessagingProviderProps> = ({ children }) => {
  const { session } = useAuth();
  const messaging = useMessaging();

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (session?.token && !messaging.isConnected) {
      messaging.connect();
      
      // Load initial conversations
      messaging.loadConversations();
    }
  }, [session?.token, messaging.isConnected]);

  // Auto-disconnect when user logs out
  useEffect(() => {
    if (!session?.token && messaging.isConnected) {
      messaging.disconnect();
    }
  }, [session?.token, messaging.isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      messaging.disconnect();
    };
  }, []);

  return (
    <MessagingContext.Provider value={messaging}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessagingContext = (): MessagingContextType => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessagingContext must be used within a MessagingProvider');
  }
  return context;
};
