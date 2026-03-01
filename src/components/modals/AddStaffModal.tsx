import React, { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Clock,
  DollarSign,
  Calendar,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { parseApiError } from "@/utils/errorHandler";
import { getDepartmentOptions } from "@/utils/departments";
import { apiService } from "@/services/api";
import { useClinic } from "@/contexts/ClinicContext";
import type { User as StaffUser } from "@/services/api";

interface AddStaffModalProps {
  trigger?: React.ReactNode;
  onStaffAdded?: () => void;
}

const AddStaffModal: React.FC<AddStaffModalProps> = ({ trigger, onStaffAdded }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currentClinic } = useClinic();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
    department: "",
    salary: "",
    salesPercentage: "0",
    joiningDate: "",
    address: "",
    qualifications: "",
    // Schedule
    mondayStart: "09:00",
    mondayEnd: "17:00",
    mondayWorking: true,
    tuesdayStart: "09:00",
    tuesdayEnd: "17:00",
    tuesdayWorking: true,
    wednesdayStart: "09:00",
    wednesdayEnd: "17:00",
    wednesdayWorking: true,
    thursdayStart: "09:00",
    thursdayEnd: "17:00",
    thursdayWorking: true,
    fridayStart: "09:00",
    fridayEnd: "17:00",
    fridayWorking: true,
    saturdayStart: "09:00",
    saturdayEnd: "13:00",
    saturdayWorking: false,
    sundayStart: "00:00",
    sundayEnd: "00:00",
    sundayWorking: false,
  });

  const roles = [
    { value: "super_admin", label: "Super Administrator" },
    { value: "admin", label: "Administrator" },
    { value: "doctor", label: "Doctor" },
    { value: "nurse", label: "Nurse" },
    { value: "receptionist", label: "Receptionist" },
    { value: "technician", label: "Technician" },
    { value: "accountant", label: "Accountant" },
  ];

  // Get departments from utility to match Departments module
  const departments = getDepartmentOptions();

  const daysOfWeek = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generatePassword = () => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&";
    let password = "";

    // Ensure at least one character from each required category
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(
      Math.floor(Math.random() * 26),
    ); // Uppercase
    password += "abcdefghijklmnopqrstuvwxyz".charAt(
      Math.floor(Math.random() * 26),
    ); // Lowercase
    password += "0123456789".charAt(Math.floor(Math.random() * 10)); // Number
    password += "@$!%*?&".charAt(Math.floor(Math.random() * 7)); // Special char

    // Add 8 more random characters to make it 12 characters total
    for (let i = 0; i < 8; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // Shuffle the password
    const shuffled = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setFormData((prev) => ({
      ...prev,
      password: shuffled,
      confirmPassword: shuffled,
    }));

    toast({
      title: "Password Generated",
      description:
        "A strong password has been generated and filled in both fields.",
    });
  };

  const validateForm = () => {
    const required = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "password",
      "confirmPassword",
      "role",
      "department",
      "salary",
    ];
    const missing = required.filter(
      (field) => !formData[field as keyof typeof formData],
    );

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

    // Password validation
    if (formData.password.length < 8) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return false;
    }

    // Password confirmation validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return false;
    }

    // Password strength validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(formData.password)) {
      toast({
        title: "Validation Error",
        description:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        variant: "destructive",
      });
      return false;
    }

    // Salary validation
    const salary = parseFloat(formData.salary);
    if (salary <= 0) {
      toast({
        title: "Validation Error",
        description: "Salary must be greater than 0",
        variant: "destructive",
      });
      return false;
    }

    // Sales percentage validation for doctors
    if (formData.role === 'doctor') {
      const salesPercentage = parseFloat(formData.salesPercentage);
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

    if (!validateForm()) {
      return;
    }

    // Check if current clinic is selected
    if (!currentClinic?._id) {
      toast({
        title: "Error",
        description: "No clinic selected. Please select a clinic before adding staff.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Prepare staff data according to API schema
      const staffData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role as 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'staff',
        phone: formData.phone,
        clinic_id: currentClinic._id, // Add the clinic_id from context
        ...(formData.role === 'doctor' && {
          sales_percentage: parseFloat(formData.salesPercentage) || 0
        })
      };

      // Create staff member via API
      const response = await apiService.register(staffData);
      const newStaff = response.user;

      const formattedSalary = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(parseFloat(formData.salary));

      toast({
        title: "Staff member added successfully",
        description: `${newStaff.first_name} ${newStaff.last_name} has been added as ${newStaff.role} with salary ${formattedSalary}.`,
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "",
        department: "",
        salary: "",
        salesPercentage: "0",
        joiningDate: "",
        address: "",
        qualifications: "",
        mondayStart: "09:00",
        mondayEnd: "17:00",
        mondayWorking: true,
        tuesdayStart: "09:00",
        tuesdayEnd: "17:00",
        tuesdayWorking: true,
        wednesdayStart: "09:00",
        wednesdayEnd: "17:00",
        wednesdayWorking: true,
        thursdayStart: "09:00",
        thursdayEnd: "17:00",
        thursdayWorking: true,
        fridayStart: "09:00",
        fridayEnd: "17:00",
        fridayWorking: true,
        saturdayStart: "09:00",
        saturdayEnd: "13:00",
        saturdayWorking: false,
        sundayStart: "00:00",
        sundayEnd: "00:00",
        sundayWorking: false,
      });

      setOpen(false);
      
      // Call the callback to refresh the staff list
      if (onStaffAdded) {
        onStaffAdded();
      }
    } catch (error) {
      console.error('Error creating staff member:', error);
      toast({
        title: "Error",
        description: parseApiError(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Staff Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Add New Staff Member
          </DialogTitle>
          <DialogDescription>
            {currentClinic ? (
              <>Enter staff member information to add them to <strong>{currentClinic.name}</strong>.</>
            ) : (
              "Enter staff member information to add them to your clinic team."
            )}
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
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
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
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generatePassword}
                      className="text-xs"
                    >
                      Generate
                    </Button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Enter a strong password"
                    required
                    minLength={8}
                    className={
                      formData.password.length > 0 &&
                      formData.password.length < 8
                        ? "border-red-300 focus:border-red-500"
                        : formData.password.length >= 8 &&
                            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
                              formData.password,
                            )
                          ? "border-green-300 focus:border-green-500"
                          : ""
                    }
                  />
                  <div className="text-xs space-y-1">
                    <p className="text-gray-500">Password must contain:</p>
                    <ul className="ml-2 space-y-1">
                      <li
                        className={
                          formData.password.length >= 8
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        ✓ At least 8 characters
                      </li>
                      <li
                        className={
                          /[A-Z]/.test(formData.password)
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        ✓ One uppercase letter
                      </li>
                      <li
                        className={
                          /[a-z]/.test(formData.password)
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        ✓ One lowercase letter
                      </li>
                      <li
                        className={
                          /\d/.test(formData.password)
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        ✓ One number
                      </li>
                      <li
                        className={
                          /[@$!%*?&]/.test(formData.password)
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        ✓ One special character (@$!%*?&)
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirm password"
                    required
                    minLength={8}
                    className={
                      formData.confirmPassword.length > 0
                        ? formData.password === formData.confirmPassword
                          ? "border-green-300 focus:border-green-500"
                          : "border-red-300 focus:border-red-500"
                        : ""
                    }
                  />
                  {formData.confirmPassword.length > 0 && (
                    <p
                      className={`text-xs ${
                        formData.password === formData.confirmPassword
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formData.password === formData.confirmPassword
                        ? "✓ Passwords match"
                        : "✗ Passwords do not match"}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="123 Main Street, City, State, ZIP"
                    className="pl-10"
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Briefcase className="h-4 w-4 mr-2" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
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
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleChange("department", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.code} value={dept.name}>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {dept.code}
                            </span>
                            <span>{dept.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Annual Salary ($) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="salary"
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.salary}
                      onChange={(e) => handleChange("salary", e.target.value)}
                      placeholder="50000"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joiningDate">Joining Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="joiningDate"
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) =>
                        handleChange("joiningDate", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Sales Percentage for Doctors */}
              {formData.role === 'doctor' && (
                <div className="space-y-2">
                  <Label htmlFor="salesPercentage">Sales Percentage (%) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="salesPercentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.salesPercentage}
                      onChange={(e) => handleChange("salesPercentage", e.target.value)}
                      placeholder="10.0"
                      className="pl-10"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Percentage of revenue generated from appointments that will be added as sales incentive
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="qualifications">Qualifications</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="qualifications"
                    value={formData.qualifications}
                    onChange={(e) =>
                      handleChange("qualifications", e.target.value)
                    }
                    placeholder="MD, MBBS, Certifications, etc. (separate with commas)"
                    className="pl-10"
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Work Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {daysOfWeek.map((day) => (
                  <div
                    key={day.key}
                    className="flex items-center space-x-4 p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-2 min-w-[100px]">
                      <Checkbox
                        id={`${day.key}Working`}
                        checked={
                          formData[
                            `${day.key}Working` as keyof typeof formData
                          ] as boolean
                        }
                        onCheckedChange={(checked) =>
                          handleChange(`${day.key}Working`, checked)
                        }
                      />
                      <Label
                        htmlFor={`${day.key}Working`}
                        className="font-medium"
                      >
                        {day.label}
                      </Label>
                    </div>

                    {formData[`${day.key}Working` as keyof typeof formData] && (
                      <div className="flex items-center space-x-2 flex-1">
                        <Label className="text-sm text-gray-600">From:</Label>
                        <Input
                          type="time"
                          value={
                            formData[
                              `${day.key}Start` as keyof typeof formData
                            ] as string
                          }
                          onChange={(e) =>
                            handleChange(`${day.key}Start`, e.target.value)
                          }
                          className="w-32"
                        />
                        <Label className="text-sm text-gray-600">To:</Label>
                        <Input
                          type="time"
                          value={
                            formData[
                              `${day.key}End` as keyof typeof formData
                            ] as string
                          }
                          onChange={(e) =>
                            handleChange(`${day.key}End`, e.target.value)
                          }
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Adding Staff...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff Member
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStaffModal;
