import axios from 'axios';
import { TenantInfo } from '@/utils/tenantUtils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance for public tenant API (no auth required)
const publicTenantApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for error handling
publicTenantApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Public Tenant API Error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'An error occurred');
  }
);

export interface GetTenantsResponse {
  tenants: TenantInfo[];
  total: number;
}

export interface GetTenantBySubdomainResponse {
  tenant: TenantInfo;
}

export const publicTenantApiService = {
  /**
   * Get all active tenants for tenant selection
   */
  async getActiveTenants(): Promise<GetTenantsResponse> {
    try {
      const response = await publicTenantApi.get('/public/tenants');
      return {
        tenants: response.data?.data?.tenants || [],
        total: response.data?.data?.total || 0
      };
    } catch (error) {
      console.error('Error fetching active tenants:', error);
      throw error;
    }
  },

  /**
   * Get tenant by subdomain
   */
  async getTenantBySubdomain(subdomain: string): Promise<GetTenantBySubdomainResponse> {
    try {
      const response = await publicTenantApi.get(`/public/tenants/subdomain/${subdomain}`);
      return {
        tenant: response.data?.data?.tenant || null
      };
    } catch (error) {
      console.error('Error fetching tenant by subdomain:', error);
      throw error;
    }
  },

  /**
   * Validate if tenant exists and is active
   */
  async validateTenant(subdomain: string): Promise<boolean> {
    try {
      const response = await this.getTenantBySubdomain(subdomain);
      return response.tenant && response.tenant.status === 'active';
    } catch (error) {
      return false;
    }
  }
};

export default publicTenantApiService;
