import { useState, useEffect } from 'react';
import { publicTenantApiService } from '@/services/api/publicTenantApi';
import { TenantInfo, getCurrentTenantInfo } from '@/utils/tenantUtils';

interface UsTenantsReturn {
  tenants: TenantInfo[];
  currentTenant: TenantInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isMultiTenant: boolean;
  currentSubdomain: string | null;
}

export const useTenants = () => {
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [currentTenant, setCurrentTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { subdomain, isMultiTenant } = getCurrentTenantInfo();

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isMultiTenant && subdomain) {
        // If we're on a tenant subdomain, fetch that specific tenant
        const response = await publicTenantApiService.getTenantBySubdomain(subdomain);
        setCurrentTenant(response.tenant || null);
        setTenants(response.tenant ? [response.tenant] : []);
      } else {
        // If we're on the main domain, fetch all active tenants
        const response = await publicTenantApiService.getActiveTenants();
        setTenants(response.tenants || []);
        setCurrentTenant(null);
      }
    } catch (err: any) {
      console.error('Error fetching tenants:', err);
      setError(err.message || 'Failed to load tenants');
      setTenants([]);
      setCurrentTenant(null);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchTenants();
  };

  useEffect(() => {
    fetchTenants();
  }, [subdomain, isMultiTenant]);

  return {
    tenants,
    currentTenant,
    loading,
    error,
    refetch,
    isMultiTenant,
    currentSubdomain: subdomain
  } as UsTenantsReturn;
};

export default useTenants;
