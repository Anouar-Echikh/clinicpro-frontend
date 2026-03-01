import { Service } from '@/types';
import { clinicCookies } from '@/utils/cookies';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface ServiceFilters {
  search?: string;
  category?: string;
  department?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  page?: number;
  limit?: number;
}

export interface ServiceStats {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  categoryStats: Array<{
    _id: string;
    count: number;
    activeCount: number;
    totalRevenue: number;
    avgPrice: number;
  }>;
  departmentStats: Array<{
    _id: string;
    count: number;
    activeCount: number;
    totalRevenue: number;
    avgPrice: number;
  }>;
  priceRanges: Array<{
    _id: number;
    count: number;
    avgDuration: number;
  }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any[];
}

export interface CreateServiceRequest {
  name: string;
  category: string;
  description: string;
  duration: number;
  price: number;
  department: string;
  isActive?: boolean;
  prerequisites?: string;
  followUpRequired: boolean;
  maxBookingsPerDay: number;
  specialInstructions?: string;
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {}

class ServiceApi {
  // Get headers with authentication and clinic context
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add authentication token
    const token = clinicCookies.getClinicToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Add clinic context header
    const clinicId = clinicCookies.getClinicId();
    if (clinicId) {
      headers['X-Clinic-Id'] = clinicId;
    }

    return headers;
  }

  // Get all services with filtering
  async getServices(filters: ServiceFilters = {}): Promise<PaginatedResponse<Service>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/services?${queryParams}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform backend data to frontend Service interface
    const transformedData = {
      ...data,
      data: data.data.map((service: any) => ({
        id: service._id,
        name: service.name,
        category: service.category,
        description: service.description,
        duration: service.duration,
        price: service.price,
        department: service.department,
        isActive: service.isActive,
        prerequisites: service.prerequisites,
        followUpRequired: service.followUpRequired,
        maxBookingsPerDay: service.maxBookingsPerDay,
        specialInstructions: service.specialInstructions,
        createdAt: new Date(service.created_at),
        updatedAt: new Date(service.updated_at)
      }))
    };

    return transformedData;
  }

  // Get service by ID
  async getServiceById(id: string): Promise<Service> {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform backend data to frontend Service interface
    const service = data.data;
    return {
      id: service._id,
      name: service.name,
      category: service.category,
      description: service.description,
      duration: service.duration,
      price: service.price,
      department: service.department,
      isActive: service.isActive,
      prerequisites: service.prerequisites,
      followUpRequired: service.followUpRequired,
      maxBookingsPerDay: service.maxBookingsPerDay,
      specialInstructions: service.specialInstructions,
      createdAt: new Date(service.created_at),
      updatedAt: new Date(service.updated_at)
    };
  }

  // Create new service
  async createService(serviceData: CreateServiceRequest): Promise<Service> {
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(serviceData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform backend data to frontend Service interface
    const service = data.data;
    return {
      id: service._id,
      name: service.name,
      category: service.category,
      description: service.description,
      duration: service.duration,
      price: service.price,
      department: service.department,
      isActive: service.isActive,
      prerequisites: service.prerequisites,
      followUpRequired: service.followUpRequired,
      maxBookingsPerDay: service.maxBookingsPerDay,
      specialInstructions: service.specialInstructions,
      createdAt: new Date(service.created_at),
      updatedAt: new Date(service.updated_at)
    };
  }

  // Update service
  async updateService(id: string, serviceData: UpdateServiceRequest): Promise<Service> {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(serviceData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform backend data to frontend Service interface
    const service = data.data;
    return {
      id: service._id,
      name: service.name,
      category: service.category,
      description: service.description,
      duration: service.duration,
      price: service.price,
      department: service.department,
      isActive: service.isActive,
      prerequisites: service.prerequisites,
      followUpRequired: service.followUpRequired,
      maxBookingsPerDay: service.maxBookingsPerDay,
      specialInstructions: service.specialInstructions,
      createdAt: new Date(service.created_at),
      updatedAt: new Date(service.updated_at)
    };
  }

  // Delete service
  async deleteService(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }

  // Toggle service status
  async toggleServiceStatus(id: string): Promise<Service> {
    const response = await fetch(`${API_BASE_URL}/services/${id}/toggle-status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform backend data to frontend Service interface
    const service = data.data;
    return {
      id: service._id,
      name: service.name,
      category: service.category,
      description: service.description,
      duration: service.duration,
      price: service.price,
      department: service.department,
      isActive: service.isActive,
      prerequisites: service.prerequisites,
      followUpRequired: service.followUpRequired,
      maxBookingsPerDay: service.maxBookingsPerDay,
      specialInstructions: service.specialInstructions,
      createdAt: new Date(service.created_at),
      updatedAt: new Date(service.updated_at)
    };
  }

  // Get service statistics
  async getServiceStats(): Promise<ServiceStats> {
    const response = await fetch(`${API_BASE_URL}/services/stats`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }
}

export const serviceApi = new ServiceApi();
export default serviceApi; 