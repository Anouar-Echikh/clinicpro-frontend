import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import {
  Receipt,
  User,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiService, type Invoice } from "@/services/api";

interface ViewInvoiceModalProps {
  invoiceId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewInvoiceModal: React.FC<ViewInvoiceModalProps> = ({ 
  invoiceId, 
  isOpen, 
  onClose 
}) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && invoiceId) {
      loadInvoice();
    }
  }, [isOpen, invoiceId]);

  const loadInvoice = async () => {
    if (!invoiceId) return;
    
    try {
      setLoading(true);
      const invoiceData = await apiService.getInvoice(invoiceId);
      setInvoice(invoiceData);
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast({
        title: "Error",
        description: "Failed to load invoice details.",
        variant: "destructive",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "cancelled":
        return <X className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPatientDisplay = (patient: string | { _id: string; first_name: string; last_name: string; phone?: string; email?: string }) => {
    if (typeof patient === 'string') {
      return patient;
    }
    return `${patient.first_name} ${patient.last_name}`;
  };

  const getPatientContact = (patient: string | { _id: string; first_name: string; last_name: string; phone?: string; email?: string }) => {
    if (typeof patient === 'string') {
      return {};
    }
    return {
      phone: patient.phone,
      email: patient.email,
    };
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Receipt className="h-5 w-5 mr-2 text-blue-600" />
            Invoice Details
          </DialogTitle>
          <DialogDescription>
            View complete invoice information and payment details
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading invoice...</span>
          </div>
        ) : invoice ? (
          <div className="space-y-6">
            {/* Invoice Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Invoice #{invoice.invoice_number}</CardTitle>
                    <p className="text-sm text-gray-600">
                      Created on {formatDate(invoice.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(invoice.status)}
                    <Badge className={`${getStatusColor(invoice.status)}`}>
                      {invoice.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Patient Name</p>
                    <p className="text-lg font-semibold">{getPatientDisplay(invoice.patient_id)}</p>
                  </div>
                  {getPatientContact(invoice.patient_id).phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phone</p>
                      <p className="text-lg">{getPatientContact(invoice.patient_id).phone}</p>
                    </div>
                  )}
                  {getPatientContact(invoice.patient_id).email && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="text-lg">{getPatientContact(invoice.patient_id).email}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Invoice Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Issue Date</p>
                    <p className="text-lg">{formatDate(invoice.issue_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Due Date</p>
                    <p className={`text-lg ${invoice.status === "overdue" ? "text-red-600 font-semibold" : ""}`}>
                      {formatDate(invoice.due_date)}
                    </p>
                  </div>
                  {invoice.paid_at && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Payment Date</p>
                      <p className="text-lg text-green-600">{formatDate(invoice.paid_at)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Services & Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoice.services.map((service, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <p className="font-medium">{service.description}</p>
                          <Badge variant="outline" className="mt-1">
                            {service.type}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Quantity</p>
                          <p className="font-semibold">{service.quantity}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Unit Price</p>
                          <p className="font-semibold">
                            <CurrencyDisplay amount={service.unit_price} />
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 text-right">
                        <p className="text-lg font-bold">
                          Total: <CurrencyDisplay amount={service.total} />
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span><CurrencyDisplay amount={invoice.subtotal} /></span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span><CurrencyDisplay amount={invoice.tax_amount} /></span>
                  </div>
                  {invoice.discount && invoice.discount > 0 && (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span className="text-green-600">-<CurrencyDisplay amount={invoice.discount} /></span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total Amount:</span>
                    <span className="text-green-600">
                      <CurrencyDisplay amount={invoice.total_amount} variant="large" />
                    </span>
                  </div>
                  {invoice.payment_method && (
                    <div className="mt-4 pt-2 border-t">
                      <p className="text-sm text-gray-600">Payment Method:</p>
                      <p className="font-medium capitalize">{invoice.payment_method.replace('_', ' ')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {invoice.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">Invoice not found</p>
              <p className="text-gray-500">The requested invoice could not be loaded.</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewInvoiceModal; 