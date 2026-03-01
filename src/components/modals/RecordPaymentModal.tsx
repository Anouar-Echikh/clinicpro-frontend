import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DollarSign,
  CreditCard,
  Banknote,
  Building2,
  Smartphone,
  Shield,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { apiService, type Invoice } from "@/services/api";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";

interface RecordPaymentModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RecordPaymentModal = ({ invoice, isOpen, onClose, onSuccess }: RecordPaymentModalProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    method: "",
    description: "",
    transaction_id: "",
  });

  const paymentMethods = [
    { value: "cash", label: t("Cash"), icon: Banknote },
    { value: "credit_card", label: t("Credit Card"), icon: CreditCard },
    { value: "bank_transfer", label: t("Bank Transfer"), icon: Building2 },
    { value: "upi", label: t("UPI"), icon: Smartphone },
    { value: "insurance", label: t("Insurance"), icon: Shield },
  ];

  useEffect(() => {
    if (isOpen && invoice) {
      // Reset form when opening
      setFormData({
        amount: invoice.due_amount > 0 ? invoice.due_amount.toString() : "",
        method: "",
        description: `Payment for Invoice ${invoice.invoice_number}`,
        transaction_id: "",
      });
    }
  }, [isOpen, invoice]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    setLoading(true);
    try {
      const paymentAmount = parseFloat(formData.amount);
      
      // Validation
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        toast({
          title: t("Error"),
          description: t("Please enter a valid payment amount"),
          variant: "destructive",
        });
        return;
      }

      if (paymentAmount > invoice.due_amount) {
        toast({
          title: t("Error"),
          description: t("Payment amount cannot exceed due amount"),
          variant: "destructive",
        });
        return;
      }

      if (!formData.method) {
        toast({
          title: t("Error"),
          description: t("Please select a payment method"),
          variant: "destructive",
        });
        return;
      }

      await apiService.recordInvoicePayment({
        invoice_id: invoice._id,
        amount: paymentAmount,
        method: formData.method as any,
        description: formData.description,
        transaction_id: formData.transaction_id || undefined,
      });

      toast({
        title: t("Payment Recorded"),
        description: t("Payment has been successfully recorded"),
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error recording payment:", error);
      toast({
        title: t("Error"),
        description: error.message || t("Failed to record payment"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-orange-100 text-orange-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPatientDisplay = (patient: Invoice['patient_id']) => {
    if (!patient) return t('Unknown Patient');
    if (typeof patient === 'string') return patient;
    return `${patient.first_name} ${patient.last_name}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t("Record Payment")}
          </DialogTitle>
          <DialogDescription>
            {t("Record a payment against this invoice")}
          </DialogDescription>
        </DialogHeader>

        {invoice && (
          <>
            {/* Invoice Summary */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">{t("Invoice Number")}</Label>
                    <p className="font-medium">{invoice.invoice_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t("Patient")}</Label>
                    <p className="font-medium">{getPatientDisplay(invoice.patient_id)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t("Total Amount")}</Label>
                    <p className="font-medium">
                      <CurrencyDisplay amount={invoice.total_amount} />
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t("Status")}</Label>
                    <Badge variant="outline" className={`${getStatusColor(invoice.status)} border-0`}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label className="text-sm text-muted-foreground">{t("Paid Amount")}</Label>
                    <p className="font-medium text-green-600">
                      <CurrencyDisplay amount={invoice.total_paid_amount || 0} />
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t("Due Amount")}</Label>
                    <p className="font-medium text-orange-600">
                      <CurrencyDisplay amount={invoice.due_amount || invoice.total_amount} />
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">{t("Payment Amount")} *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={invoice.due_amount || invoice.total_amount}
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">{t("Payment Method")} *</Label>
                  <Select
                    value={formData.method}
                    onValueChange={(value) => handleInputChange("method", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select payment method")} />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                          <SelectItem key={method.value} value={method.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {method.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction_id">{t("Transaction ID")} ({t("Optional")})</Label>
                <Input
                  id="transaction_id"
                  placeholder={t("Enter transaction ID or reference number")}
                  value={formData.transaction_id}
                  onChange={(e) => handleInputChange("transaction_id", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("Description")} *</Label>
                <Textarea
                  id="description"
                  placeholder={t("Enter payment description or notes")}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                  {t("Cancel")}
                </Button>
                <Button type="submit" disabled={loading || !formData.method || !formData.amount}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("Record Payment")}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecordPaymentModal;


