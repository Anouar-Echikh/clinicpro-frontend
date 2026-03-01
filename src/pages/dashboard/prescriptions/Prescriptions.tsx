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
  Download,
  MoreVertical,
  Stethoscope,
  Pill,
  Calendar,
  User,
  Eye,
  Edit,
  Send,
  Printer,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import NewPrescriptionModal from "@/components/modals/NewPrescriptionModal";
import PrescriptionDetailModal from "@/components/modals/PrescriptionDetailModal";
import EditPrescriptionModal from "@/components/modals/EditPrescriptionModal";
import { apiService } from "@/services/api";
import { Prescription, PrescriptionStats } from "@/types";
import { 
  usePrescriptions, 
  usePrescriptionStats, 
  useUpdatePrescriptionStatus, 
  useSendToPharmacy 
} from "@/hooks/useApi";
import { printPrescription } from "@/utils/prescriptionPrint";
import { 
  generatePrescriptionSlipPDF, 
  convertToPrescriptionSlipData,
  ClinicInfo 
} from "@/utils/prescriptionSlipPdf";
import { useClinic } from "@/contexts/ClinicContext";

const Prescriptions = () => {
  const { t } = useTranslation();
  const { currentClinic } = useClinic();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [doctors, setDoctors] = useState<string[]>([]);

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);

  // Build API parameters for date filtering
  const getApiParams = () => {
    const params: any = {
      page: currentPage,
      limit: 10,
    };

    if (searchTerm) params.search = searchTerm;
    if (selectedStatus !== "all") params.status = selectedStatus;
    if (selectedDoctor !== "all") {
      // Find the doctor ID from the doctor name
      const selectedPrescription = prescriptions?.find(
        p => p.doctor_id && `${p.doctor_id.first_name} ${p.doctor_id.last_name}` === selectedDoctor
      );
      if (selectedPrescription && selectedPrescription.doctor_id) {
        params.doctor_id = selectedPrescription.doctor_id._id;
      }
    }

    // Add date filtering
    if (selectedDateRange !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (selectedDateRange) {
        case "today":
          const endOfToday = new Date(today);
          endOfToday.setHours(23, 59, 59, 999);
          params.date_from = today.toISOString();
          params.date_to = endOfToday.toISOString();
          break;
        case "week":
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);
          params.date_from = startOfWeek.toISOString();
          params.date_to = endOfWeek.toISOString();
          break;
        case "month":
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          startOfMonth.setHours(0, 0, 0, 0);
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          endOfMonth.setHours(23, 59, 59, 999);
          params.date_from = startOfMonth.toISOString();
          params.date_to = endOfMonth.toISOString();
          break;
      }
    }

    return params;
  };

  // Use hooks for data fetching
  const { 
    data: prescriptionsResponse, 
    isLoading, 
    error,
    refetch
  } = usePrescriptions(getApiParams());

  const { 
    data: stats,
    isLoading: statsLoading
  } = usePrescriptionStats();

  const updateStatusMutation = useUpdatePrescriptionStatus();
  const sendToPharmacyMutation = useSendToPharmacy();

  const prescriptions = prescriptionsResponse?.data?.prescriptions || [];
  const totalPages = prescriptionsResponse?.data?.pagination?.pages || 1;

  // Extract unique doctors for filter
  React.useEffect(() => {
    if (prescriptions?.length > 0) {
      const uniqueDoctors = Array.from(
        new Set(
          prescriptions
            .filter((p) => p.doctor_id && p.doctor_id.first_name && p.doctor_id.last_name)
            .map((p) => `${p.doctor_id.first_name} ${p.doctor_id.last_name}`)
        )
      );
      setDoctors(["all", ...uniqueDoctors]);
    }
  }, [prescriptions]);

  const handleViewPrescription = (prescriptionId: string) => {
    setSelectedPrescriptionId(prescriptionId);
    setDetailModalOpen(true);
  };

  const handleEditPrescription = (prescriptionId: string) => {
    setSelectedPrescriptionId(prescriptionId);
    setEditModalOpen(true);
  };

  const handlePrintPrescription = async (prescriptionId: string) => {
    try {
      // First get the prescription details
      const prescription = await apiService.getPrescription(prescriptionId);
      
      // Use the print utility to generate and print the prescription
      printPrescription(prescription);
      
      toast({
        title: t("Prescription Printed"),
        description: `${t("Prescription")} ${prescription.prescription_id} ${t("has been sent to printer.")}`,
      });
    } catch (err: any) {
      console.error("Error printing prescription:", err);
      toast({
        title: t("Error"),
        description: err.message || t("Failed to print prescription."),
        variant: "destructive",
      });
    }
  };

  const handleSendToPharmacy = async (prescriptionId: string) => {
    try {
      await sendToPharmacyMutation.mutateAsync(prescriptionId);
      toast({
        title: t("Sent to Pharmacy"),
        description: `${t("Prescription")} ${prescriptionId} ${t("has been sent to pharmacy.")}`,
      });
    } catch (err: any) {
      toast({
        title: t("Error"),
        description: t("Failed to send prescription to pharmacy."),
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (prescriptionId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: prescriptionId, status: newStatus });
      toast({
        title: t("Status Updated"),
        description: `${t("Prescription status updated to")} ${newStatus}.`,
      });
    } catch (err: any) {
      toast({
        title: t("Error"),
        description: t("Failed to update prescription status."),
        variant: "destructive",
      });
    }
  };

  const handleDownloadSlip = async (prescriptionId: string) => {
    try {
      // Get the prescription details
      const prescription = await apiService.getPrescription(prescriptionId);
      
      // Prepare clinic info from current clinic context
      const clinicInfo: ClinicInfo = {
        name: currentClinic?.name || 'Medical Clinic',
        address: currentClinic?.address 
          ? `${currentClinic.address.street}, ${currentClinic.address.city}, ${currentClinic.address.state} ${currentClinic.address.zipCode}`
          : 'Clinic Address',
        phone: currentClinic?.contact?.phone || 'Phone Number',
        email: currentClinic?.contact?.email || 'clinic@email.com',
        website: currentClinic?.contact?.website,
      };

      // Generate and download the PDF
      generatePrescriptionSlipPDF(prescription, clinicInfo, true);

      toast({
        title: t("Prescription Slip Downloaded"),
        description: `${t("Prescription")} ${prescription.prescription_id} ${t("slip has been downloaded.")}`,
      });
    } catch (err: any) {
      console.error("Error downloading prescription slip:", err);
      toast({
        title: t("Error"),
        description: err.message || t("Failed to download prescription slip."),
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case "pending":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "cancelled":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateAge = (dateOfBirth: string | Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (isLoading && prescriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t("Loading prescriptions...")}</span>
      </div>
    );
  }

  if (error && prescriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error.message || t('An error occurred')}</p>
          <Button onClick={() => refetch()} className="mt-2">
            {t("Try Again")}
          </Button>
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
            {t("Prescriptions")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("Manage patient prescriptions and medications")}
          </p>
        </div>
        <div className="flex-shrink-0">
                        <NewPrescriptionModal onSuccess={() => refetch()} />
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
                    {t("Total Prescriptions")}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats?.totalPrescriptions || 0}
                  </p>
                </div>
                <Stethoscope className="h-8 w-8 text-primary" />
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
                  <p className="text-sm font-medium text-muted-foreground">{t("Active")}</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {stats?.activePrescriptions || 0}
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
                  <p className="text-sm font-medium text-muted-foreground">{t("Pending")}</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {stats?.pendingPrescriptions || 0}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
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
                  <p className="text-sm font-medium text-muted-foreground">{t("Dispensed")}</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {stats?.dispensedPrescriptions || 0}
                  </p>
                </div>
                <Pill className="h-8 w-8 text-purple-600" />
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
                placeholder={t("Search by prescription ID, patient name, doctor, or diagnosis...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder={t("Status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("All Status")}</SelectItem>
                  <SelectItem value="active">{t("Active")}</SelectItem>
                  <SelectItem value="completed">{t("Completed")}</SelectItem>
                  <SelectItem value="pending">{t("Pending")}</SelectItem>
                  <SelectItem value="cancelled">{t("Cancelled")}</SelectItem>
                  <SelectItem value="expired">{t("Expired")}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t("Doctor")} />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor} value={doctor}>
                      {doctor === "all" ? t("All Doctors") : doctor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedDateRange}
                onValueChange={setSelectedDateRange}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder={t("Date Range")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("All Time")}</SelectItem>
                  <SelectItem value="today">{t("Today")}</SelectItem>
                  <SelectItem value="week">{t("This Week")}</SelectItem>
                  <SelectItem value="month">{t("This Month")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t("Prescription Records")}</CardTitle>
            <CardDescription>
              {t("Complete list of all patient prescriptions and medication orders")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">{t("Loading...")}</span>
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-8">
                <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t("No prescriptions found")}</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("Prescription")}</TableHead>
                        <TableHead>{t("Patient")}</TableHead>
                        <TableHead>{t("Doctor")}</TableHead>
                        <TableHead>{t("Diagnosis")}</TableHead>
                        <TableHead>{t("Medications")}</TableHead>
                        <TableHead>{t("Status")}</TableHead>
                        <TableHead>{t("Date")}</TableHead>
                        <TableHead className="text-right">{t("Actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prescriptions.map((prescription) => (
                        <TableRow key={prescription._id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Stethoscope className="h-4 w-4 text-primary" />
                              <div>
                                <div className="font-medium">{prescription.prescription_id}</div>
                                {prescription.appointment_id && (
                                  <div className="text-sm text-muted-foreground">
                                    {t("Apt:")}: {prescription.appointment_id._id}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {prescription.patient_id ? 
                                  `${prescription.patient_id.first_name} ${prescription.patient_id.last_name}` : 
                                  t('Unknown Patient')
                                }
                              </div>
                              <div className="text-sm text-gray-500">
                                {prescription.patient_id?.date_of_birth ? 
                                  `${t("Age:")}: ${calculateAge(prescription.patient_id.date_of_birth)}` : 
                                  t('Age: N/A')
                                }
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {prescription.doctor_id ? 
                              `${prescription.doctor_id.first_name} ${prescription.doctor_id.last_name}` : 
                              t('Unknown Doctor')
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {prescription.diagnosis}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {prescription.medications
                                .slice(0, 2)
                                .map((med, index) => (
                                  <div key={index} className="text-sm">
                                    <span className="font-medium">{med.name}</span>
                                    <span className="text-gray-500 ml-2">
                                      {med.dosage}
                                    </span>
                                  </div>
                                ))}
                              {prescription.medications.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{prescription.medications.length - 2} {t("more")}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(prescription.status)}
                              <Badge
                                className={`text-xs ${getStatusColor(prescription.status)}`}
                              >
                                {prescription.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(prescription.created_at)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                  <MoreVertical className="h-4 w-4 mr-1" />
                                  {t("Actions")}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewPrescription(prescription._id)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  {t("View Details")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditPrescription(prescription._id)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  {t("Edit Prescription")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDownloadSlip(prescription._id)}
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  {t("Download Slip")}
                                </DropdownMenuItem>
                                {prescription.status === "active" && (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusUpdate(prescription._id, "completed")}
                                  >
                                    {t("Mark as Completed")}
                                  </DropdownMenuItem>
                                )}
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
                  {prescriptions.map((prescription) => (
                    <Card
                      key={prescription._id}
                      className="p-4 space-y-3 bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      {/* Header with Prescription and Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-semibold text-base">
                              #{prescription.prescription_id}
                            </div>
                            {prescription.appointment_id && (
                              <div className="text-xs text-gray-500">
                                Apt: {prescription.appointment_id._id}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(prescription.status)}
                          <Badge
                            className={`text-xs flex items-center space-x-1 ${getStatusColor(prescription.status)}`}
                          >
                            <span className="capitalize">{prescription.status}</span>
                          </Badge>
                        </div>
                      </div>

                      {/* Patient Information */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <User className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {prescription.patient_id ? 
                                `${prescription.patient_id.first_name} ${prescription.patient_id.last_name}` : 
                                t('Unknown Patient')
                              }
                            </div>
                            <div className="text-xs text-gray-500">
                              {prescription.patient_id?.date_of_birth ? 
                                `Age: ${calculateAge(prescription.patient_id.date_of_birth)}` : 
                                t('Age: N/A')
                              }
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Doctor and Diagnosis */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Stethoscope className="h-4 w-4 text-purple-600" />
                            <span className="font-medium text-gray-500">{t("Doctor")}</span>
                          </div>
                          <span className="text-gray-900 font-medium">
                            {prescription.doctor_id ? 
                              `${prescription.doctor_id.first_name} ${prescription.doctor_id.last_name}` : 
                              t('Unknown Doctor')
                            }
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-gray-500">{t("Diagnosis")}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {prescription.diagnosis}
                          </Badge>
                        </div>
                      </div>

                      {/* Medications */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-700">
                            {t("Medications")} ({prescription.medications.length})
                          </div>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {prescription.medications.slice(0, 3).map((med, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm"
                            >
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <Pill className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-sm truncate">
                                    {med.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {med.dosage}
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-600 flex-shrink-0 ml-2">
                                {med.frequency}
                              </div>
                            </div>
                          ))}
                          {prescription.medications.length > 3 && (
                            <div className="text-xs text-gray-500 text-center py-1">
                              +{prescription.medications.length - 3} {t("more medications")}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Date and Actions */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-xs text-gray-500">
                          {formatDate(prescription.created_at)}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              <MoreVertical className="h-4 w-4 mr-1" />
                              {t("Actions")}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewPrescription(prescription._id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              {t("View Details")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditPrescription(prescription._id)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {t("Edit Prescription")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadSlip(prescription._id)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {t("Download Slip")}
                            </DropdownMenuItem>
                            {prescription.status === "active" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(prescription._id, "completed")}
                              >
                                {t("Mark as Completed")}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      {t("Previous")}
                    </Button>
                    <span className="text-sm text-gray-600">
                      {t("Page")} {currentPage} {t("of")} {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      {t("Next")}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modals */}
      <PrescriptionDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        prescriptionId={selectedPrescriptionId}
        onPrint={handlePrintPrescription}
        onSendToPharmacy={handleSendToPharmacy}
      />

      <EditPrescriptionModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        prescriptionId={selectedPrescriptionId}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default Prescriptions;
