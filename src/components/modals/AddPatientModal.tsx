import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  Shield,
  Lock,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCreatePatient } from "@/hooks/useApi";
import { parseApiError } from "@/utils/errorHandler";
import type { Patient } from "@/services/api";

interface AddPatientModalProps {
  trigger?: React.ReactNode;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({ trigger }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const createPatientMutation = useCreatePatient();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    bloodGroup: "",
    allergies: "",
    medicalHistory: "",
    height: "",
    weight: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    lastVisit: "",
    // Portal access fields
    enablePortalAccess: false,
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password if portal access is enabled
    if (formData.enablePortalAccess) {
      if (!formData.password) {
        toast({
          title: t("Error"),
          description: t("Password is required for portal access"),
          variant: "destructive",
        });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: t("Error"),
          description: t("Passwords do not match"),
          variant: "destructive",
        });
        return;
      }
      if (formData.password.length < 6) {
        toast({
          title: t("Error"),
          description: t("Password must be at least 6 characters"),
          variant: "destructive",
        });
        return;
      }
    }

    try {
      // Prepare patient data according to API schema
      const patientData: Omit<Patient, '_id' | 'created_at' | 'updated_at'> & { password?: string } = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender as 'male' | 'female' | 'other',
        address: formData.address,
        ...(formData.lastVisit && {
          last_visit: new Date(formData.lastVisit),
        }),
        ...(formData.emergencyContactName && {
          emergency_contact: {
            name: formData.emergencyContactName,
            relationship: formData.emergencyContactRelationship,
            phone: formData.emergencyContactPhone,
          }
        }),
        ...((formData.insuranceProvider || formData.insurancePolicyNumber) && {
          insurance_info: {
            provider: formData.insuranceProvider,
            policy_number: formData.insurancePolicyNumber,
          }
        }),
        // Include password if portal access is enabled
        ...(formData.enablePortalAccess && formData.password && {
          password: formData.password
        })
      };

      // Create patient via mutation
      await createPatientMutation.mutateAsync(patientData);

      toast({
        title: t("Patient added successfully"),
        description: formData.enablePortalAccess
          ? `${formData.firstName} ${formData.lastName} ${t("has been added to the system with portal access.")}`
          : `${formData.firstName} ${formData.lastName} ${t("has been added to the system.")}`,
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelationship: "",
        bloodGroup: "",
        allergies: "",
        medicalHistory: "",
        height: "",
        weight: "",
        insuranceProvider: "",
        insurancePolicyNumber: "",
        lastVisit: "",
        enablePortalAccess: false,
        password: "",
        confirmPassword: "",
      });

      setOpen(false);
    } catch (error) {
      console.error('Error creating patient:', error);
      toast({
        title: t("Error"),
        description: parseApiError(error),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("Add Patient")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full min-h-0">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center text-lg sm:text-xl">
              <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
              {t("Add New Patient")}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t("Enter patient information to create a new medical record in the system.")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 min-h-0">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Personal Information */}
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {t("Personal Information")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">{t("First Name")} *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        placeholder={t("John")}
                        required
                        className="h-9 sm:h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">{t("Last Name")} *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        placeholder={t("Doe")}
                        required
                        className="h-9 sm:h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">{t("Email")}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder={t("john.doe@email.com")}
                        className="h-9 sm:h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">{t("Phone Number")} *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder={t("+1 (555) 123-4567")}
                        required
                        className="h-9 sm:h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-sm font-medium">{t("Date of Birth")} *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                        required
                        className="h-9 sm:h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm font-medium">{t("Gender")} *</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue placeholder={t("Select gender")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">{t("Male")}</SelectItem>
                          <SelectItem value="female">{t("Female")}</SelectItem>
                          <SelectItem value="other">{t("Other")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lastVisit" className="text-sm font-medium">{t("Last Visit Date")}</Label>
                      <Input
                        id="lastVisit"
                        type="date"
                        value={formData.lastVisit}
                        onChange={(e) => handleChange("lastVisit", e.target.value)}
                        className="h-9 sm:h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      {/* Empty space for alignment */}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">{t("Address")}</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder={t("Street address, city, state, ZIP code")}
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {t("Emergency Contact")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName" className="text-sm font-medium">{t("Contact Name")}</Label>
                      <Input
                        id="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                        placeholder={t("Jane Doe")}
                        className="h-9 sm:h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactRelationship" className="text-sm font-medium">{t("Relationship")}</Label>
                      <Input
                        id="emergencyContactRelationship"
                        value={formData.emergencyContactRelationship}
                        onChange={(e) => handleChange("emergencyContactRelationship", e.target.value)}
                        placeholder={t("Spouse, Parent, Sibling...")}
                        className="h-9 sm:h-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone" className="text-sm font-medium">{t("Contact Phone")}</Label>
                    <Input
                      id="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleChange("emergencyContactPhone", e.target.value)}
                      placeholder={t("+1 (555) 987-6543")}
                      className="h-9 sm:h-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Medical Information */}
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    {t("Medical Information")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup" className="text-sm font-medium">{t("Blood Group")}</Label>
                      <Select value={formData.bloodGroup} onValueChange={(value) => handleChange("bloodGroup", value)}>
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue placeholder={t("Select blood group")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height" className="text-sm font-medium">{t("Height (cm)")}</Label>
                      <Input
                        id="height"
                        type="number"
                        value={formData.height}
                        onChange={(e) => handleChange("height", e.target.value)}
                        placeholder={t("170")}
                        className="h-9 sm:h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight" className="text-sm font-medium">{t("Weight (kg)")}</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) => handleChange("weight", e.target.value)}
                        placeholder={t("70")}
                        className="h-9 sm:h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies" className="text-sm font-medium">{t("Allergies")}</Label>
                    <Textarea
                      id="allergies"
                      value={formData.allergies}
                      onChange={(e) => handleChange("allergies", e.target.value)}
                      placeholder={t("List any known allergies (medications, food, environmental)")}
                      className="min-h-[80px] resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicalHistory" className="text-sm font-medium">{t("Medical History")}</Label>
                    <Textarea
                      id="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={(e) => handleChange("medicalHistory", e.target.value)}
                      placeholder={t("Previous medical conditions, surgeries, medications")}
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Insurance Information */}
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    {t("Insurance Information")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="insuranceProvider" className="text-sm font-medium">{t("Insurance Provider")}</Label>
                      <Input
                        id="insuranceProvider"
                        value={formData.insuranceProvider}
                        onChange={(e) => handleChange("insuranceProvider", e.target.value)}
                        placeholder={t("Blue Cross Blue Shield")}
                        className="h-9 sm:h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insurancePolicyNumber" className="text-sm font-medium">{t("Policy Number")}</Label>
                      <Input
                        id="insurancePolicyNumber"
                        value={formData.insurancePolicyNumber}
                        onChange={(e) => handleChange("insurancePolicyNumber", e.target.value)}
                        placeholder={t("ABC123456789")}
                        className="h-9 sm:h-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Patient Portal Access */}
              <Card className="border border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-blue-600" />
                    {t("Patient Portal Access")}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("Enable patient to access their dashboard to view appointments, prescriptions, and invoices")}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enablePortalAccess"
                      checked={formData.enablePortalAccess}
                      onCheckedChange={(checked) => 
                        setFormData((prev) => ({ ...prev, enablePortalAccess: checked as boolean }))
                      }
                    />
                    <Label 
                      htmlFor="enablePortalAccess" 
                      className="text-sm font-medium cursor-pointer"
                    >
                      {t("Enable Portal Access")}
                    </Label>
                  </div>

                  {formData.enablePortalAccess && (
                    <>
                      <div className="p-3 bg-blue-100 border border-blue-200 rounded-md">
                        <p className="text-xs text-blue-800">
                          <strong>{t("Note")}:</strong> {t("Email is required to enable portal access. Patient will be able to login using their email and the password you set here.")}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-sm font-medium">
                            {t("Password")} *
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            placeholder={t("Enter password")}
                            className="h-9 sm:h-10"
                            required={formData.enablePortalAccess}
                          />
                          <p className="text-xs text-muted-foreground">
                            {t("Minimum 6 characters")}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-sm font-medium">
                            {t("Confirm Password")} *
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleChange("confirmPassword", e.target.value)}
                            placeholder={t("Confirm password")}
                            className="h-9 sm:h-10"
                            required={formData.enablePortalAccess}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Footer with buttons */}
          <div className="border-t bg-background px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto"
              >
                {t("Cancel")}
              </Button>
              <Button 
                type="submit" 
                onClick={handleSubmit}
                disabled={createPatientMutation.isPending}
                className="w-full sm:w-auto"
              >
                {createPatientMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t("Adding Patient...")}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("Add Patient")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientModal;
