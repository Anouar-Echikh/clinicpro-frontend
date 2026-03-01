import React, { useState, useEffect } from "react";
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

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (department: Department) => void;
  department: Department & { id: string; createdAt: string; updatedAt: string };
}

const EditDepartmentModal: React.FC<EditDepartmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  department,
}) => {
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

  // Populate form when department changes
  useEffect(() => {
    if (department) {
      setFormData({
        code: department.code,
        name: department.name,
        description: department.description,
        head: department.head,
        location: department.location,
        phone: department.phone,
        email: department.email,
        staffCount: department.staffCount,
        budget: department.budget,
        status: department.status,
      });
    }
  }, [department]);

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

  const validateForm = () => {
    const newErrors: Partial<Department> = {};

    if (!formData.code.trim()) {
      newErrors.code = "Department code is required";
    } else if (formData.code.length < 2) {
      newErrors.code = "Code must be at least 2 characters";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Department name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.head.trim()) {
      newErrors.head = "Department head is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.budget < 0) {
      newErrors.budget = "Budget cannot be negative";
    }

    if (formData.staffCount < 0) {
      newErrors.staffCount = "Staff count cannot be negative";
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
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Building2 className="h-6 w-6 mr-3 text-blue-600" />
            Edit Department: {department?.name}
          </DialogTitle>
          <DialogDescription>
            Update department information and settings.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="contact">Contact & Location</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="code">Department Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g., CARD, NEUR, PEDS"
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Department Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Cardiology, Neurology, Pediatrics"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the department's role and services..."
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
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder="e.g., Building A, Floor 3, Room 301"
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
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
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
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="department@clinicpro.com"
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
              <Label htmlFor="head">Department Head *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="head"
                  placeholder="Dr. John Smith"
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
                <Label htmlFor="staffCount">Current Staff Count</Label>
                <Input
                  id="staffCount"
                  type="number"
                  min="0"
                  placeholder="0"
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Annual Budget (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="500000"
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
              </div>
            </div>

            {/* Department Preview */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Updated Department Preview</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{formData.code}</Badge>
                  <span className="font-medium">{formData.name}</span>
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
                <p className="text-sm text-gray-600">{formData.description}</p>
                <div className="text-sm text-gray-500">
                  <p>Head: {formData.head}</p>
                  <p>Location: {formData.location}</p>
                  <p>Staff: {formData.staffCount} members</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            Update Department
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditDepartmentModal;
