// Define axios client similar to existing API pattern
import axios, { AxiosInstance } from 'axios';

import { clinicCookies } from '@/utils/cookies';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = clinicCookies.getClinicToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clinicCookies.clearClinicData();
      localStorage.removeItem('clinic_user'); // Keep this for backward compatibility
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface TrainingModule {
  _id?: string;
  title: string;
  duration: string;
  lessons: string[];
  description?: string;
  order: number;
}

export interface Training {
  _id: string;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'accountant';
  name: string;
  description: string;
  overview: string;
  modules: TrainingModule[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModuleProgress {
  module_id: string;
  module_title: string;
  completed: boolean;
  completed_at?: string;
  lessons_completed: string[];
  progress_percentage: number;
}

export interface TrainingProgress {
  _id: string;
  user_id: string;
  training_id: string | Training;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'accountant';
  overall_progress: number;
  modules_progress: ModuleProgress[];
  started_at: string;
  last_accessed: string;
  completed_at?: string;
  is_completed: boolean;
  certificate_issued: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrainingAnalytics {
  role: string;
  total_users: number;
  completed_trainings: number;
  in_progress: number;
  certificates_issued: number;
  completion_rate: number;
  avg_completion_days: number;
  avg_progress: number;
}

export interface Certificate {
  id: string;
  issued_date: string;
  training_name: string;
  user_name: string;
  completion_date: string;
}

// Training API service following the existing pattern
export const trainingApi = {
  // Get all trainings or filter by role
  getTrainings: async (role?: string): Promise<{ trainings: Training[] }> => {
    const params = role ? { role } : {};
    const response = await apiClient.get<ApiResponse<{ trainings: Training[] }>>('/training', { params });
    return response.data.data!;
  },

  // Get training by role
  getTrainingByRole: async (role: string): Promise<{ training: Training }> => {
    const response = await apiClient.get<ApiResponse<{ training: Training }>>(`/training/role/${role}`);
    return response.data.data!;
  },

  // Protected API functions (authentication required)
  // Get user's training progress
  getUserProgress: async (role?: string): Promise<{ progress: TrainingProgress[] }> => {
    const params = role ? { role } : {};
    const response = await apiClient.get<ApiResponse<{ progress: TrainingProgress[] }>>('/training/progress', { params });
    return response.data.data!;
  },

  // Start training for a user
  startTraining: async (payload: {
    trainingId: string;
    role?: string;
  }): Promise<{ progress: TrainingProgress }> => {
    const response = await apiClient.post<ApiResponse<{ progress: TrainingProgress }>>('/training/start', payload);
    return response.data.data!;
  },

  // Update module progress
  updateModuleProgress: async (
    progressId: string,
    payload: {
      moduleId: string;
      completed: boolean;
      lessonsCompleted?: string[];
      progressPercentage?: number;
    }
  ): Promise<{ progress: TrainingProgress }> => {
    const response = await apiClient.put<ApiResponse<{ progress: TrainingProgress }>>(
      `/training/progress/${progressId}/module`, 
      payload
    );
    return response.data.data!;
  },

  // Complete training
  completeTraining: async (progressId: string): Promise<{ progress: TrainingProgress }> => {
    const response = await apiClient.put<ApiResponse<{ progress: TrainingProgress }>>(
      `/training/progress/${progressId}/complete`
    );
    return response.data.data!;
  },

  // Issue certificate
  issueCertificate: async (progressId: string): Promise<{
    progress: TrainingProgress;
    certificate: Certificate;
  }> => {
    const response = await apiClient.post<ApiResponse<{
      progress: TrainingProgress;
      certificate: Certificate;
    }>>(`/training/progress/${progressId}/certificate`);
    return response.data.data!;
  },

  // Admin API functions
  // Create or update training content
  createOrUpdateTraining: async (payload: {
    role: string;
    name: string;
    description: string;
    overview: string;
    modules: Omit<TrainingModule, '_id'>[];
  }): Promise<{ training: Training }> => {
    const response = await apiClient.post<ApiResponse<{ training: Training }>>(
      '/training/admin/content', 
      payload
    );
    return response.data.data!;
  },

  // Get training analytics
  getTrainingAnalytics: async (filters?: {
    role?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ analytics: TrainingAnalytics[] }> => {
    const response = await apiClient.get<ApiResponse<{ analytics: TrainingAnalytics[] }>>(
      '/training/admin/analytics', 
      { params: filters }
    );
    return response.data.data!;
  },
};

// Helper functions for frontend components
export const trainingHelpers = {
  // Calculate overall progress percentage
  calculateProgress: (modules: ModuleProgress[]): number => {
    if (!modules || modules.length === 0) return 0;
    const completedModules = modules.filter(m => m.completed).length;
    return Math.round((completedModules / modules.length) * 100);
  },

  // Get next incomplete module
  getNextModule: (modules: ModuleProgress[]): ModuleProgress | null => {
    return modules.find(m => !m.completed) || null;
  },

  // Check if training is completed
  isTrainingCompleted: (modules: ModuleProgress[]): boolean => {
    return modules.every(m => m.completed);
  },

  // Get role display name
  getRoleDisplayName: (role: string): string => {
    const roleNames: Record<string, string> = {
      admin: 'Administrator',
      doctor: 'Doctor',
      nurse: 'Nurse',
      receptionist: 'Receptionist',
      accountant: 'Accountant'
    };
    return roleNames[role] || role;
  },

  // Format duration
  formatDuration: (duration: string): string => {
    return duration.replace(/(\d+)\s*(mins?|minutes?)/i, '$1 minutes');
  },

  // Get module completion rate
  getModuleCompletionRate: (module: ModuleProgress): number => {
    if (module.completed) return 100;
    return module.progress_percentage || 0;
  },

  // Calculate estimated time remaining
  getEstimatedTimeRemaining: (training: Training, progress: TrainingProgress): string => {
    const incompleteModules = progress.modules_progress.filter(m => !m.completed);
    if (incompleteModules.length === 0) return '0 minutes';
    
    const totalMinutes = incompleteModules.reduce((total, moduleProgress) => {
      const trainingModule = training.modules.find(tm => 
        tm._id?.toString() === moduleProgress.module_id || 
        tm.title === moduleProgress.module_title
      );
      if (trainingModule) {
        const minutes = parseInt(trainingModule.duration.replace(/\D/g, '')) || 0;
        return total + minutes;
      }
      return total;
    }, 0);
    
    if (totalMinutes < 60) return `${totalMinutes} minutes`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  },

  // Get training status
  getTrainingStatus: (progress: TrainingProgress): 'not-started' | 'in-progress' | 'completed' => {
    if (progress.is_completed) return 'completed';
    if (progress.overall_progress > 0) return 'in-progress';
    return 'not-started';
  },

  // Generate certificate data
  generateCertificateData: (progress: TrainingProgress, training: Training) => {
    return {
      id: progress._id,
      trainingName: training.name,
      role: progress.role,
      completionDate: progress.completed_at,
      issuedDate: new Date().toISOString(),
      certificateNumber: `CERT-${progress._id.slice(-6).toUpperCase()}`,
    };
  }
}; 