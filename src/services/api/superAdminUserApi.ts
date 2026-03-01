import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  tenant_id: string;
  tenant_name?: string;
  is_active: boolean;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  tenant_id: string;
  role: string;
  is_active?: boolean;
  password?: string;
  password_hash?: string;
}

interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  tenant_id?: string;
  role?: string;
  is_active?: boolean;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  super_admin: number;
  admin: number;
  recent: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  total?: number;
  meta?: any;
}

class SuperAdminUserApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('super_admin_token');
    if (!token) {
      throw new Error('No super admin authentication token found');
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get all admin users
   */
  async getAllUsers(): Promise<ApiResponse<{ users: User[]; stats: UserStats }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ users: User[]; stats: UserStats }>> = 
        await axios.get(`${API_BASE_URL}/super-admin/users`, {
          headers: this.getAuthHeaders(),
        });
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = 
        await axios.get(`${API_BASE_URL}/super-admin/users/${id}`, {
          headers: this.getAuthHeaders(),
        });
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserData): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = 
        await axios.post(`${API_BASE_URL}/super-admin/users`, userData, {
          headers: this.getAuthHeaders(),
        });
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  }

  /**
   * Update user
   */
  async updateUser(id: string, userData: UpdateUserData): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = 
        await axios.put(`${API_BASE_URL}/super-admin/users/${id}`, userData, {
          headers: this.getAuthHeaders(),
        });
      
      return response.data;
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<ApiResponse<{ deleted_user_id: string; deleted_user_email: string }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ deleted_user_id: string; deleted_user_email: string }>> = 
        await axios.delete(`${API_BASE_URL}/super-admin/users/${id}`, {
          headers: this.getAuthHeaders(),
        });
      
      return response.data;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  }

  /**
   * Toggle user status (activate/deactivate)
   */
  async toggleUserStatus(id: string): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = 
        await axios.patch(`${API_BASE_URL}/super-admin/users/${id}/toggle-status`, {}, {
          headers: this.getAuthHeaders(),
        });
      
      return response.data;
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user status');
    }
  }

  /**
   * Reset user password to default
   */
  async resetUserPassword(id: string): Promise<ApiResponse<{ user_email: string; new_password: string; note: string }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ user_email: string; new_password: string; note: string }>> = 
        await axios.patch(`${API_BASE_URL}/super-admin/users/${id}/reset-password`, {}, {
          headers: this.getAuthHeaders(),
        });
      
      return response.data;
    } catch (error: any) {
      console.error('Error resetting password:', error);
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    try {
      const response: AxiosResponse<ApiResponse<UserStats>> = 
        await axios.get(`${API_BASE_URL}/super-admin/users/stats`, {
          headers: this.getAuthHeaders(),
        });
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user statistics');
    }
  }

  /**
   * Check if super admin is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('super_admin_token');
  }

  /**
   * Get current super admin token
   */
  getToken(): string | null {
    return localStorage.getItem('super_admin_token');
  }
}

// Export singleton instance
export const superAdminUserApiService = new SuperAdminUserApiService();
export default superAdminUserApiService;

// Export types
export type { User, CreateUserData, UpdateUserData, UserStats, ApiResponse };
