import axios, { AxiosResponse } from 'axios';
import { clinicCookies } from '@/utils/cookies';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Expense Types
export interface Expense {
  _id: string;
  clinic_id: string;
  title: string;
  description?: string;
  amount: number;
  category: 'supplies' | 'equipment' | 'utilities' | 'maintenance' | 'staff' | 'marketing' | 'insurance' | 'rent' | 'other';
  vendor?: string;
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'check';
  date: string;
  status: 'pending' | 'paid' | 'cancelled';
  receipt_url?: string;
  notes?: string;
  created_by: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseRequest {
  title: string;
  description?: string;
  amount: number;
  category: string;
  vendor?: string;
  payment_method: string;
  date: string;
  status?: string;
  receipt_url?: string;
  notes?: string;
}

export interface UpdateExpenseRequest extends Partial<CreateExpenseRequest> {}

export interface ExpenseStats {
  overview: {
    total_expenses: number;
    total_amount: number;
    pending_expenses: number;
    paid_expenses: number;
    cancelled_expenses: number;
    pending_amount: number;
    paid_amount: number;
    monthly_total: number;
    monthly_count: number;
  };
  by_category: Array<{
    _id: string;
    count: number;
    total_amount: number;
    average_amount: number;
  }>;
  by_status: Array<{
    _id: string;
    count: number;
    total_amount: number;
  }>;
  monthly_trend: Array<{
    _id: {
      year: number;
      month: number;
    };
    total_amount: number;
    count: number;
  }>;
}

export interface ExpenseCategory {
  category: string;
  count: number;
  total_amount: number;
  last_expense_date: string | null;
}

export interface ExpenseQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  vendor?: string;
  payment_method?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface BulkExpenseRequest {
  expenses: CreateExpenseRequest[];
}

class ExpenseApiService {
  private api: typeof axios;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/expenses`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include clinic ID and auth token
    this.api.interceptors.request.use((config) => {
      // Migrate from localStorage to cookies if needed
      clinicCookies.migrateFromLocalStorage();

      const clinicId = clinicCookies.getClinicId();
      const token = clinicCookies.getClinicToken();
      
      if (clinicId) {
        config.headers['X-Clinic-ID'] = clinicId;
      }
      
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      return config;
    });
  }

  // Get all expenses with filtering and pagination
  async getExpenses(params?: ExpenseQueryParams): Promise<AxiosResponse<{
    success: boolean;
    data: {
      items: Expense[];
      pagination: {
        page: number;
        pages: number;
        total: number;
        limit: number;
      };
    };
  }>> {
    return this.api.get('/', { params });
  }

  // Get expense by ID
  async getExpenseById(id: string): Promise<AxiosResponse<{
    success: boolean;
    data: Expense;
  }>> {
    return this.api.get(`/${id}`);
  }

  // Create new expense
  async createExpense(data: CreateExpenseRequest): Promise<AxiosResponse<{
    success: boolean;
    message: string;
    data: Expense;
  }>> {
    return this.api.post('/', data);
  }

  // Update expense
  async updateExpense(id: string, data: UpdateExpenseRequest): Promise<AxiosResponse<{
    success: boolean;
    message: string;
    data: Expense;
  }>> {
    return this.api.put(`/${id}`, data);
  }

  // Delete expense
  async deleteExpense(id: string): Promise<AxiosResponse<{
    success: boolean;
    message: string;
  }>> {
    return this.api.delete(`/${id}`);
  }

  // Get expense statistics
  async getExpenseStats(params?: { start_date?: string; end_date?: string }): Promise<AxiosResponse<{
    success: boolean;
    data: ExpenseStats;
  }>> {
    return this.api.get('/stats', { params });
  }

  // Get expense categories
  async getExpenseCategories(): Promise<AxiosResponse<{
    success: boolean;
    data: ExpenseCategory[];
  }>> {
    return this.api.get('/categories');
  }

  // Get recent expenses
  async getRecentExpenses(limit?: number): Promise<AxiosResponse<{
    success: boolean;
    data: Expense[];
  }>> {
    return this.api.get('/recent', { params: { limit } });
  }

  // Bulk create expenses
  async bulkCreateExpenses(data: BulkExpenseRequest): Promise<AxiosResponse<{
    success: boolean;
    message: string;
    data: {
      count: number;
      expenses: Expense[];
    };
  }>> {
    return this.api.post('/bulk', data);
  }
}

export const expenseApi = new ExpenseApiService();
