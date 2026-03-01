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
  Building,
  Phone,
  Mail,
  MapPin,
  Star,
  Calendar,
  TestTube2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  FileText,
  Users,
  DollarSign,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useClinic } from "@/contexts/ClinicContext";
import AddLabVendorModal from "@/components/modals/AddLabVendorModal";
import ViewVendorDetailsModal from "@/components/modals/ViewVendorDetailsModal";
import EditVendorModal from "@/components/modals/EditVendorModal";
import TestHistoryModal from "@/components/modals/TestHistoryModal";
import ContractDetailsModal from "@/components/modals/ContractDetailsModal";
import BillingPaymentsModal from "@/components/modals/BillingPaymentsModal";
import { LabVendor, LabVendorStats } from "@/types";
import { labVendorApi } from "@/services/api/labVendorApi";

const LabVendors = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const { currentClinic, loading: clinicLoading, error: clinicError } = useClinic();

  // API state
  const [labVendors, setLabVendors] = useState<LabVendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<LabVendorStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal state
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedVendorName, setSelectedVendorName] = useState<string>("");
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [testHistoryModalOpen, setTestHistoryModalOpen] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [billingModalOpen, setBillingModalOpen] = useState(false);

  // Mock lab vendors data (keeping for fallback)
  const mockLabVendors: LabVendor[] = [
    {
      id: "LV-001",
      name: "City Lab Services",
      code: "CLS",
      type: "diagnostic_lab",
      status: "active",
      contactPerson: "Dr. Michael Johnson",
      email: "contact@citylabservices.com",
      phone: "+1-555-123-4567",
      address: "123 Medical Center Drive",
      city: "Springfield",
      state: "IL",
      zipCode: "62701",
      website: "www.citylabservices.com",
      license: "LAB-IL-2024-001",
      accreditation: ["CLIA", "CAP", "AABB"],
      specialties: ["Hematology", "Clinical Chemistry", "Microbiology"],
      rating: 4.8,
      totalTests: 1250,
      averageTurnaround: "4-6 hours",
      pricing: "moderate",
      contractStart: new Date("2024-01-01"),
      contractEnd: new Date("2024-12-31"),
      lastTestDate: new Date("2024-01-20"),
      notes: "Reliable partner with excellent turnaround times",
      createdAt: new Date("2023-12-01"),
      updatedAt: new Date("2024-01-20"),
    },
    {
      id: "LV-002",
      name: "Advanced Diagnostics",
      code: "ADG",
      type: "pathology_lab",
      status: "active",
      contactPerson: "Dr. Sarah Wilson",
      email: "info@advanceddiagnostics.com",
      phone: "+1-555-234-5678",
      address: "456 Research Boulevard",
      city: "Springfield",
      state: "IL",
      zipCode: "62702",
      website: "www.advanceddiagnostics.com",
      license: "LAB-IL-2024-002",
      accreditation: ["CLIA", "CAP", "NABL"],
      specialties: ["Histopathology", "Cytology", "Immunohistochemistry"],
      rating: 4.6,
      totalTests: 850,
      averageTurnaround: "24-48 hours",
      pricing: "premium",
      contractStart: new Date("2024-01-15"),
      contractEnd: new Date("2025-01-14"),
      lastTestDate: new Date("2024-01-19"),
      notes: "Specialized in complex pathology cases",
      createdAt: new Date("2023-11-15"),
      updatedAt: new Date("2024-01-19"),
    },
    {
      id: "LV-003",
      name: "Metro Lab Center",
      code: "MLC",
      type: "reference_lab",
      status: "active",
      contactPerson: "Dr. Robert Chen",
      email: "admin@metrolabcenter.com",
      phone: "+1-555-345-6789",
      address: "789 Technology Park",
      city: "Springfield",
      state: "IL",
      zipCode: "62703",
      website: "www.metrolabcenter.com",
      license: "LAB-IL-2024-003",
      accreditation: ["CLIA", "CAP", "ISO 15189"],
      specialties: ["Molecular Diagnostics", "Genetics", "Endocrinology"],
      rating: 4.9,
      totalTests: 2100,
      averageTurnaround: "6-12 hours",
      pricing: "moderate",
      contractStart: new Date("2023-06-01"),
      contractEnd: new Date("2024-05-31"),
      lastTestDate: new Date("2024-01-18"),
      notes: "Excellent for specialized molecular testing",
      createdAt: new Date("2023-05-01"),
      updatedAt: new Date("2024-01-18"),
    },
    {
      id: "LV-004",
      name: "Specialist Lab Solutions",
      code: "SLS",
      type: "specialty_lab",
      status: "pending",
      contactPerson: "Dr. Emily Davis",
      email: "contact@specialistlab.com",
      phone: "+1-555-456-7890",
      address: "321 Innovation Drive",
      city: "Springfield",
      state: "IL",
      zipCode: "62704",
      license: "LAB-IL-2024-004",
      accreditation: ["CLIA", "CAP"],
      specialties: ["Toxicology", "Pharmacogenomics", "Allergy Testing"],
      rating: 4.3,
      totalTests: 0,
      averageTurnaround: "12-24 hours",
      pricing: "premium",
      contractStart: new Date("2024-02-01"),
      contractEnd: new Date("2025-01-31"),
      notes: "New partnership under evaluation",
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-15"),
    },
    {
      id: "LV-005",
      name: "Quick Test Center",
      code: "QTC",
      type: "diagnostic_lab",
      status: "suspended",
      contactPerson: "Dr. James Martinez",
      email: "support@quicktestcenter.com",
      phone: "+1-555-567-8901",
      address: "654 Healthcare Plaza",
      city: "Springfield",
      state: "IL",
      zipCode: "62705",
      license: "LAB-IL-2024-005",
      accreditation: ["CLIA"],
      specialties: ["Rapid Tests", "Point of Care", "Urgent Care"],
      rating: 3.8,
      totalTests: 450,
      averageTurnaround: "1-2 hours",
      pricing: "budget",
      contractStart: new Date("2023-03-01"),
      contractEnd: new Date("2024-02-29"),
      lastTestDate: new Date("2024-01-10"),
      notes: "Contract suspended due to quality issues",
      createdAt: new Date("2023-02-01"),
      updatedAt: new Date("2024-01-10"),
    },
  ];

  // Load lab vendors from API
  const fetchLabVendors = async () => {
    if (!currentClinic) {
      console.warn("No clinic selected, skipping lab vendors fetch");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const filters = {
        search: searchTerm || undefined,
        type: selectedType !== "all" ? selectedType : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        specialty: selectedSpecialty !== "all" ? selectedSpecialty : undefined,
        page: pagination.page,
        limit: pagination.limit,
        tenantScoped: true, // Force tenant-scoped filtering to show only tenant-related vendors
      };

      const response = await labVendorApi.getLabVendors(filters);
      setLabVendors(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error fetching lab vendors:", error);
      const errorMessage = error instanceof Error && error.message.includes('401') 
        ? t("Access denied. Please check your clinic permissions.") 
        : error instanceof Error && error.message.includes('403')
        ? t("Insufficient permissions to view lab vendors for this clinic.")
        : t("Failed to load lab vendors. Please try again.");
      
      toast({
        title: t("Error"),
        description: errorMessage,
        variant: "destructive",
      });
      setLabVendors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!currentClinic) {
      return;
    }

    try {
      // Force tenant-scoped filtering to show only tenant-related stats
      const labVendorStats = await labVendorApi.getLabVendorStats({ tenantScoped: true });
      setStats(labVendorStats);
    } catch (error) {
      console.error("Error fetching lab vendor stats:", error);
      // Calculate stats from current data as fallback
      const totalVendors = labVendors.length;
      const activeVendors = labVendors.filter((v) => v.status === "active").length;
      const pendingVendors = labVendors.filter((v) => v.status === "pending").length;
      const suspendedVendors = labVendors.filter((v) => v.status === "suspended").length;
      const totalTests = labVendors.reduce((sum, v) => sum + v.totalTests, 0);
      
      setStats({
        totalVendors,
        activeVendors,
        pendingVendors,
        suspendedVendors,
        totalTests,
        averageRating: 4.5,
        expiringContracts: 0,
        typeStats: [],
        pricingStats: [],
        specialtyStats: []
      });
    }
  };

  // Initial load when clinic is available
  useEffect(() => {
    if (currentClinic) {
      fetchLabVendors();
      fetchStats();
    }
  }, [currentClinic]);

  // Refresh when filters change
  useEffect(() => {
    if (!isLoading && currentClinic) {
      fetchLabVendors();
    }
  }, [searchTerm, selectedType, selectedStatus, selectedSpecialty, pagination.page, currentClinic]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchLabVendors(), fetchStats()]);
    setIsRefreshing(false);
  };

  const types = [
    "all",
    ...Array.from(new Set(labVendors.map((vendor) => vendor.type))),
  ];

  const specialties = [
    "all",
    ...Array.from(new Set(labVendors.flatMap((vendor) => vendor.specialties))),
  ];

  const filteredVendors = labVendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.specialties.some((specialty) =>
        specialty.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesType = selectedType === "all" || vendor.type === selectedType;

    const matchesStatus =
      selectedStatus === "all" || vendor.status === selectedStatus;

    const matchesSpecialty =
      selectedSpecialty === "all" ||
      vendor.specialties.includes(selectedSpecialty);

    return matchesSearch && matchesType && matchesStatus && matchesSpecialty;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "inactive":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "suspended":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-muted text-muted-foreground";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case "budget":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
      case "premium":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "diagnostic_lab":
        return t("Diagnostic Lab");
      case "pathology_lab":
        return t("Pathology Lab");
      case "imaging_center":
        return t("Imaging Center");
      case "reference_lab":
        return t("Reference Lab");
      case "specialty_lab":
        return t("Specialty Lab");
      default:
        return type;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-muted-foreground"
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleViewVendor = (vendor: LabVendor) => {
    setSelectedVendorId(vendor.id);
    setSelectedVendorName(vendor.name);
    setViewDetailsModalOpen(true);
  };

  const handleEditVendor = (vendor: LabVendor) => {
    setSelectedVendorId(vendor.id);
    setSelectedVendorName(vendor.name);
    setEditModalOpen(true);
  };

  const handleViewTestHistory = (vendor: LabVendor) => {
    setSelectedVendorId(vendor.id);
    setSelectedVendorName(vendor.name);
    setTestHistoryModalOpen(true);
  };

  const handleViewContractDetails = (vendor: LabVendor) => {
    setSelectedVendorId(vendor.id);
    setSelectedVendorName(vendor.name);
    setContractModalOpen(true);
  };

  const handleViewBillingPayments = (vendor: LabVendor) => {
    setSelectedVendorId(vendor.id);
    setSelectedVendorName(vendor.name);
    setBillingModalOpen(true);
  };

  const closeAllModals = () => {
    setSelectedVendorId(null);
    setSelectedVendorName("");
    setViewDetailsModalOpen(false);
    setEditModalOpen(false);
    setTestHistoryModalOpen(false);
    setContractModalOpen(false);
    setBillingModalOpen(false);
  };

  const handleDeleteVendor = async (vendorId: string) => {
    try {
      await labVendorApi.deleteLabVendor(vendorId);
      toast({
        title: t("Vendor Deleted"),
        description: t("Vendor has been deleted successfully"),
      });
      fetchLabVendors(); // Refresh the list
      fetchStats(); // Refresh stats
    } catch (error) {
      toast({
        title: t("Error"),
        description: t("Failed to delete vendor. Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleActivateVendor = async (vendor: LabVendor) => {
    try {
      await labVendorApi.updateLabVendorStatus(vendor.id, "active");
      toast({
        title: t("Vendor Activated"),
        description: `${vendor.name} ${t("has been activated.")}`,
      });
      fetchLabVendors(); // Refresh the list
      fetchStats(); // Refresh stats
    } catch (error) {
      toast({
        title: t("Error"),
        description: t("Failed to activate vendor. Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleDeactivateVendor = async (vendor: LabVendor) => {
    try {
      await labVendorApi.updateLabVendorStatus(vendor.id, "inactive");
      toast({
        title: t("Vendor Deactivated"),
        description: `${vendor.name} ${t("has been deactivated.")}`,
      });
      fetchLabVendors(); // Refresh the list
      fetchStats(); // Refresh stats
    } catch (error) {
      toast({
        title: t("Error"),
        description: t("Failed to deactivate vendor. Please try again."),
        variant: "destructive",
      });
    }
  };

  // Calculate stats (use API stats if available, otherwise calculate from current data)
  const totalVendors = stats?.totalVendors || labVendors.length;
  const activeVendors = stats?.activeVendors || labVendors.filter((v) => v.status === "active").length;
  const pendingVendors = stats?.pendingVendors || labVendors.filter((v) => v.status === "pending").length;
  const totalTests = stats?.totalTests || labVendors.reduce((sum, v) => sum + v.totalTests, 0);

  // Handle clinic loading state
  if (clinicLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-muted-foreground">{t('Loading clinic context...')}</span>
      </div>
    );
  }

  // Handle no clinic selected state
  if (!currentClinic && !clinicLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">{t('No Clinic Selected')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('Please select a clinic to view and manage lab vendors.')}
          </p>
          {clinicError && (
            <p className="text-red-600 text-sm">
              {t('Error:')} {clinicError}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between sm:flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t('Lab Vendors')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentClinic ? (
              <>{t('Manage external laboratory partners and vendors for')} <span className="font-semibold text-primary">{currentClinic.name}</span></>
            ) : (
              t('Manage external laboratory partners and vendors')
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-shrink-0">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <FileText className="h-4 w-4 mr-2" />
            {isRefreshing ? t("Refreshing...") : t("Refresh")}
          </Button>
          <AddLabVendorModal onVendorAdded={handleRefresh} />
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
                    {t('Total Vendors')}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {totalVendors}
                  </p>
                </div>
                <Building className="h-8 w-8 text-primary" />
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
                    {t('Active Vendors')}
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {activeVendors}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
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
                  <p className="text-sm font-medium text-muted-foreground">{t('Pending')}</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {pendingVendors}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
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
                    {t('Total Tests')}
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {totalTests.toLocaleString()}
                  </p>
                </div>
                <TestTube2 className="h-8 w-8 text-purple-600" />
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
                placeholder={t('Search by vendor name, code, contact person, or specialty...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t('Vendor Type')} />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "all" ? t("All Types") : getTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder={t('Status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Status')}</SelectItem>
                  <SelectItem value="active">{t('Active')}</SelectItem>
                  <SelectItem value="inactive">{t('Inactive')}</SelectItem>
                  <SelectItem value="pending">{t('Pending')}</SelectItem>
                  <SelectItem value="suspended">{t('Suspended')}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedSpecialty}
                onValueChange={setSelectedSpecialty}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t('Specialty')} />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty === "all" ? t("All Specialties") : specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lab Vendors Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('Laboratory Vendors & Partners')}</CardTitle>
            <CardDescription>
              {t('Manage relationships with external laboratory service providers')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">{t('Loading lab vendors...')}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">
                      {t('Vendor Details')}
                    </TableHead>
                    <TableHead className="min-w-[180px]">
                      {t('Contact Info')}
                    </TableHead>
                    <TableHead className="min-w-[160px]">{t('Specialties')}</TableHead>
                    <TableHead className="min-w-[140px]">{t('Performance')}</TableHead>
                    <TableHead className="min-w-[140px]">{t('Contract')}</TableHead>
                    <TableHead className="min-w-[100px]">{t('Status')}</TableHead>
                    <TableHead className="text-right min-w-[120px]">
                      {t('Actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {t('Code:')} {vendor.code} • {getTypeLabel(vendor.type)}
                          </div>
                          <div className="flex items-center space-x-2">
                            {renderStars(vendor.rating)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-sm">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span>{vendor.contactPerson}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{vendor.email}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{vendor.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {vendor.specialties.slice(0, 2).map((specialty) => (
                            <Badge
                              key={specialty}
                              variant="outline"
                              className="text-xs mr-1"
                            >
                              {specialty}
                            </Badge>
                          ))}
                          {vendor.specialties.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{vendor.specialties.length - 2} {t('more')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium">
                              {vendor.totalTests}
                            </span>{" "}
                            {t('tests')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {vendor.averageTurnaround}
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getPricingColor(vendor.pricing)}`}
                          >
                            {vendor.pricing}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(vendor.contractStart)}</div>
                          <div className="text-muted-foreground">
                            {t('to')} {formatDate(vendor.contractEnd)}
                          </div>
                          {vendor.lastTestDate && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {t('Last test:')} {formatDate(vendor.lastTestDate)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(vendor.status)}
                          <Badge
                            className={`text-xs ${getStatusColor(vendor.status)}`}
                          >
                            {vendor.status.charAt(0).toUpperCase() +
                              vendor.status.slice(1)}
                          </Badge>
                        </div>
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
                              onClick={() => handleViewVendor(vendor)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              {t('View Details')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditVendor(vendor)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {t('Edit Vendor')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleViewTestHistory(vendor)}
                            >
                              <TestTube2 className="mr-2 h-4 w-4" />
                              {t('View Test History')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleViewContractDetails(vendor)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              {t('Contract Details')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleViewBillingPayments(vendor)}
                            >
                              <DollarSign className="mr-2 h-4 w-4" />
                              {t('Billing & Payments')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteVendor(vendor.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('Remove Vendor')}
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
              {filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="border rounded-lg p-4 space-y-3 bg-card shadow-sm"
                >
                  {/* Header with Vendor and Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{vendor.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {getTypeLabel(vendor.type)}
                      </div>
                    </div>
                    <Badge
                      variant={
                        vendor.status === "active" ? "default" : "secondary"
                      }
                      className="text-xs ml-3"
                    >
                      {vendor.status}
                    </Badge>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-foreground">{vendor.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-foreground">{vendor.phone}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-foreground">{vendor.address}</span>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">
                      {t('Specialties')} ({vendor.specialties.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {vendor.specialties
                        .slice(0, 3)
                        .map((specialty, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      {vendor.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{vendor.specialties.length - 3} {t('more')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">
                        {t('Rating')}
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium">
                          {vendor.rating}
                        </span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">
                        {t('Tests Processed')}
                      </div>
                      <div className="text-sm font-medium">
                        {vendor.totalTests}
                      </div>
                    </div>
                  </div>

                  {/* Contract Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">
                        {t('Contract Start')}
                      </div>
                      <div className="text-sm">
                        {vendor.contractStart.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">
                        {t('Contract End')}
                      </div>
                      <div className="text-sm">
                        {vendor.contractEnd.toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      {t('Vendor ID:')} #{vendor.id}
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
                          onClick={() => handleViewVendor(vendor)}
                        >
                          {t('View Details')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditVendor(vendor)}
                        >
                          {t('Edit Vendor')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleViewTestHistory(vendor)}
                        >
                          {t('View Test History')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleViewContractDetails(vendor)}
                        >
                          {t('Contract Details')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleViewBillingPayments(vendor)}
                        >
                          {t('Billing & Payments')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteVendor(vendor.id)}
                          className="text-red-600"
                        >
                          {t('Remove Vendor')}
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

      {/* Modal Components */}
      <ViewVendorDetailsModal
        vendorId={selectedVendorId}
        isOpen={viewDetailsModalOpen}
        onClose={() => setViewDetailsModalOpen(false)}
      />
      
      <EditVendorModal
        vendorId={selectedVendorId}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onVendorUpdated={() => {
          setEditModalOpen(false);
          handleRefresh();
        }}
      />
      
      <TestHistoryModal
        vendorId={selectedVendorId}
        vendorName={selectedVendorName}
        isOpen={testHistoryModalOpen}
        onClose={() => setTestHistoryModalOpen(false)}
      />
      
      <ContractDetailsModal
        vendorId={selectedVendorId}
        vendorName={selectedVendorName}
        isOpen={contractModalOpen}
        onClose={() => setContractModalOpen(false)}
      />
      
      <BillingPaymentsModal
        vendorId={selectedVendorId}
        vendorName={selectedVendorName}
        isOpen={billingModalOpen}
        onClose={() => setBillingModalOpen(false)}
      />
    </div>
  );
};

export default LabVendors;
