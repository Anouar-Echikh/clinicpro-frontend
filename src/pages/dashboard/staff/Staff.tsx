import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Users,
  UserCheck,
  Stethoscope,
  Shield,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Clock,
  RefreshCw,
  Loader2,
} from "lucide-react";
import AddStaffModal from "@/components/modals/AddStaffModal";
import ViewStaffModal from "@/components/modals/ViewStaffModal";
import EditStaffModal from "@/components/modals/EditStaffModal";
import ManageScheduleModal from "@/components/modals/ManageScheduleModal";
import UpdateSalaryModal from "@/components/modals/UpdateSalaryModal";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { useStaff, StaffFilters, transformUserToStaff } from "@/hooks/useStaff";
import { apiService, type Payroll } from "@/services/api";
import { toast } from "@/hooks/use-toast";

const Staff = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const { formatAmount } = useCurrency();

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<ReturnType<typeof transformUserToStaff> | null>(null);

  // Payroll data for salary calculations
  const [payrollData, setPayrollData] = useState<Payroll[]>([]);
  const [loadingPayroll, setLoadingPayroll] = useState(false);

  // Use the staff hook
  const {
    staff,
    loading,
    error,
    fetchStaff,
    updateStaff,
    updateStaffSchedule,
    activateStaff,
    deactivateStaff,
    getStaffStats,
    refetch
  } = useStaff();

  // Fetch payroll data to get actual salary information
  const fetchPayrollData = async () => {
    try {
      setLoadingPayroll(true);
      // Force tenant-scoped filtering to show only tenant-related payroll data
      const response = await apiService.getPayrolls({ limit: 100, tenantScoped: true }); 
      setPayrollData(response.data.items || []);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
    } finally {
      setLoadingPayroll(false);
    }
  };

  // Calculate staff member salary from payroll data
  const getStaffSalary = (staffId: string): number => {
    const payrollEntries = payrollData.filter(entry => {
      const employeeId = typeof entry.employee_id === 'string' 
        ? entry.employee_id 
        : entry.employee_id._id;
      return employeeId === staffId;
    });

    if (payrollEntries.length === 0) return 0;

    // Get the most recent payroll entry for base salary
    const latestEntry = payrollEntries.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    return latestEntry.base_salary || 0;
  };

  // Enhanced stats calculation with real salary data
  const getEnhancedStaffStats = () => {
    const baseStats = getStaffStats();
    
    // Calculate total salary budget from payroll data
    const staffWithSalaries = staff.map(member => ({
      ...member,
      actualSalary: getStaffSalary(member.id)
    }));

    const totalSalaryBudget = staffWithSalaries.reduce((sum, member) => 
      sum + member.actualSalary, 0
    );

    return {
      ...baseStats,
      totalSalaryBudget,
      staffWithSalaries
    };
  };

  // Effect to fetch staff when filters change
  useEffect(() => {
    const filters: StaffFilters = {
      search: searchTerm,
      role: selectedRole !== "all" ? selectedRole : undefined,
      department: selectedDepartment !== "all" ? selectedDepartment : undefined,
    };
    fetchStaff(filters);
  }, [searchTerm, selectedRole, selectedDepartment]);

  // Effect to fetch payroll data on component mount
  useEffect(() => {
    fetchPayrollData();
  }, []);

  const departments = [
    "all",
    ...Array.from(new Set(staff.map((s) => s.department))),
  ];

  const filteredStaff = staff;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Shield className="h-4 w-4 text-red-600" />;
      case "admin":
        return <Shield className="h-4 w-4 text-purple-600" />;
      case "doctor":
        return <Stethoscope className="h-4 w-4 text-primary" />;
      case "nurse":
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case "receptionist":
        return <Users className="h-4 w-4 text-orange-600" />;
      case "technician":
        return <Users className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-200 dark:bg-red-900/30 text-red-900 dark:text-red-200 border-red-300 dark:border-red-700 font-bold";
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "doctor":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
      case "nurse":
        return "bg-green-100 text-green-800";
      case "receptionist":
        return "bg-orange-100 text-orange-800";
      case "technician":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Using the currency context for dynamic currency formatting
  const formatCurrency = (amount: number) => {
    return formatAmount(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getWorkingDays = (schedule: any) => {
    return Object.values(schedule).filter((day: any) => day.isWorking).length;
  };

  // Calculate stats using the enhanced version with payroll data
  const stats = getEnhancedStaffStats();

  // Add handlers for staff actions
  const handleActivateStaff = async (id: string) => {
    try {
      await activateStaff(id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeactivateStaff = async (id: string) => {
    try {
      await deactivateStaff(id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleRefresh = () => {
    refetch();
    fetchPayrollData(); // Also refresh payroll data
    toast({
      title: t("Staff list refreshed"),
      description: t("Staff data has been updated from the server."),
    });
  };

  // Modal handlers
  const handleViewProfile = (staffMember: ReturnType<typeof transformUserToStaff>) => {
    setSelectedStaff(staffMember);
    setViewModalOpen(true);
  };

  const handleEditDetails = (staffMember: ReturnType<typeof transformUserToStaff>) => {
    setSelectedStaff(staffMember);
    setEditModalOpen(true);
  };

  const handleManageSchedule = (staffMember: ReturnType<typeof transformUserToStaff>) => {
    setSelectedStaff(staffMember);
    setScheduleModalOpen(true);
  };

  const handleUpdateSalary = (staffMember: ReturnType<typeof transformUserToStaff>) => {
    setSelectedStaff(staffMember);
    setSalaryModalOpen(true);
  };

  // Update handlers for modals
  const handleStaffUpdate = async (id: string, data: any) => {
    try {
      await updateStaff(id, data);
      handleRefresh();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleScheduleUpdate = async (id: string, schedule: any) => {
    try {
      await updateStaffSchedule(id, schedule);
      handleRefresh();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t('Staff Management')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Manage clinic staff and their information')}
          </p>
        </div>
        <div className="flex-shrink-0 flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading || loadingPayroll}>
            <RefreshCw className={`h-4 w-4 mr-2 ${(loading || loadingPayroll) ? 'animate-spin' : ''}`} />
            {t('Refresh')}
          </Button>
          <AddStaffModal onStaffAdded={handleRefresh} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('Total Staff')}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.totalStaff}
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('Doctors')}</p>
                  <p className="text-3xl font-bold text-primary">{stats.doctors}</p>
                </div>
                <Stethoscope className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('Nurses')}</p>
                  <p className="text-3xl font-bold text-green-600">{stats.nurses}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('Salary Budget')}
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {loadingPayroll ? (
                      <span className="text-sm">{t('Loading...')}</span>
                    ) : (
                      <CurrencyDisplay amount={stats.totalSalaryBudget} variant="large" />
                    )}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-0 sm:min-w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('Search staff by name, email, or phone...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder={t('Role')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Roles')}</SelectItem>
                  <SelectItem value="super_admin">{t('Super Administrator')}</SelectItem>
                  <SelectItem value="admin">{t('Admin')}</SelectItem>
                  <SelectItem value="doctor">{t('Doctor')}</SelectItem>
                  <SelectItem value="nurse">{t('Nurse')}</SelectItem>
                  <SelectItem value="receptionist">{t('Receptionist')}</SelectItem>
                  <SelectItem value="technician">{t('Technician')}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t('Department')} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept === "all" ? t("All Departments") : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('Staff Directory')}</CardTitle>
            <CardDescription>
              {t('Complete list of clinic staff with their details and schedules')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">{t('Loading staff...')}</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex items-center justify-center py-8 text-red-600">
                <span>{t('Error:')} {error}</span>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredStaff.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Users className="h-12 w-12 mb-4" />
                <span className="text-lg font-medium">{t('No staff members found')}</span>
                <span className="text-sm">{t('Try adjusting your filters or add new staff members')}</span>
              </div>
            )}

            {/* Desktop Table View */}
            {!loading && !error && filteredStaff.length > 0 && (
              <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">
                      {t('Staff Member')}
                    </TableHead>
                    <TableHead className="min-w-[200px]">{t('Contact')}</TableHead>
                    <TableHead className="min-w-[120px]">{t('Role')}</TableHead>
                    <TableHead className="min-w-[140px]">{t('Department')}</TableHead>
                    <TableHead className="min-w-[140px]">{t('Salary & Incentive')}</TableHead>
                    <TableHead className="min-w-[120px]">
                      {t('Working Days')}
                    </TableHead>
                    <TableHead className="min-w-[100px]">{t('Joined')}</TableHead>
                    <TableHead className="text-right min-w-[120px]">
                      {t('Actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {member.firstName.charAt(0)}
                              {member.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.qualifications[0]}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1 text-gray-400" />
                            {member.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1 text-gray-400" />
                            {member.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(member.role)}
                          <Badge
                            className={`text-xs ${getRoleColor(member.role)}`}
                          >
                            {member.role}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{member.department}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {getStaffSalary(member.id) > 0 
                              ? formatCurrency(getStaffSalary(member.id)) 
                              : t('Not set')
                            }
                          </div>
                          <div className="text-sm text-gray-500">{t('Base Salary')}</div>
                          {member.role === 'doctor' && (
                            <div className="text-sm text-blue-600 font-medium">
                              {member.salesPercentage}% {t('Sales Incentive')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>
                            {getWorkingDays(member.schedule)} {t('days/week')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(member.joiningDate)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              <MoreVertical className="h-4 w-4 mr-1" />
                              {t('Actions')}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewProfile(member)}>
                              {t('View Profile')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditDetails(member)}>
                              {t('Edit Details')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManageSchedule(member)}>
                              <Calendar className="mr-2 h-4 w-4" />
                              {t('Manage Schedule')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateSalary(member)}>
                              <DollarSign className="mr-2 h-4 w-4" />
                              {t('Update Salary')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => member.isActive ? handleDeactivateStaff(member.id) : handleActivateStaff(member.id)}
                            >
                              {member.isActive ? t('Deactivate Staff') : t('Activate Staff')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            )}

            {/* Mobile Card View */}
            {!loading && !error && filteredStaff.length > 0 && (
              <div className="md:hidden space-y-4">
              {filteredStaff.map((member) => (
                <div
                  key={member.id}
                  className="border rounded-lg p-4 space-y-3 bg-white shadow-sm"
                >
                  {/* Header with Staff and Role */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {member.firstName.charAt(0)}
                          {member.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-lg">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.qualifications[0]}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(member.role)}
                      <Badge className={`text-xs ${getRoleColor(member.role)}`}>
                        {member.role}
                      </Badge>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-900">{member.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-900">{member.phone}</span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {t('Department')}
                      </div>
                      <div className="text-sm font-medium">
                        {member.department}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {t('Salary & Incentive')}
                      </div>
                      <div className="text-sm font-medium">
                        {getStaffSalary(member.id) > 0 
                          ? formatCurrency(getStaffSalary(member.id)) 
                          : t('Not set')
                        }
                      </div>
                      {member.role === 'doctor' && (
                        <div className="text-xs text-blue-600 font-medium">
                          {member.salesPercentage}% {t('Sales')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {t('Working Days')}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">
                          {getWorkingDays(member.schedule)} {t('days/week')}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {t('Joined')}
                      </div>
                      <div className="text-sm">
                        {formatDate(member.joiningDate)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      {t('Employee ID:')} #{member.id}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4 mr-1" />
                          {t('Actions')}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewProfile(member)}>
                          {t('View Profile')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditDetails(member)}>
                          {t('Edit Details')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManageSchedule(member)}>
                          <Calendar className="mr-2 h-4 w-4" />
                          {t('Manage Schedule')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateSalary(member)}>
                          <DollarSign className="mr-2 h-4 w-4" />
                          {t('Update Salary')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => member.isActive ? handleDeactivateStaff(member.id) : handleActivateStaff(member.id)}
                        >
                          {member.isActive ? t('Deactivate Staff') : t('Activate Staff')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modals */}
      <ViewStaffModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        staff={selectedStaff}
      />

      <EditStaffModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        staff={selectedStaff}
        onUpdate={handleStaffUpdate}
      />

      <ManageScheduleModal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        staff={selectedStaff}
        onUpdate={handleScheduleUpdate}
      />

      <UpdateSalaryModal
        open={salaryModalOpen}
        onOpenChange={setSalaryModalOpen}
        employeeId={selectedStaff?.id || null}
        onUpdate={() => {
          // Refresh staff data after salary update
          fetchStaff();
          setSalaryModalOpen(false);
          setSelectedStaff(null);
        }}
      />
    </div>
  );
};

export default Staff;
