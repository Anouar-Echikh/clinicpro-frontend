import { clinicCookies } from '@/utils/cookies';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: string;
  is_active?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    users: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface BackendUser {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'accountant' | 'staff';
  phone: string;
  is_active: boolean;
  base_currency: string;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
}

class UserApi {
  // Helper function to get auth headers
  private getAuthHeaders() {
    const token = clinicCookies.getClinicToken();
    const clinicId = clinicCookies.getClinicId();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(clinicId && { 'X-Clinic-Id': clinicId }),
    };
  }

  // Helper function to handle rate limiting and retries
  private async fetchWithRetry(url: string, options: RequestInit, maxRetries: number = 3): Promise<Response> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        if (response.status === 429) {
          // Rate limit hit, wait before retry
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000; // Exponential backoff
          
          if (attempt < maxRetries) {
            console.warn(`Rate limit hit, retrying in ${waitTime}ms (attempt ${attempt}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
        
        return response;
      } catch (error) {
        if (attempt === maxRetries) throw error;
        
        // Wait before retry on network error
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  // Helper function to transform backend user to doctor
  private transformToDoctor(user: BackendUser): Doctor {
    return {
      id: user._id,
      name: `Dr. ${user.first_name} ${user.last_name}`,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.is_active,
    };
  }

  // Get all users with filtering
  async getUsers(filters: UserFilters = {}): Promise<Doctor[]> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await this.fetchWithRetry(`${API_BASE_URL}/users?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PaginatedResponse<BackendUser> = await response.json();
    
    // Transform backend data to doctor objects
    return data.data.users.map(this.transformToDoctor);
  }

  // Get all doctors
  async getDoctors(): Promise<Doctor[]> {
    return this.getUsers({
      role: 'doctor',
      is_active: true,
      limit: 100, // Get all active doctors
    });
  }

  // Get user by ID
  async getUserById(id: string): Promise<Doctor> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<{ user: BackendUser }> = await response.json();
    
    return this.transformToDoctor(data.data.user);
  }

  // Get active staff members
  async getActiveStaff(): Promise<Doctor[]> {
    return this.getUsers({
      is_active: true,
      limit: 100,
    });
  }

  // Get medical staff (doctors and nurses)
  async getMedicalStaff(): Promise<Doctor[]> {
    const doctors = await this.getUsers({ role: 'doctor', is_active: true });
    const nurses = await this.getUsers({ role: 'nurse', is_active: true });
    return [...doctors, ...nurses];
  }
}

export default new UserApi(); 