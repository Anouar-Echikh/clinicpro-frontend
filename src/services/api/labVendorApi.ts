import { LabVendor, CreateLabVendorRequest, LabVendorStats } from '@/types';
import { clinicCookies } from '@/utils/cookies';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface LabVendorFilters {
  search?: string;
  type?: string;
  status?: string;
  specialty?: string;
  pricing?: string;
  minRating?: number;
  page?: number;
  limit?: number;
  tenantScoped?: boolean;
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

class LabVendorApi {
  // Helper function to get auth headers
  private getAuthHeaders(): HeadersInit {
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

  // Get all lab vendors with filtering
  async getLabVendors(filters: LabVendorFilters = {}): Promise<PaginatedResponse<LabVendor>> {
    const queryParams = new URLSearchParams();
    
    // Process filters, excluding our custom parameters
    const apiFilters = { ...filters };
    if (filters.tenantScoped) {
      // Remove our custom parameter before sending to API
      delete apiFilters.tenantScoped;
      // The backend should automatically apply tenant filtering based on auth context
      // No additional parameter needed - the middleware handles this
    }
    
    Object.entries(apiFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/lab-vendors?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform backend data to frontend LabVendor interface
    const transformedData = {
      ...data,
      data: data.data.labVendors.map((vendor: any) => ({
        id: vendor._id,
        _id: vendor._id,
        name: vendor.name,
        code: vendor.code,
        type: vendor.type,
        status: vendor.status,
        contactPerson: vendor.contactPerson,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        city: vendor.city,
        state: vendor.state,
        zipCode: vendor.zipCode,
        website: vendor.website,
        license: vendor.license,
        accreditation: vendor.accreditation,
        specialties: vendor.specialties,
        rating: vendor.rating,
        totalTests: vendor.totalTests,
        averageTurnaround: vendor.averageTurnaround,
        pricing: vendor.pricing,
        contractStart: new Date(vendor.contractStart),
        contractEnd: new Date(vendor.contractEnd),
        lastTestDate: vendor.lastTestDate ? new Date(vendor.lastTestDate) : undefined,
        notes: vendor.notes,
        createdAt: new Date(vendor.created_at),
        updatedAt: new Date(vendor.updated_at),
        created_at: vendor.created_at,
        updated_at: vendor.updated_at
      })),
      pagination: data.data.pagination
    };

    return transformedData;
  }

  // Get lab vendor by ID
  async getLabVendorById(id: string): Promise<LabVendor> {
    const response = await fetch(`${API_BASE_URL}/lab-vendors/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform backend data to frontend LabVendor interface
    const vendor = data.data.labVendor;
    return {
      id: vendor._id,
      _id: vendor._id,
      name: vendor.name,
      code: vendor.code,
      type: vendor.type,
      status: vendor.status,
      contactPerson: vendor.contactPerson,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      city: vendor.city,
      state: vendor.state,
      zipCode: vendor.zipCode,
      website: vendor.website,
      license: vendor.license,
      accreditation: vendor.accreditation,
      specialties: vendor.specialties,
      rating: vendor.rating,
      totalTests: vendor.totalTests,
      averageTurnaround: vendor.averageTurnaround,
      pricing: vendor.pricing,
      contractStart: new Date(vendor.contractStart),
      contractEnd: new Date(vendor.contractEnd),
      lastTestDate: vendor.lastTestDate ? new Date(vendor.lastTestDate) : undefined,
      notes: vendor.notes,
      createdAt: new Date(vendor.created_at),
      updatedAt: new Date(vendor.updated_at),
      created_at: vendor.created_at,
      updated_at: vendor.updated_at
    };
  }

  // Create new lab vendor
  async createLabVendor(vendorData: CreateLabVendorRequest): Promise<LabVendor> {
    const response = await fetch(`${API_BASE_URL}/lab-vendors`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(vendorData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Create an error object that mimics axios structure
      const error = new Error(errorData.message || `HTTP error! status: ${response.status}`) as any;
      error.response = {
        data: errorData,
        status: response.status,
        statusText: response.statusText
      };
      throw error;
    }

    const data = await response.json();
    
    // Transform backend data to frontend LabVendor interface
    const vendor = data.data.labVendor;
    return {
      id: vendor._id,
      _id: vendor._id,
      name: vendor.name,
      code: vendor.code,
      type: vendor.type,
      status: vendor.status,
      contactPerson: vendor.contactPerson,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      city: vendor.city,
      state: vendor.state,
      zipCode: vendor.zipCode,
      website: vendor.website,
      license: vendor.license,
      accreditation: vendor.accreditation,
      specialties: vendor.specialties,
      rating: vendor.rating,
      totalTests: vendor.totalTests,
      averageTurnaround: vendor.averageTurnaround,
      pricing: vendor.pricing,
      contractStart: new Date(vendor.contractStart),
      contractEnd: new Date(vendor.contractEnd),
      lastTestDate: vendor.lastTestDate ? new Date(vendor.lastTestDate) : undefined,
      notes: vendor.notes,
      createdAt: new Date(vendor.created_at),
      updatedAt: new Date(vendor.updated_at),
      created_at: vendor.created_at,
      updated_at: vendor.updated_at
    };
  }

  // Update lab vendor
  async updateLabVendor(id: string, vendorData: Partial<CreateLabVendorRequest>): Promise<LabVendor> {
    const response = await fetch(`${API_BASE_URL}/lab-vendors/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(vendorData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform backend data to frontend LabVendor interface
    const vendor = data.data.labVendor;
    return {
      id: vendor._id,
      _id: vendor._id,
      name: vendor.name,
      code: vendor.code,
      type: vendor.type,
      status: vendor.status,
      contactPerson: vendor.contactPerson,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      city: vendor.city,
      state: vendor.state,
      zipCode: vendor.zipCode,
      website: vendor.website,
      license: vendor.license,
      accreditation: vendor.accreditation,
      specialties: vendor.specialties,
      rating: vendor.rating,
      totalTests: vendor.totalTests,
      averageTurnaround: vendor.averageTurnaround,
      pricing: vendor.pricing,
      contractStart: new Date(vendor.contractStart),
      contractEnd: new Date(vendor.contractEnd),
      lastTestDate: vendor.lastTestDate ? new Date(vendor.lastTestDate) : undefined,
      notes: vendor.notes,
      createdAt: new Date(vendor.created_at),
      updatedAt: new Date(vendor.updated_at),
      created_at: vendor.created_at,
      updated_at: vendor.updated_at
    };
  }

  // Delete lab vendor
  async deleteLabVendor(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/lab-vendors/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }

  // Update lab vendor status
  async updateLabVendorStatus(id: string, status: 'active' | 'inactive' | 'pending' | 'suspended'): Promise<LabVendor> {
    const response = await fetch(`${API_BASE_URL}/lab-vendors/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform backend data to frontend LabVendor interface
    const vendor = data.data.labVendor;
    return {
      id: vendor._id,
      _id: vendor._id,
      name: vendor.name,
      code: vendor.code,
      type: vendor.type,
      status: vendor.status,
      contactPerson: vendor.contactPerson,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      city: vendor.city,
      state: vendor.state,
      zipCode: vendor.zipCode,
      website: vendor.website,
      license: vendor.license,
      accreditation: vendor.accreditation,
      specialties: vendor.specialties,
      rating: vendor.rating,
      totalTests: vendor.totalTests,
      averageTurnaround: vendor.averageTurnaround,
      pricing: vendor.pricing,
      contractStart: new Date(vendor.contractStart),
      contractEnd: new Date(vendor.contractEnd),
      lastTestDate: vendor.lastTestDate ? new Date(vendor.lastTestDate) : undefined,
      notes: vendor.notes,
      createdAt: new Date(vendor.created_at),
      updatedAt: new Date(vendor.updated_at),
      created_at: vendor.created_at,
      updated_at: vendor.updated_at
    };
  }

  // Update test count
  async updateTestCount(id: string, increment: number = 1): Promise<LabVendor> {
    const response = await fetch(`${API_BASE_URL}/lab-vendors/${id}/test-count`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ increment }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform backend data to frontend LabVendor interface
    const vendor = data.data.labVendor;
    return {
      id: vendor._id,
      _id: vendor._id,
      name: vendor.name,
      code: vendor.code,
      type: vendor.type,
      status: vendor.status,
      contactPerson: vendor.contactPerson,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      city: vendor.city,
      state: vendor.state,
      zipCode: vendor.zipCode,
      website: vendor.website,
      license: vendor.license,
      accreditation: vendor.accreditation,
      specialties: vendor.specialties,
      rating: vendor.rating,
      totalTests: vendor.totalTests,
      averageTurnaround: vendor.averageTurnaround,
      pricing: vendor.pricing,
      contractStart: new Date(vendor.contractStart),
      contractEnd: new Date(vendor.contractEnd),
      lastTestDate: vendor.lastTestDate ? new Date(vendor.lastTestDate) : undefined,
      notes: vendor.notes,
      createdAt: new Date(vendor.created_at),
      updatedAt: new Date(vendor.updated_at),
      created_at: vendor.created_at,
      updated_at: vendor.updated_at
    };
  }

  // Get lab vendor statistics
  async getLabVendorStats(params?: { tenantScoped?: boolean }): Promise<LabVendorStats> {
    const queryParams = new URLSearchParams();
    
    // If tenant-scoped is requested, ensure we get tenant-filtered results
    // This is especially important for super_admin users
    if (params?.tenantScoped) {
      // The backend should automatically apply tenant filtering based on auth context
      // No additional parameter needed - the middleware handles this
    }
    
    const url = `${API_BASE_URL}/lab-vendors/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Get contract expiring vendors
  async getContractExpiringVendors(days: number = 30): Promise<LabVendor[]> {
    const response = await fetch(`${API_BASE_URL}/lab-vendors/contract-expiring?days=${days}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform backend data to frontend LabVendor interface
    return data.data.expiringVendors.map((vendor: any) => ({
      id: vendor._id,
      _id: vendor._id,
      name: vendor.name,
      code: vendor.code,
      type: vendor.type,
      status: vendor.status,
      contactPerson: vendor.contactPerson,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      city: vendor.city,
      state: vendor.state,
      zipCode: vendor.zipCode,
      website: vendor.website,
      license: vendor.license,
      accreditation: vendor.accreditation,
      specialties: vendor.specialties,
      rating: vendor.rating,
      totalTests: vendor.totalTests,
      averageTurnaround: vendor.averageTurnaround,
      pricing: vendor.pricing,
      contractStart: new Date(vendor.contractStart),
      contractEnd: new Date(vendor.contractEnd),
      lastTestDate: vendor.lastTestDate ? new Date(vendor.lastTestDate) : undefined,
      notes: vendor.notes,
      createdAt: new Date(vendor.created_at),
      updatedAt: new Date(vendor.updated_at),
      created_at: vendor.created_at,
      updated_at: vendor.updated_at
    }));
  }

  // Get test history for a vendor
  async getTestHistory(vendorId: string, filters: { page?: number; limit?: number; dateFrom?: string; dateTo?: string } = {}): Promise<{
    tests: TestRecord[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/lab-vendors/${vendorId}/test-history?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Get contract details for a vendor
  async getContractDetails(vendorId: string): Promise<ContractDetails> {
    const response = await fetch(`${API_BASE_URL}/lab-vendors/${vendorId}/contract`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data.contract;
  }

  // Update contract details
  async updateContractDetails(vendorId: string, contractData: Partial<ContractDetails>): Promise<ContractDetails> {
    const response = await fetch(`${API_BASE_URL}/lab-vendors/${vendorId}/contract`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(contractData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data.contract;
  }

  // Get billing and payment information
  async getBillingPayments(vendorId: string, filters: { page?: number; limit?: number; year?: number; month?: number } = {}): Promise<{
    payments: PaymentRecord[];
    summary: BillingSummary;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && (typeof value === 'number' || value !== '')) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/lab-vendors/${vendorId}/billing?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Record a payment
  async recordPayment(vendorId: string, paymentData: {
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    reference?: string;
    notes?: string;
  }): Promise<PaymentRecord> {
    const response = await fetch(`${API_BASE_URL}/lab-vendors/${vendorId}/payments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data.payment;
  }
}

// Additional interfaces for the new functionality
export interface TestRecord {
  id: string;
  testId: string;
  patientId: string;
  patientName: string;
  testType: string;
  orderDate: Date;
  completionDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  cost: number;
  results?: string;
  notes?: string;
}

export interface ContractDetails {
  id: string;
  vendorId: string;
  contractNumber: string;
  startDate: Date;
  endDate: Date;
  renewalDate?: Date;
  status: 'active' | 'expired' | 'pending_renewal' | 'terminated';
  terms: string;
  paymentTerms: string;
  serviceLevels: {
    turnaroundTime: string;
    accuracyGuarantee: number;
    availabilityHours: string;
  };
  pricing: {
    baseRate: number;
    discountPercentage: number;
    minimumVolume?: number;
    penalties?: string;
  };
  autoRenewal: boolean;
  notificationDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRecord {
  id: string;
  vendorId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'bank_transfer' | 'check' | 'credit_card' | 'ach' | 'wire';
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
  notes?: string;
  createdAt: Date;
}

export interface BillingSummary {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  lastPaymentDate?: Date;
  nextPaymentDue?: Date;
  averageMonthlySpend: number;
}

export const labVendorApi = new LabVendorApi();
export default labVendorApi; 