import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';

// Types for settings
export interface ClinicSettings {
  id: string;
  clinic: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    description?: string;
    logo?: string;
  };
  workingHours: {
    [key: string]: {
      isOpen: boolean;
      start: string;
      end: string;
    };
  };
  financial: {
    currency: string;
    taxRate: number;
    invoicePrefix: string;
    paymentTerms: number;
    defaultDiscount: number;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    appointmentReminders: boolean;
    paymentReminders: boolean;
    lowStockAlerts: boolean;
    systemAlerts: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    backupFrequency: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsRequest {
  clinic?: Partial<ClinicSettings['clinic']>;
  workingHours?: Partial<ClinicSettings['workingHours']>;
  financial?: Partial<ClinicSettings['financial']>;
  notifications?: Partial<ClinicSettings['notifications']>;
  security?: Partial<ClinicSettings['security']>;
}

// Get settings hook
export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await apiService.getSettings();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Update settings mutation
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSettingsRequest) => {
      const response = await apiService.updateSettings(data);
      return response.data;
    },
    onSuccess: (data) => {
      // Update the cache with new data
      queryClient.setQueryData(['settings'], data);
      
      toast({
        title: 'Settings Updated',
        description: 'Your clinic settings have been successfully updated.',
      });
    },
    onError: (error: any) => {
      console.error('Error updating settings:', error);
      
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

// Prefetch settings (useful for preloading)
export const usePrefetchSettings = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: ['settings'],
      queryFn: async () => {
        const response = await apiService.getSettings();
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}; 