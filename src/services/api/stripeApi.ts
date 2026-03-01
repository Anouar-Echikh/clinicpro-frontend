import axios, { AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Types for Stripe operations
export interface SubscriptionPlan {
  _id: string;
  stripe_price_id: string;
  stripe_product_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  interval_count: number;
  trial_period_days?: number;
  features: string[];
  max_clinics: number;
  max_users: number;
  max_patients: number;
  is_active: boolean;
  is_default: boolean;
  formatted_price?: string;
  created_by: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface TenantSubscription {
  _id: string;
  tenant_id: {
    _id: string;
    name: string;
    email: string;
    slug: string;
    subdomain?: string;
    status: string;
  };
  plan_id: {
    _id: string;
    name: string;
    price: number;
    currency: string;
    interval: string;
    features: string[];
  };
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  ended_at?: string;
  price_amount: number;
  currency: string;
  payment_method?: string;
  next_payment_attempt?: string;
  last_payment_date?: string;
  formatted_price?: string;
  is_trial?: boolean;
  is_past_due?: boolean;
  days_until_renewal?: number;
  created_by: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface StripeTransaction {
  _id: string;
  tenant_id?: {
    _id: string;
    name: string;
    email: string;
    slug: string;
    subdomain?: string;
  };
  stripe_payment_intent_id?: string;
  stripe_invoice_id?: string;
  stripe_subscription_id?: string;
  stripe_customer_id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded' | 'failed';
  type: 'subscription' | 'one_time' | 'refund' | 'dispute' | 'payout' | 'invoice';
  description: string;
  customer_email?: string;
  payment_method_type?: string;
  card_last4?: string;
  card_brand?: string;
  failure_code?: string;
  failure_message?: string;
  refunded_amount?: number;
  fee_amount?: number;
  net_amount?: number;
  metadata?: Record<string, any>;
  processed_at?: string;
  formatted_amount?: string;
  formatted_refunded_amount?: string;
  formatted_net_amount?: string;
  is_successful?: boolean;
  is_refundable?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanRequest {
  name: string;
  description: string;
  price: number;
  currency?: string;
  interval?: 'month' | 'year';
  interval_count?: number;
  trial_period_days?: number;
  features?: string[];
  max_clinics?: number;
  max_users?: number;
  max_patients?: number;
  is_default?: boolean;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
  is_default?: boolean;
  features?: string[];
}

export interface CreateSubscriptionRequest {
  tenant_id: string;
  plan_id: string;
  customer_email: string;
  trial_days?: number;
  admin_payment_method_id?: string; // For admin to pay on behalf of customer
}

export interface CancelSubscriptionRequest {
  immediately?: boolean;
}

export interface SubscriptionFilters {
  page?: number;
  limit?: number;
  status?: string;
  tenant_id?: string;
  plan_id?: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  tenant_id?: string;
  customer_email?: string;
  start_date?: string;
  end_date?: string;
}

export interface AnalyticsFilters {
  start_date?: string;
  end_date?: string;
}

export interface SubscriptionStats {
  _id: string;
  count: number;
  total_revenue: number;
}

export interface RevenueByPlan {
  _id: string;
  count: number;
  revenue: number;
  plan_price: number;
}

export interface TransactionStats {
  _id: string;
  count: number;
  total_amount: number;
  total_fees: number;
}

export interface AnalyticsResponse {
  subscription_stats: SubscriptionStats[];
  revenue_by_plan: RevenueByPlan[];
  transaction_stats: TransactionStats[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message: string;
}

class StripeApiService {
  private api: typeof axios;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/super-admin/stripe`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // Longer timeout for Stripe operations
    });

    // Add request interceptor to include super admin token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('super_admin_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Stripe API Error:', error);
        
        // Handle specific error cases
        if (error.response?.status === 401) {
          localStorage.removeItem('super_admin_token');
          window.location.href = '/admin/login';
        }
        
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        throw new Error(errorMessage);
      }
    );
  }

  // ============ SUBSCRIPTION PLANS ============

  /**
   * Get all subscription plans
   */
  async getPlans(activeOnly: boolean = true): Promise<AxiosResponse<ApiResponse<SubscriptionPlan[]>>> {
    return this.api.get('/plans', {
      params: { active_only: activeOnly.toString() }
    });
  }

  /**
   * Create a new subscription plan
   */
  async createPlan(planData: CreatePlanRequest): Promise<AxiosResponse<ApiResponse<SubscriptionPlan>>> {
    return this.api.post('/plans', planData);
  }

  /**
   * Update a subscription plan
   */
  async updatePlan(planId: string, updates: UpdatePlanRequest): Promise<AxiosResponse<ApiResponse<SubscriptionPlan>>> {
    return this.api.put(`/plans/${planId}`, updates);
  }

  /**
   * Delete/Archive a subscription plan
   */
  async deletePlan(planId: string): Promise<AxiosResponse<ApiResponse<void>>> {
    return this.api.delete(`/plans/${planId}`);
  }

  /**
   * Sync plans from Stripe to local database
   */
  async syncPlansFromStripe(): Promise<AxiosResponse<ApiResponse<{
    synced_count: number;
    error_count: number;
    errors: string[];
  }>>> {
    return this.api.post('/plans/sync');
  }

  /**
   * Sync transactions from Stripe to local database
   */
  async syncTransactionsFromStripe(): Promise<AxiosResponse<ApiResponse<{
    synced_count: number;
    error_count: number;
    errors: string[];
    total_processed: number;
  }>>> {
    return this.api.post('/transactions/sync');
  }

  // ============ SUBSCRIPTIONS ============

  /**
   * Get all tenant subscriptions
   */
  async getSubscriptions(filters: SubscriptionFilters = {}): Promise<AxiosResponse<PaginatedResponse<TenantSubscription>>> {
    return this.api.get('/subscriptions', { params: filters });
  }

  /**
   * Create subscription for tenant
   */
  async createSubscription(subscriptionData: CreateSubscriptionRequest): Promise<AxiosResponse<ApiResponse<{
    subscription: TenantSubscription;
    client_secret?: string;
    stripe_subscription_id: string;
  }>>> {
    return this.api.post('/subscriptions', subscriptionData);
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, options: CancelSubscriptionRequest = {}): Promise<AxiosResponse<ApiResponse<TenantSubscription>>> {
    return this.api.post(`/subscriptions/${subscriptionId}/cancel`, options);
  }

  /**
   * Force delete a subscription - removes from database without Stripe sync.
   * Use for orphaned records where Stripe subscription no longer exists.
   */
  async forceDeleteSubscription(subscriptionId: string): Promise<AxiosResponse<ApiResponse<{ deleted_id: string }>>> {
    return this.api.delete(`/subscriptions/${subscriptionId}/force-delete`);
  }

  // ============ ADMIN PAYMENT METHODS ============

  /**
   * Get admin payment methods for paying on behalf of customers
   */
  async getAdminPaymentMethods(): Promise<AxiosResponse<ApiResponse<{
    payment_methods: Array<{
      id: string;
      card: {
        brand: string;
        last4: string;
        exp_month: number;
        exp_year: number;
      } | null;
      created: number;
    }>;
    admin_customer_id: string;
  }>>> {
    return this.api.get('/admin/payment-methods');
  }

  /**
   * Get admin payment methods for subscription payment (same as above but with clear context)
   */
  async getAdminPaymentMethodsForSubscription(): Promise<AxiosResponse<ApiResponse<{
    payment_methods: Array<{
      id: string;
      card: {
        brand: string;
        last4: string;
        exp_month: number;
        exp_year: number;
      } | null;
      created: number;
    }>;
    admin_customer_id: string;
  }>>> {
    return this.getAdminPaymentMethods();
  }

  /**
   * Create setup intent for admin to add new payment method
   */
  async createAdminSetupIntent(): Promise<AxiosResponse<ApiResponse<{
    client_secret: string;
    setup_intent_id: string;
    admin_customer_id: string;
  }>>> {
    return this.api.post('/admin/setup-intent');
  }

  /**
   * Pay for existing subscription on behalf of customer
   */
  async paySubscriptionOnBehalf(subscriptionId: string, paymentMethodId: string): Promise<AxiosResponse<ApiResponse<{
    subscription: TenantSubscription;
    invoice_id: string;
    amount_paid: number;
    status: string;
  }>>> {
    return this.api.post(`/subscriptions/${subscriptionId}/pay-on-behalf`, {
      admin_payment_method_id: paymentMethodId
    });
  }

  /**
   * Delete admin payment method
   */
  async deleteAdminPaymentMethod(paymentMethodId: string): Promise<AxiosResponse<ApiResponse<void>>> {
    return this.api.delete(`/admin/payment-methods/${paymentMethodId}`);
  }

  // ============ TRANSACTIONS ============

  /**
   * Get all Stripe transactions
   */
  async getTransactions(filters: TransactionFilters = {}): Promise<AxiosResponse<PaginatedResponse<StripeTransaction>>> {
    return this.api.get('/transactions', { params: filters });
  }

  // ============ ANALYTICS ============

  /**
   * Get subscription analytics
   */
  async getAnalytics(filters: AnalyticsFilters = {}): Promise<AxiosResponse<ApiResponse<AnalyticsResponse>>> {
    return this.api.get('/analytics', { params: filters });
  }

  // ============ UTILITY METHODS ============

  /**
   * Format currency amount
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Convert from cents
  }

  /**
   * Get status color for subscriptions
   */
  getSubscriptionStatusColor(status: string): string {
    const statusColors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      trialing: 'bg-blue-100 text-blue-800 border-blue-200',
      past_due: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      canceled: 'bg-red-100 text-red-800 border-red-200',
      unpaid: 'bg-red-100 text-red-800 border-red-200',
      incomplete: 'bg-gray-100 text-gray-800 border-gray-200',
      incomplete_expired: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  /**
   * Get status color for transactions
   */
  getTransactionStatusColor(status: string): string {
    const statusColors = {
      succeeded: 'bg-green-100 text-green-800 border-green-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      requires_action: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      requires_confirmation: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      requires_payment_method: 'bg-orange-100 text-orange-800 border-orange-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      canceled: 'bg-red-100 text-red-800 border-red-200',
      requires_capture: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  /**
   * Get readable status text
   */
  getReadableStatus(status: string): string {
    const statusMap = {
      requires_payment_method: 'Requires Payment Method',
      requires_confirmation: 'Requires Confirmation',
      requires_action: 'Requires Action',
      processing: 'Processing',
      requires_capture: 'Requires Capture',
      canceled: 'Canceled',
      succeeded: 'Succeeded',
      failed: 'Failed',
      active: 'Active',
      trialing: 'Trialing',
      past_due: 'Past Due',
      unpaid: 'Unpaid',
      incomplete: 'Incomplete',
      incomplete_expired: 'Incomplete Expired',
    };
    return statusMap[status as keyof typeof statusMap] || status.replace('_', ' ').toUpperCase();
  }

  /**
   * Get card brand icon
   */
  getCardBrandIcon(brand?: string): string {
    const brandIcons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      diners: '💳',
      jcb: '💳',
      unionpay: '💳',
    };
    return brandIcons[brand as keyof typeof brandIcons] || '💳';
  }
}

export const stripeApiService = new StripeApiService();
