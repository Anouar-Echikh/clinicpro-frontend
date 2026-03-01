import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Users,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  DollarSign,
  MoreVertical,
  Loader2,
} from "lucide-react";
import AddDepartmentModal from "@/components/modals/AddDepartmentModal";
import EditDepartmentModal from "@/components/modals/EditDepartmentModal";
import ViewDepartmentModal from "@/components/modals/ViewDepartmentModal";
import { toast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useClinic } from "@/contexts/ClinicContext";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { apiService, Department as ApiDepartment, CreateDepartmentRequest, DepartmentStats } from "@/services/api";

// Use the API interface but extend with local ID mapping
interface Department extends Omit<ApiDepartment, '_id' | 'created_at' | 'updated_at'> {
  id: string;
  createdAt: string;
  updatedAt: string;
}

const Departments = () => {
  const { t } = useTranslation();
  const { formatAmount } = useCurrency();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DepartmentStats | null>(null);

  // Transform API department to local department interface
  const transformDepartment = (apiDept: ApiDepartment): Department => ({
    id: apiDept._id,
    code: apiDept.code,
    name: apiDept.name,
    description: apiDept.description,
    head: apiDept.head,
    location: apiDept.location,
    phone: apiDept.phone,
    email: apiDept.email,
    staffCount: apiDept.staffCount,
    budget: apiDept.budget,
    status: apiDept.status,
    createdAt: apiDept.created_at,
    updatedAt: apiDept.updated_at,
  });

  // Fetch departments from API
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDepartments({ limit: 1000 }); // Get all departments
      const transformedDepartments = response.data.departments.map(transformDepartment);
      setDepartments(transformedDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        title: t("Error"),
        description: t("Failed to load departments. Please try again."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch department statistics
  const fetchStats = async () => {
    try {
      const statsData = await apiService.getDepartmentStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching department stats:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDepartments();
    fetchStats();
  }, []);

  // Filter departments based on search term
  useEffect(() => {
    const filtered = departments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.description.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredDepartments(filtered);
  }, [searchTerm, departments]);

  const handleAddDepartment = async (
    departmentData: Omit<Department, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      const createRequest: CreateDepartmentRequest = {
        code: departmentData.code,
        name: departmentData.name,
        description: departmentData.description,
        head: departmentData.head,
        location: departmentData.location,
        phone: departmentData.phone,
        email: departmentData.email,
        staffCount: departmentData.staffCount,
        budget: departmentData.budget,
        status: departmentData.status,
      };

      const newDepartment = await apiService.createDepartment(createRequest);
      const transformedDepartment = transformDepartment(newDepartment);
      
      setDepartments([...departments, transformedDepartment]);
      setIsAddModalOpen(false);
      
      // Refresh stats
      fetchStats();
      
      toast({
        title: t("Department Added"),
        description: `${departmentData.name} ${t('has been successfully added.')}`,
      });
    } catch (error: any) {
      console.error('Error adding department:', error);
      toast({
        title: t("Error"),
        description: error.response?.data?.message || t("Failed to add department. Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleEditDepartment = async (
    departmentData: Omit<Department, "id" | "createdAt" | "updatedAt">,
  ) => {
    if (!selectedDepartment) return;

    try {
      const updateRequest: Partial<CreateDepartmentRequest> = {
        code: departmentData.code,
        name: departmentData.name,
        description: departmentData.description,
        head: departmentData.head,
        location: departmentData.location,
        phone: departmentData.phone,
        email: departmentData.email,
        staffCount: departmentData.staffCount,
        budget: departmentData.budget,
        status: departmentData.status,
      };

      const updatedDepartment = await apiService.updateDepartment(selectedDepartment.id, updateRequest);
      const transformedDepartment = transformDepartment(updatedDepartment);

      setDepartments(
        departments.map((dept) =>
          dept.id === selectedDepartment.id ? transformedDepartment : dept,
        ),
      );
      setIsEditModalOpen(false);
      setSelectedDepartment(null);
      
      // Refresh stats
      fetchStats();

      toast({
        title: t("Department Updated"),
        description: `${departmentData.name} ${t('has been successfully updated.')}`,
      });
    } catch (error: any) {
      console.error('Error updating department:', error);
      toast({
        title: t("Error"),
        description: error.response?.data?.message || t("Failed to update department. Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    const departmentToDelete = departments.find((dept) => dept.id === id);
    
    try {
      await apiService.deleteDepartment(id);
      setDepartments(departments.filter((dept) => dept.id !== id));
      
      // Refresh stats
      fetchStats();

      toast({
        title: t("Department Deleted"),
        description: `${departmentToDelete?.name} ${t('has been successfully deleted.')}`,
        variant: "destructive",
      });
    } catch (error: any) {
      console.error('Error deleting department:', error);
      toast({
        title: t("Error"),
        description: error.response?.data?.message || t("Failed to delete department. Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleViewDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (department: Department) => {
    setSelectedDepartment(department);
    setIsEditModalOpen(true);
  };

  // Using the currency context for dynamic currency formatting
  const formatCurrency = (amount: number) => {
    return formatAmount(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        {t('Active')}
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <AlertCircle className="h-3 w-3 mr-1" />
        {t('Inactive')}
      </Badge>
    );
  };

  // Statistics - use API stats when available, fallback to calculated values
  const totalDepartments = stats?.overview?.totalDepartments ?? departments.length;
  const activeDepartments = stats?.overview?.activeDepartments ?? departments.filter(
    (dept) => dept.status === "active",
  ).length;
  const totalStaff = stats?.staff?.totalStaff ?? departments.reduce(
    (sum, dept) => sum + dept.staffCount,
    0,
  );
  const totalBudget = stats?.budget?.totalBudget ?? departments.reduce((sum, dept) => sum + dept.budget, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t('Departments')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Manage clinic departments and their information')}
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('Add Department')}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('Total Departments')}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalDepartments}
                  </p>
                </div>
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
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('Active Departments')}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {activeDepartments}
                  </p>
                </div>
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
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('Total Staff')}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalStaff}
                  </p>
                </div>
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
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('Total Budget')}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    <CurrencyDisplay amount={totalBudget} variant="large" />
                  </p>
                </div>
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('Search departments...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Departments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('Department Directory')}</CardTitle>
            <CardDescription>
              {t('Complete list of clinic departments with their details and budgets')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">{t('Loading departments...')}</span>
              </div>
            ) : (
              <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">{t('Department')}</TableHead>
                    <TableHead className="min-w-[200px]">{t('Contact')}</TableHead>
                    <TableHead className="min-w-[140px]">
                      {t('Department Head')}
                    </TableHead>
                    <TableHead className="min-w-[100px]">{t('Staff')}</TableHead>
                    <TableHead className="min-w-[120px]">{t('Budget')}</TableHead>
                    <TableHead className="min-w-[100px]">{t('Status')}</TableHead>
                    <TableHead className="min-w-[100px]">{t('Created')}</TableHead>
                    <TableHead className="text-right min-w-[120px]">
                      {t('Actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartments.map((department) => (
                    <TableRow key={department.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center">
                            <Building2 className="h-4 w-4 mr-2 text-primary" />
                            {department.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {department.code} • {department.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1 text-gray-400" />
                            {department.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1 text-gray-400" />
                            {department.phone}
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                            {department.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{department.head}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">
                            {department.staffCount}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(department.budget)}
                        </div>
                        <div className="text-sm text-gray-500">{t('Annual')}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(department.status)}</TableCell>
                      <TableCell>{formatDate(department.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              <MoreVertical className="h-4 w-4 mr-1" />
                              {t('Actions')}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDepartment(department)}
                            >
                              {t('View Details')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditClick(department)}
                            >
                              {t('Edit Department')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteDepartment(department.id)
                              }
                              className="text-red-600"
                            >
                              {t('Delete Department')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredDepartments.map((department) => (
                <div
                  key={department.id}
                  className="border rounded-lg p-4 space-y-3 bg-white shadow-sm"
                >
                  {/* Header with Department Name and Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-lg">
                          {department.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {department.code}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(department.status)}
                  </div>

                  {/* Description */}
                  <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                    {department.description}
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-900">{department.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-900">{department.phone}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-900">
                        {department.location}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {t('Department Head')}
                      </div>
                      <div className="text-sm font-medium">
                        {department.head}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {t('Staff Count')}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">
                          {department.staffCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {t('Annual Budget')}
                      </div>
                      <div className="text-sm font-medium">
                        {formatCurrency(department.budget)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {t('Created')}
                      </div>
                      <div className="text-sm">
                        {formatDate(department.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      {t('Dept ID:')} {department.code}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4 mr-1" />
                          {t('Actions')}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewDepartment(department)}
                        >
                          {t('View Details')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditClick(department)}
                        >
                          {t('Edit Department')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteDepartment(department.id)}
                          className="text-red-600"
                        >
                          {t('Delete Department')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modals */}
      <AddDepartmentModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddDepartment}
      />
      
      {selectedDepartment && (
        <>
          <EditDepartmentModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedDepartment(null);
            }}
            onSubmit={handleEditDepartment}
            department={selectedDepartment}
          />
          <ViewDepartmentModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedDepartment(null);
            }}
            department={selectedDepartment}
          />
        </>
      )}
    </div>
  );
};

export default Departments;
