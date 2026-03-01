import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { 
  DollarSign,
  Mail,
  User,
  Loader2
} from "lucide-react";
import { paymentApi } from "@/services/api/paymentApi";
import { apiService } from "@/services/api";
import type { CreateStripePaymentLinkData, StripePaymentLinkResponse } from "@/types";

interface CreatePaymentLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentLinkCreated?: (paymentData: StripePaymentLinkResponse) => void;
}

interface Patient {
  _id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}

export const CreatePaymentLinkModal: React.FC<CreatePaymentLinkModalProps> = ({
  open,
  onOpenChange,
  onPaymentLinkCreated,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<CreateStripePaymentLinkData>({
    amount: 0,
    currency: 'USD',
    description: '',
    customer_email: '',
    patient_id: '',
    metadata: {}
  });



  // Load patients when modal opens
  useEffect(() => {
    if (open) {
      loadPatients();
      // Reset form when modal opens
      setFormData({
        amount: 0,
        currency: 'USD',
        description: '',
        customer_email: '',
        patient_id: '',
        metadata: {}
      });

    }
  }, [open]);

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await apiService.getPatients({ limit: 100, sort: 'first_name' });
      setPatients(response.data.patients || []);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast({
        title: t("Error"),
        description: t("Failed to load patients list"),
        variant: "destructive",
      });
    } finally {
      setLoadingPatients(false);
    }
  };

  const handlePatientSelect = (patientId: string) => {
    const selectedPatient = patients.find(p => p._id === patientId);
    if (selectedPatient) {
      setFormData({
        ...formData,
        patient_id: patientId,
        customer_email: selectedPatient.email || formData.customer_email,
        description: formData.description || `Payment for ${selectedPatient.first_name} ${selectedPatient.last_name}`
      });
    }
  };

  const handleCreatePaymentLink = async () => {
    try {
      // Validation
      if (!formData.patient_id) {
        toast({
          title: t("Validation Error"),
          description: t("Please select a patient"),
          variant: "destructive",
        });
        return;
      }

      if (!formData.amount || formData.amount <= 0) {
        toast({
          title: t("Validation Error"),
          description: t("Please enter a valid amount"),
          variant: "destructive",
        });
        return;
      }

      if (!formData.customer_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
        toast({
          title: t("Validation Error"),
          description: t("Please enter a valid email address"),
          variant: "destructive",
        });
        return;
      }

      if (!formData.description) {
        toast({
          title: t("Validation Error"),
          description: t("Please enter a description"),
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      // Prepare data - success_url and cancel_url are handled automatically by backend
      const paymentData = { ...formData };

      const response = await paymentApi.createStripePaymentLink(paymentData);
      
      toast({
        title: t("Payment Link Created"),
        description: t("Payment link has been created successfully"),
      });

      // Close the current modal and call the callback if provided
      onOpenChange(false);
      if (onPaymentLinkCreated) {
        onPaymentLinkCreated(response.data);
      }

    } catch (error: any) {
      console.error('Error creating payment link:', error);
      toast({
        title: t("Error"),
        description: error.response?.data?.message || t("Failed to create payment link"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };





  const getSelectedPatient = () => {
    return patients.find(p => p._id === formData.patient_id);
  };

  const formatExpiryDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("Create Payment Link")}
          </DialogTitle>
          <DialogDescription>
            {t("Generate a secure Stripe payment link for your patient")}
          </DialogDescription>
        </DialogHeader>

        {(
          // Form Content
          <div className="grid gap-4 py-4">
            {/* Patient Selection */}
            <div className="grid gap-2">
              <Label htmlFor="patient">
                {t("Patient")} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.patient_id}
                onValueChange={handlePatientSelect}
                disabled={loadingPatients}
              >
                <SelectTrigger>
                  <SelectValue 
                    placeholder={loadingPatients ? t("Loading patients...") : t("Select a patient")} 
                  />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient._id} value={patient._id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div className="font-medium">
                            {patient.first_name} {patient.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {patient.email || patient.phone}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                  {patients.length === 0 && !loadingPatients && (
                    <SelectItem value="no-patients" disabled>
                      {t("No patients found")}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Amount and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">
                  {t("Amount")} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.50"
                    placeholder="0.00"
                    className="pl-9"
                    value={formData.amount || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currency">{t("Currency")}</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Customer Email */}
            <div className="grid gap-2">
              <Label htmlFor="customer_email">
                {t("Customer Email")} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="customer_email"
                  type="email"
                  placeholder={t("Enter customer email")}
                  className="pl-9"
                  value={formData.customer_email}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_email: e.target.value })
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("Payment confirmation will be sent to this email")}
              </p>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">
                {t("Description")} <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder={t("Enter payment description (e.g., Consultation fee, Treatment payment)")}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Advanced Options - Hidden as URLs are set automatically in backend */}
            {/* 
            <div className="grid gap-4 p-4 border rounded-lg bg-muted/50">
              <Label className="font-medium">{t("Advanced Options")} ({t("Optional")})</Label>
              
              <div className="grid gap-2">
                <Label htmlFor="success_url">{t("Success URL")}</Label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="success_url"
                    type="url"
                    placeholder="https://your-website.com/payment-success"
                    className="pl-9"
                    value={formData.success_url || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, success_url: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cancel_url">{t("Cancel URL")}</Label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cancel_url"
                    type="url"
                    placeholder="https://your-website.com/payment-cancelled"
                    className="pl-9"
                    value={formData.cancel_url || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, cancel_url: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            */}

            {/* Selected Patient Preview */}
            {getSelectedPatient() && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{t("Selected Patient")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {getSelectedPatient()?.first_name} {getSelectedPatient()?.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getSelectedPatient()?.email || getSelectedPatient()?.phone}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t("Cancel")}
          </Button>
          <Button onClick={handleCreatePaymentLink} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {loading ? t("Creating Link...") : t("Create Payment Link")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePaymentLinkModal;
