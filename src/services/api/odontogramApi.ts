import { 
  Odontogram, 
  CreateOdontogramRequest, 
  UpdateOdontogramRequest,
  CreateToothConditionRequest,
  UpdateToothConditionRequest,
  OdontogramStats,
  OdontogramHistory,
  OdontogramPatientSummary
} from '@/types';
import { clinicCookies } from '@/utils/cookies';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface OdontogramFilters {
  page?: number;
  limit?: number;
  patient_id?: string;
  doctor_id?: string;
  active_only?: boolean;
  start_date?: string;
  end_date?: string;
  search?: string;
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
    odontograms: T[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  };
}

export interface OdontogramHistoryResponse {
  success: boolean;
  data: OdontogramHistory;
}

export interface TreatmentSummaryResponse {
  success: boolean;
  data: {
    patient_summary?: {
      total_planned_treatments: number;
      completed_treatments: number;
      in_progress_treatments: number;
      estimated_total_cost?: number;
    };
    clinic_summary?: OdontogramStats;
    treatment_progress?: number;
    pending_treatments?: number;
  };
}

class OdontogramApi {
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

  // Get all odontograms with filtering
  async getOdontograms(filters: OdontogramFilters = {}): Promise<{ odontograms: Odontogram[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await this.fetchWithRetry(`${API_BASE_URL}/odontograms?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PaginatedResponse<Odontogram> = await response.json();
    return {
      odontograms: data.data.odontograms,
      pagination: data.data.pagination
    };
  }

  // Get odontogram by ID
  async getOdontogramById(id: string): Promise<Odontogram> {
    const response = await this.fetchWithRetry(`${API_BASE_URL}/odontograms/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Odontogram not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<{ odontogram: Odontogram }> = await response.json();
    return data.data.odontogram;
  }

  // Get active odontogram for a patient
  async getActiveOdontogramByPatient(patientId: string): Promise<Odontogram> {
    const response = await this.fetchWithRetry(`${API_BASE_URL}/odontograms/patient/${patientId}/active`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No active odontogram found for this patient');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<{ odontogram: Odontogram }> = await response.json();
    return data.data.odontogram;
  }

  // Get odontogram history for a patient
  async getOdontogramHistory(patientId: string, filters: Pick<OdontogramFilters, 'page' | 'limit'> = {}): Promise<OdontogramHistory> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && (typeof value === 'number' || value !== '')) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await this.fetchWithRetry(`${API_BASE_URL}/odontograms/patient/${patientId}/history?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OdontogramHistoryResponse = await response.json();
    return data.data;
  }

  // Create new odontogram for a patient
  async createOdontogram(patientId: string, odontogramData: CreateOdontogramRequest): Promise<Odontogram> {
    const response = await this.fetchWithRetry(`${API_BASE_URL}/odontograms/patient/${patientId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(odontogramData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<{ odontogram: Odontogram }> = await response.json();
    return data.data.odontogram;
  }

  // Update odontogram
  async updateOdontogram(id: string, odontogramData: UpdateOdontogramRequest): Promise<Odontogram> {
    const response = await this.fetchWithRetry(`${API_BASE_URL}/odontograms/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(odontogramData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<{ odontogram: Odontogram }> = await response.json();
    return data.data.odontogram;
  }

  // Update specific tooth condition
  async updateToothCondition(id: string, toothNumber: number, conditionData: UpdateToothConditionRequest): Promise<Odontogram> {
    const response = await this.fetchWithRetry(`${API_BASE_URL}/odontograms/${id}/tooth/${toothNumber}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(conditionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<{ odontogram: Odontogram; updated_tooth: any }> = await response.json();
    return data.data.odontogram;
  }

  // Set odontogram as active
  async setActiveOdontogram(id: string): Promise<Odontogram> {
    const response = await this.fetchWithRetry(`${API_BASE_URL}/odontograms/${id}/activate`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<{ odontogram: Odontogram }> = await response.json();
    return data.data.odontogram;
  }

  // Delete odontogram
  async deleteOdontogram(id: string): Promise<void> {
    const response = await this.fetchWithRetry(`${API_BASE_URL}/odontograms/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }

  // Get treatment summary (clinic-wide)
  async getTreatmentSummary(): Promise<OdontogramStats> {
    const response = await this.fetchWithRetry(`${API_BASE_URL}/odontograms/summary/treatment`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TreatmentSummaryResponse = await response.json();
    return data.data.clinic_summary || {
      total_patients: 0,
      total_planned_treatments: 0,
      total_completed_treatments: 0,
      total_in_progress_treatments: 0,
      total_pending_treatments: 0,
      total_estimated_cost: 0,
      completion_rate: 0
    };
  }

  // Get patient odontogram history
  async getPatientHistory(patientId: string, params?: { page?: number; limit?: number }): Promise<{
    odontograms: Odontogram[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await this.fetchWithRetry(
      `${API_BASE_URL}/odontograms/patient/${patientId}/history?${queryParams}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<{
      odontograms: Odontogram[];
      pagination: {
        current_page: number;
        total_pages: number;
        total_items: number;
        items_per_page: number;
      };
    }> = await response.json();
    
    return data.data;
  }

  // Get treatment summary for specific patient
  async getPatientTreatmentSummary(patientId: string): Promise<{
    patient_summary: any;
    treatment_progress: number;
    pending_treatments: number;
  }> {
    const response = await this.fetchWithRetry(`${API_BASE_URL}/odontograms/patient/${patientId}/summary`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TreatmentSummaryResponse = await response.json();
    return {
      patient_summary: data.data.patient_summary || {
        total_planned_treatments: 0,
        completed_treatments: 0,
        in_progress_treatments: 0,
        estimated_total_cost: 0
      },
      treatment_progress: data.data.treatment_progress || 0,
      pending_treatments: data.data.pending_treatments || 0
    };
  }

  // Get odontograms for a specific patient
  async getPatientOdontograms(patientId: string, filters: Pick<OdontogramFilters, 'page' | 'limit'> = {}): Promise<{ odontograms: Odontogram[]; pagination: any }> {
    return this.getOdontograms({
      ...filters,
      patient_id: patientId
    });
  }

  // Get odontograms by doctor
  async getDoctorOdontograms(doctorId: string, filters: Pick<OdontogramFilters, 'page' | 'limit' | 'start_date' | 'end_date'> = {}): Promise<{ odontograms: Odontogram[]; pagination: any }> {
    return this.getOdontograms({
      ...filters,
      doctor_id: doctorId
    });
  }

  // Get recent odontograms (last 30 days)
  async getRecentOdontograms(limit: number = 10): Promise<Odontogram[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.getOdontograms({
      start_date: thirtyDaysAgo.toISOString(),
      limit
    });

    return result.odontograms;
  }

  // Check if patient has active odontogram
  async hasActiveOdontogram(patientId: string): Promise<boolean> {
    try {
      await this.getActiveOdontogramByPatient(patientId);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Create tooth condition (convenience method)
  async createToothCondition(odontogramId: string, conditionData: CreateToothConditionRequest): Promise<Odontogram> {
    return this.updateToothCondition(odontogramId, conditionData.tooth_number, conditionData);
  }

  // Get treatment progress for multiple patients
  async getBulkTreatmentProgress(patientIds: string[]): Promise<Record<string, number>> {
    const progressMap: Record<string, number> = {};
    
    // Note: This could be optimized with a bulk API endpoint in the future
    await Promise.all(
      patientIds.map(async (patientId) => {
        try {
          const summary = await this.getPatientTreatmentSummary(patientId);
          progressMap[patientId] = summary.treatment_progress;
        } catch (error) {
          progressMap[patientId] = 0;
        }
      })
    );

    return progressMap;
  }

  // Upload attachment for tooth condition
  async uploadToothAttachment(file: File, toothNumber: number, description?: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('toothNumber', toothNumber.toString());
    if (description) {
      formData.append('description', description);
    }

    const response = await this.fetchWithRetry(`${API_BASE_URL}/odontograms/attachments/upload`, {
      method: 'POST',
      headers: {
        ...(clinicCookies.getClinicToken() && { Authorization: `Bearer ${clinicCookies.getClinicToken()}` }),
        ...(clinicCookies.getClinicId() && { 'X-Clinic-Id': clinicCookies.getClinicId() }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<{ file_url: string }> = await response.json();
    return data.data.file_url;
  }

  // Utility: Recalculate treatment summaries for all odontograms
  async recalculateTreatmentSummaries(): Promise<{
    message: string;
    total_processed: number;
    updated_count: number;
  }> {
    const response = await this.fetchWithRetry(`${API_BASE_URL}/odontograms/admin/recalculate-summaries`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<{
      message: string;
      total_processed: number;
      updated_count: number;
    }> = await response.json();
    
    return data.data;
  }
}

export default new OdontogramApi();
