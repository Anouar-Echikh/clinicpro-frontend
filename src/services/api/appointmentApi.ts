import { clinicCookies } from '@/utils/cookies';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface AppointmentFilters {
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
  doctor_id?: string;
  patient_id?: string;
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
    appointments: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface BackendAppointment {
  _id: string;
  patient_id: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: Date;
    gender: string;
  };
  doctor_id: {
    _id: string;
    first_name: string;
    last_name: string;
    role: string;
    email: string;
    phone: string;
  };
  appointment_date: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  type: 'consultation' | 'follow-up' | 'check-up' | 'vaccination' | 'procedure' | 'emergency' | 'screening' | 'therapy' | 'other';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: "appointment" | "surgery" | "consultation" | "emergency" | "meeting";
  patientName?: string;
  doctorName: string;
  startTime: Date;
  endTime: Date;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show";
  room?: string;
  notes?: string;
  color: string;
}

export interface CreateAppointmentRequest {
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  duration: number;
  type: 'consultation' | 'follow-up' | 'check-up' | 'vaccination' | 'procedure' | 'emergency' | 'screening' | 'therapy' | 'other';
  notes?: string;
}

export interface UpdateAppointmentRequest {
  patient_id?: string;
  doctor_id?: string;
  nurse_id?: string;
  appointment_date?: string;
  duration?: number;
  type?: 'consultation' | 'follow-up' | 'check-up' | 'vaccination' | 'procedure' | 'emergency' | 'screening' | 'therapy' | 'other';
  status?: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
}

class AppointmentApi {
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

  // Helper function to transform backend appointment to calendar event
  private transformToCalendarEvent(appointment: BackendAppointment): CalendarEvent {
    const startTime = new Date(appointment.appointment_date);
    const endTime = new Date(startTime.getTime() + appointment.duration * 60000);
    
    // Get type-specific color and title
    const getEventTypeInfo = (type: string) => {
      switch (type) {
        case 'consultation':
          return { color: '#3B82F6', eventType: 'consultation' as const };
        case 'emergency':
          return { color: '#EF4444', eventType: 'emergency' as const };
        case 'procedure':
          return { color: '#EC4899', eventType: 'surgery' as const };
        case 'follow-up':
          return { color: '#10B981', eventType: 'appointment' as const };
        default:
          return { color: '#8B5CF6', eventType: 'appointment' as const };
      }
    };

    const { color, eventType } = getEventTypeInfo(appointment.type);
    
    return {
      id: appointment._id,
      title: `${appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}`,
      type: eventType,
      patientName: appointment.patient_id 
        ? `${appointment.patient_id.first_name} ${appointment.patient_id.last_name}`
        : 'Unknown Patient',
      doctorName: appointment.doctor_id
        ? `Dr. ${appointment.doctor_id.first_name} ${appointment.doctor_id.last_name}`
        : 'Unknown Doctor',
      startTime,
      endTime,
      status: appointment.status,
      notes: appointment.notes,
      color,
    };
  }

  // Get all appointments with filtering
  async getAppointments(filters: AppointmentFilters = {}): Promise<CalendarEvent[]> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await this.fetchWithRetry(`${API_BASE_URL}/appointments?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PaginatedResponse<BackendAppointment> = await response.json();
    
    // Transform backend data to calendar events
    return data.data.appointments.map(this.transformToCalendarEvent);
  }

  // Get upcoming appointments
  async getUpcomingAppointments(limit: number = 10): Promise<CalendarEvent[]> {
    const response = await fetch(`${API_BASE_URL}/appointments/upcoming?limit=${limit}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<{ appointments: BackendAppointment[] }> = await response.json();
    
    // Transform backend data to calendar events
    return data.data.appointments.map(this.transformToCalendarEvent);
  }

  // Get doctor schedule for a specific date
  async getDoctorSchedule(doctorId: string, date: string): Promise<CalendarEvent[]> {
    const response = await fetch(`${API_BASE_URL}/appointments/doctor/${doctorId}/schedule?date=${date}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<{ appointments: BackendAppointment[] }> = await response.json();
    
    // Transform backend data to calendar events
    return data.data.appointments.map(this.transformToCalendarEvent);
  }

  // Get appointment by ID
  async getAppointmentById(id: string): Promise<CalendarEvent> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<{ appointment: BackendAppointment }> = await response.json();
    
    return this.transformToCalendarEvent(data.data.appointment);
  }

  // Create new appointment
  async createAppointment(appointmentData: CreateAppointmentRequest): Promise<CalendarEvent> {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(appointmentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<{ appointment: BackendAppointment }> = await response.json();
    
    return this.transformToCalendarEvent(data.data.appointment);
  }

  // Update appointment
  async updateAppointment(id: string, appointmentData: UpdateAppointmentRequest): Promise<CalendarEvent> {
    console.log('updateAppointment called with:', { id, appointmentData });
    
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(appointmentData),
    });

    console.log('updateAppointment response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('updateAppointment error response:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<{ appointment: BackendAppointment }> = await response.json();
    console.log('updateAppointment success response:', data);
    
    return this.transformToCalendarEvent(data.data.appointment);
  }

  // Cancel appointment
  async cancelAppointment(id: string): Promise<CalendarEvent> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/cancel`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<{ appointment: BackendAppointment }> = await response.json();
    
    return this.transformToCalendarEvent(data.data.appointment);
  }

  // Get appointments for date range (useful for calendar view)
  async getAppointmentsInRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    return this.getAppointments({
      start_date: startDate,
      end_date: endDate,
      limit: 100, // Get more events for calendar view
    });
  }

  // Get appointments for today
  async getTodayAppointments(): Promise<CalendarEvent[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    return this.getAppointmentsInRange(
      startOfDay.toISOString(),
      endOfDay.toISOString()
    );
  }

  // Get this week's appointments
  async getThisWeekAppointments(): Promise<CalendarEvent[]> {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    return this.getAppointmentsInRange(
      startOfWeek.toISOString(),
      endOfWeek.toISOString()
    );
  }

  // Get this month's appointments
  async getThisMonthAppointments(): Promise<CalendarEvent[]> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return this.getAppointmentsInRange(
      startOfMonth.toISOString(),
      endOfMonth.toISOString()
    );
  }
}

export default new AppointmentApi(); 