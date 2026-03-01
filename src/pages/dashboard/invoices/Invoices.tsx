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
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  Receipt,
  Send,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Calendar,
  AlertTriangle,
  TrendingUp,
  FileText,
  DollarSign,
  RefreshCw,
  Loader2,
} from "lucide-react";
import CreateInvoiceModal from "@/components/modals/CreateInvoiceModal";
import ViewInvoiceModal from "@/components/modals/ViewInvoiceModal";
import EditInvoiceModal from "@/components/modals/EditInvoiceModal";
import DeleteInvoiceModal from "@/components/modals/DeleteInvoiceModal";
import RecordPaymentModal from "@/components/modals/RecordPaymentModal";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { toast } from "@/hooks/use-toast";
import { apiService, type Invoice } from "@/services/api";
import { InvoicePDFGenerator, type ClinicInfo } from "@/utils/invoicePdfUtils";
import { useClinic } from "@/contexts/ClinicContext";

const Invoices = () => {
  const { t } = useTranslation();
  const { currentClinic } = useClinic();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceStats, setInvoiceStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [viewInvoiceModal, setViewInvoiceModal] = useState<{ isOpen: boolean; invoiceId: string | null }>({
    isOpen: false,
    invoiceId: null,
  });
  const [editInvoiceModal, setEditInvoiceModal] = useState<{ isOpen: boolean; invoiceId: string | null }>({
    isOpen: false,
    invoiceId: null,
  });
  const [deleteInvoiceModal, setDeleteInvoiceModal] = useState<{ isOpen: boolean; invoiceId: string | null }>({
    isOpen: false,
    invoiceId: null,
  });
  const [recordPaymentModal, setRecordPaymentModal] = useState<{ isOpen: boolean; invoice: Invoice | null }>({
    isOpen: false,
    invoice: null,
  });

  // Load invoices data
  useEffect(() => {
    loadInvoices();
    loadInvoiceStats();
  }, [currentPage, selectedStatus, searchTerm]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
      };
      
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (searchTerm) params.search = searchTerm;

      const response = await apiService.getInvoices(params);
      setInvoices(response.data.invoices || []);
      setTotalPages(response.data.pagination.pages || 1);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setInvoices([]); // Set to empty array on error
      toast({
        title: t("Error"),
        description: t("Failed to load invoices. Please try again."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadInvoiceStats = async () => {
    try {
      const stats = await apiService.getInvoiceStats();
      setInvoiceStats(stats);
    } catch (error) {
      console.error('Error loading invoice stats:', error);
    }
  };

  const handleRefresh = () => {
    loadInvoices();
    loadInvoiceStats();
  };

  // Mock invoice data for fallback
  const mockInvoices = [
    {
      id: "INV-001",
      patientName: "John Doe",
      patientEmail: "john.doe@email.com",
      appointmentDate: "2024-01-15",
      issueDate: "2024-01-15",
      dueDate: "2024-02-15",
      items: [
        { description: "General Consultation", quantity: 1, price: 100 },
        { description: "Blood Test", quantity: 1, price: 50 },
      ],
      subtotal: 150,
      tax: 15,
      discount: 0,
      total: 165,
      status: "paid",
      paymentMethod: "Credit Card",
      paidDate: "2024-01-16",
    },
    {
      id: "INV-002",
      patientName: "Sarah Johnson",
      patientEmail: "sarah.j@email.com",
      appointmentDate: "2024-01-18",
      issueDate: "2024-01-18",
      dueDate: "2024-02-18",
      items: [
        { description: "Cardiac Consultation", quantity: 1, price: 200 },
        { description: "ECG Test", quantity: 1, price: 75 },
      ],
      subtotal: 275,
      tax: 27.5,
      discount: 25,
      total: 277.5,
      status: "pending",
      paymentMethod: null,
      paidDate: null,
    },
  ];

  const displayInvoices = loading ? [] : (invoices.length > 0 ? invoices : []);

  const getPatientDisplay = (patient: string | { _id: string; first_name: string; last_name: string; phone?: string; email?: string } | null) => {
    if (!patient) {
      return t('Unknown Patient');
    }
    if (typeof patient === 'string') {
      return patient;
    }
    return `${patient.first_name} ${patient.last_name}`;
  };

  const getPatientEmail = (patient: string | { _id: string; first_name: string; last_name: string; phone?: string; email?: string } | null) => {
    if (!patient) {
      return '';
    }
    if (typeof patient === 'string') {
      return patient;
    }
    return patient.email || '';
  };

  const getPatientId = (patient: string | { _id: string; first_name: string; last_name: string; phone?: string; email?: string } | null) => {
    if (!patient) {
      return '';
    }
    if (typeof patient === 'string') {
      return patient;
    }
    return patient._id;
  };

  const filteredInvoices = displayInvoices.filter((invoice) => {
    if (!invoice) return false;
    
    let patientSearchString = '';
    if (invoice.patient_id) {
      if (typeof invoice.patient_id === 'string') {
        patientSearchString = invoice.patient_id;
      } else {
        patientSearchString = `${invoice.patient_id.first_name || ''} ${invoice.patient_id.last_name || ''} ${invoice.patient_id.email || ''}`.trim();
      }
    }
    
    const matchesSearch =
      (invoice._id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.invoice_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientSearchString.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || invoice.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "partial":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "cancelled":
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "partial":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      await apiService.updateInvoice(invoiceId, { status: "paid" });
      toast({
        title: t("Payment Recorded"),
        description: `${t('Invoice')} ${invoiceId} ${t('has been marked as paid.')}`,
      });
      loadInvoices(); // Reload invoices
    } catch (error) {
      toast({
        title: t("Error"),
        description: t("Failed to update invoice status."),
        variant: "destructive",
      });
    }
  };

  // Modal handlers
  const handleViewInvoice = (invoiceId: string) => {
    setViewInvoiceModal({ isOpen: true, invoiceId });
  };

  const handleEditInvoice = (invoiceId: string) => {
    setEditInvoiceModal({ isOpen: true, invoiceId });
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setDeleteInvoiceModal({ isOpen: true, invoiceId });
  };

  const handleRecordPayment = (invoice: Invoice) => {
    setRecordPaymentModal({ isOpen: true, invoice });
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const invoiceData = await apiService.getInvoice(invoiceId);
      
      // Prepare clinic info for PDF
      const clinicInfo: ClinicInfo | undefined = currentClinic ? {
        name: currentClinic.name,
        address: currentClinic.address,
        contact: currentClinic.contact
      } : undefined;
      
      await InvoicePDFGenerator.generateInvoicePDF(invoiceData, clinicInfo);
      toast({
        title: t("Download Started"),
        description: t("Invoice PDF is being downloaded."),
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: t("Error"),
        description: t("Failed to download invoice PDF. Please try again."),
        variant: "destructive",
      });
    }
  };

  const closeViewModal = () => {
    setViewInvoiceModal({ isOpen: false, invoiceId: null });
  };

  const closeEditModal = () => {
    setEditInvoiceModal({ isOpen: false, invoiceId: null });
    loadInvoices(); // Reload invoices after edit
  };

  const closeDeleteModal = () => {
    setDeleteInvoiceModal({ isOpen: false, invoiceId: null });
    loadInvoices(); // Reload invoices after delete
  };

  const closeRecordPaymentModal = () => {
    setRecordPaymentModal({ isOpen: false, invoice: null });
    loadInvoices(); // Reload invoices after payment recorded
    loadInvoiceStats(); // Reload stats to reflect payment changes
  };

  // Calculate stats - use API stats when available, fallback to local calculations
  const totalInvoices = invoiceStats?.totalInvoices || invoices?.length || 0;
  const totalRevenue = invoiceStats?.totalRevenue || (invoices || [])
    .filter((i) => i?.status === "paid")
    .reduce((sum, invoice) => sum + (invoice?.total_amount || 0), 0);
  const monthlyRevenue = invoiceStats?.monthlyRevenue || 0;
  const paidInvoices = invoiceStats?.paidInvoices || (invoices || []).filter((i) => i?.status === "paid").length;
  const overdueInvoices = invoiceStats?.overdueInvoices || (invoices || []).filter((i) => i?.status === "overdue").length;

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
            {t('Invoice Management')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {t('Create, send, and track patient invoices')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
            className="h-9"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t('Refresh')}</span>
          </Button>
          <CreateInvoiceModal 
            trigger={
              <Button size="sm" className="h-9">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t('Create Invoice')}</span>
                <span className="sm:hidden">{t('Create')}</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('Total Invoices')}</CardTitle>
            <Receipt className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalInvoices}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('All invoices')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('Total Revenue')}</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent>
                         <div className="text-xl sm:text-2xl font-bold text-green-600">
               {loading ? (
                 <Loader2 className="h-6 w-6 animate-spin" />
               ) : (
                 <CurrencyDisplay amount={totalRevenue} variant="default" />
               )}
             </div>
            <p className="text-xs text-muted-foreground">{t('All time earnings')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('Monthly Revenue')}</CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <CurrencyDisplay amount={monthlyRevenue} variant="default" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{t('This month')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('Paid')}</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : paidInvoices}
            </div>
            <p className="text-xs text-muted-foreground">{t('Completed payments')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('Overdue')}</CardTitle>
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : overdueInvoices}
            </div>
            <p className="text-xs text-muted-foreground">{t('Needs attention')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('Search by invoice ID, patient name, or email...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 sm:h-10"
                />
              </div>
            </div>
            <div className="flex flex-col xs:flex-row gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full xs:w-[120px] sm:w-[140px] h-9 sm:h-10">
                  <SelectValue placeholder={t('Status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Status')}</SelectItem>
                  <SelectItem value="pending">{t('Pending')}</SelectItem>
                  <SelectItem value="partial">{t('Partial')}</SelectItem>
                  <SelectItem value="paid">{t('Paid')}</SelectItem>
                  <SelectItem value="overdue">{t('Overdue')}</SelectItem>
                  <SelectItem value="cancelled">{t('Cancelled')}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedDateRange}
                onValueChange={setSelectedDateRange}
              >
                <SelectTrigger className="w-full xs:w-[120px] sm:w-[140px] h-9 sm:h-10">
                  <SelectValue placeholder={t('Date Range')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Time')}</SelectItem>
                  <SelectItem value="today">{t('Today')}</SelectItem>
                  <SelectItem value="week">{t('This Week')}</SelectItem>
                  <SelectItem value="month">{t('This Month')}</SelectItem>
                  <SelectItem value="quarter">{t('This Quarter')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">{t('Invoice Records')} ({totalInvoices})</CardTitle>
          <CardDescription className="text-sm">
            {t('Manage all patient invoices, payments, and billing information')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">{t('Loading invoices...')}</span>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedStatus !== "all" || selectedDateRange !== "all" 
                  ? t('No invoices found matching your filters.') 
                  : t('No invoices found. Create your first invoice to get started.')}
              </p>
              <CreateInvoiceModal 
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('Create Your First Invoice')}
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="min-w-[200px]">{t('Invoice Details')}</TableHead>
                      <TableHead className="min-w-[180px]">{t('Patient')}</TableHead>
                      <TableHead className="min-w-[120px] hidden lg:table-cell">{t('Issue Date')}</TableHead>
                      <TableHead className="min-w-[120px] hidden lg:table-cell">{t('Due Date')}</TableHead>
                      <TableHead className="min-w-[120px]">{t('Amount')}</TableHead>
                      <TableHead className="min-w-[100px]">{t('Status')}</TableHead>
                      <TableHead className="text-right min-w-[100px]">{t('Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Receipt className="h-8 w-8 text-blue-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate">
                                {invoice.invoice_number || invoice._id}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {invoice.services?.length || 0} {(invoice.services?.length || 0) !== 1 ? t('services') : t('service')}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm truncate">
                              {getPatientDisplay(invoice.patient_id)}
                            </div>
                            {getPatientEmail(invoice.patient_id) && (
                              <div className="text-xs text-muted-foreground truncate">
                                {getPatientEmail(invoice.patient_id)}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {t('Invoice:')}: {invoice.invoice_number}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-sm">{formatDate(invoice.created_at)}</span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div
                            className={`text-sm ${
                              invoice.status === "overdue"
                                ? "text-red-600 font-medium"
                                : ""
                            }`}
                          >
                            {formatDate(invoice.due_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">
                              <CurrencyDisplay amount={invoice.total_amount} />
                            </div>
                            {invoice.status === "paid" && invoice.payment_date && (
                              <div className="text-xs text-green-600">
                                {t('Paid')} {formatDate(invoice.payment_date)}
                              </div>
                            )}
                            {invoice.status === "partial" && (
                              <div className="text-xs space-y-1">
                                <div className="text-green-600">
                                  {t('Paid')}: <CurrencyDisplay amount={invoice.total_paid_amount || 0} />
                                </div>
                                <div className="text-orange-600">
                                  {t('Due')}: <CurrencyDisplay amount={invoice.due_amount || invoice.total_amount} />
                                </div>
                              </div>
                            )}
                            {invoice.status === "pending" && (
                              <div className="text-xs text-orange-600">
                                {t('Due')}: <CurrencyDisplay amount={invoice.due_amount || invoice.total_amount} />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(invoice.status)}
                            <Badge
                              variant="outline"
                              className={`text-xs ${getStatusColor(invoice.status)}`}
                            >
                              <span className="capitalize">{invoice.status}</span>
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8">
                                <MoreVertical className="h-4 w-4 mr-1" />
                                {t('Actions')}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewInvoice(invoice._id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                {t('View Invoice')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice._id)}>
                                <Download className="mr-2 h-4 w-4" />
                                {t('Download PDF')}
                              </DropdownMenuItem>
                              {!["paid", "cancelled"].includes(invoice.status) && (
                                <DropdownMenuItem
                                  onClick={() => handleRecordPayment(invoice)}
                                >
                                  <DollarSign className="mr-2 h-4 w-4" />
                                  {t('Record Payment')}
                                </DropdownMenuItem>
                              )}
                              {invoice.status !== "paid" && (
                                <DropdownMenuItem
                                  onClick={() => handleMarkAsPaid(invoice._id)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  {t('Mark as Paid')}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleEditInvoice(invoice._id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                {t('Edit Invoice')}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteInvoice(invoice._id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('Delete Invoice')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4">
                {filteredInvoices.map((invoice) => (
                  <div
                    key={invoice._id}
                    className="border rounded-lg p-4 space-y-3 bg-white shadow-sm"
                  >
                    {/* Header with Invoice and Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Receipt className="h-8 w-8 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {invoice.invoice_number || invoice._id}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {invoice.services?.length || 0} {(invoice.services?.length || 0) !== 1 ? t('services') : t('service')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(invoice.status)}
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusColor(invoice.status)}`}
                        >
                          <span className="capitalize">{invoice.status}</span>
                        </Badge>
                      </div>
                    </div>

                    {/* Patient Information */}
                    <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t('Patient:')}:</span>
                        <span className="font-medium text-gray-900 truncate max-w-[200px]">
                          {getPatientDisplay(invoice.patient_id)}
                        </span>
                      </div>
                      {getPatientEmail(invoice.patient_id) && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{t('Email:')}:</span>
                          <span className="text-gray-900 truncate max-w-[200px]">
                            {getPatientEmail(invoice.patient_id)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t('Invoice #:')}:</span>
                        <span className="text-gray-900">
                          {invoice.invoice_number}
                        </span>
                      </div>
                    </div>

                    {/* Amount and Dates */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          {t('Total Amount')}
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          <CurrencyDisplay amount={invoice.total_amount} />
                        </div>
                        {invoice.status === "paid" && invoice.payment_date && (
                          <div className="text-xs text-green-600">
                            {t('Paid')} {formatDate(invoice.payment_date)}
                          </div>
                        )}
                        {invoice.status === "partial" && (
                          <div className="text-xs space-y-1 mt-1">
                            <div className="text-green-600">
                              {t('Paid')}: <CurrencyDisplay amount={invoice.total_paid_amount || 0} />
                            </div>
                            <div className="text-orange-600">
                              {t('Due')}: <CurrencyDisplay amount={invoice.due_amount || invoice.total_amount} />
                            </div>
                          </div>
                        )}
                        {invoice.status === "pending" && (
                          <div className="text-xs text-orange-600 mt-1">
                            {t('Due')}: <CurrencyDisplay amount={invoice.due_amount || invoice.total_amount} />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          {t('Due Date')}
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            invoice.status === "overdue"
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {formatDate(invoice.due_date)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('Issue:')}: {formatDate(invoice.created_at)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-xs text-gray-500">
                        {t('ID:')}: {invoice._id.slice(-8)}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4 mr-1" />
                            {t('Actions')}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewInvoice(invoice._id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('View Details')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice._id)}>
                            <Download className="mr-2 h-4 w-4" />
                            {t('Download PDF')}
                          </DropdownMenuItem>
                          {!["paid", "cancelled"].includes(invoice.status) && (
                            <DropdownMenuItem
                              onClick={() => handleRecordPayment(invoice)}
                            >
                              <DollarSign className="mr-2 h-4 w-4" />
                              {t('Record Payment')}
                            </DropdownMenuItem>
                          )}
                          {invoice.status !== "paid" && (
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice._id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {t('Mark as Paid')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleEditInvoice(invoice._id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t('Edit Invoice')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteInvoice(invoice._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('Delete Invoice')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t p-4">
              <div className="text-sm text-muted-foreground">
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
        </CardContent>
      </Card>

      {/* Modals */}
      <ViewInvoiceModal
        invoiceId={viewInvoiceModal.invoiceId}
        isOpen={viewInvoiceModal.isOpen}
        onClose={closeViewModal}
      />

      <EditInvoiceModal
        invoiceId={editInvoiceModal.invoiceId}
        isOpen={editInvoiceModal.isOpen}
        onClose={closeEditModal}
        onSuccess={closeEditModal}
      />

      <DeleteInvoiceModal
        invoiceId={deleteInvoiceModal.invoiceId}
        isOpen={deleteInvoiceModal.isOpen}
        onClose={closeDeleteModal}
        onSuccess={closeDeleteModal}
      />

      <RecordPaymentModal
        invoice={recordPaymentModal.invoice}
        isOpen={recordPaymentModal.isOpen}
        onClose={closeRecordPaymentModal}
        onSuccess={closeRecordPaymentModal}
      />
    </div>
  );
};

export default Invoices;
