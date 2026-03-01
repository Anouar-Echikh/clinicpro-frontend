import { ApiResponse } from '../api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Super Admin specific types
export interface SuperAdmin {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  phone?: string;
  is_active: boolean;
  last_login?: string;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SuperAdminLoginRequest {
  email: string;
  password: string;
}

export interface SuperAdminLoginResponse {
  token: string;
  super_admin: SuperAdmin;
}

export interface SuperAdminProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar?: string;
}

export interface SuperAdminPasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export interface SuperAdminCreateRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

class SuperAdminApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/super-admin/auth`;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('super_admin_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`Super Admin API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication Methods
  async login(credentials: SuperAdminLoginRequest): Promise<SuperAdminLoginResponse> {
    const response = await this.request<{ token: string; super_admin: SuperAdmin }>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      // Store token in localStorage with super admin prefix
      localStorage.setItem('super_admin_token', response.data.token);
      localStorage.setItem('super_admin_user', JSON.stringify(response.data.super_admin));
      
      return response.data;
    }

    throw new Error(response.message || 'Login failed');
  }

  async logout(): Promise<void> {
    // Clear super admin tokens and data
    localStorage.removeItem('super_admin_token');
    localStorage.removeItem('super_admin_user');
  }

  async getProfile(): Promise<SuperAdmin> {
    const response = await this.request<{ super_admin: SuperAdmin }>('/profile');

    if (response.success && response.data) {
      // Update stored user data
      localStorage.setItem('super_admin_user', JSON.stringify(response.data.super_admin));
      return response.data.super_admin;
    }

    throw new Error(response.message || 'Failed to fetch profile');
  }

  async updateProfile(profileData: SuperAdminProfileUpdateRequest): Promise<SuperAdmin> {
    const response = await this.request<{ super_admin: SuperAdmin }>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });

    if (response.success && response.data) {
      // Update stored user data
      localStorage.setItem('super_admin_user', JSON.stringify(response.data.super_admin));
      return response.data.super_admin;
    }

    throw new Error(response.message || 'Failed to update profile');
  }

  async changePassword(passwordData: SuperAdminPasswordChangeRequest): Promise<void> {
    const response = await this.request('/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to change password');
    }
  }

  // Super Admin Management Methods
  async getAllSuperAdmins(page = 1, limit = 10, isActive?: boolean): Promise<{
    super_admins: SuperAdmin[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (isActive !== undefined) {
      params.append('is_active', isActive.toString());
    }

    const response = await this.request<{
      super_admins: SuperAdmin[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/admins?${params.toString()}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch super admins');
  }

  async createSuperAdmin(superAdminData: SuperAdminCreateRequest): Promise<SuperAdmin> {
    const response = await this.request<{ super_admin: SuperAdmin }>('/admins', {
      method: 'POST',
      body: JSON.stringify(superAdminData),
    });

    if (response.success && response.data) {
      return response.data.super_admin;
    }

    throw new Error(response.message || 'Failed to create super admin');
  }

  async deactivateSuperAdmin(id: string): Promise<SuperAdmin> {
    const response = await this.request<{ super_admin: SuperAdmin }>(`/admins/${id}/deactivate`, {
      method: 'PUT',
    });

    if (response.success && response.data) {
      return response.data.super_admin;
    }

    throw new Error(response.message || 'Failed to deactivate super admin');
  }

  async activateSuperAdmin(id: string): Promise<SuperAdmin> {
    const response = await this.request<{ super_admin: SuperAdmin }>(`/admins/${id}/activate`, {
      method: 'PUT',
    });

    if (response.success && response.data) {
      return response.data.super_admin;
    }

    throw new Error(response.message || 'Failed to activate super admin');
  }

  async unlockSuperAdmin(id: string): Promise<SuperAdmin> {
    const response = await this.request<{ super_admin: SuperAdmin }>(`/admins/${id}/unlock`, {
      method: 'PUT',
    });

    if (response.success && response.data) {
      return response.data.super_admin;
    }

    throw new Error(response.message || 'Failed to unlock super admin');
  }

  // Utility Methods
  isAuthenticated(): boolean {
    const token = localStorage.getItem('super_admin_token');
    const user = localStorage.getItem('super_admin_user');
    return !!(token && user);
  }

  getCurrentSuperAdmin(): SuperAdmin | null {
    const user = localStorage.getItem('super_admin_user');
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('super_admin_token');
  }

  // Tenant Management Methods (proxy to tenantApiService)
  async getTenants(page = 1, limit = 100): Promise<{
    success: boolean;
    data: {
      tenants: Array<{
        _id?: string;
        id: string;
        name: string;
        slug: string;
        email: string;
        phone?: string;
        subdomain?: string;
        logo_url?: string;
        status: 'active' | 'inactive' | 'suspended' | 'pending';
        created_at: string;
        updated_at: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
      stats: {
        total: number;
        active: number;
        pending: number;
        suspended: number;
        inactive: number;
      };
    };
  }> {
    // Import tenantApiService dynamically to avoid circular dependency
    const { tenantApiService } = await import('./tenantApi');
    const response = await tenantApiService.getAllTenants(page, limit);
    
    return {
      success: true,
      data: response
    };
  }
}

export const superAdminApiService = new SuperAdminApiService();
export default superAdminApiService;
