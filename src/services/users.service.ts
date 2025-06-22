import axios from 'axios';

// Define base URL for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// User interface matching backend schema
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
  id: string; // Duplicate ID field from API response
}

// API Response interfaces
export interface UsersResponse {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
  search: string | null;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

// Query parameters interface for getUsers
interface GetUsersParams {
  page: number;
  limit: number;
  search?: string;
}

class UsersService {
  // Get all users with pagination and search
  async getUsers(token: string, page = 1, limit = 50, search?: string): Promise<UsersResponse> {
    try {
      const params: GetUsersParams = { page, limit };
      if (search) {
        params.search = search;
      }

      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get current user profile
  async getCurrentUser(token: string): Promise<UserResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId: string, token: string): Promise<UserResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  // Update current user profile
  async updateProfile(token: string, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'profilePicture'>>): Promise<UserResponse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/me`, updates, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(token: string, currentPassword: string, newPassword: string, confirmNewPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/me/password`, {
        currentPassword,
        newPassword,
        confirmNewPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // Delete current user account
  async deleteAccount(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  // Upload profile picture
  async uploadProfilePicture(token: string, file: File): Promise<{ success: boolean; message: string; data: { profilePictureUrl: string } }> {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await axios.post(`${API_BASE_URL}/users/me/profile-picture`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }

  // Delete profile picture
  async deleteProfilePicture(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/users/me/profile-picture`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      throw error;
    }
  }
}

// Export singleton instance
const usersService = new UsersService();
export default usersService;
