import { useState, useEffect } from 'react';
import { serviceApi } from '@/services/api/serviceApi';
import type { Service, ServiceFilters } from '@/types';
import { toast } from '@/hooks/use-toast';

// Custom hook for loading services
export const useServices = (shouldLoad: boolean = false) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shouldLoad) {
      loadServices();
    }
  }, [shouldLoad]);

  const loadServices = async (filters: ServiceFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviceApi.getServices({
        ...filters,
        limit: 100, // Get all services for dropdown
        isActive: true // Only active services
      });
      setServices(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load services';
      setError(errorMessage);
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  return { 
    services, 
    loading, 
    error, 
    refetch: loadServices,
    loadServices 
  };
};

export default useServices;
