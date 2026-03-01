import { useState, useEffect } from 'react';
import { apiService, User as ApiUser, WorkSchedule } from '@/services/api';
import { toast } from '@/hooks/use-toast';

// Transform API User to frontend Staff type
export const transformUserToStaff = (user: ApiUser) => ({
  id: user._id,
  firstName: user.first_name,
  lastName: user.last_name,
  email: user.email,
  phone: user.phone || '',
  role: user.role as 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'technician',
  department: 'General', // Default department - could be enhanced with a department field
  salary: 0, // This would need to be added to the backend User model
  salesPercentage: user.sales_percentage || 0, // Sales percentage for doctors
  joiningDate: new Date(user.created_at),
  address: '', // This would need to be added to the backend User model
  qualifications: [], // This would need to be added to the backend User model
  schedule: user.schedule || { // Use schedule from backend or default
    monday: { start: '09:00', end: '17:00', isWorking: true },
    tuesday: { start: '09:00', end: '17:00', isWorking: true },
    wednesday: { start: '09:00', end: '17:00', isWorking: true },
    thursday: { start: '09:00', end: '17:00', isWorking: true },
    friday: { start: '09:00', end: '17:00', isWorking: true },
    saturday: { start: '00:00', end: '00:00', isWorking: false },
    sunday: { start: '00:00', end: '00:00', isWorking: false },
  },
  createdAt: new Date(user.created_at),
  updatedAt: new Date(user.updated_at),
  isActive: user.is_active,
});

export interface StaffFilters {
  role?: string;
  department?: string;
  search?: string;
  is_active?: boolean;
}

export const useStaff = () => {
  const [staff, setStaff] = useState<ReturnType<typeof transformUserToStaff>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });

  const fetchStaff = async (filters?: StaffFilters, page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        limit: pagination.limit,
        ...(filters?.role && filters.role !== 'all' && { role: filters.role }),
        ...(filters?.is_active !== undefined && { is_active: filters.is_active }),
        tenantScoped: true, // Force tenant-scoped filtering to show only tenant-related staff
      };

      const response = await apiService.getUsers(params);
      
      let transformedStaff = response.data.users.map(transformUserToStaff);

      // Apply client-side filters for fields not supported by the backend
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        transformedStaff = transformedStaff.filter(member =>
          `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm) ||
          member.email.toLowerCase().includes(searchTerm) ||
          member.phone.includes(searchTerm)
        );
      }

      if (filters?.department && filters.department !== 'all') {
        transformedStaff = transformedStaff.filter(member =>
          member.department === filters.department
        );
      }

      setStaff(transformedStaff);
      setPagination(response.data.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch staff';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createStaff = async (staffData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'staff';
    phone?: string;
  }) => {
    setLoading(true);
    try {
      const newUser = await apiService.createUser(staffData);
      const transformedStaff = transformUserToStaff(newUser);
      setStaff(prev => [transformedStaff, ...prev]);
      
      toast({
        title: "Success",
        description: "Staff member added successfully",
      });
      
      return transformedStaff;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create staff member';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStaff = async (id: string, staffData: Partial<ApiUser>) => {
    setLoading(true);
    try {
      const updatedUser = await apiService.updateUser(id, staffData);
      const transformedStaff = transformUserToStaff(updatedUser);
      
      setStaff(prev => prev.map(member => 
        member.id === id ? transformedStaff : member
      ));
      
      toast({
        title: "Success",
        description: "Staff member updated successfully",
      });
      
      return transformedStaff;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update staff member';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const activateStaff = async (id: string) => {
    try {
      const updatedUser = await apiService.activateUser(id);
      const transformedStaff = transformUserToStaff(updatedUser);
      
      setStaff(prev => prev.map(member => 
        member.id === id ? transformedStaff : member
      ));
      
      toast({
        title: "Success",
        description: "Staff member activated successfully",
      });
      
      return transformedStaff;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to activate staff member';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deactivateStaff = async (id: string) => {
    try {
      const updatedUser = await apiService.deactivateUser(id);
      const transformedStaff = transformUserToStaff(updatedUser);
      
      setStaff(prev => prev.map(member => 
        member.id === id ? transformedStaff : member
      ));
      
      toast({
        title: "Success",
        description: "Staff member deactivated successfully",
      });
      
      return transformedStaff;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate staff member';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateStaffSchedule = async (id: string, schedule: WorkSchedule) => {
    setLoading(true);
    try {
      const updatedUser = await apiService.updateUserSchedule(id, schedule);
      const transformedStaff = transformUserToStaff(updatedUser);
      
      setStaff(prev => prev.map(member => 
        member.id === id ? transformedStaff : member
      ));
      
      toast({
        title: "Success",
        description: "Work schedule updated successfully",
      });
      
      return transformedStaff;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update work schedule';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getStaffStats = () => {
    const totalStaff = staff.length;
    const activeStaff = staff.filter(s => s.isActive).length;
    const doctors = staff.filter(s => s.role === 'doctor').length;
    const nurses = staff.filter(s => s.role === 'nurse').length;
    const totalSalaryBudget = staff.reduce((sum, s) => sum + s.salary, 0);

    return {
      totalStaff,
      activeStaff,
      doctors,
      nurses,
      totalSalaryBudget,
    };
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return {
    staff,
    loading,
    error,
    pagination,
    fetchStaff,
    createStaff,
    updateStaff,
    activateStaff,
    deactivateStaff,
    updateStaffSchedule,
    getStaffStats,
    refetch: fetchStaff,
  };
}; 