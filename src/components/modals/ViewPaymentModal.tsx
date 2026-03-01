import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  CreditCard,
  Calendar,
  Hash,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Copy,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiService, type Payment } from "@/services/api";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { Skeleton } from "@/components/ui/skeleton";

interface ViewPaymentModalProps {
  paymentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewPaymentModal: React.FC<ViewPaymentModalProps> = ({
  paymentId,
  isOpen,
  onClose,
}) => {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && paymentId) {
      fetchPayment();
    }
  }, [isOpen, paymentId]);

  const fetchPayment = async () => {
    if (!paymentId) return;

    try {
      setLoading(true);
      const paymentData = await apiService.getPayment(paymentId);
      setPayment(paymentData);
    } catch (error) {
      console.error("Error fetching payment:", error);
      toast({
        title: "Error",
        description: "Failed to load payment details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "processing":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "refunded":
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-orange-100 text-orange-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "credit_card":
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case "cash":
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case "bank_transfer":
        return <DollarSign className="h-4 w-4 text-purple-600" />;
      case "upi":
        return <CreditCard className="h-4 w-4 text-orange-600" />;
      case "insurance":
        return <FileText className="h-4 w-4 text-indigo-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const getPatientDisplay = (patient: string | { _id: string; first_name: string; last_name: string; email?: string } | null) => {
    if (!patient) return 'Unknown Patient';
    if (typeof patient === 'string') return patient;
    return `${patient.first_name} ${patient.last_name}`;
  };

  const getPatientEmail = (patient: string | { _id: string; first_name: string; last_name: string; email?: string } | null) => {
    if (!patient || typeof patient === 'string') return '';
    return patient.email || '';
  };

  const getInvoiceDisplay = (invoice: string | { _id: string; invoice_number: string; total_amount: number } | null) => {
    if (!invoice) return 'N/A';
    if (typeof invoice === 'string') return invoice;
    return invoice.invoice_number || invoice._id;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : payment ? (
          <div className="space-y-6">
            {/* Payment Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Payment Overview</CardTitle>
                  <Badge className={`${getStatusColor(payment.status)}`}>
                    {getStatusIcon(payment.status)}
                    <span className="ml-1 capitalize">{payment.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Payment ID</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm">{payment._id}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(payment._id, "Payment ID")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Transaction ID</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm">{payment.transaction_id || 'N/A'}</p>
                      {payment.transaction_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(payment.transaction_id!, "Transaction ID")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amount Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Amount Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Total Amount</p>
                    <CurrencyDisplay 
                      amount={payment.amount} 
                      className="text-2xl font-bold text-gray-900"
                    />
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Processing Fee</p>
                    <CurrencyDisplay 
                      amount={payment.processing_fee} 
                      className="text-xl font-semibold text-orange-600"
                    />
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Net Amount</p>
                    <CurrencyDisplay 
                      amount={payment.net_amount} 
                      className="text-xl font-semibold text-green-600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method & Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {getPaymentMethodIcon(payment.method)}
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Method</p>
                    <p className="capitalize font-medium">{payment.method.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Payment Date</p>
                    <p className="font-medium">{formatDate(payment.payment_date)}</p>
                  </div>
                  {payment.card_last4 && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Card Ending</p>
                      <p className="font-mono">****{payment.card_last4}</p>
                    </div>
                  )}
                  {payment.insurance_provider && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Insurance Provider</p>
                      <p className="font-medium">{payment.insurance_provider}</p>
                    </div>
                  )}
                </div>
                {payment.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Description</p>
                    <p className="text-sm">{payment.description}</p>
                  </div>
                )}
                {payment.failure_reason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-600">Failure Reason</p>
                    <p className="text-sm text-red-700">{payment.failure_reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Related Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Patient</p>
                    <p className="font-medium">{getPatientDisplay(payment.patient_id)}</p>
                    {getPatientEmail(payment.patient_id) && (
                      <p className="text-sm text-gray-500">{getPatientEmail(payment.patient_id)}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Invoice</p>
                    <p className="font-medium">{getInvoiceDisplay(payment.invoice_id)}</p>
                    {typeof payment.invoice_id === 'object' && payment.invoice_id && (
                      <p className="text-sm text-gray-500">
                        Total: <CurrencyDisplay amount={payment.invoice_id.total_amount} />
                      </p>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <p>Created: {formatDate(payment.created_at)}</p>
                  </div>
                  <div>
                    <p>Updated: {formatDate(payment.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Payment not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewPaymentModal; 