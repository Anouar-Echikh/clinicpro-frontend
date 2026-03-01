import React, { useState } from "react";
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
import { Loader2, UserCheck, Calendar, User, Phone, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { parseApiError } from "@/utils/errorHandler";
import { Lead } from "@/types";
import { useConvertLeadToPatient } from "@/hooks/useApi";

interface ConvertLeadModalProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ConvertLeadModal: React.FC<ConvertLeadModalProps> = ({ 
  lead, 
  open, 
  onOpenChange 
}) => {
  const { t } = useTranslation();
  const [patientData, setPatientData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "male" as "male" | "female" | "other",
    phone: "",
    email: "",
    address: "",
    emergency_contact: {
      name: "",
      relationship: "",
      phone: "",
    },
    insurance_info: {
      provider: "",
      policy_number: "",
      group_number: "",
    },
  });

  const convertMutation = useConvertLeadToPatient();

  React.useEffect(() => {
    if (lead) {
      setPatientData(prev => ({
        ...prev,
        first_name: lead.firstName,
        last_name: lead.lastName,
        phone: lead.phone,
        email: lead.email || "",
      }));
    }
  }, [lead]);

  const handleChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPatientData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value,
        },
      }));
    } else {
      setPatientData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lead) return;

    try {
      await convertMutation.mutateAsync({
        id: lead._id || lead.id,
        patientData,
      });

      toast({
        title: t("Lead converted successfully"),
        description: `${patientData.first_name} ${patientData.last_name} ${t("has been converted to a patient.")}`,
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

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            {t("Convert Lead to Patient")}
          </DialogTitle>
          <DialogDescription>
            {t("Complete the patient information to convert this lead.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lead Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-4 w-4 mr-2" />
                {t("Lead Information")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{t("Converting:")}</strong> {lead.firstName} {lead.lastName}
                </p>
                <p className="text-sm text-blue-600">
                  {t("Source")}: {lead.source} • {t("Service Interest")}: {lead.serviceInterest}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                {t("Basic Information")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">{t("First Name *")}</Label>
                  <Input
                    id="first_name"
                    value={patientData.first_name}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                    placeholder={t("Enter first name")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">{t("Last Name *")}</Label>
                  <Input
                    id="last_name"
                    value={patientData.last_name}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                    placeholder={t("Enter last name")}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">{t("Date of Birth *")}</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={patientData.date_of_birth}
                    onChange={(e) => handleChange("date_of_birth", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">{t("Gender *")}</Label>
                  <Select
                    value={patientData.gender}
                    onValueChange={(value) => handleChange("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select gender")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("Male")}</SelectItem>
                      <SelectItem value="female">{t("Female")}</SelectItem>
                      <SelectItem value="other">{t("Other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t("Phone Number *")}</Label>
                  <Input
                    id="phone"
                    value={patientData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder={t("Enter phone number")}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("Email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={patientData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder={t("Enter email address")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t("Address *")}</Label>
                  <Input
                    id="address"
                    value={patientData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder={t("Enter complete address")}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                {t("Emergency Contact")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_name">{t("Contact Name")}</Label>
                  <Input
                    id="emergency_name"
                    value={patientData.emergency_contact.name}
                    onChange={(e) => handleChange("emergency_contact.name", e.target.value)}
                    placeholder={t("Enter contact name")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_relationship">{t("Relationship")}</Label>
                  <Input
                    id="emergency_relationship"
                    value={patientData.emergency_contact.relationship}
                    onChange={(e) => handleChange("emergency_contact.relationship", e.target.value)}
                    placeholder={t("e.g., Spouse, Parent")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_phone">{t("Emergency Phone")}</Label>
                  <Input
                    id="emergency_phone"
                    value={patientData.emergency_contact.phone}
                    onChange={(e) => handleChange("emergency_contact.phone", e.target.value)}
                    placeholder={t("Enter emergency phone")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                {t("Insurance Information (Optional)")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insurance_provider">{t("Insurance Provider")}</Label>
                  <Input
                    id="insurance_provider"
                    value={patientData.insurance_info.provider}
                    onChange={(e) => handleChange("insurance_info.provider", e.target.value)}
                    placeholder={t("Enter insurance provider")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policy_number">{t("Policy Number")}</Label>
                  <Input
                    id="policy_number"
                    value={patientData.insurance_info.policy_number}
                    onChange={(e) => handleChange("insurance_info.policy_number", e.target.value)}
                    placeholder={t("Enter policy number")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group_number">{t("Group Number")}</Label>
                  <Input
                    id="group_number"
                    value={patientData.insurance_info.group_number}
                    onChange={(e) => handleChange("insurance_info.group_number", e.target.value)}
                    placeholder={t("Enter group number")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={convertMutation.isPending}
            >
              {t("Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={convertMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {convertMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Converting...")}
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  {t("Convert to Patient")}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertLeadModal; 