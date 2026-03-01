import { ApiResponse } from '../api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Tenant specific types
export interface Tenant {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  subdomain?: string;
  logo_url?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  created_by?: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface TenantCreateRequest {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  subdomain?: string;
  logo_url?: string;
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
}

export interface TenantUpdateRequest {
  name?: string;
  slug?: string;
  email?: string;
  phone?: string;
  subdomain?: string;
  logo_url?: string;
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
}

export interface TenantListResponse {
  tenants: Tenant[];
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
}

export interface TenantStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  inactive: number;
  deleted: number;
}

export interface RecentTenant {
  _id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
}

export interface TenantStatsResponse {
  stats: TenantStats;
  recentTenants: RecentTenant[];
}

class TenantApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/super-admin/tenants`;
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
      console.error(`Tenant API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Get all tenants with pagination and filtering
  async getAllTenants(
    page = 1,
    limit = 10,
    search = '',
    status = 'all',
    sortBy = 'created_at',
    sortOrder = 'desc'
  ): Promise<TenantListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    });

    if (search) params.append('search', search);
    if (status !== 'all') params.append('status', status);

    const response = await this.request<TenantListResponse>(`/?${params.toString()}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch tenants');
  }

  // Get tenant by ID
  async getTenantById(id: string): Promise<Tenant> {
    const response = await this.request<{ tenant: Tenant }>(`/${id}`);

    if (response.success && response.data) {
      return response.data.tenant;
    }

    throw new Error(response.message || 'Failed to fetch tenant');
  }

  // Create new tenant
  async createTenant(tenantData: TenantCreateRequest): Promise<Tenant> {
    const response = await this.request<{ tenant: Tenant }>('/', {
      method: 'POST',
      body: JSON.stringify(tenantData),
    });

    if (response.success && response.data) {
      return response.data.tenant;
    }

    throw new Error(response.message || 'Failed to create tenant');
  }

  // Update tenant
  async updateTenant(id: string, tenantData: TenantUpdateRequest): Promise<Tenant> {
    const response = await this.request<{ tenant: Tenant }>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tenantData),
    });

    if (response.success && response.data) {
      return response.data.tenant;
    }

    throw new Error(response.message || 'Failed to update tenant');
  }

  // Delete tenant (soft delete)
  async deleteTenant(id: string): Promise<Tenant> {
    const response = await this.request<{ tenant: Tenant }>(`/${id}`, {
      method: 'DELETE',
    });

    if (response.success && response.data) {
      return response.data.tenant;
    }

    throw new Error(response.message || 'Failed to delete tenant');
  }

  // Restore tenant
  async restoreTenant(id: string): Promise<Tenant> {
    const response = await this.request<{ tenant: Tenant }>(`/${id}/restore`, {
      method: 'PUT',
    });

    if (response.success && response.data) {
      return response.data.tenant;
    }

    throw new Error(response.message || 'Failed to restore tenant');
  }

  // Get tenant statistics
  async getTenantStats(): Promise<TenantStatsResponse> {
    const response = await this.request<TenantStatsResponse>('/stats');

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch tenant stats');
  }

  // Check slug availability
  async checkSlugAvailability(slug: string, excludeId?: string): Promise<{
    available: boolean;
    slug: string;
  }> {
    const params = excludeId ? `?excludeId=${excludeId}` : '';
    const response = await this.request<{
      available: boolean;
      slug: string;
    }>(`/check-slug/${encodeURIComponent(slug)}${params}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to check slug availability');
  }

  // Check subdomain availability
  async checkSubdomainAvailability(subdomain: string, excludeId?: string): Promise<{
    available: boolean;
    subdomain: string;
    full_url: string;
  }> {
    const params = excludeId ? `?excludeId=${excludeId}` : '';
    const response = await this.request<{
      available: boolean;
      subdomain: string;
      full_url: string;
    }>(`/check-subdomain/${encodeURIComponent(subdomain)}${params}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to check subdomain availability');
  }
}

export const tenantApiService = new TenantApiService();
export default tenantApiService;
