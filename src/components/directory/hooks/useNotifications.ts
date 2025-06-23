import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/auth.provider';

// Define base URL for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Notification types
export interface FriendRequest {
  _id: string;
  from: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  };
  to: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  type: 'friend_request' | 'message' | 'system';
  title: string;
  message: string;
  data?: never;
  read: boolean;
  createdAt: string;
}

// API Response interfaces
interface FriendRequestsResponse {
  success: boolean;
  data: {
    friendRequests: FriendRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface ActionResponse {
  success: boolean;
  message: string;
}

export const useNotifications = () => {
  const [receivedFriendRequests, setReceivedFriendRequests] = useState<FriendRequest[]>([]);
  const [sentFriendRequests, setSentFriendRequests] = useState<FriendRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { session } = useAuth();

  // Fetch received friend requests
  const fetchReceivedFriendRequests = useCallback(async (status?: 'pending' | 'accepted' | 'rejected') => {
    if (!session?.token) return;

    try {
      setLoading(true);
      setError(null);

      const statusQuery = status ? `&status=${status}` : '';
      const response = await axios.get<FriendRequestsResponse>(
        `${API_BASE_URL}/friend-requests?type=received${statusQuery}&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${session.token}`,
          }
        }
      );

      if (response.data.success) {
        setReceivedFriendRequests(response.data.data.friendRequests);
      }
    } catch (error: unknown) {
      console.error('Error fetching received friend requests:', error);
      setError('Failed to load received friend requests');
    } finally {
      setLoading(false);
    }
  }, [session?.token]);

  // Fetch sent friend requests
  const fetchSentFriendRequests = useCallback(async (status?: 'pending' | 'accepted' | 'rejected') => {
    if (!session?.token) return;

    try {
      setLoading(true);
      setError(null);

      const statusQuery = status ? `&status=${status}` : '';
      const response = await axios.get<FriendRequestsResponse>(
        `${API_BASE_URL}/friend-requests?type=sent${statusQuery}&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${session.token}`,
          }
        }
      );

      if (response.data.success) {
        setSentFriendRequests(response.data.data.friendRequests);
      }
    } catch (error: unknown) {
      console.error('Error fetching sent friend requests:', error);
      setError('Failed to load sent friend requests');
    } finally {
      setLoading(false);
    }
  }, [session?.token]);

  // Fetch friend requests (backward compatibility)
  const fetchFriendRequests = useCallback(async (type: 'sent' | 'received' = 'received') => {
    if (type === 'received') {
      return fetchReceivedFriendRequests();
    } else {
      return fetchSentFriendRequests();
    }
  }, [fetchReceivedFriendRequests, fetchSentFriendRequests]);

  // Fetch general notifications
  const fetchNotifications = useCallback(async () => {
    if (!session?.token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<NotificationsResponse>(
        `${API_BASE_URL}/notifications?limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${session.token}`,
          }
        }
      );

      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        // Calculate unread count
        const unread = response.data.data.notifications.filter(n => !n.read).length + 
                      receivedFriendRequests.filter(fr => fr.status === 'pending').length;
        setUnreadCount(unread);
      }
    } catch (error: unknown) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [session?.token, receivedFriendRequests.length]);

  // Accept friend request
  const acceptFriendRequest = useCallback(async (requestId: string) => {
    if (!session?.token) return false;

    try {
      const response = await axios.put<ActionResponse>(
        `${API_BASE_URL}/friend-requests/${requestId}/accept`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${session.token}`,
          }
        }
      );

      if (response.data.success) {
        // Remove from pending requests
        setReceivedFriendRequests(prev => prev.filter(fr => fr._id !== requestId));
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
      return false;
    } catch (error: unknown) {
      console.error('Error accepting friend request:', error);
      setError('Failed to accept friend request');
      return false;
    }
  }, [session?.token]);

  // Reject friend request
  const rejectFriendRequest = useCallback(async (requestId: string) => {
    if (!session?.token) return false;

    try {
      const response = await axios.put<ActionResponse>(
        `${API_BASE_URL}/friend-requests/${requestId}/reject`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${session.token}`,
          }
        }
      );

      if (response.data.success) {
        // Remove from pending requests
        setReceivedFriendRequests(prev => prev.filter(fr => fr._id !== requestId));
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
      return false;
    } catch (error: unknown) {
      console.error('Error rejecting friend request:', error);
      setError('Failed to reject friend request');
      return false;
    }
  }, [session?.token]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    if (!session?.token) return false;

    try {
      const response = await axios.put<ActionResponse>(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${session.token}`,
          }
        }
      );

      if (response.data.success) {
        setNotifications(prev => 
          prev.map(n => 
            n._id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
      return false;
    } catch (error: unknown) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }, [session?.token]);

  // Load all notifications on mount
  useEffect(() => {
    if (session?.token) {
      fetchReceivedFriendRequests();
      fetchSentFriendRequests();
      fetchNotifications();
    }
  }, [session?.token, fetchReceivedFriendRequests, fetchSentFriendRequests, fetchNotifications]);

  // Refresh all notifications
  const refreshNotifications = useCallback(() => {
    fetchReceivedFriendRequests();
    fetchSentFriendRequests();
    fetchNotifications();
  }, [fetchReceivedFriendRequests, fetchSentFriendRequests, fetchNotifications]);

  return {
    receivedFriendRequests,
    sentFriendRequests,
    notifications,
    loading,
    error,
    unreadCount,
    acceptFriendRequest,
    rejectFriendRequest,
    markNotificationAsRead,
    refreshNotifications,
    fetchReceivedFriendRequests,
    fetchSentFriendRequests,
    fetchNotifications
  };
};
