import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  Briefcase,
  Calendar,
  Calculator,
  Save,
  X,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { apiService, type Payroll, type User } from "@/services/api";

interface UpdateSalaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string | null;
  onUpdate: () => void;
}

const UpdateSalaryModal: React.FC<UpdateSalaryModalProps> = ({
  open,
  onOpenChange,
  employeeId,
  onUpdate,
}) => {
  const [employeeData, setEmployeeData] = useState<User | null>(null);
  const [payrollData, setPayrollData] = useState<Payroll | null>(null);
  const [editForm, setEditForm] = useState<Partial<Payroll>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { formatAmount } = useCurrency();

  // Helper function to parse numeric input values
  const parseNumericValue = (value: string): number => {
    if (value === '' || value === null || value === undefined) {
      return 0;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Helper function to parse integer input values
  const parseIntegerValue = (value: string): number => {
    if (value === '' || value === null || value === undefined) {
      return 0;
    }
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Calculate net salary automatically
  const calculateNetSalary = (formData: Partial<Payroll>) => {
    const baseSalary = formData.base_salary || 0;
    const overtime = formData.overtime || 0;
    const bonus = formData.bonus || 0;
    const allowances = formData.allowances || 0;
    const tax = formData.tax || 0;
    const deductions = formData.deductions || 0;

    const grossSalary = baseSalary + overtime + bonus + allowances;
    const totalDeductions = tax + deductions;
    return grossSalary - totalDeductions;
  };

  // Update edit form with automatic net salary calculation
  const updateEditForm = (updates: Partial<Payroll>) => {
    const newFormData = { ...editForm, ...updates };
    const calculatedNetSalary = calculateNetSalary(newFormData);
    
    setEditForm({
      ...newFormData,
      net_salary: calculatedNetSalary
    });
  };

  // Load employee and payroll data
  useEffect(() => {
    if (open && employeeId) {
      loadEmployeeData();
    }
  }, [open, employeeId]);

  const loadEmployeeData = async () => {
    try {
      setIsFetching(true);
      
      // Fetch employee data and payroll data in parallel
      const [userResponse, payrollResponse] = await Promise.allSettled([
        apiService.getUser(employeeId!),
        apiService.getPayrolls({ employee_id: employeeId, limit: 10 })
      ]);

      // Handle employee data
      if (userResponse.status === 'fulfilled') {
        setEmployeeData(userResponse.value);
      } else {
        console.error('Error fetching employee data:', userResponse.reason);
        toast({
          title: "Error",
          description: "Failed to load employee data. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Handle payroll data
      if (payrollResponse.status === 'fulfilled' && 
          payrollResponse.value.data.items && 
          payrollResponse.value.data.items.length > 0) {
        
        // Find the most recent payroll entry
        const latestPayroll = payrollResponse.value.data.items.reduce((latest, current) => {
          const latestDate = new Date(latest.created_at || latest.updated_at);
          const currentDate = new Date(current.created_at || current.updated_at);
          return currentDate > latestDate ? current : latest;
        });
        
        setPayrollData(latestPayroll);
        
        // Set the edit form with calculated net salary
        const calculatedNetSalary = calculateNetSalary(latestPayroll);
        setEditForm({
          ...latestPayroll,
          net_salary: calculatedNetSalary
        });
      } else {
        // No existing payroll found, create a new one
        const currentDate = new Date();
        const newPayrollData: Partial<Payroll> = {
          employee_id: employeeId,
          month: currentDate.toLocaleString('default', { month: 'long' }),
          year: currentDate.getFullYear(),
          base_salary: 0,
          overtime: 0,
          bonus: 0,
          allowances: 0,
          tax: 0,
          deductions: 0,
          net_salary: 0,
          working_days: 22,
          total_days: 30,
          leaves: 0,
          status: 'draft'
        };
        
        setPayrollData(null);
        setEditForm(newPayrollData);
      }
    } catch (error: any) {
      console.error('Error loading employee/payroll data:', error);
      toast({
        title: "Error",
        description: "Failed to load employee data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const getEmployeeDisplay = (employee: string | User) => {
    if (typeof employee === 'string') {
      return employee;
    }
    return `${employee.first_name} ${employee.last_name}`;
  };

  const getEmployeeEmail = (employee: string | User) => {
    if (typeof employee === 'string') {
      return employee;
    }
    return employee.email || '';
  };

  const getEmployeeRole = (employee: string | User) => {
    if (typeof employee === 'string') {
      return 'Staff Member';
    }
    return employee.role || 'Staff Member';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "processed":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "draft":
        return <FileText className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "processed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSavePayroll = async () => {
    if (!editForm || !employeeId) return;

    try {
      setIsLoading(true);
      
      // Prepare the payload
      const payload = {
        ...editForm,
        employee_id: employeeId
      };

      let updatedPayroll: Payroll;

      if (payrollData?._id) {
        // Update existing payroll
        updatedPayroll = await apiService.updatePayroll(payrollData._id, payload);
        toast({
          title: "Success",
          description: "Payroll details updated successfully.",
        });
      } else {
        // Create new payroll
        updatedPayroll = await apiService.createPayroll(payload as Omit<Payroll, '_id' | 'created_at' | 'updated_at'>);
        toast({
          title: "Success",
          description: "New payroll record created successfully.",
        });
      }

      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving payroll:', error);
      
      // Handle validation errors specifically
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map((err: any) => 
          `${err.path}: ${err.msg}`
        ).join(', ');
        
        toast({
          title: "Validation Error",
          description: `Please check the following fields: ${errorMessages}`,
          variant: "destructive",
        });
      } else if (error.response?.data?.message) {
        toast({
          title: "Error",
          description: error.response.data.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save payroll details. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setEmployeeData(null);
    setPayrollData(null);
    setEditForm({});
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Update Salary & Payroll Details
          </DialogTitle>
          <DialogDescription>
            {payrollData 
              ? 'Edit payroll information. Only non-paid entries can be modified.'
              : 'Create new payroll record for this employee.'}
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading employee data...</span>
          </div>
        ) : editForm && (
          <div className="space-y-6">
            {/* Employee Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                Employee Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Name</Label>
                  <p className="text-sm font-semibold">
                    {employeeData ? getEmployeeDisplay(employeeData) : 'Loading...'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-sm">
                    {employeeData ? getEmployeeEmail(employeeData) : 'Loading...'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Role</Label>
                  <p className="text-sm">
                    {employeeData ? getEmployeeRole(employeeData) : 'Loading...'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Employee ID</Label>
                  <p className="text-sm">
                    {employeeId}
                  </p>
                </div>
                {payrollData && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(payrollData.status)}
                      <Badge className={getStatusColor(payrollData.status)}>
                        {payrollData.status}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pay Period Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Pay Period Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Month & Year</Label>
                  <p className="text-sm font-semibold">
                    {editForm.month} {editForm.year}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Working Days</Label>
                  <Input
                    type="number"
                    value={editForm.working_days ?? 0}
                    onChange={(e) => updateEditForm({
                      working_days: parseIntegerValue(e.target.value)
                    })}
                    className="mt-1"
                    min="0"
                    max="31"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Leaves Taken</Label>
                  <Input
                    type="number"
                    value={editForm.leaves ?? 0}
                    onChange={(e) => updateEditForm({
                      leaves: parseIntegerValue(e.target.value)
                    })}
                    className="mt-1"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Salary Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Salary Breakdown
              </h3>
              
              {/* Base Salary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Base Salary</Label>
                    <Input
                      type="number"
                      value={editForm.base_salary ?? 0}
                      onChange={(e) => updateEditForm({
                        base_salary: parseNumericValue(e.target.value)
                      })}
                      className="mt-1"
                      min="0"
                      step="0.01"
                      placeholder="Enter base salary"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Total Days</Label>
                    <Input
                      type="number"
                      value={editForm.total_days ?? 30}
                      onChange={(e) => updateEditForm({
                        total_days: parseIntegerValue(e.target.value)
                      })}
                      className="mt-1"
                      min="1"
                      max="31"
                    />
                  </div>
                </div>
              </div>

              {/* Additions */}
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">Additions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Overtime</Label>
                    <Input
                      type="number"
                      value={editForm.overtime ?? 0}
                      onChange={(e) => updateEditForm({
                        overtime: parseNumericValue(e.target.value)
                      })}
                      className="mt-1"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Bonus</Label>
                    <Input
                      type="number"
                      value={editForm.bonus ?? 0}
                      onChange={(e) => updateEditForm({
                        bonus: parseNumericValue(e.target.value)
                      })}
                      className="mt-1"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Allowances</Label>
                    <Input
                      type="number"
                      value={editForm.allowances ?? 0}
                      onChange={(e) => updateEditForm({
                        allowances: parseNumericValue(e.target.value)
                      })}
                      className="mt-1"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-3">Deductions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Tax</Label>
                    <Input
                      type="number"
                      value={editForm.tax ?? 0}
                      onChange={(e) => updateEditForm({
                        tax: parseNumericValue(e.target.value)
                      })}
                      className="mt-1"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Other Deductions</Label>
                    <Input
                      type="number"
                      value={editForm.deductions ?? 0}
                      onChange={(e) => updateEditForm({
                        deductions: parseNumericValue(e.target.value)
                      })}
                      className="mt-1"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Net Salary */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Net Salary
                      <span className="ml-2 text-xs text-blue-600 font-normal">
                        <Calculator className="inline h-3 w-3 mr-1" />
                        Auto-calculated
                      </span>
                    </Label>
                    <p className="text-2xl font-bold text-blue-700">
                      <CurrencyDisplay 
                        amount={editForm.net_salary ?? 0} 
                        variant="large" 
                      />
                    </p>
                  </div>
                  {payrollData?.pay_date && (
                    <div className="text-right">
                      <Label className="text-sm font-medium text-gray-600">Pay Date</Label>
                      <p className="text-sm font-semibold">
                        {new Date(payrollData.pay_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Current vs New Salary Comparison */}
            {payrollData && editForm.base_salary !== payrollData.base_salary && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-3">Salary Change Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-white rounded-lg">
                    <div className="text-sm text-gray-500">Previous Base Salary</div>
                    <div className="text-lg font-semibold">
                      <CurrencyDisplay amount={payrollData.base_salary} />
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <div className="text-sm text-gray-500">New Base Salary</div>
                    <div className="text-lg font-semibold text-blue-600">
                      <CurrencyDisplay amount={editForm.base_salary ?? 0} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={closeModal} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSavePayroll} disabled={isLoading || isFetching}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : payrollData ? 'Update Payroll' : 'Create Payroll'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSalaryModal; 