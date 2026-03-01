import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Activity,
  Clock,
  DollarSign,
  Users,
  Eye,
  Edit,
  Trash2,
  Stethoscope,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Service } from "@/types";
import AddServiceModal from "@/components/modals/AddServiceModal";
import ViewDetailsModal from "@/components/modals/ViewDetailsModal";
import EditItemModal from "@/components/modals/EditItemModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import AdvancedFiltersModal from "@/components/modals/AdvancedFiltersModal";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useClinic } from "@/contexts/ClinicContext";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { serviceApi, ServiceStats } from "@/services/api/serviceApi";

const Services = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>(
    {},
  );
  const { formatAmount } = useCurrency();
  const { currentClinic, loading: clinicLoading, error: clinicError } = useClinic();

  // API state
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Master data for filter dropdowns (independent of current filtering)
  const [masterCategories, setMasterCategories] = useState<string[]>([]);
  const [masterDepartments, setMasterDepartments] = useState<string[]>([]);
  const [masterDataLoading, setMasterDataLoading] = useState(true);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Modal states
  const [viewDetailsModal, setViewDetailsModal] = useState<{
    open: boolean;
    item: Service | null;
  }>({ open: false, item: null });

  const [editModal, setEditModal] = useState<{
    open: boolean;
    item: Service | null;
  }>({ open: false, item: null });

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    item: Service | null;
  }>({ open: false, item: null });

  // Load services from API
  const fetchServices = useCallback(async () => {
    if (!currentClinic) {
      console.warn("No clinic selected, skipping services fetch");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const filters = {
        search: debouncedSearchTerm || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        department: selectedDepartment !== "all" ? selectedDepartment : undefined,
        page: pagination.page,
        limit: pagination.limit,
        ...advancedFilters,
      };

      const response = await serviceApi.getServices(filters);
      setServices(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error fetching services:", error);
      const errorMessage = error instanceof Error && error.message.includes('401') 
        ? t("Access denied. Please check your clinic permissions.") 
        : error instanceof Error && error.message.includes('403')
        ? t("Insufficient permissions to view services for this clinic.")
        : t("Failed to load services. Please try again.");
      
      toast({
        title: t("Error"),
        description: errorMessage,
        variant: "destructive",
      });
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentClinic, debouncedSearchTerm, selectedCategory, selectedDepartment, pagination.page, pagination.limit, advancedFilters, t]);

  const fetchStats = useCallback(async () => {
    if (!currentClinic) {
      console.warn("No clinic selected, skipping stats fetch");
      return;
    }

    try {
      const serviceStats = await serviceApi.getServiceStats();
      setStats(serviceStats);
    } catch (error) {
      console.error("Error fetching service stats:", error);
      // Don't show error toast for stats failure, as it's secondary data
      setStats(null);
    }
  }, [currentClinic]);

  // Load master data for filter dropdowns (no filters applied)
  const fetchMasterData = useCallback(async () => {
    if (!currentClinic) {
      console.warn("No clinic selected, skipping master data fetch");
      setMasterDataLoading(false);
      return;
    }

    try {
      setMasterDataLoading(true);
      // Fetch all services without any filters to get master categories and departments
      const response = await serviceApi.getServices({ limit: 1000 });
      const allServices = response.data;
      
      // Extract unique categories and departments
      const categories = Array.from(new Set(allServices.map(s => s.category))).filter(Boolean);
      const departments = Array.from(new Set(allServices.map(s => s.department))).filter(Boolean);
      
      setMasterCategories(categories);
      setMasterDepartments(departments);
    } catch (error) {
      console.error("Error fetching master data:", error);
      // Fallback to empty arrays
      setMasterCategories([]);
      setMasterDepartments([]);
    } finally {
      setMasterDataLoading(false);
    }
  }, [currentClinic]);

  // Initial load and reload when clinic changes
  useEffect(() => {
    if (currentClinic && !clinicLoading) {
      fetchMasterData();
      fetchStats();
      fetchServices();
    }
  }, [currentClinic, clinicLoading, fetchMasterData, fetchStats, fetchServices]);

  // Refresh when filters change (using debounced search term)
  useEffect(() => {
    if (currentClinic && !clinicLoading) {
      fetchServices();
    }
  }, [debouncedSearchTerm, selectedCategory, selectedDepartment, advancedFilters, pagination.page, fetchServices, currentClinic, clinicLoading]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchServices(), fetchStats(), fetchMasterData()]);
    setIsRefreshing(false);
  };

  // Action handlers
  const handleViewDetails = (service: Service) => {
    setViewDetailsModal({ open: true, item: service });
  };

  const handleEdit = (service: Service) => {
    setEditModal({ open: true, item: service });
  };

  const handleDelete = (service: Service) => {
    setDeleteModal({ open: true, item: service });
  };

  const handleActivateService = async (service: Service) => {
    try {
      await serviceApi.toggleServiceStatus(service.id);
      toast({
        title: t("Service Activated"),
        description: `${service.name} ${t('has been activated.')}`,
      });
      fetchServices(); // Refresh the list
    } catch (error) {
      toast({
        title: t("Error"),
        description: t("Failed to activate service. Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleDeactivateService = async (service: Service) => {
    try {
      await serviceApi.toggleServiceStatus(service.id);
      toast({
        title: t("Service Deactivated"),
        description: `${service.name} ${t('has been deactivated.')}`,
      });
      fetchServices(); // Refresh the list
    } catch (error) {
      toast({
        title: t("Error"),
        description: t("Failed to deactivate service. Please try again."),
        variant: "destructive",
      });
    }
  };

  // Filter handlers
  const handleApplyAdvancedFilters = (filters: Record<string, any>) => {
    setAdvancedFilters(filters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when applying filters
  };

  const handleClearAdvancedFilters = () => {
    setAdvancedFilters({});
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when clearing filters
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when category changes
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when department changes
  };

  // Filter configuration
  const filterFields = useMemo(() => [
    {
      key: "department",
      label: t("Department"),
      type: "select" as const,
      options: masterDepartments,
    },
    {
      key: "minPrice",
      label: t("Minimum Price"),
      type: "number" as const,
      placeholder: t("Enter minimum price"),
    },
    {
      key: "maxPrice",
      label: t("Maximum Price"),
      type: "number" as const,
      placeholder: t("Enter maximum price"),
    },
    {
      key: "minDuration",
      label: t("Minimum Duration (minutes)"),
      type: "number" as const,
      placeholder: t("Enter minimum duration"),
    },
    {
      key: "maxDuration",
      label: t("Maximum Duration (minutes)"),
      type: "number" as const,
      placeholder: t("Enter maximum duration"),
    },
    {
      key: "status",
      label: t("Service Status"),
      type: "checkbox" as const,
      options: [t("Active"), t("Inactive")],
    },
    {
      key: "followUpRequired",
      label: t("Follow-up Requirements"),
      type: "checkbox" as const,
      options: [t("Follow-up Required"), t("No Follow-up Required")],
    },
  ], [t, masterDepartments]);

  // Filter data - using master data independent of current filtering
  const categories = useMemo(() => [
    "all",
    ...masterCategories.sort()
  ], [masterCategories]);

  const departments = useMemo(() => [
    "all", 
    ...masterDepartments.sort()
  ], [masterDepartments]);

  // Since filtering is now handled by the API, we use the services directly
  const filteredServices = services;

  // Calculate stats from API data
  const totalServices = stats?.totalServices || services.length;
  const activeServices = stats?.activeServices || services.filter((s) => s.isActive).length;
  const totalRevenue = stats?.categoryStats?.reduce((sum, cat) => sum + cat.totalRevenue, 0) || 
    services.filter((s) => s.isActive).reduce((sum, s) => sum + s.price, 0);
  const avgDuration = services.length > 0 ? Math.round(
    services.reduce((sum, s) => sum + s.duration, 0) / services.length,
  ) : 0;

  // Using the currency context for dynamic currency formatting
  const formatCurrency = (amount: number) => {
    return formatAmount(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? { label: t("Active"), color: "bg-green-100 text-green-800" }
      : { label: t("Inactive"), color: "bg-muted text-muted-foreground" };
  };

  // Show loading state while clinic context is loading
  if (clinicLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-muted-foreground">{t('Loading clinic context...')}</span>
      </div>
    );
  }

  // Show message when no clinic is selected
  if (!currentClinic && !clinicLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Stethoscope className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">{t('No Clinic Selected')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('Please select a clinic to view and manage services.')}
          </p>
          {clinicError && (
            <p className="text-red-600 text-sm">
              {t('Error:')}: {clinicError}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t('Services')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentClinic ? (
              <>{t('Manage medical services and pricing for')} <span className="font-semibold text-primary">{currentClinic.name}</span></>
            ) : (
              t('Manage medical services and pricing')
            )}
          </p>
          {clinicError && (
            <p className="text-red-600 text-sm mt-1">
              {t('Error loading clinic:')}: {clinicError}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing || !currentClinic}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? t('Refreshing...') : t('Refresh')}
          </Button>
          {currentClinic ? (
            <AddServiceModal 
              onServiceCreated={fetchServices}
            />
          ) : (
            <Button disabled size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t('Add Service')}
            </Button>
          )}
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
                    {t('Total Services')}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {totalServices}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-primary" />
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('Active Services')}
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {activeServices}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-600" />
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('Total Revenue Potential')}
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    <CurrencyDisplay amount={totalRevenue} variant="large" />
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('Avg Duration')}
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatDuration(avgDuration)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('Search services by name, description, or department...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
              disabled={masterDataLoading || !currentClinic}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={masterDataLoading ? t('Loading...') : t('Category')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? t("All Categories") : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedDepartment}
              onValueChange={handleDepartmentChange}
              disabled={masterDataLoading || !currentClinic}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={masterDataLoading ? t('Loading...') : t('Department')} />
              </SelectTrigger>
              <SelectContent>
                {departments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department === "all" ? t("All Departments") : department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <AdvancedFiltersModal
              filterFields={filterFields}
              onApplyFilters={handleApplyAdvancedFilters}
              onClearFilters={handleClearAdvancedFilters}
              initialFilters={advancedFilters}
            />
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('Services Directory')}</CardTitle>
            <CardDescription>
              {t('Manage and configure available medical services')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2 text-gray-600">{t('Loading services...')}</span>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">{t('Service')}</TableHead>
                        <TableHead className="min-w-[120px]">{t('Category')}</TableHead>
                        <TableHead className="min-w-[140px]">{t('Department')}</TableHead>
                        <TableHead className="min-w-[100px]">{t('Duration')}</TableHead>
                        <TableHead className="min-w-[100px]">{t('Price')}</TableHead>
                        <TableHead className="min-w-[100px]">{t('Max/Day')}</TableHead>
                        <TableHead className="min-w-[100px]">{t('Status')}</TableHead>
                        <TableHead className="text-right min-w-[120px]">
                          {t('Actions')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                  {filteredServices.map((service) => {
                    const statusBadge = getStatusBadge(service.isActive);

                    return (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-gray-500">
                              {service.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{service.category}</Badge>
                        </TableCell>
                        <TableCell>{service.department}</TableCell>
                        <TableCell>
                          {formatDuration(service.duration)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(service.price)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{service.maxBookingsPerDay}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${statusBadge.color}`}>
                            {statusBadge.label}
                          </Badge>
                        </TableCell>
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
                                onClick={() => handleViewDetails(service)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                {t('View Details')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEdit(service)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                {t('Edit Service')}
                              </DropdownMenuItem>
                              {service.isActive ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeactivateService(service)
                                  }
                                >
                                  <Activity className="mr-2 h-4 w-4" />
                                  {t('Deactivate')}
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleActivateService(service)}
                                >
                                  <Activity className="mr-2 h-4 w-4" />
                                  {t('Activate')}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDelete(service)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('Delete Service')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredServices.map((service) => {
                const statusBadge = getStatusBadge(service.isActive);

                return (
                  <div
                    key={service.id}
                    className="border rounded-lg p-4 space-y-3 bg-white shadow-sm"
                  >
                    {/* Header with Service and Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-lg">
                          {service.name}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {service.description}
                        </div>
                      </div>
                      <Badge className={`text-xs ${statusBadge.color} ml-3`}>
                        {statusBadge.label}
                      </Badge>
                    </div>

                    {/* Service Details Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          {t('Category')}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {service.category}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          {t('Department')}
                        </div>
                        <div className="text-sm">{service.department}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          {t('Duration')}
                        </div>
                        <div className="text-sm font-medium">
                          {formatDuration(service.duration)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          {t('Price')}
                        </div>
                        <div className="text-sm font-medium">
                          {formatCurrency(service.price)}
                        </div>
                      </div>
                    </div>

                    {/* Capacity Info */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-gray-500">
                            {t('Max bookings per day:')}
                          </span>
                          <span className="ml-2 font-medium">
                            {service.maxBookingsPerDay}
                          </span>
                        </div>
                        <Users className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-xs text-gray-500">
                        {t('Service ID:')}: #{service.id}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4 mr-1" />
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(service)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(service)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Service
                          </DropdownMenuItem>
                          {service.isActive ? (
                            <DropdownMenuItem
                              onClick={() => handleDeactivateService(service)}
                            >
                              <Activity className="mr-2 h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleActivateService(service)}
                            >
                              <Activity className="mr-2 h-4 w-4" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(service)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Service
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modals */}
      <ViewDetailsModal
        open={viewDetailsModal.open}
        onOpenChange={(open) =>
          setViewDetailsModal({ open, item: viewDetailsModal.item })
        }
        title={t("Service Details")}
        data={viewDetailsModal.item}
        fields={[
          { key: "id", label: t("Service ID"), type: "text" },
          { key: "name", label: t("Service Name"), type: "text" },
          { key: "category", label: t("Category"), type: "badge" },
          { key: "department", label: t("Department"), type: "text" },
          { key: "description", label: t("Description"), type: "text" },
          {
            key: "duration",
            label: t("Duration"),
            type: "text",
            render: (value: number) => formatDuration(value),
          },
          { key: "price", label: t("Price"), type: "currency" },
          { key: "maxBookingsPerDay", label: t("Max Bookings/Day"), type: "text" },
          { key: "prerequisites", label: t("Prerequisites"), type: "text" },
          {
            key: "followUpRequired",
            label: t("Follow-up Required"),
            type: "boolean",
          },
          {
            key: "specialInstructions",
            label: t("Special Instructions"),
            type: "text",
          },
          {
            key: "isActive",
            label: "Status",
            type: "boolean",
            render: (value: boolean) => (value ? t("Active") : t("Inactive")),
          },
          { key: "createdAt", label: t("Created"), type: "date" },
          { key: "updatedAt", label: t("Last Updated"), type: "date" },
        ]}
      />

      <EditItemModal
        open={editModal.open}
        onOpenChange={(open) => setEditModal({ open, item: editModal.item })}
        title={t("Edit Service")}
        data={editModal.item}
        fields={[
          { key: "name", label: t("Service Name"), type: "text", required: true },
          {
            key: "category",
            label: t("Category"),
            type: "select",
            options: masterCategories,
            required: true,
          },
          {
            key: "department",
            label: t("Department"),
            type: "select",
            options: masterDepartments,
            required: true,
          },
          {
            key: "description",
            label: t("Description"),
            type: "textarea",
            required: true,
          },
          {
            key: "duration",
            label: t("Duration (minutes)"),
            type: "number",
            required: true,
          },
          { key: "price", label: "Price", type: "number", required: true },
          {
            key: "maxBookingsPerDay",
            label: t("Max Bookings/Day"),
            type: "number",
            required: true,
          },
          { key: "prerequisites", label: t("Prerequisites"), type: "text" },
          {
            key: "specialInstructions",
            label: t("Special Instructions"),
            type: "textarea",
          },
          {
            key: "followUpRequired",
            label: t("Follow-up Required"),
            type: "switch",
          },
          { key: "isActive", label: t("Active"), type: "switch" },
        ]}
        onSave={async (data) => {
          try {
            await serviceApi.updateService(editModal.item!.id, data);
            toast({
              title: t("Service Updated"),
              description: `${data.name} ${t('has been updated successfully.')}`,
            });
            setEditModal({ open: false, item: null });
            fetchServices(); // Refresh the list
          } catch (error) {
            toast({
              title: t("Error"),
              description: t("Failed to update service. Please try again."),
              variant: "destructive",
            });
          }
        }}
      />

      <DeleteConfirmModal
        open={deleteModal.open}
        onOpenChange={(open) =>
          setDeleteModal({ open, item: deleteModal.item })
        }
        title={t("Delete Service")}
        description={`${t('Are you sure you want to delete')} "${deleteModal.item?.name}"? ${t('This action cannot be undone.')}`}
        itemName={deleteModal.item?.name || ""}
        onConfirm={async () => {
          try {
            await serviceApi.deleteService(deleteModal.item!.id);
            toast({
              title: t("Service Deleted"),
              description: `${deleteModal.item?.name} ${t('has been deleted successfully.')}`,
            });
            setDeleteModal({ open: false, item: null });
            fetchServices(); // Refresh the list
          } catch (error) {
            toast({
              title: t("Error"),
              description: t("Failed to delete service. Please try again."),
              variant: "destructive",
            });
          }
        }}
      />
    </div>
  );
};

export default Services;
