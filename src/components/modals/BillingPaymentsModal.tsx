import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DollarSign,
  Calendar,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Plus,
  Download,
  Filter,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { labVendorApi, PaymentRecord, BillingSummary } from "@/services/api/labVendorApi";

interface BillingPaymentsModalProps {
  vendorId: string | null;
  vendorName?: string;
  isOpen: boolean;
  onClose: () => void;
}

const BillingPaymentsModal: React.FC<BillingPaymentsModalProps> = ({
  vendorId,
  vendorName,
  isOpen,
  onClose,
}) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Mock data for demonstration
  const mockPayments: PaymentRecord[] = [
    {
      id: "PAY-001",
      vendorId: vendorId || "",
      amount: 1250.75,
      paymentDate: new Date("2024-01-15"),
      paymentMethod: "bank_transfer",
      reference: "INV-2024-001",
      status: "completed",
      notes: "Monthly lab services payment",
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "PAY-002",
      vendorId: vendorId || "",
      amount: 890.50,
      paymentDate: new Date("2024-01-02"),
      paymentMethod: "ach",
      reference: "INV-2023-128",
      status: "completed",
      notes: "December services payment",
      createdAt: new Date("2024-01-02"),
    },
    {
      id: "PAY-003",
      vendorId: vendorId || "",
      amount: 2150.00,
      paymentDate: new Date("2024-01-25"),
      paymentMethod: "check",
      reference: "INV-2024-002",
      status: "pending",
      notes: "Quarterly contract payment",
      createdAt: new Date("2024-01-20"),
    },
    {
      id: "PAY-004",
      vendorId: vendorId || "",
      amount: 675.25,
      paymentDate: new Date("2023-12-28"),
      paymentMethod: "credit_card",
      reference: "INV-2023-127",
      status: "completed",
      notes: "Emergency testing services",
      createdAt: new Date("2023-12-28"),
    },
    {
      id: "PAY-005",
      vendorId: vendorId || "",
      amount: 1425.80,
      paymentDate: new Date("2023-12-15"),
      paymentMethod: "wire",
      reference: "INV-2023-126",
      status: "failed",
      notes: "Failed wire transfer - retry needed",
      createdAt: new Date("2023-12-15"),
    },
  ];

  const mockSummary: BillingSummary = {
    totalAmount: 15432.75,
    paidAmount: 12856.50,
    pendingAmount: 2150.00,
    overdueAmount: 426.25,
    lastPaymentDate: new Date("2024-01-15"),
    nextPaymentDue: new Date("2024-02-15"),
    averageMonthlySpend: 1287.73,
  };

  useEffect(() => {
    if (vendorId && isOpen) {
      fetchBillingData();
    }
  }, [vendorId, isOpen, selectedYear, selectedMonth, pagination.page]);

  const fetchBillingData = async () => {
    if (!vendorId) return;
    
    try {
      setIsLoading(true);
      const filters = {
        page: pagination.page,
        limit: pagination.limit,
        year: parseInt(selectedYear) || undefined,
        month: selectedMonth !== "all" ? parseInt(selectedMonth) : undefined,
      };
      
      const response = await labVendorApi.getBillingPayments(vendorId, filters);
      setPayments(response.payments);
      setSummary(response.summary);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error fetching billing data:", error);
      toast({
        title: "Error",
        description: "Failed to load billing data. Showing sample data.",
        variant: "destructive",
      });
      // Fallback to mock data
      setPayments(mockPayments);
      setSummary(mockSummary);
      setPagination({
        page: 1,
        limit: 10,
        total: mockPayments.length,
        pages: 1,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return "Bank Transfer";
      case "check":
        return "Check";
      case "credit_card":
        return "Credit Card";
      case "ach":
        return "ACH";
      case "wire":
        return "Wire Transfer";
      default:
        return method;
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Billing & Payments - {vendorName || "Vendor"}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(summary.totalAmount)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(summary.paidAmount)}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(summary.pendingAmount)}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Monthly Avg</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(summary.averageMonthlySpend)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payment Status */}
          {summary?.overdueAmount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Overdue Payments</h3>
                  <p className="text-sm text-red-700">
                    You have {formatCurrency(summary.overdueAmount)} in overdue payments.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-4">
                  <div>
                    <Label htmlFor="year-filter">Year</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="month-filter">Month</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All months" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All months</SelectItem>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Record Payment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading payment history...</p>
                  </div>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {formatDate(payment.paymentDate)}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                              {getPaymentMethodLabel(payment.paymentMethod)}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {payment.reference || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(payment.status)}
                              <Badge className={getStatusColor(payment.status)}>
                                {payment.status.toUpperCase()}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="text-sm truncate" title={payment.notes}>
                                {payment.notes || "-"}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {payments.length === 0 && (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No payment records found</p>
                      <p className="text-sm text-gray-500">
                        Try adjusting your filters or date range
                      </p>
                    </div>
                  )}

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm text-gray-600">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                        {pagination.total} results
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page <= 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page >= pagination.pages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Payment Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Payment</label>
                    <p className="text-sm">
                      {summary.lastPaymentDate
                        ? formatDate(summary.lastPaymentDate)
                        : "No payments yet"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Next Payment Due</label>
                    <p className="text-sm">
                      {summary.nextPaymentDue
                        ? formatDate(summary.nextPaymentDue)
                        : "No scheduled payments"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Payment Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Completion Rate</label>
                    <p className="text-lg font-semibold text-green-600">
                      {summary.totalAmount > 0 
                        ? Math.round((summary.paidAmount / summary.totalAmount) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Outstanding Balance</label>
                    <p className="text-lg font-semibold text-blue-600">
                      {formatCurrency(summary.totalAmount - summary.paidAmount)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BillingPaymentsModal; 