import axios from 'axios';

// Define base URL for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Group interface matching backend schema
export interface Group {
  _id: string;
  name: string;
  description?: string;
  creator: string;
  members: string[];
  admins: string[];
  createdAt: string;
  updatedAt: string;
}

// Member result interface for bulk operations
export interface MemberResult {
  email: string;
  userId?: string;
  error?: string;
}

// API Response interfaces
export interface GroupsResponse {
  groups?: Group[];  // Direct groups array (like users API)
  success?: boolean;
  message?: string;
  data?: {
    groups: Group[];  // Nested groups array (original structure)
  };
}

export interface GroupResponse {
  success: boolean;
  message: string;
  data: {
    group: Group;
  };
}

export interface CreateGroupResponse {
  success: boolean;
  message: string;
  data: {
    group: Group;
    memberResults: {
      successful: MemberResult[];
      failed: MemberResult[];
      summary: {
        total: number;
        successful: number;
        failed: number;
      };
    };
  };
}

export interface MemberOperationResponse {
  success: boolean;
  message: string;
  data?: {
    memberResults: {
      successful: MemberResult[];
      failed: MemberResult[];
      summary: {
        total: number;
        successful: number;
        failed: number;
      };
    };
  };
}

class GroupsService {
  // Create a new group
  async createGroup(token: string, name?: string, description?: string, emails: string[] = []): Promise<CreateGroupResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/groups`, {
        name,
        description,
        emails
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  // Get all groups for the current user
  async getGroups(token: string): Promise<GroupsResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/groups`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  }

  // Get group by ID
  async getGroupById(groupId: string, token: string): Promise<GroupResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/groups/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching group by ID:', error);
      throw error;
    }
  }

  // Update group information (admin only)
  async updateGroup(groupId: string, token: string, updates: Partial<Pick<Group, 'name' | 'description'>>): Promise<GroupResponse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/groups/${groupId}`, updates, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  // Add members to group by email (admin only)
  async addMembers(groupId: string, token: string, emails: string[]): Promise<MemberOperationResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/groups/${groupId}/members`, {
        emails
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding members to group:', error);
      throw error;
    }
  }

  // Remove member from group (admin or self)
  async removeMember(groupId: string, userId: string, token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/groups/${groupId}/members/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing member from group:', error);
      throw error;
    }
  }

  // Delete group (creator only)
  async deleteGroup(groupId: string, token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/groups/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }

  // Make user admin (creator only)
  async promoteToAdmin(groupId: string, userId: string, token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/groups/${groupId}/admins/${userId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      throw error;
    }
  }

  // Remove admin privileges (creator only)
  async removeAdmin(groupId: string, userId: string, token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/groups/${groupId}/admins/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing admin privileges:', error);
      throw error;
    }
  }
}

// Export singleton instance
const groupsService = new GroupsService();
export default groupsService;
