import axios, { AxiosResponse } from 'axios';
import { clinicCookies } from '@/utils/cookies';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Performance Types
export interface PerformanceOverview {
  period: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_revenue: number;
    total_costs: number;
    net_profit: number;
    profit_margin: string;
  };
  modules: {
    invoices: ModuleStats[];
    payments: ModuleStats[];
    payroll: PayrollStats[];
    expenses: ModuleStats[];
  };
}

export interface ModuleStats {
  _id: {
    year: number;
    month?: number;
    quarter?: number;
    status?: string;
    category?: string;
    method?: string;
  };
  total_invoices?: number;
  total_payments?: number;
  total_expenses?: number;
  total_amount: number;
  paid_invoices?: number;
  pending_invoices?: number;
  overdue_invoices?: number;
  paid_amount?: number;
  pending_amount?: number;
  average_invoice_value?: number;
  completed_payments?: number;
  failed_payments?: number;
  completed_amount?: number;
  processing_fees?: number;
  average_payment_value?: number;
  cash_payments?: number;
  card_payments?: number;
  bank_transfer_payments?: number;
  upi_payments?: number;
  paid_expenses?: number;
  pending_expenses?: number;
  average_expense_value?: number;
  supplies_expenses?: number;
  equipment_expenses?: number;
  utilities_expenses?: number;
  staff_expenses?: number;
  other_expenses?: number;
}

export interface PayrollStats {
  _id: {
    year: number;
    month: string;
  };
  total_payroll: number;
  total_employees: number;
  average_salary: number;
  total_gross_salary: number;
  total_deductions: number;
  total_overtime: number;
  total_bonuses: number;
}

export interface ModulePerformance {
  module: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
  statistics: ModuleStats[];
}

export interface ComparativePerformance {
  current_period: PeriodData;
  previous_period: PeriodData;
  changes: {
    invoices: string;
    payments: string;
    expenses: string;
    payroll: string;
    revenue: string;
    profit: string;
  };
}

export interface PeriodData {
  start_date: string;
  end_date: string;
  totals: {
    invoices: number;
    payments: number;
    expenses: number;
    payroll: number;
  };
  revenue: number;
  costs: number;
  profit: number;
}

export interface PerformanceQueryParams {
  start_date?: string;
  end_date?: string;
  period?: 'monthly' | 'quarterly' | 'yearly';
  compare_with_previous?: boolean;
}

export interface ModuleQueryParams extends PerformanceQueryParams {
  metric?: 'amount' | 'count' | 'average';
}

export interface ComparisonQueryParams {
  current_start: string;
  current_end: string;
  previous_start: string;
  previous_end: string;
}

export interface DoctorPayoutQueryParams {
  year?: number;
  month?: number;
}

export interface DoctorPayout {
  doctor_id: string;
  doctor_name: string;
  email: string;
  phone: string;
  specialization?: string;
  sales_percentage: number;
  base_salary: number;
  revenue_generated: number;
  invoice_count: number;
  appointment_count: number;
  sales_incentive: number;
  total_payout: number;
  payout_breakdown: {
    base_salary: number;
    sales_incentive: number;
    incentive_calculation: string;
  };
}

export interface DoctorPayoutsResponse {
  month: number;
  year: number;
  date_range: {
    start_date: string;
    end_date: string;
  };
  totals: {
    total_doctors: number;
    total_base_salary: number;
    total_revenue: number;
    total_sales_incentive: number;
    total_payout: number;
    total_appointments: number;
    total_invoices: number;
  };
  doctors: DoctorPayout[];
}

class PerformanceApiService {
  private api: typeof axios;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/performance`,
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

  // Get performance overview
  async getPerformanceOverview(params?: PerformanceQueryParams): Promise<AxiosResponse<{
    success: boolean;
    data: PerformanceOverview;
  }>> {
    return this.api.get('/overview', { params });
  }

  // Get module-specific performance
  async getModulePerformance(module: string, params?: ModuleQueryParams): Promise<AxiosResponse<{
    success: boolean;
    data: ModulePerformance;
  }>> {
    return this.api.get(`/module/${module}`, { params });
  }

  // Get comparative performance
  async getComparativePerformance(params: ComparisonQueryParams): Promise<AxiosResponse<{
    success: boolean;
    data: ComparativePerformance;
  }>> {
    return this.api.get('/compare', { params });
  }

  // Get doctor payouts with sales incentives
  async getDoctorPayouts(params?: DoctorPayoutQueryParams): Promise<AxiosResponse<{
    success: boolean;
    data: DoctorPayoutsResponse;
  }>> {
    return this.api.get('/doctors/payouts', { params });
  }
}

export const performanceApi = new PerformanceApiService();
