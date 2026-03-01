import { useQuery } from '@tanstack/react-query';
import apiService from '@/services/api';
import { useClinic } from '@/contexts/ClinicContext';

// Dashboard Query Keys
export const dashboardQueryKeys = {
  adminStats: (clinicId: string | null) => ['dashboard', 'admin', clinicId] as const,
  revenueAnalytics: (clinicId: string | null, period: string) => ['dashboard', 'revenue', clinicId, period] as const,
  operationalMetrics: (clinicId: string | null) => ['dashboard', 'operational', clinicId] as const,
  systemHealth: (clinicId: string | null) => ['dashboard', 'system-health', clinicId] as const,
};

// Dashboard Statistics Hook
export const useAdminDashboardStats = () => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: dashboardQueryKeys.adminStats(clinicId),
    queryFn: async () => {
      // Only fetch data if we have a clinic selected
      if (!clinicId) {
        return {
          overview: {
            totalPatients: 0,
            todayAppointments: 0,
            monthlyRevenue: 0,
            lowStockCount: 0,
            totalDoctors: 0,
            totalStaff: 0,
          },
          appointmentStats: [],
          revenueData: [],
          lowStockItems: [],
          recentAppointments: [],
          recentLeads: [],
          percentageChanges: { revenue: '0', patients: '0', appointments: '0' },
          systemHealth: {
            totalUsers: 0,
            activeUsers: 0,
            systemUptime: '0:00:00',
            lastBackup: new Date(),
            apiResponseTime: '0ms',
          },
          lastUpdated: new Date(),
        };
      }
      
      const response = await apiService.getDashboardStats();
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    enabled: !!clinicId, // Only enable query when clinic is selected
  });
};

// Revenue Analytics Hook
export const useRevenueAnalytics = (period: string = '6months') => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: dashboardQueryKeys.revenueAnalytics(clinicId, period),
    queryFn: async () => {
      // Only fetch data if we have a clinic selected
      if (!clinicId) {
        return {
          revenueData: [],
          expenseData: [],
          period,
        };
      }
      
      const response = await apiService.getRevenueAnalytics(period);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clinicId, // Only enable query when clinic is selected
  });
};

// Operational Metrics Hook
export const useOperationalMetrics = () => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: dashboardQueryKeys.operationalMetrics(clinicId),
    queryFn: async () => {
      if (!clinicId) {
        return {
          appointments: {
            today: 0,
            thisWeek: 0,
            thisMonth: 0,
            byStatus: [],
          },
          patients: {
            today: 0,
            thisWeek: 0,
            thisMonth: 0,
          },
          inventoryAlerts: [],
          timestamp: new Date(),
        };
      }
      
      const response = await apiService.getOperationalMetrics();
      return response;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    enabled: !!clinicId,
  });
};

// System Health Hook
export const useSystemHealth = () => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: dashboardQueryKeys.systemHealth(clinicId),
    queryFn: async () => {
      if (!clinicId) {
        return {
          status: 'offline' as const,
          uptime: '0:00:00',
          lastCheck: new Date().toISOString(),
          services: [],
        };
      }
      
      const response = await apiService.getSystemHealth();
      return response;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!clinicId,
  });
};

// Combined Dashboard Data Hook
export const useDashboardData = () => {
  const adminStats = useAdminDashboardStats();
  const revenueAnalytics = useRevenueAnalytics();
  const operationalMetrics = useOperationalMetrics();
  const systemHealth = useSystemHealth();

  return {
    adminStats,
    revenueAnalytics, 
    operationalMetrics,
    systemHealth,
    isLoading: adminStats.isLoading || revenueAnalytics.isLoading || operationalMetrics.isLoading || systemHealth.isLoading,
    hasError: adminStats.isError || revenueAnalytics.isError || operationalMetrics.isError || systemHealth.isError,
    error: adminStats.error || revenueAnalytics.error || operationalMetrics.error || systemHealth.error,
  };
};

// Analytics Query Keys
export const analyticsQueryKeys = {
  overview: (clinicId: string | null, period: string) => ['analytics', 'overview', clinicId, period] as const,
  departments: (clinicId: string | null) => ['analytics', 'departments', clinicId] as const,
  appointments: (clinicId: string | null) => ['analytics', 'appointments', clinicId] as const,
  demographics: (clinicId: string | null) => ['analytics', 'demographics', clinicId] as const,
  services: (clinicId: string | null) => ['analytics', 'services', clinicId] as const,
  stats: (clinicId: string | null) => ['analytics', 'stats', clinicId] as const,
};

// Analytics Overview Hook
export const useAnalyticsOverview = (period: string = '6months') => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: analyticsQueryKeys.overview(clinicId, period),
    queryFn: async () => {
      if (!clinicId) {
        return {
          revenueExpenseData: [],
          period,
        };
      }
      
      const response = await apiService.getAnalyticsOverview(period);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clinicId,
  });
};

// Department Analytics Hook  
export const useDepartmentAnalytics = () => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: analyticsQueryKeys.departments(clinicId),
    queryFn: async () => {
      if (!clinicId) {
        return [];
      }
      
      const response = await apiService.getDepartmentAnalytics();
      return response;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!clinicId,
  });
};

// Appointment Analytics Hook
export const useAppointmentAnalytics = () => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: analyticsQueryKeys.appointments(clinicId),
    queryFn: async () => {
      if (!clinicId) {
        return [];
      }
      
      const response = await apiService.getAppointmentAnalytics();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clinicId,
  });
};

// Patient Demographics Hook
export const usePatientDemographics = () => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: analyticsQueryKeys.demographics(clinicId),
    queryFn: async () => {
      if (!clinicId) {
        return [];
      }
      
      const response = await apiService.getPatientDemographics();
      return response;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!clinicId,
  });
};

// Service Analytics Hook
export const useServiceAnalytics = () => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: analyticsQueryKeys.services(clinicId),
    queryFn: async () => {
      if (!clinicId) {
        return [];
      }
      
      const response = await apiService.getTopServices();
      return response;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!clinicId,
  });
};

// Payment Method Analytics Hook
export const usePaymentMethodAnalytics = () => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: ['analytics', 'payment-methods', clinicId],
    queryFn: async () => {
      if (!clinicId) {
        return [];
      }
      
      const response = await apiService.getPaymentMethodAnalytics();
      return response;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!clinicId,
  });
};

// Analytics Stats Hook
export const useAnalyticsStats = () => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: analyticsQueryKeys.stats(clinicId),
    queryFn: async () => {
      if (!clinicId) {
        return {
          currentMonth: {
            revenue: 0,
            patients: 0,
            appointments: 0,
            completionRate: 0,
          },
          growth: {
            revenue: 0,
            patients: 0,
            appointments: 0,
          },
        };
      }
      
      const response = await apiService.getAnalyticsStats();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clinicId,
  });
}; 