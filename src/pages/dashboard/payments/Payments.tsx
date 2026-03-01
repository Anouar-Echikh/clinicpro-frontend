import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  Eye,
  Receipt,
  Banknote,
  Smartphone,
  Building,
  Shield,
  Edit,
  Link,
} from "lucide-react";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { toast } from "@/hooks/use-toast";
import { apiService, type PaymentStats } from "@/services/api";
import { paymentApi, type Payment, type StripePaymentLinkResponse } from "@/services/api/paymentApi";
import CreatePaymentLinkModal from "@/components/modals/CreatePaymentLinkModal";


const Payments = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [recordPaymentLoading, setRecordPaymentLoading] = useState(false);
  const [recordPaymentForm, setRecordPaymentForm] = useState({
    patient_id: "",
    invoice_id: "",
    amount: "",
    method: "",
    description: "",
    transaction_id: "",
  });
  const [availablePatients, setAvailablePatients] = useState<any[]>([]);
  const [availableInvoices, setAvailableInvoices] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  
  // Edit Payment Modal States
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [editPaymentLoading, setEditPaymentLoading] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editPaymentForm, setEditPaymentForm] = useState({
    patient_id: "",
    invoice_id: "",
    amount: "",
    method: "",
    description: "",
    transaction_id: "",
    status: "",
  });

  // View Payment Details Modal States
  const [showViewPaymentModal, setShowViewPaymentModal] = useState(false);
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);

  // Stripe Payment Link Modal States
  const [showCreatePaymentLinkModal, setShowCreatePaymentLinkModal] = useState(false);

  
  // Stripe Stats State
  const [stripeStats, setStripeStats] = useState<any>(null);

  // Load payments data
  useEffect(() => {
    loadPayments();
    loadStats();
    loadStripeStats();
  }, [currentPage, selectedStatus, selectedMethod, searchTerm, selectedDateRange]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
      };
      
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (selectedMethod !== "all") params.method = selectedMethod;
      if (searchTerm) params.search = searchTerm;
      if (selectedDateRange !== "all") params.date_range = selectedDateRange;

      const response = await apiService.getPayments(params);
      
      // Ensure we have a valid array of payment objects
      const paymentsData = response.data.items || [];
      
      // Validate each payment object
      const validPayments = paymentsData.filter((payment: any) => {
        if (!payment || typeof payment !== 'object') {
          return false;
        }
        
        // Check if this might be an invoice object instead of payment
        if (payment.invoice_number && payment.total_amount) {
          return false;
        }
        
        return true;
      });
      
      setPayments(validPayments);
      setTotalPages(response.data.pagination.pages || 1);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast({
        title: t("Error"),
        description: t("Failed to load payments. Please try again."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await apiService.getPaymentStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading payment stats:', error);
    }
  };

  const loadStripeStats = async () => {
    try {
      const stripeStatsData = await paymentApi.getStripeStats();
      setStripeStats(stripeStatsData.data);
    } catch (error) {
      console.error('Error loading Stripe stats:', error);
    }
  };

  const getPatientDisplay = (patient: string | { _id: string; first_name: string; last_name: string; email?: string } | null) => {
    if (!patient) {
      return t('Unknown Patient');
    }
    if (typeof patient === 'string') {
      return patient;
    }
    return `${patient.first_name} ${patient.last_name}`;
  };

  const getInvoiceDisplay = (invoice: string | { _id: string; invoice_number: string; total_amount: number } | null) => {
    if (!invoice) {
      return t('N/A');
    }
    if (typeof invoice === 'string') {
      return invoice;
    }
    return invoice.invoice_number || invoice._id;
  };

  const isPaymentInDateRange = (payment: Payment, dateRange: string) => {
    if (dateRange === "all") return true;
    
    // Check if payment_date exists and is valid
    if (!payment.payment_date) return false;
    
    const paymentDate = new Date(payment.payment_date);
    
    // Check if date is valid
    if (isNaN(paymentDate.getTime())) return false;
    
    const now = new Date();
    
    switch (dateRange) {
      case "today":
        const today = new Date();
        return paymentDate.toDateString() === today.toDateString();
      
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return paymentDate >= weekAgo;
      
      case "month":
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return paymentDate >= monthAgo;
      
      case "quarter":
        const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        return paymentDate >= quarterAgo;
      
      default:
        return true;
    }
  };

  const filteredPayments = payments.filter((payment) => {
    // Add safety check to ensure payment is an object with expected properties
    if (!payment || typeof payment !== 'object') return false;
    
    const invoiceSearchString = typeof payment.invoice_id === 'string' 
      ? payment.invoice_id 
      : (payment.invoice_id && payment.invoice_id.invoice_number) || '';
    
    const patientSearchString = typeof payment.patient_id === 'string' 
      ? payment.patient_id 
      : (payment.patient_id ? `${payment.patient_id.first_name} ${payment.patient_id.last_name} ${payment.patient_id.email || ''}` : '');
    
    const matchesSearch =
      (payment._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoiceSearchString.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientSearchString.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || payment.status === selectedStatus;
    const matchesMethod =
      selectedMethod === "all" || payment.method === selectedMethod;
    const matchesDateRange = isPaymentInDateRange(payment, selectedDateRange);

    return matchesSearch && matchesStatus && matchesMethod && matchesDateRange;
  });

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "credit_card":
        return <CreditCard className="h-4 w-4 text-primary" />;
      case "cash":
        return <Banknote className="h-4 w-4 text-green-600" />;
      case "bank_transfer":
        return <Building className="h-4 w-4 text-purple-600" />;
      case "upi":
        return <Smartphone className="h-4 w-4 text-orange-600" />;
      case "insurance":
        return <Shield className="h-4 w-4 text-indigo-600" />;
      case "stripe":
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-primary" />;
      case "processing":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "refunded":
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
      case "processing":
        return "bg-orange-100 text-orange-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };



  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "credit_card":
        return t("Credit Card");
      case "cash":
        return t("Cash");
      case "bank_transfer":
        return t("Bank Transfer");
      case "upi":
        return t("UPI");
      case "insurance":
        return t("Insurance");
      case "stripe":
        return t("Stripe");
      default:
        return method;
    }
  };

  const handleViewPaymentDetails = (payment: Payment) => {
    setViewingPayment(payment);
    setShowViewPaymentModal(true);
  };

  const handleRefundPayment = async (paymentId: string) => {
    try {
      // This would show a refund modal in a real implementation
      await apiService.initiateRefund(paymentId, 0, "Customer requested refund");
      toast({
        title: t("Refund Initiated"),
        description: `${t('Refund for payment')} ${paymentId} ${t('has been initiated.')}`,
      });
      loadPayments(); // Reload payments
    } catch (error) {
      toast({
        title: t("Error"),
        description: t("Failed to initiate refund."),
        variant: "destructive",
      });
    }
  };

  const handleRetryPayment = async (paymentId: string) => {
    try {
      // This would trigger a retry process in a real implementation
      toast({
        title: t("Payment Retry"),
        description: `${t('Payment retry for')} ${paymentId} ${t('has been initiated.')}`,
      });
    } catch (error) {
      toast({
        title: t("Error"),
        description: t("Failed to retry payment."),
        variant: "destructive",
      });
    }
  };

  const handlePaymentLinkCreated = async (paymentData: StripePaymentLinkResponse) => {
    try {
      // Reload payments to show the new payment link
      await loadPayments();
      loadStats();
      loadStripeStats();
      
      // Find the newly created payment and show its details
      const newPayment = payments.find(p => p._id === paymentData.payment_id);
      if (newPayment) {
        setViewingPayment(newPayment);
        setShowViewPaymentModal(true);
      } else {
        // If not found in current list, fetch the payment directly
        try {
          const paymentDetails = await paymentApi.getPayment(paymentData.payment_id);
          setViewingPayment(paymentDetails.data);
          setShowViewPaymentModal(true);
        } catch (error) {
          console.error('Error fetching payment details:', error);
          // Fallback: show success message
          toast({
            title: t("Payment Link Created"),
            description: t("Payment link has been created successfully"),
          });
        }
      }
    } catch (error) {
      console.error('Error in handlePaymentLinkCreated:', error);
      toast({
        title: t("Payment Link Created"),
        description: t("Payment link has been created successfully"),
      });
    }
  };

  const handleResendPaymentLink = async (paymentId: string) => {
    try {
      const response = await paymentApi.resendPaymentLink(paymentId);
      
      // Debug: Log the actual response structure
      console.log('=== PAYMENT LINK DEBUG ===');
      console.log('Full response:', response);
      console.log('Response.data:', response.data);
      console.log('========================');
      
      // Show the link in a dialog or copy to clipboard
      // The response should have the payment link directly
      let paymentLink = response.data.payment_link;
      
      if (paymentLink) {
        const copySuccess = await paymentApi.copyPaymentLink(paymentLink);
        
        if (copySuccess) {
          toast({
            title: t("Link Copied"),
            description: t("Payment link has been copied to clipboard"),
          });
        } else {
          toast({
            title: t("Payment Link Ready"),
            description: `${t("Could not copy automatically. Link:")} ${paymentLink}`,
          });
        }
      } else {
        toast({
          title: t("Error"),
          description: t("Payment link not found in response"),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error getting payment link:', error);
      toast({
        title: t("Error"),
        description: error.response?.data?.message || t("Failed to get payment link"),
        variant: "destructive",
      });
    }
  };

  const handleStripeRefund = async (paymentId: string) => {
    try {
      await paymentApi.createStripeRefund(paymentId);
      toast({
        title: t("Refund Initiated"),
        description: t("Stripe refund has been initiated successfully"),
      });
      loadPayments(); // Reload payments to show updated status
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.response?.data?.message || t("Failed to initiate Stripe refund"),
        variant: "destructive",
      });
    }
  };

  // Helper function to validate MongoDB ObjectId
  const isValidObjectId = (id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Load patients for dropdown
  const loadPatientsForDropdown = async () => {
    try {
      setLoadingPatients(true);
      const response = await apiService.getPatients({ limit: 100 }); // Get first 100 patients
      setAvailablePatients(response.data.patients || []);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast({
        title: t("Error"),
        description: t("Failed to load patients list."),
        variant: "destructive",
      });
    } finally {
      setLoadingPatients(false);
    }
  };

  // Load invoices for dropdown
  const loadInvoicesForDropdown = async () => {
    try {
      setLoadingInvoices(true);
      const response = await apiService.getInvoices({ limit: 100, status: 'pending' }); // Get pending invoices
      setAvailableInvoices(response.data.invoices || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: t("Error"), 
        description: t("Failed to load invoices list."),
        variant: "destructive",
      });
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Load data when modal opens
  const handleOpenRecordPaymentModal = () => {
    setShowRecordPaymentModal(true);
    loadPatientsForDropdown();
    loadInvoicesForDropdown();
  };

  // Handle opening edit modal
  const handleOpenEditPaymentModal = (payment: Payment) => {
    setEditingPayment(payment);
    setEditPaymentForm({
      patient_id: typeof payment.patient_id === 'string' ? payment.patient_id : payment.patient_id._id,
      invoice_id: payment.invoice_id ? (typeof payment.invoice_id === 'string' ? payment.invoice_id : payment.invoice_id._id) : "",
      amount: payment.amount.toString(),
      method: payment.method,
      description: payment.description || "",
      transaction_id: payment.transaction_id || "",
      status: payment.status,
    });
    setShowEditPaymentModal(true);
    loadPatientsForDropdown();
    loadInvoicesForDropdown();
  };

  const handleRecordPayment = async () => {
    try {
      setRecordPaymentLoading(true);
      
              // Validate required fields
        if (!recordPaymentForm.patient_id || !recordPaymentForm.amount || !recordPaymentForm.method || !recordPaymentForm.description) {
          toast({
            title: t("Validation Error"),
            description: t("Please fill in all required fields (Patient, Amount, Payment Method, and Description)."),
            variant: "destructive",
          });
          return;
        }

        // Validate amount
        const amount = parseFloat(recordPaymentForm.amount);
        if (isNaN(amount) || amount <= 0) {
          toast({
            title: t("Validation Error"),
            description: t("Please enter a valid amount greater than 0."),
            variant: "destructive",
          });
          return;
        }

              // Create payment record with proper structure matching Payment interface
        const paymentData = {
          patient_id: recordPaymentForm.patient_id, // Already a valid ObjectId from dropdown
          invoice_id: recordPaymentForm.invoice_id || undefined, // Optional field, already valid ObjectId
          amount: amount,
          method: recordPaymentForm.method as 'credit_card' | 'cash' | 'bank_transfer' | 'upi' | 'insurance',
          status: "completed" as const, // Default to completed for manual records
          transaction_id: recordPaymentForm.transaction_id.trim() || undefined,
          description: recordPaymentForm.description.trim(), // Required field
          payment_date: new Date().toISOString(),
          processing_fee: 0, // Default processing fee for manual records
          net_amount: amount, // Net amount equals full amount for manual records
        };

      // Call the backend API to create the payment
      const newPayment = await apiService.createPayment(paymentData);
      
      toast({
        title: t("Payment Recorded"),
        description: `${t('Payment')} ${newPayment._id} ${t('has been successfully recorded.')}`,
      });

      // Reset form and close modal
      setRecordPaymentForm({
        patient_id: "",
        invoice_id: "",
        amount: "",
        method: "",
        description: "",
        transaction_id: "",
      });
      setShowRecordPaymentModal(false);
      
      // Reload payments to show the new payment
      loadPayments();
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast({
        title: t("Error"),
        description: error.response?.data?.message || error.message || t("Failed to record payment."),
        variant: "destructive",
      });
    } finally {
      setRecordPaymentLoading(false);
    }
  };

  const handleEditPayment = async () => {
    try {
      setEditPaymentLoading(true);
      
      if (!editingPayment) {
        toast({
          title: t("Error"),
          description: t("No payment selected for editing."),
          variant: "destructive",
        });
        return;
      }

      // Validate required fields
      if (!editPaymentForm.patient_id || !editPaymentForm.amount || !editPaymentForm.method || !editPaymentForm.description) {
        toast({
          title: t("Validation Error"),
          description: t("Please fill in all required fields (Patient, Amount, Payment Method, and Description)."),
          variant: "destructive",
        });
        return;
      }

      // Validate amount
      const amount = parseFloat(editPaymentForm.amount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: t("Validation Error"),
          description: t("Please enter a valid amount greater than 0."),
          variant: "destructive",
        });
        return;
      }

      // Create update payload
      const updateData = {
        patient_id: editPaymentForm.patient_id,
        invoice_id: editPaymentForm.invoice_id || undefined,
        amount: amount,
        method: editPaymentForm.method as 'credit_card' | 'cash' | 'bank_transfer' | 'upi' | 'insurance',
        status: editPaymentForm.status as 'pending' | 'completed' | 'processing' | 'failed' | 'refunded',
        transaction_id: editPaymentForm.transaction_id.trim() || undefined,
        description: editPaymentForm.description.trim(),
      };

      // Call the backend API to update the payment
      const updatedPayment = await apiService.updatePayment(editingPayment._id, updateData);
      
      toast({
        title: t("Payment Updated"),
        description: `${t('Payment')} ${updatedPayment._id} ${t('has been successfully updated.')}`,
      });

      // Reset form and close modal
      setEditPaymentForm({
        patient_id: "",
        invoice_id: "",
        amount: "",
        method: "",
        description: "",
        transaction_id: "",
        status: "",
      });
      setEditingPayment(null);
      setShowEditPaymentModal(false);
      
      // Reload payments to show the updated payment
      loadPayments();
    } catch (error: any) {
      console.error('Error updating payment:', error);
      toast({
        title: t("Error"),
        description: error.response?.data?.message || error.message || t("Failed to update payment."),
        variant: "destructive",
      });
    } finally {
      setEditPaymentLoading(false);
    }
  };

  // Use stats from API or calculate from current data
  const totalPayments = stats?.overview?.total_payments || payments.length;
  const totalRevenue = stats?.overview?.total_revenue || payments
    .filter((p) => p.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const monthlyRevenue = stats?.overview?.monthly_revenue || 0;
  const completedPayments = stats?.overview?.completed_payments || payments.filter(
    (p) => p.status === "completed",
  ).length;
  const failedPayments = stats?.overview?.failed_payments || payments.filter((p) => p.status === "failed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between sm:flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t('Payment Management')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Track and manage all patient payments and transactions')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-shrink-0">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setShowCreatePaymentLinkModal(true)}
          >
            <Link className="h-4 w-4 mr-2" />
            {t('Create Payment Link')}
          </Button>
          <Button 
            className="w-full sm:w-auto"
            onClick={handleOpenRecordPaymentModal}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('Record Payment')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('Total Payments')}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {totalPayments}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('Total Revenue (All Time)')}
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    <CurrencyDisplay amount={totalRevenue} variant="large" />
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('This Month Revenue')}
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    <CurrencyDisplay amount={monthlyRevenue} variant="large" />
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('Successful')}
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {completedPayments}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('Failed')}</p>
                  <p className="text-3xl font-bold text-red-600">
                    {failedPayments}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stripe Stats Card */}
        {stripeStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">{t('Stripe Payments')}</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {stripeStats.successful_payments}
                    </p>
                    <p className="text-sm text-blue-600">
                      <CurrencyDisplay amount={stripeStats.net_amount || 0} />
                    </p>
                  </div>
                  <div className="relative">
                    <CreditCard className="h-8 w-8 text-blue-600" />
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-blue-600 rounded-full flex items-center justify-center">
                      <div className="h-1.5 w-1.5 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-0 sm:min-w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('Search by payment ID, patient name, or invoice...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder={t('Status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Status')}</SelectItem>
                  <SelectItem value="completed">{t('Completed')}</SelectItem>
                  <SelectItem value="pending">{t('Pending')}</SelectItem>
                  <SelectItem value="processing">{t('Processing')}</SelectItem>
                  <SelectItem value="failed">{t('Failed')}</SelectItem>
                  <SelectItem value="refunded">{t('Refunded')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder={t('Method')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Methods')}</SelectItem>
                  <SelectItem value="stripe">{t('Stripe')}</SelectItem>
                  <SelectItem value="credit_card">{t('Credit Card')}</SelectItem>
                  <SelectItem value="cash">{t('Cash')}</SelectItem>
                  <SelectItem value="bank_transfer">{t('Bank Transfer')}</SelectItem>
                  <SelectItem value="upi">{t('UPI')}</SelectItem>
                  <SelectItem value="insurance">{t('Insurance')}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedDateRange}
                onValueChange={setSelectedDateRange}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('Payment Records')}</CardTitle>
            <CardDescription>
              {t('Complete history of all payment transactions and their details')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">{t('Loading payments...')}</div>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">{t('No payments found.')}</div>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[140px]">{t('Payment')}</TableHead>
                    <TableHead className="min-w-[160px]">{t('Patient')}</TableHead>
                    <TableHead className="min-w-[120px]">{t('Amount')}</TableHead>
                    <TableHead className="min-w-[120px]">{t('Method')}</TableHead>
                    <TableHead className="min-w-[100px]">{t('Status')}</TableHead>
                    <TableHead className="min-w-[120px]">{t('Date')}</TableHead>
                    <TableHead className="min-w-[140px]">
                      {t('Transaction ID')}
                    </TableHead>
                    <TableHead className="text-right min-w-[120px]">
                      {t('Actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    // Safety check to ensure payment is a valid object
                    if (!payment || typeof payment !== 'object') {
                      console.warn('Invalid payment object:', payment);
                      return null;
                    }
                    
                    return (
                    <TableRow key={payment._id || 'unknown'}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-medium">{payment._id || 'N/A'}</div>
                            <div className="text-sm text-gray-500">
                              Invoice: {getInvoiceDisplay(payment.invoice_id) || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {getPatientDisplay(payment.patient_id) || t('N/A')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.description || t('No description')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            <CurrencyDisplay amount={payment.amount || 0} />
                          </div>
                          {(payment.processing_fee || 0) > 0 && (
                            <div className="text-sm text-gray-500">
                              {t('Fee')}: <CurrencyDisplay amount={payment.processing_fee || 0} />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getPaymentMethodIcon(payment.method || 'unknown')}
                          <div>
                            <div className="font-medium">
                              {getPaymentMethodLabel(payment.method || 'unknown')}
                            </div>
                            {payment.card_last4 && (
                              <div className="text-sm text-gray-500">
                                ****{payment.card_last4}
                              </div>
                            )}
                            {payment.insurance_provider && (
                              <div className="text-sm text-gray-500">
                                {payment.insurance_provider}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment.status || 'unknown')}
                          <div>
                            <Badge
                              className={`text-xs ${getStatusColor(payment.status || 'unknown')}`}
                            >
                              {payment.status || 'Unknown'}
                            </Badge>
                            {payment.failure_reason && (
                              <div className="text-xs text-red-600 mt-1">
                                {payment.failure_reason}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {payment.payment_date ? formatDateTime(payment.payment_date) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {payment.transaction_id ? (
                          <div className="font-mono text-sm">
                            {payment.transaction_id}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              <MoreVertical className="h-4 w-4 mr-1" />
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewPaymentDetails(payment)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenEditPaymentModal(payment)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {t('Edit Payment')}
                            </DropdownMenuItem>
                            {payment.method === "stripe" && payment.status === "pending" && payment.payment_link && (
                              <DropdownMenuItem
                                onClick={() => handleResendPaymentLink(payment._id)}
                              >
                                <Link className="mr-2 h-4 w-4" />
                                {t('Copy Payment Link')}
                              </DropdownMenuItem>
                            )}
                            {payment.method === "stripe" && payment.status === "completed" && (
                              <DropdownMenuItem
                                onClick={() => handleStripeRefund(payment._id)}
                                className="text-red-600"
                              >
                                <TrendingUp className="mr-2 h-4 w-4" />
                                {t('Stripe Refund')}
                              </DropdownMenuItem>
                            )}
                            {payment.status === "failed" && (
                              <DropdownMenuItem
                                onClick={() => handleRetryPayment(payment._id)}
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                {t('Retry Payment')}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredPayments.map((payment) => {
                    // Safety check to ensure payment is a valid object
                    if (!payment || typeof payment !== 'object') {
                      console.warn('Invalid payment object:', payment);
                      return null;
                    }
                    
                    return (
                      <div
                        key={payment._id || 'unknown'}
                        className="border rounded-lg p-4 space-y-3 bg-white shadow-sm"
                      >
                        {/* Header with Payment ID and Status */}
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-sm truncate">
                              Payment #{payment._id?.slice(-8) || 'N/A'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {payment.payment_date ? formatDateTime(payment.payment_date) : 'N/A'}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(payment.status || 'unknown')}
                            <Badge className={`text-xs ${getStatusColor(payment.status || 'unknown')}`}>
                              {payment.status || 'Unknown'}
                            </Badge>
                          </div>
                        </div>

                        {/* Patient Information */}
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            {t('Patient & Description')}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {getPatientDisplay(payment.patient_id) || t('N/A')}
                          </div>
                          <div className="text-sm text-gray-600">
                            {payment.description || t('No description')}
                          </div>
                          {payment.invoice_id && (
                            <div className="text-xs text-gray-500 mt-1">
                              Invoice: {getInvoiceDisplay(payment.invoice_id)}
                            </div>
                          )}
                        </div>

                        {/* Payment Details Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500 uppercase tracking-wide">
                              Amount
                            </div>
                            <div className="font-semibold text-lg text-gray-900">
                              <CurrencyDisplay amount={payment.amount || 0} />
                            </div>
                            {(payment.processing_fee || 0) > 0 && (
                              <div className="text-xs text-gray-500">
                                {t('Fee')}: <CurrencyDisplay amount={payment.processing_fee || 0} />
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500 uppercase tracking-wide">
                              Method
                            </div>
                            <div className="flex items-center space-x-2">
                              {getPaymentMethodIcon(payment.method || 'unknown')}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {getPaymentMethodLabel(payment.method || 'unknown')}
                                </div>
                                {payment.card_last4 && (
                                  <div className="text-xs text-gray-500">
                                    ****{payment.card_last4}
                                  </div>
                                )}
                                {payment.insurance_provider && (
                                  <div className="text-xs text-gray-500">
                                    {payment.insurance_provider}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Transaction Information */}
                        {payment.transaction_id && (
                          <div className="p-2 bg-gray-100 rounded border">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Transaction ID
                            </div>
                            <div className="font-mono text-xs text-gray-900 break-all">
                              {payment.transaction_id}
                            </div>
                          </div>
                        )}

                        {/* Failure Reason */}
                        {payment.failure_reason && (
                          <div className="p-2 bg-red-50 border border-red-200 rounded">
                            <div className="text-xs text-red-600 font-medium mb-1">
                              {t('Failure Reason')}
                            </div>
                            <div className="text-xs text-red-800">
                              {payment.failure_reason}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-xs text-gray-400">
                            ID: {payment._id?.slice(-8) || 'N/A'}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4 mr-1" />
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewPaymentDetails(payment)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenEditPaymentModal(payment)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                {t('Edit Payment')}
                              </DropdownMenuItem>
                              {payment.method === "stripe" && payment.status === "pending" && payment.payment_link && (
                                <DropdownMenuItem
                                  onClick={() => handleResendPaymentLink(payment._id)}
                                >
                                  <Link className="mr-2 h-4 w-4" />
                                  {t('Copy Payment Link')}
                                </DropdownMenuItem>
                              )}
                              {payment.method === "stripe" && payment.status === "completed" && (
                                <DropdownMenuItem
                                  onClick={() => handleStripeRefund(payment._id)}
                                  className="text-red-600"
                                >
                                  <TrendingUp className="mr-2 h-4 w-4" />
                                  {t('Stripe Refund')}
                                </DropdownMenuItem>
                              )}
                              {payment.status === "failed" && (
                                <DropdownMenuItem
                                  onClick={() => handleRetryPayment(payment._id)}
                                >
                                  <Clock className="mr-2 h-4 w-4" />
                                  {t('Retry Payment')}
                                </DropdownMenuItem>
                              )}
                              {payment.status === "completed" && payment.method !== "stripe" && (
                                <DropdownMenuItem
                                  onClick={() => handleRefundPayment(payment._id)}
                                  className="text-red-600"
                                >
                                  <TrendingUp className="mr-2 h-4 w-4" />
                                  {t('Initiate Refund')}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-gray-500">
                      {t('Page')} {currentPage} {t('of')} {totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        {t('Previous')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        {t('Next')}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Record Payment Modal */}
      <Dialog open={showRecordPaymentModal} onOpenChange={setShowRecordPaymentModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('Record New Payment')}</DialogTitle>
            <DialogDescription>
              {t('Enter the payment details to record a new payment transaction.')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patient_id">{t('Patient')} *</Label>
              <Select
                value={recordPaymentForm.patient_id}
                onValueChange={(value) =>
                  setRecordPaymentForm({
                    ...recordPaymentForm,
                    patient_id: value,
                  })
                }
                disabled={loadingPatients}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingPatients ? "Loading patients..." : "Select a patient"} />
                </SelectTrigger>
                <SelectContent>
                  {availablePatients.map((patient) => (
                    <SelectItem key={patient._id} value={patient._id}>
                      {patient.first_name} {patient.last_name} ({patient.email || patient.phone})
                    </SelectItem>
                  ))}
                  {availablePatients.length === 0 && !loadingPatients && (
                    <SelectItem value="no-patients-found" disabled>
                      {t('No patients found')}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                {t('Required: Select the patient for this payment.')}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="invoice_id">{t('Invoice (Optional)')}</Label>
              <Select
                value={recordPaymentForm.invoice_id || "no-invoice"} // Show "no-invoice" when empty
                onValueChange={(value) => {
                  // Auto-fill amount when invoice is selected
                  const selectedInvoice = availableInvoices.find(inv => inv._id === value);
                  setRecordPaymentForm({
                    ...recordPaymentForm,
                    invoice_id: value === "no-invoice" ? "" : value, // Convert back to empty string for API
                    amount: selectedInvoice ? selectedInvoice.total_amount.toString() : recordPaymentForm.amount,
                    description: selectedInvoice 
                      ? `Payment for invoice ${selectedInvoice.invoice_number || selectedInvoice._id}` 
                      : recordPaymentForm.description
                  });
                }}
                disabled={loadingInvoices}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingInvoices ? "Loading invoices..." : "Select an invoice (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-invoice">None (General Payment)</SelectItem>
                  {availableInvoices.map((invoice) => (
                    <SelectItem key={invoice._id} value={invoice._id}>
                      {invoice.invoice_number || invoice._id} - ${invoice.total_amount} 
                      {typeof invoice.patient_id === 'object' && invoice.patient_id
                        ? ` (${invoice.patient_id.first_name} ${invoice.patient_id.last_name})`
                        : ''
                      }
                    </SelectItem>
                  ))}
                  {availableInvoices.length === 0 && !loadingInvoices && (
                    <SelectItem value="no-invoices-found" disabled>
                      No pending invoices found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                {t('Optional: Select the invoice if this payment is for a specific invoice.')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">{t('Amount')} *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={recordPaymentForm.amount}
                  onChange={(e) =>
                    setRecordPaymentForm({
                      ...recordPaymentForm,
                      amount: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="method">Payment Method *</Label>
                <Select
                  value={recordPaymentForm.method}
                  onValueChange={(value) =>
                    setRecordPaymentForm({
                      ...recordPaymentForm,
                      method: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('Select method')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="transaction_id">Transaction ID (Optional)</Label>
              <Input
                id="transaction_id"
                placeholder={t('Enter transaction ID')}
                value={recordPaymentForm.transaction_id}
                onChange={(e) =>
                  setRecordPaymentForm({
                    ...recordPaymentForm,
                    transaction_id: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder={t('Enter payment description or notes (required)')}
                value={recordPaymentForm.description}
                onChange={(e) =>
                  setRecordPaymentForm({
                    ...recordPaymentForm,
                    description: e.target.value,
                  })
                }
              />
              <p className="text-sm text-gray-500">
                {t('Required: Provide a description of the payment (e.g., "Consultation fee", "Lab test payment").')}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRecordPaymentModal(false)}
              disabled={recordPaymentLoading}
            >
              {t('Cancel')}
            </Button>
            <Button 
              onClick={handleRecordPayment}
              disabled={recordPaymentLoading}
            >
              {recordPaymentLoading ? t("Recording...") : t("Record Payment")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Modal */}
      <Dialog open={showEditPaymentModal} onOpenChange={setShowEditPaymentModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('Edit Payment')}</DialogTitle>
            <DialogDescription>
              {t('Modify the payment details below. Be careful when editing payment information.')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_patient_id">Patient *</Label>
              <Select
                value={editPaymentForm.patient_id}
                onValueChange={(value) =>
                  setEditPaymentForm({
                    ...editPaymentForm,
                    patient_id: value,
                  })
                }
                disabled={loadingPatients}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingPatients ? "Loading patients..." : "Select a patient"} />
                </SelectTrigger>
                <SelectContent>
                  {availablePatients.map((patient) => (
                    <SelectItem key={patient._id} value={patient._id}>
                      {patient.first_name} {patient.last_name} ({patient.email || patient.phone})
                    </SelectItem>
                  ))}
                  {availablePatients.length === 0 && !loadingPatients && (
                    <SelectItem value="no-patients-found" disabled>
                      {t('No patients found')}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_invoice_id">Invoice (Optional)</Label>
              <Select
                value={editPaymentForm.invoice_id || "no-invoice"}
                onValueChange={(value) => {
                  const selectedInvoice = availableInvoices.find(inv => inv._id === value);
                  setEditPaymentForm({
                    ...editPaymentForm,
                    invoice_id: value === "no-invoice" ? "" : value,
                    amount: selectedInvoice ? selectedInvoice.total_amount.toString() : editPaymentForm.amount,
                  });
                }}
                disabled={loadingInvoices}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingInvoices ? "Loading invoices..." : "Select an invoice (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-invoice">None (General Payment)</SelectItem>
                  {availableInvoices.map((invoice) => (
                    <SelectItem key={invoice._id} value={invoice._id}>
                      {invoice.invoice_number || invoice._id} - ${invoice.total_amount}
                      {typeof invoice.patient_id === 'object' && invoice.patient_id
                        ? ` (${invoice.patient_id.first_name} ${invoice.patient_id.last_name})`
                        : ''
                      }
                    </SelectItem>
                  ))}
                  {availableInvoices.length === 0 && !loadingInvoices && (
                    <SelectItem value="no-invoices-found" disabled>
                      No pending invoices found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_amount">Amount *</Label>
                <Input
                  id="edit_amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={editPaymentForm.amount}
                  onChange={(e) =>
                    setEditPaymentForm({
                      ...editPaymentForm,
                      amount: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_method">Payment Method *</Label>
                <Select
                  value={editPaymentForm.method}
                  onValueChange={(value) =>
                    setEditPaymentForm({
                      ...editPaymentForm,
                      method: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('Select method')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_status">Status *</Label>
                <Select
                  value={editPaymentForm.status}
                  onValueChange={(value) =>
                    setEditPaymentForm({
                      ...editPaymentForm,
                      status: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_transaction_id">Transaction ID (Optional)</Label>
                <Input
                  id="edit_transaction_id"
                  placeholder={t('Enter transaction ID')}
                  value={editPaymentForm.transaction_id}
                  onChange={(e) =>
                    setEditPaymentForm({
                      ...editPaymentForm,
                      transaction_id: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_description">Description *</Label>
              <Textarea
                id="edit_description"
                placeholder={t('Enter payment description or notes (required)')}
                value={editPaymentForm.description}
                onChange={(e) =>
                  setEditPaymentForm({
                    ...editPaymentForm,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditPaymentModal(false);
                setEditingPayment(null);
                setEditPaymentForm({
                  patient_id: "",
                  invoice_id: "",
                  amount: "",
                  method: "",
                  description: "",
                  transaction_id: "",
                  status: "",
                });
              }}
              disabled={editPaymentLoading}
            >
              {t('Cancel')}
            </Button>
            <Button 
              onClick={handleEditPayment}
              disabled={editPaymentLoading}
            >
              {editPaymentLoading ? t("Updating...") : t("Update Payment")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Payment Details Modal */}
      <Dialog open={showViewPaymentModal} onOpenChange={setShowViewPaymentModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('Payment Details')}</DialogTitle>
            <DialogDescription>
              {t('Complete information about this payment transaction')}
            </DialogDescription>
          </DialogHeader>
          
          {viewingPayment && (
            <div className="grid gap-6 py-4">
              {/* Payment Overview */}
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {t('Payment Information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">{t('Payment ID')}</Label>
                    <p className="font-medium text-gray-900">{viewingPayment._id}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">{t('Status')}</Label>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(viewingPayment.status)}
                      <Badge className={`${getStatusColor(viewingPayment.status)}`}>
                        {viewingPayment.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">{t('Amount')}</Label>
                    <p className="font-medium text-gray-900 text-lg">
                      <CurrencyDisplay amount={viewingPayment.amount} variant="large" />
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">{t('Payment Method')}</Label>
                    <div className="flex items-center space-x-2">
                      {getPaymentMethodIcon(viewingPayment.method)}
                      <span className="font-medium text-gray-900">
                        {getPaymentMethodLabel(viewingPayment.method)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">{t('Payment Date')}</Label>
                    <p className="font-medium text-gray-900">
                      {formatDateTime(viewingPayment.payment_date)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">{t('Created At')}</Label>
                    <p className="font-medium text-gray-900">
                      {formatDateTime(viewingPayment.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {t('Patient Information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">{t('Patient Name')}</Label>
                    <p className="font-medium text-gray-900">
                      {getPatientDisplay(viewingPayment.patient_id)}
                    </p>
                  </div>
                  {typeof viewingPayment.patient_id === 'object' && viewingPayment.patient_id.email && (
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-600">Email</Label>
                      <p className="font-medium text-gray-900">
                        {viewingPayment.patient_id.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Invoice Information */}
              {viewingPayment.invoice_id && (
                <div className="grid gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    {t('Invoice Information')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-600">{t('Invoice Number')}</Label>
                      <p className="font-medium text-gray-900">
                        {getInvoiceDisplay(viewingPayment.invoice_id)}
                      </p>
                    </div>
                    {typeof viewingPayment.invoice_id === 'object' && (
                      <div className="space-y-1">
                        <Label className="text-sm text-gray-600">{t('Invoice Amount')}</Label>
                        <p className="font-medium text-gray-900">
                          <CurrencyDisplay amount={viewingPayment.invoice_id.total_amount} />
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Financial Details */}
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {t('Financial Details')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">{t('Gross Amount')}</Label>
                    <p className="font-medium text-gray-900">
                      <CurrencyDisplay amount={viewingPayment.amount} />
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">{t('Processing Fee')}</Label>
                    <p className="font-medium text-gray-900">
                      <CurrencyDisplay amount={viewingPayment.processing_fee || 0} />
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">{t('Net Amount')}</Label>
                    <p className="font-medium text-green-600 text-lg">
                      <CurrencyDisplay amount={viewingPayment.net_amount} />
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Link Section - for Stripe payments */}
              {viewingPayment.method === 'stripe' && viewingPayment.payment_link && (
                <div className="grid gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    {t('Payment Link')}
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">{t('Stripe Payment Link')}</Label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={viewingPayment.payment_link}
                          className="flex-1 font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              const success = await paymentApi.copyPaymentLink(viewingPayment.payment_link!);
                              if (success) {
                                toast({
                                  title: t("Link Copied!"),
                                  description: t("Payment link has been copied to clipboard"),
                                });
                              } else {
                                throw new Error('Copy failed');
                              }
                            } catch (error) {
                              toast({
                                title: t("Copy Failed"),
                                description: t("Could not copy link to clipboard. Please copy manually."),
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Receipt className="h-4 w-4 mr-1" />
                          {t('Copy')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(viewingPayment.payment_link!, '_blank')}
                        >
                          <Link className="h-4 w-4 mr-1" />
                          {t('Open')}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        {t('Share this link with the patient to collect payment securely via Stripe')}
                      </p>
                    </div>
                    
                    {/* Checkout Session ID */}
                    {viewingPayment.stripe_checkout_session_id && (
                      <div className="space-y-1">
                        <Label className="text-sm text-gray-600">{t('Checkout Session ID')}</Label>
                        <p className="font-mono text-xs bg-gray-100 p-2 rounded border break-all">
                          {viewingPayment.stripe_checkout_session_id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Transaction Details */}
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {t('Transaction Details')}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {viewingPayment.transaction_id && (
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-600">{t('Transaction ID')}</Label>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded border">
                        {viewingPayment.transaction_id}
                      </p>
                    </div>
                  )}
                  {viewingPayment.card_last4 && (
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-600">{t('Card Last 4 Digits')}</Label>
                      <p className="font-medium text-gray-900">****{viewingPayment.card_last4}</p>
                    </div>
                  )}
                  {viewingPayment.insurance_provider && (
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-600">{t('Insurance Provider')}</Label>
                      <p className="font-medium text-gray-900">{viewingPayment.insurance_provider}</p>
                    </div>
                  )}
                  {viewingPayment.description && (
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-600">{t('Description')}</Label>
                      <p className="font-medium text-gray-900">{viewingPayment.description}</p>
                    </div>
                  )}
                  {viewingPayment.failure_reason && (
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-600">Failure Reason</Label>
                      <p className="font-medium text-red-600 bg-red-50 p-2 rounded border">
                        {viewingPayment.failure_reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* System Information */}
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {t('System Information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">{t('Created At')}</Label>
                    <p className="font-medium text-gray-900">
                      {formatDateTime(viewingPayment.created_at)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-600">{t('Last Updated')}</Label>
                    <p className="font-medium text-gray-900">
                      {formatDateTime(viewingPayment.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowViewPaymentModal(false);
                setViewingPayment(null);
              }}
            >
              {t('Close')}
            </Button>
            {viewingPayment && (
              <Button
                onClick={() => {
                  setShowViewPaymentModal(false);
                  handleOpenEditPaymentModal(viewingPayment);
                }}
              >
                {t('Edit Payment')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Payment Link Modal */}
      <CreatePaymentLinkModal
        open={showCreatePaymentLinkModal}
        onOpenChange={setShowCreatePaymentLinkModal}
        onPaymentLinkCreated={handlePaymentLinkCreated}
      />


    </div>
  );
};

export default Payments;
