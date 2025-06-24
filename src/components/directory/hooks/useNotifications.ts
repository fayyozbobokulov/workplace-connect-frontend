import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/auth.provider';

// Define base URL for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Notification types
export interface FriendRequest {
  _id: string;
  sender: string;
  recipient: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  senderDetails: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    profilePictureMetadata?: {
      filename: string;
      originalName: string;
      size: number;
      mimeType: string;
      uploadedAt: string;
    };
    password?: string;
    id?: string;
  };
  recipientDetails: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    profilePictureMetadata?: {
      filename: string;
      originalName: string;
      size: number;
      mimeType: string;
      uploadedAt: string;
    };
    password?: string;
    id?: string;
  };
  id?: string;
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
      pages: number;
    };
    stats: {
      total: number;
      type: string;
      status: string;
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
  const [allReceivedRequests, setAllReceivedRequests] = useState<FriendRequest[]>([]);
  const [allSentRequests, setAllSentRequests] = useState<FriendRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { session } = useAuth();

  // Helper function to fetch all friend requests by status
  const fetchAllFriendRequestsByType = useCallback(async (type: 'received' | 'sent') => {
    if (!session?.token) return [];

    try {
      const statuses: ('pending' | 'accepted' | 'rejected')[] = ['pending', 'accepted', 'rejected'];
      const allRequests: FriendRequest[] = [];

      // Fetch all statuses in parallel
      const promises = statuses.map(async (status) => {
        const response = await axios.get<FriendRequestsResponse>(
          `${API_BASE_URL}/friend-requests?type=${type}&status=${status}&limit=100`,
          {
            headers: {
              'Authorization': `Bearer ${session.token}`,
            }
          }
        );
        
        if (response.data.success) {
          return response.data.data.friendRequests;
        }
        return [];
      });

      const results = await Promise.all(promises);
      results.forEach(requests => allRequests.push(...requests));

      // Sort by createdAt (newest first)
      allRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return allRequests;
    } catch (error) {
      console.error(`Error fetching all ${type} friend requests:`, error);
      throw error;
    }
  }, [session?.token]);

  // Fetch received friend requests
  const fetchReceivedFriends = useCallback(async (status?: 'all' | 'pending' | 'accepted' | 'rejected') => {
    if (!session?.token) return;

    try {
      setLoading(true);
      setError(null);

      if (status === 'all' || !status) {
        // Fetch all requests when 'all' or no status specified
        const allRequests = await fetchAllFriendRequestsByType('received');
        setAllReceivedRequests(allRequests);
        setReceivedFriendRequests(allRequests);
      } else {
        // Fetch specific status
        const response = await axios.get<FriendRequestsResponse>(
          `${API_BASE_URL}/friend-requests?type=received&status=${status}&limit=100`,
          {
            headers: {
              'Authorization': `Bearer ${session.token}`,
            }
          }
        );

        if (response.data.success) {
          const requests = response.data.data.friendRequests.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setReceivedFriendRequests(requests);
          
          // Also update all requests if this is the first fetch
          if (allReceivedRequests.length === 0) {
            const allRequests = await fetchAllFriendRequestsByType('received');
            setAllReceivedRequests(allRequests);
          }
        }
      }
    } catch (error: unknown) {
      console.error('Error fetching received friend requests:', error);
      setError('Failed to load received friend requests');
    } finally {
      setLoading(false);
    }
  }, [session?.token, allReceivedRequests.length, fetchAllFriendRequestsByType]);

  // Fetch sent friend requests
  const fetchSentFriends = useCallback(async (status?: 'all' | 'pending' | 'accepted' | 'rejected') => {
    if (!session?.token) return;

    try {
      setLoading(true);
      setError(null);

      if (status === 'all' || !status) {
        // Fetch all requests when 'all' or no status specified
        const allRequests = await fetchAllFriendRequestsByType('sent');
        setAllSentRequests(allRequests);
        setSentFriendRequests(allRequests);
      } else {
        // Fetch specific status
        const response = await axios.get<FriendRequestsResponse>(
          `${API_BASE_URL}/friend-requests?type=sent&status=${status}&limit=100`,
          {
            headers: {
              'Authorization': `Bearer ${session.token}`,
            }
          }
        );

        if (response.data.success) {
          const requests = response.data.data.friendRequests.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setSentFriendRequests(requests);
          
          // Also update all requests if this is the first fetch
          if (allSentRequests.length === 0) {
            const allRequests = await fetchAllFriendRequestsByType('sent');
            setAllSentRequests(allRequests);
          }
        }
      }
    } catch (error: unknown) {
      console.error('Error fetching sent friend requests:', error);
      setError('Failed to load sent friend requests');
    } finally {
      setLoading(false);
    }
  }, [session?.token, allSentRequests.length, fetchAllFriendRequestsByType]);

  // Backward compatibility functions
  const fetchReceivedFriendRequests = fetchReceivedFriends;
  const fetchSentFriendRequests = fetchSentFriends;

  // Fetch friend requests (backward compatibility)
  const fetchFriendRequests = useCallback(() => {
    return fetchReceivedFriendRequests();
  }, [fetchReceivedFriendRequests]);

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
      setLoading(true);
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
        // Update the request status in both arrays
        const updateRequestStatus = (requests: FriendRequest[]) => 
          requests.map(fr => 
            fr._id === requestId ? { ...fr, status: 'accepted' as const, updatedAt: new Date().toISOString() } : fr
          );

        setReceivedFriendRequests(updateRequestStatus);
        setAllReceivedRequests(updateRequestStatus);
        
        // Update unread count - decrease by 1 for the accepted request
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        console.log(' Friend request accepted successfully');
        return true;
      }
      return false;
    } catch (error: unknown) {
      console.error('Error accepting friend request:', error);
      setError('Failed to accept friend request');
      return false;
    } finally {
      setLoading(false);
    }
  }, [session?.token]);

  // Reject friend request
  const rejectFriendRequest = useCallback(async (requestId: string) => {
    if (!session?.token) return false;

    try {
      setLoading(true);
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
        // Update the request status in both arrays
        const updateRequestStatus = (requests: FriendRequest[]) => 
          requests.map(fr => 
            fr._id === requestId ? { ...fr, status: 'rejected' as const, updatedAt: new Date().toISOString() } : fr
          );

        setReceivedFriendRequests(updateRequestStatus);
        setAllReceivedRequests(updateRequestStatus);
        
        // Update unread count - decrease by 1 for the rejected request
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        console.log(' Friend request rejected successfully');
        return true;
      }
      return false;
    } catch (error: unknown) {
      console.error('Error rejecting friend request:', error);
      setError('Failed to reject friend request');
      return false;
    } finally {
      setLoading(false);
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

  // Refresh all notifications
  const refreshNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      await Promise.all([
        fetchReceivedFriendRequests('all'),
        fetchSentFriendRequests('all'),
        fetchNotifications()
      ]);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      setError('Failed to refresh notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all notifications on mount
  useEffect(() => {
    if (session?.token) {
      fetchReceivedFriends();
      fetchSentFriends();
      fetchNotifications();
    }
  }, [session?.token]);

  return {
    receivedFriendRequests,
    sentFriendRequests,
    allReceivedRequests,
    allSentRequests,
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
    fetchNotifications,
    fetchFriendRequests
  };
};
