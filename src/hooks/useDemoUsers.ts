import { useState, useEffect } from 'react';
import { User } from '@/types';
import { apiService } from '@/services/api';
import { Shield, Stethoscope, Users, Calculator, UserCheck } from 'lucide-react';

export interface DemoAccount {
  role: string;
  email: string;
  password: string;
  description: string;
  icon: any;
  color: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
}

interface UseDemoUsersOptions {
  tenantId?: string;
}

export const useDemoUsers = (options?: UseDemoUsersOptions) => {
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Role configurations
  const roleConfigs = {
    super_admin: {
      description: "Unrestricted system access - bypasses all checks",
      icon: Shield,
      color: "bg-red-100 text-red-800",
    },
    admin: {
      description: "Full system access & management",
      icon: Shield,
      color: "bg-purple-100 text-purple-800",
    },
    doctor: {
      description: "Patient care & medical records",
      icon: Stethoscope,
      color: "bg-blue-100 text-blue-800",
    },
    nurse: {
      description: "Patient care & inventory",
      icon: UserCheck,
      color: "bg-orange-100 text-orange-800",
    },
    receptionist: {
      description: "Appointment & lead management",
      icon: Users,
      color: "bg-green-100 text-green-800",
    },
    accountant: {
      description: "Financial management & reports",
      icon: Calculator,
      color: "bg-pink-100 text-pink-800",
    },
    patient: {
      description: "View appointments, prescriptions & invoices",
      icon: UserCheck,
      color: "bg-teal-100 text-teal-800",
    },
  };

  const fetchDemoUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all active users from the database (no role filtering, higher limit)
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        is_active: 'true',
        limit: '50',
        page: '1'
      });
      
      // Add tenant filter if provided
      if (options?.tenantId) {
        queryParams.append('tenant_id', options.tenantId);
      }
      
      const response = await fetch(`${apiBase}/users/demo?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data.users.length > 0) {
        const demoUsers: DemoAccount[] = data.data.users.map((user: any) => {
          const userRole = user.role.toLowerCase();
          const roleConfig = roleConfigs[userRole as keyof typeof roleConfigs];
          
          // Default config for roles not defined in our roleConfigs
          const defaultConfig = {
            description: "User access and management",
            icon: Users,
            color: "bg-gray-100 text-gray-800",
          };

          const config = roleConfig || defaultConfig;

          // Format role name for display
          const displayRole = user.role === 'super_admin' 
            ? 'Super Admin' 
            : user.role.charAt(0).toUpperCase() + user.role.slice(1);
            
          return {
            role: displayRole,
            email: user.email,
            password: "password123", // All seeded users have this password
            description: config.description,
            icon: config.icon,
            color: config.color,
            firstName: user.first_name,
            lastName: user.last_name,
            userId: user._id
          };
        });

        // Sort users by role priority for better organization
        const rolePriority = {
          'Super Admin': 1,
          'Admin': 2,
          'Doctor': 3,
          'Nurse': 4,
          'Receptionist': 5,
          'Accountant': 6,
          'Patient': 7,
        };

        demoUsers.sort((a, b) => {
          const aPriority = rolePriority[a.role as keyof typeof rolePriority] || 999;
          const bPriority = rolePriority[b.role as keyof typeof rolePriority] || 999;
          return aPriority - bPriority;
        });

        setDemoAccounts(demoUsers);
      } else {
        setDemoAccounts([]);
      }

    } catch (err) {
      console.error('Error fetching demo users:', err);
      setError('Failed to load demo accounts from database');
      
      // Don't fall back to static accounts, leave demoAccounts empty
      setDemoAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemoUsers();
  }, [options?.tenantId]);

  return {
    demoAccounts,
    loading,
    error,
    refetch: fetchDemoUsers
  };
};
