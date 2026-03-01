import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Save,
  X,
} from "lucide-react";

interface Department {
  code: string;
  name: string;
  description: string;
  head: string;
  location: string;
  phone: string;
  email: string;
  staffCount: number;
  budget: number;
  status: "active" | "inactive";
}

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (department: Department) => void;
}

const AddDepartmentModal: React.FC<AddDepartmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Department>({
    code: "",
    name: "",
    description: "",
    head: "",
    location: "",
    phone: "",
    email: "",
    staffCount: 0,
    budget: 0,
    status: "active",
  });

  const [errors, setErrors] = useState<Partial<Department>>({});

  const handleInputChange = (
    field: keyof Department,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const generateDepartmentCode = (name: string) => {
    // Generate a 4-letter code from department name
    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 4).toUpperCase();
    } else {
      // Take first letter of each word, up to 4 letters
      return words
        .map((word) => word.charAt(0))
        .join("")
        .substring(0, 4)
        .toUpperCase();
    }
  };

  const handleNameChange = (name: string) => {
    handleInputChange("name", name);
    if (name && !formData.code) {
      handleInputChange("code", generateDepartmentCode(name));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Department> = {};

    if (!formData.code.trim()) {
      newErrors.code = t("Department code is required");
    } else if (formData.code.length < 2) {
      newErrors.code = t("Code must be at least 2 characters");
    }

    if (!formData.name.trim()) {
      newErrors.name = t("Department name is required");
    }

    if (!formData.description.trim()) {
      newErrors.description = t("Description is required");
    }

    if (!formData.head.trim()) {
      newErrors.head = t("Department head is required");
    }

    if (!formData.location.trim()) {
      newErrors.location = t("Location is required");
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t("Phone number is required");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("Please enter a valid email address");
    }

    if (formData.budget < 0) {
      newErrors.budget = t("Budget cannot be negative");
    }

    if (formData.staffCount < 0) {
      newErrors.staffCount = t("Staff count cannot be negative");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      head: "",
      location: "",
      phone: "",
      email: "",
      staffCount: 0,
      budget: 0,
      status: "active",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Building2 className="h-6 w-6 mr-3 text-blue-600" />
            {t("Add New Department")}
          </DialogTitle>
          <DialogDescription>
            {t("Create a new department with all necessary information and settings.")}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">{t("Basic Information")}</TabsTrigger>
            <TabsTrigger value="contact">{t("Contact & Location")}</TabsTrigger>
            <TabsTrigger value="management">{t("Management")}</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="code">{t("Department Code")} *</Label>
                <Input
                  id="code"
                  placeholder={t("e.g., CARD, NEUR, PEDS")}
                  value={formData.code}
                  onChange={(e) =>
                    handleInputChange("code", e.target.value.toUpperCase())
                  }
                  className={errors.code ? "border-red-500" : ""}
                  maxLength={10}
                />
                {errors.code && (
                  <p className="text-sm text-red-600">{errors.code}</p>
                )}
                <p className="text-xs text-gray-500">
                  {t("Short code for easy identification (auto-generated from name)")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{t("Status")} *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") =>
                    handleInputChange("status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("Active")}</SelectItem>
                    <SelectItem value="inactive">{t("Inactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{t("Department Name")} *</Label>
              <Input
                id="name"
                placeholder={t("e.g., Cardiology, Neurology, Pediatrics")}
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("Description")} *</Label>
              <Textarea
                id="description"
                placeholder={t("Brief description of the department's role and services...")}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className={errors.description ? "border-red-500" : ""}
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </TabsContent>

          {/* Contact & Location Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="location">{t("Location")} *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder={t("e.g., Building A, Floor 3, Room 301")}
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  className={`pl-10 ${errors.location ? "border-red-500" : ""}`}
                />
              </div>
              {errors.location && (
                <p className="text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone">{t("Phone Number")} *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder={t("+1 (555) 123-4567")}
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("Email Address")} *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("department@clinicpro.com")}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="management" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="head">{t("Department Head")} *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="head"
                  placeholder={t("Dr. John Smith")}
                  value={formData.head}
                  onChange={(e) => handleInputChange("head", e.target.value)}
                  className={`pl-10 ${errors.head ? "border-red-500" : ""}`}
                />
              </div>
              {errors.head && (
                <p className="text-sm text-red-600">{errors.head}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="staffCount">{t("Current Staff Count")}</Label>
                <Input
                  id="staffCount"
                  type="number"
                  min="0"
                  placeholder={t("0")}
                  value={formData.staffCount || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "staffCount",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className={errors.staffCount ? "border-red-500" : ""}
                />
                {errors.staffCount && (
                  <p className="text-sm text-red-600">{errors.staffCount}</p>
                )}
                <p className="text-xs text-gray-500">
                  {t("Number of staff members currently assigned to this department")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">{t("Annual Budget (USD)")}</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder={t("500000")}
                    value={formData.budget || ""}
                    onChange={(e) =>
                      handleInputChange("budget", parseInt(e.target.value) || 0)
                    }
                    className={`pl-10 ${errors.budget ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.budget && (
                  <p className="text-sm text-red-600">{errors.budget}</p>
                )}
                <p className="text-xs text-gray-500">
                  {t("Annual budget allocation for this department")}
                </p>
              </div>
            </div>

            {/* Department Preview */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">{t("Department Preview")}</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{formData.code || "CODE"}</Badge>
                  <span className="font-medium">
                    {formData.name || t("Department Name")}
                  </span>
                  <Badge
                    className={
                      formData.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {formData.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                                      {formData.description ||
                      t("Department description will appear here...")}
                </p>
                <div className="text-sm text-gray-500">
                  <p>{t("Head:")}: {formData.head || t("Department Head")}</p>
                  <p>{t("Location:")}: {formData.location || t("Department Location")}</p>
                  <p>{t("Staff:")}: {formData.staffCount} {t("members")}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            {t("Cancel")}
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            {t("Add Department")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddDepartmentModal;
