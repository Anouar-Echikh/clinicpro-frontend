import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Edit, Globe, Phone, Mail, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { parseApiError } from "@/utils/errorHandler";
import { Lead } from "@/types";
import { useUpdateLead } from "@/hooks/useApi";

interface EditLeadModalProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditLeadModal: React.FC<EditLeadModalProps> = ({ lead, open, onOpenChange }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    source: "",
    serviceInterest: "",
    status: "new" as Lead['status'],
    assignedTo: "",
    notes: "",
  });

  const updateLeadMutation = useUpdateLead();

  useEffect(() => {
    if (lead) {
      setFormData({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email || "",
        phone: lead.phone,
        source: lead.source,
        serviceInterest: lead.serviceInterest,
        status: lead.status,
        assignedTo: lead.assignedTo || "",
        notes: lead.notes || "",
      });
    }
  }, [lead]);

  const leadSources = [
    { value: "website", label: t("Website Form") },
    { value: "referral", label: t("Patient Referral") },
    { value: "social", label: t("Social Media") },
    { value: "advertisement", label: t("Advertisement") },
    { value: "walk-in", label: t("Walk-in") },
  ];

  const services = [
    t("General Consultation"),
    t("Cardiology"),
    t("Neurology"),
    t("Pediatrics"),
    t("Dermatology"),
    t("Orthopedics"),
    t("Gynecology"),
    t("Mental Health"),
    t("Dental Care"),
    t("Physical Therapy"),
  ];

  const statusOptions = [
    { value: "new", label: t("New") },
    { value: "contacted", label: t("Contacted") },
    { value: "converted", label: t("Converted") },
    { value: "lost", label: t("Lost") },
  ];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateLeadMutation.mutateAsync({
        id: lead._id || lead.id,
        data: formData,
      });

      toast({
        title: t("Lead updated successfully"),
        description: `${formData.firstName} ${formData.lastName} ${t("has been updated.")}`
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: t("Error"),
        description: parseApiError(error),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            {t("Edit Lead")}
          </DialogTitle>
          <DialogDescription>
            {t("Update lead information and track their progress.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                {t("Contact Information")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                {t("Lead Details")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Lead Source *</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => handleChange("source", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("How did they find us?")} />
                    </SelectTrigger>
                    <SelectContent>
                      {leadSources.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceInterest">Service Interest *</Label>
                  <Select
                    value={formData.serviceInterest}
                    onValueChange={(value) =>
                      handleChange("serviceInterest", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("What service are they interested in?")} />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select status")} />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    value={formData.assignedTo}
                    onChange={(e) => handleChange("assignedTo", e.target.value)}
                    placeholder={t("Assign to staff member")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder={t("Additional information about the lead, their needs, timeline, etc.")}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateLeadMutation.isPending}
            >
              {t("Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={updateLeadMutation.isPending}
            >
              {updateLeadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Updating Lead...")}
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  {t("Update Lead")}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditLeadModal; 