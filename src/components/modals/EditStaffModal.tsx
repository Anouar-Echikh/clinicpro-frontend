import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Loader2,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { transformUserToStaff } from "@/hooks/useStaff";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";

interface EditStaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: ReturnType<typeof transformUserToStaff> | null;
  onUpdate: (id: string, data: any) => Promise<void>;
}

const EditStaffModal: React.FC<EditStaffModalProps> = ({
  open,
  onOpenChange,
  staff,
  onUpdate,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    sales_percentage: "0",
  });

  const roles = [
    { value: "super_admin", label: "Super Administrator" },
    { value: "admin", label: "Administrator" },
    { value: "doctor", label: "Doctor" },
    { value: "nurse", label: "Nurse" },
    { value: "receptionist", label: "Receptionist" },
    { value: "staff", label: "Staff" },
  ];

  // Check if current user is admin
  const isAdmin = user?.role === "admin";

  // Initialize form data when staff changes
  useEffect(() => {
    if (staff) {
      setFormData({
        first_name: staff.firstName,
        last_name: staff.lastName,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        password: "",
        sales_percentage: String(staff.salesPercentage || 0),
      });
    }
  }, [staff]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ["first_name", "last_name", "email", "role"];
    const missing = required.filter((field) => !formData[field as keyof typeof formData]);

    if (missing.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${missing.join(", ")}`,
        variant: "destructive",
      });
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    // Password validation (only if provided and user is admin)
    if (formData.password && isAdmin) {
      if (formData.password.length < 6) {
        toast({
          title: "Validation Error",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        return false;
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
      if (!passwordRegex.test(formData.password)) {
        toast({
          title: "Validation Error",
          description: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
          variant: "destructive",
        });
        return false;
      }
    }

    // Sales percentage validation for doctors
    if (formData.role === 'doctor') {
      const salesPercentage = parseFloat(formData.sales_percentage);
      if (isNaN(salesPercentage) || salesPercentage < 0 || salesPercentage > 100) {
        toast({
          title: "Validation Error",
          description: "Sales percentage must be between 0 and 100",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!staff || !validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Update basic staff information
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        ...(formData.role === 'doctor' && {
          sales_percentage: parseFloat(formData.sales_percentage) || 0
        })
      };

      await onUpdate(staff.id, updateData);

      // Update password separately if provided and user is admin
      if (formData.password && isAdmin) {
        await apiService.adminChangeUserPassword(staff.id, formData.password);
        toast({
          title: "Password Updated",
          description: `Password for ${formData.first_name} ${formData.last_name} has been updated successfully.`,
        });
      }
      
      toast({
        title: "Staff Updated",
        description: `${formData.first_name} ${formData.last_name}'s information has been updated successfully.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error updating staff member:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update staff member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!staff) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Edit Staff Member
          </DialogTitle>
          <DialogDescription>
            Update information for {staff.firstName} {staff.lastName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-4 w-4 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.first_name}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.last_name}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="john.doe@clinic.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Briefcase className="h-4 w-4 mr-2" />
                Role Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Sales Percentage for Doctors */}
              {formData.role === 'doctor' && (
                <div className="space-y-2">
                  <Label htmlFor="sales_percentage">Sales Percentage (%) *</Label>
                  <Input
                    id="sales_percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.sales_percentage}
                    onChange={(e) => handleChange("sales_percentage", e.target.value)}
                    placeholder="10.0"
                  />
                  <p className="text-sm text-muted-foreground">
                    Percentage of revenue generated from appointments that will be added as sales incentive
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Password Information - Admin Only */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  Password Management
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Only administrators can update user passwords. Leave blank to keep current password.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="Enter new password (optional)"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Password must be at least 6 characters and contain uppercase, lowercase, and number.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Staff"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStaffModal; 