import api from '../api';

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: 'completed' | 'pending' | 'processing' | 'failed' | 'refunded';
  method?: 'credit_card' | 'cash' | 'bank_transfer' | 'upi' | 'insurance' | 'stripe';
  patient_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface Payment {
  _id: string;
  clinic_id: string;
  invoice_id?: string | {
    _id: string;
    invoice_number: string;
    total_amount: number;
  };
  patient_id: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  amount: number;
  currency: string;
  method: 'credit_card' | 'cash' | 'bank_transfer' | 'upi' | 'insurance' | 'stripe';
  status: 'completed' | 'pending' | 'processing' | 'failed' | 'refunded';
  transaction_id?: string;
  card_last4?: string;
  insurance_provider?: string;
  processing_fee: number;
  net_amount: number;
  payment_date: string;
  failure_reason?: string;
  description: string;
  
  // Stripe-specific fields
  stripe_payment_intent_id?: string;
  stripe_checkout_session_id?: string;
  stripe_customer_id?: string;
  payment_link?: string;
  customer_email?: string;
  
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentData {
  invoice_id?: string;
  patient_id: string;
  amount: number;
  currency?: string;
  method: 'credit_card' | 'cash' | 'bank_transfer' | 'upi' | 'insurance' | 'stripe';
  description: string;
  processing_fee?: number;
  card_last4?: string;
  insurance_provider?: string;
  customer_email?: string;
}

export interface CreateStripePaymentLinkData {
  amount: number;
  currency?: string;
  description: string;
  customer_email: string;
  patient_id: string;
  success_url?: string;
  cancel_url?: string;
  metadata?: Record<string, string>;
}

export interface StripePaymentLinkResponse {
  payment_id: string;
  payment_link: string;
  checkout_session_id: string;
  expires_at: number;
  amount: number;
  currency: string;
  customer_email: string;
  patient: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UpdatePaymentStatusData {
  status: 'completed' | 'pending' | 'processing' | 'failed' | 'refunded';
  failure_reason?: string;
}

export interface RefundData {
  refund_amount: number;
  reason: string;
}

export interface StripeRefundData {
  amount?: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

export interface PaymentStats {
  overview: {
    total_payments: number;
    total_revenue: number;
    completed_payments: number;
    failed_payments: number;
    pending_payments: number;
    processing_payments: number;
    monthly_revenue: number;
    monthly_payments_count: number;
  };
  by_method: Array<{
    _id: string;
    count: number;
    total_amount: number;
  }>;
}

export interface StripeStats {
  total_payments: number;
  successful_payments: number;
  failed_payments: number;
  pending_payments: number;
  total_amount: number;
  total_fees: number;
  net_amount: number;
}

export const paymentApi = {
  // Get all payments with filters
  getPayments: async (filters: PaymentFilters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/payments?${params.toString()}`);
    return response.data;
  },

  // Get payment by ID
  getPayment: async (id: string) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  // Create a new payment
  createPayment: async (data: CreatePaymentData) => {
    const response = await api.post('/payments', data);
    return response.data;
  },

  // Update payment
  updatePayment: async (id: string, data: Partial<CreatePaymentData>) => {
    const response = await api.put(`/payments/${id}`, data);
    return response.data;
  },

  // Update payment status
  updatePaymentStatus: async (id: string, data: UpdatePaymentStatusData) => {
    const response = await api.patch(`/payments/${id}/status`, data);
    return response.data;
  },

  // Create refund
  createRefund: async (id: string, data: RefundData) => {
    const response = await api.post(`/payments/${id}/refund`, data);
    return response.data;
  },

  // Get payment statistics
  getPaymentStats: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/payments/stats?${params.toString()}`);
    return response.data;
  },

  // ===== STRIPE API METHODS =====

  // Create Stripe payment link
  createStripePaymentLink: async (data: CreateStripePaymentLinkData): Promise<{ data: StripePaymentLinkResponse }> => {
    const response = await api.post('/payments/create-payment-link', data);
    return response.data;
  },

  // Get payment link details
  getPaymentLinkDetails: async (paymentId: string) => {
    const response = await api.get(`/payments/payment-link/${paymentId}`);
    return response.data;
  },

  // Create Stripe refund
  createStripeRefund: async (id: string, data: StripeRefundData = {}) => {
    const response = await api.post(`/payments/${id}/stripe-refund`, data);
    return response.data;
  },

  // Get Stripe statistics
  getStripeStats: async (startDate?: string, endDate?: string): Promise<{ data: StripeStats }> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/payments/stripe/stats?${params.toString()}`);
    return response.data;
  },

  // Resend payment link
  resendPaymentLink: async (paymentId: string): Promise<{ data: StripePaymentLinkResponse }> => {
    const response = await api.post(`/payments/payment-link/${paymentId}/resend`);
    
    // Debug: Log the response structure
    console.log('PaymentApi Debug - Full response:', response);
    console.log('PaymentApi Debug - response.data:', response.data);
    
    // Backend returns { success, message, data: { payment_link, ... } }
    // We need to return { data: { payment_link, ... } } to match other Stripe API functions
    
    // Check if the response has the expected structure
    if (response.data && response.data.data) {
      return { data: response.data.data };
    } else if (response.data && response.data.payment_link) {
      // If response.data already has the payment_link directly
      return { data: response.data };
    } else {
      console.error('Unexpected response structure:', response);
      throw new Error('Unexpected response structure from payment link API');
    }
  },

  // Verify payment by session ID (public endpoint)
  verifyPaymentBySessionId: async (sessionId: string) => {
    // Use the same API base URL configuration as other API calls
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    const response = await fetch(`${API_BASE_URL}/payments/verify-session/${sessionId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Payment verification failed');
    }
    
    return result.data;
  },

  // Copy payment link to clipboard
  copyPaymentLink: async (link: string): Promise<boolean> => {
    if (!link) {
      console.error('No link provided to copy');
      return false;
    }

    try {
      // Check if clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
        return true;
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = link;
        textArea.style.position = 'fixed';
        textArea.style.top = '-999px';
        textArea.style.left = '-999px';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          console.error('execCommand copy failed');
          return false;
        }
        return true;
      }
    } catch (err) {
      console.error('Could not copy text: ', err);
      return false;
    }
  }
};

export default paymentApi;
