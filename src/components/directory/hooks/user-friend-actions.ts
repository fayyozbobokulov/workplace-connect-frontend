import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/auth.provider';

// Define base URL for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Type for selected item - can be either a User or a custom email entry
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
}

export type SelectedItem = User | { _id: string; email: string; isCustomEmail: true };

// API Response interfaces
interface FriendRequestResponse {
  success: boolean;
  message: string;
  data?: {
    sent: number;
    failed: number;
    errors?: string[];
  };
}

export const useFriendActions = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();

  const handleAddFriend = async (selections: SelectedItem[]) => {
    if (selections.length === 0) return;
    
    if (!session?.token) {
      setSnackbarMessage('Authentication required to send friend requests');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsLoading(true);
    
    try {
      // Extract emails from all selections
      const emails: string[] = selections.map(item => {
        if ('isCustomEmail' in item) {
          return item.email;
        } else {
          return item.email;
        }
      });

      console.log('🚀 Sending friend requests to emails:', emails);
      console.log('🔑 Using token:', session.token ? 'Token present' : 'No token');
      console.log('📡 API URL:', `${API_BASE_URL}/friend-requests`);

      // Make API call to send friend requests
      const response = await axios.post<FriendRequestResponse>(
        `${API_BASE_URL}/friend-requests`,
        { emails },
        {
          headers: {
            'Authorization': `Bearer ${session.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Friend request API response:', response.data);

      if (response.data.success) {
        // Count existing users and custom emails for success message
        const existingUsers = selections.filter(item => !('isCustomEmail' in item));
        const customEmails = selections.filter(item => 'isCustomEmail' in item);
        
        let message = '';
        
        if (existingUsers.length > 0 && customEmails.length > 0) {
          message = `Friend requests sent to ${existingUsers.length} user(s) and invitations sent to ${customEmails.length} email(s)`;
        } else if (existingUsers.length > 0) {
          if (existingUsers.length === 1) {
            const user = existingUsers[0] as User;
            message = `Friend request sent to ${user.firstName} ${user.lastName}`;
          } else {
            message = `Friend requests sent to ${existingUsers.length} users`;
          }
        } else if (customEmails.length > 0) {
          if (customEmails.length === 1) {
            message = `Invitation sent to ${customEmails[0].email}`;
          } else {
            message = `Invitations sent to ${customEmails.length} email addresses`;
          }
        }

        // Add API response details if available
        if (response.data.data) {
          const { sent, failed } = response.data.data;
          if (failed > 0) {
            message += ` (${sent} successful, ${failed} failed)`;
            setSnackbarSeverity('error');
          } else {
            setSnackbarSeverity('success');
          }
        } else {
          setSnackbarSeverity('success');
        }
        
        setSnackbarMessage(message);
      } else {
        setSnackbarMessage(response.data.message || 'Failed to send friend requests');
        setSnackbarSeverity('error');
      }
      
    } catch (error: unknown) {
      console.error('❌ Error sending friend requests:', error);
      
      let errorMessage = 'Failed to send friend requests';
      
      // Type guard for axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            data?: { message?: string; error?: string; details?: string }; 
            status?: number;
            statusText?: string;
          } 
        };
        
        console.log('🔍 Server response:', axiosError.response?.data);
        console.log('🔍 Status:', axiosError.response?.status);
        
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        } else if (axiosError.response?.data?.details) {
          errorMessage = axiosError.response.data.details;
        } else if (axiosError.response?.status === 400) {
          errorMessage = 'Bad request - please check the email format and try again';
        } else if (axiosError.response?.status === 401) {
          errorMessage = 'Authentication failed - please log in again';
        } else if (axiosError.response?.status === 403) {
          errorMessage = 'Permission denied - you are not authorized to send friend requests';
        } else if (axiosError.response?.statusText) {
          errorMessage = `Server error: ${axiosError.response.statusText}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
    } finally {
      setIsLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    isLoading,
    handleAddFriend,
    handleCloseSnackbar
  };
};
