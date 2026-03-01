import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppointments, useUpdateAppointment, useDeleteAppointment } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { useClinic } from "@/contexts/ClinicContext";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Plus,
  Filter,
  Calendar,
  Clock,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Stethoscope,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Table as TableIcon,
  Download,
} from "lucide-react";
import { Appointment as ApiAppointment, Patient as ApiPatient, User as ApiUser } from "@/services/api";
import { apiService } from "@/services/api";
import { serviceApi } from "@/services/api/serviceApi";
import type { Service } from "@/types";
import NewAppointmentModal from "@/components/modals/NewAppointmentModal";
import { AppointmentSlipPDFGenerator, convertToAppointmentSlipData, type ClinicInfo } from "@/utils/appointmentSlipPdf";

const Appointments = () => {
  const { t } = useTranslation();
  const { currentClinic } = useClinic();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  
  // View state
  const [currentView, setCurrentView] = useState<"table" | "calendar">("calendar");
  
  // Calendar state
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Modal states
  const [viewDetailsModal, setViewDetailsModal] = useState<{
    open: boolean;
    appointment: any | null;
  }>({ open: false, appointment: null });

  const [editModal, setEditModal] = useState<{
    open: boolean;
    appointment: any | null;
  }>({ open: false, appointment: null });

  const [cancelModal, setCancelModal] = useState<{
    open: boolean;
    appointment: any | null;
  }>({ open: false, appointment: null });

  const [dayAppointmentsModal, setDayAppointmentsModal] = useState<{
    open: boolean;
    date: Date | null;
    appointments: any[];
  }>({ open: false, date: null, appointments: [] });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    patientId: "",
    doctorId: "",
    nurseId: "",
    serviceId: "",
    date: "",
    time: "",
    duration: "",
    type: "",
    notes: "",
  });

  // State for API data in edit modal
  const [editModalData, setEditModalData] = useState({
    patients: [] as ApiPatient[],
    doctors: [] as ApiUser[],
    nurses: [] as ApiUser[],
    services: [] as Service[],
    loading: false,
  });

  // Build API parameters with date filtering
  const getDateRangeParams = () => {
    if (selectedDate === "all") return {};
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    switch (selectedDate) {
      case "today":
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999); // End of today
        return {
          start_date: today.toISOString(),
          end_date: endOfToday.toISOString(),
        };
      case "tomorrow":
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const endOfTomorrow = new Date(tomorrow);
        endOfTomorrow.setHours(23, 59, 59, 999);
        return {
          start_date: tomorrow.toISOString(),
          end_date: endOfTomorrow.toISOString(),
        };
      case "this-week":
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
        endOfWeek.setHours(23, 59, 59, 999);
        return {
          start_date: startOfWeek.toISOString(),
          end_date: endOfWeek.toISOString(),
        };
      case "next-week":
        const nextWeekStart = new Date(today);
        nextWeekStart.setDate(today.getDate() + (7 - today.getDay())); // Next Sunday
        nextWeekStart.setHours(0, 0, 0, 0);
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6); // Next Saturday
        nextWeekEnd.setHours(23, 59, 59, 999);
        return {
          start_date: nextWeekStart.toISOString(),
          end_date: nextWeekEnd.toISOString(),
        };
      default:
        return {};
    }
  };

  const apiParams = {
    page: currentPage,
    limit: pageSize,
    ...(selectedStatus !== "all" && { status: selectedStatus }),
    ...getDateRangeParams(),
  };

  // Fetch data from APIs
  const { 
    data: appointmentsData, 
    isLoading: appointmentsLoading, 
    error: appointmentsError 
  } = useAppointments(apiParams);

  // Mutations
  const updateAppointmentMutation = useUpdateAppointment();
  const deleteAppointmentMutation = useDeleteAppointment();

  // Process API data - appointments come from data.appointments and have populated patient_id/doctor_id
  const appointments = (appointmentsData as any)?.data?.appointments || [];
  const pagination = (appointmentsData as any)?.data?.pagination || { 
    page: 1, 
    limit: pageSize, 
    total: 0, 
    pages: 0 
  };

  // Convert API appointment with populated patient/doctor data
  const convertAppointment = (apiAppointment: any) => {
    const patient = apiAppointment.patient_id;
    const doctor = apiAppointment.doctor_id;
    const nurse = apiAppointment.nurse_id;
    
    return {
      id: apiAppointment._id,
      // Store both the ID and the original references for flexibility
      patientId: typeof patient === 'string' ? patient : patient?._id,
      doctorId: typeof doctor === 'string' ? doctor : doctor?._id,
      nurseId: typeof nurse === 'string' ? nurse : nurse?._id,
      // Keep original field names for backup access
      patient_id: patient,
      doctor_id: doctor,
      nurse_id: nurse,
      date: new Date(apiAppointment.appointment_date),
      duration: apiAppointment.duration,
      status: apiAppointment.status,
      notes: apiAppointment.notes || "",
      type: apiAppointment.type,
      createdAt: new Date(apiAppointment.created_at),
      updatedAt: new Date(apiAppointment.updated_at),
      // Include populated patient and doctor data
      patient: patient ? {
        id: patient._id,
        name: `${patient.first_name} ${patient.last_name}`,
        phone: patient.phone,
        email: patient.email,
        avatar: ""
      } : null,
      doctor: doctor ? {
        id: doctor._id,
        name: `${doctor.first_name} ${doctor.last_name}`,
        specialty: doctor.role === 'doctor' ? 'General Medicine' : doctor.role
      } : null,
      nurse: nurse ? {
        id: nurse._id,
        name: `${nurse.first_name} ${nurse.last_name}`,
        specialty: nurse.role
      } : null
    };
  };

  const processedAppointments = appointments.map(convertAppointment);

  // For the main table, use the paginated results from API
  // Sort appointments in descending order by date (newest first) - API should handle this but we ensure it
  const sortedAppointments = [...processedAppointments].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Apply search filter only (status and date filters are handled by API params)
  const filteredAppointments = sortedAppointments.filter((appointment) => {
    if (!searchTerm) return true;
    
    const matchesSearch =
      appointment.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.notes.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedDate, searchTerm]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "scheduled":
      case "confirmed":
        return <Clock className="h-4 w-4 text-primary" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "no-show":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
      case "confirmed":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-orange-100 text-orange-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Calendar helper functions
  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from Sunday of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    // End on Saturday of the week containing the last day
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    return allFilteredAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentCalendarDate.getMonth() && 
           date.getFullYear() === currentCalendarDate.getFullYear();
  };

  const navigateCalendar = (direction: 'prev' | 'next') => {
    setCurrentCalendarDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Fetch all appointments for stats (without pagination)
  const { data: allAppointmentsData } = useAppointments({ 
    limit: 1000, // Large limit to get all appointments for stats
    ...(selectedStatus !== "all" && { status: selectedStatus })
  });
  
  const allAppointments = (allAppointmentsData as any)?.data?.appointments || [];
  const allProcessedAppointments = allAppointments.map(convertAppointment);
  
  // Sort all appointments in descending order by date (newest first)
  const allSortedAppointments = [...allProcessedAppointments].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Apply the same filters to all appointments for stats
  const allFilteredAppointments = allSortedAppointments.filter((appointment) => {
    const matchesSearch =
      appointment.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.notes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || appointment.status === selectedStatus;

    // Date filtering - use the same logic as API params
    let matchesDate = true;
    if (selectedDate !== "all") {
      const appointmentDate = new Date(appointment.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (selectedDate) {
        case "today":
          const endOfToday = new Date(today);
          endOfToday.setHours(23, 59, 59, 999);
          matchesDate = appointmentDate >= today && appointmentDate <= endOfToday;
          break;
        case "tomorrow":
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          const endOfTomorrow = new Date(tomorrow);
          endOfTomorrow.setHours(23, 59, 59, 999);
          matchesDate = appointmentDate >= tomorrow && appointmentDate <= endOfTomorrow;
          break;
        case "this-week":
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);
          matchesDate = appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
          break;
        case "next-week":
          const nextWeekStart = new Date(today);
          nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
          nextWeekStart.setHours(0, 0, 0, 0);
          const nextWeekEnd = new Date(nextWeekStart);
          nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
          nextWeekEnd.setHours(23, 59, 59, 999);
          matchesDate = appointmentDate >= nextWeekStart && appointmentDate <= nextWeekEnd;
          break;
        default:
          matchesDate = true;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate stats based on all filtered appointments
  const todayStats = {
    total: allFilteredAppointments.length,
    today: allFilteredAppointments.filter(apt => 
      apt.date.toDateString() === new Date().toDateString()
    ).length,
    completed: allFilteredAppointments.filter((a) => a.status === "completed").length,
    scheduled: allFilteredAppointments.filter((a) => a.status === "scheduled" || a.status === "confirmed").length,
    cancelled: allFilteredAppointments.filter((a) => a.status === "cancelled" || a.status === "no-show").length,
  };

  // Pagination functions
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Load data for edit modal
  const loadEditModalData = async () => {
    setEditModalData(prev => ({ ...prev, loading: true }));
    try {
      const [patientsResponse, doctorsResponse, nursesResponse, servicesResponse] = await Promise.all([
        apiService.getPatients({ limit: 100 }),
        apiService.getDoctors({ limit: 100 }),
        apiService.getNurses({ limit: 100 }),
        serviceApi.getServices({ isActive: true, limit: 100 })
      ]);

      setEditModalData({
        patients: patientsResponse.data.patients || [],
        doctors: doctorsResponse.data.items || [],
        nurses: nursesResponse.data.items || [],
        services: servicesResponse.data || [],
        loading: false,
      });
    } catch (error) {
      console.error('Error loading edit modal data:', error);
      setEditModalData(prev => ({ ...prev, loading: false }));
      toast({
        title: t("Error loading data"),
        description: t("Failed to load patients, doctors, nurses, and services."),
        variant: "destructive",
      });
    }
  };

  // Action handlers
  const handleViewDetails = (appointment: any) => {
    setViewDetailsModal({ open: true, appointment });
  };

  const handleEditAppointment = (appointment: any) => {
    // Pre-populate form with current appointment data
    // Get the actual IDs from the appointment data
    const appointmentDate = new Date(appointment.date);
    
    // Extract patient ID - handle both populated and non-populated cases
    const patientId = appointment.patientId || 
                      (appointment.patient && appointment.patient.id) ||
                      (appointment.patient_id && typeof appointment.patient_id === 'string' ? appointment.patient_id : appointment.patient_id?._id) ||
                      "";
    
    // Extract doctor ID - handle both populated and non-populated cases  
    const doctorId = appointment.doctorId ||
                     (appointment.doctor && appointment.doctor.id) ||
                     (appointment.doctor_id && typeof appointment.doctor_id === 'string' ? appointment.doctor_id : appointment.doctor_id?._id) ||
                     "";
    
    // Extract nurse ID if present
    const nurseId = appointment.nurseId ||
                    (appointment.nurse && appointment.nurse.id) ||
                    (appointment.nurse_id && typeof appointment.nurse_id === 'string' ? appointment.nurse_id : appointment.nurse_id?._id) ||
                    "none";
    
    setEditFormData({
      patientId: patientId,
      doctorId: doctorId,
      nurseId: nurseId,
      serviceId: appointment.serviceId || "",
      date: appointmentDate.toISOString().split('T')[0], // YYYY-MM-DD format
      time: appointmentDate.toTimeString().slice(0, 5), // HH:MM format
      duration: appointment.duration ? appointment.duration.toString() : "30",
      type: appointment.type || "consultation",
      notes: appointment.notes || "",
    });
    setEditModal({ open: true, appointment });
    loadEditModalData();
  };

  const handleReschedule = (appointment: any) => {
    // For now, just show edit modal with focus on date/time
    setEditModal({ open: true, appointment });
    toast({
      title: t("Reschedule"),
      description: t("Update the date and time to reschedule this appointment."),
    });
  };

  const handleMarkComplete = async (appointment: any) => {
    try {
      console.log('Marking appointment as complete:', { id: appointment.id, status: 'completed' });
      
      const result = await updateAppointmentMutation.mutateAsync({
        id: appointment.id,
        data: { status: 'completed' }
      });
      
      console.log('Status update result:', result);
      
      toast({
        title: t("Success"),
        description: t("Appointment marked as completed."),
      });
    } catch (error) {
      console.error('Status update error:', error);
      toast({
        title: t("Error"),
        description: t("Failed to update appointment status."),
        variant: "destructive",
      });
    }
  };

  const handleCancelAppointment = (appointment: any) => {
    setCancelModal({ open: true, appointment });
  };

  const handleDownloadSlip = async (appointment: any) => {
    try {
      const appointmentSlipData = convertToAppointmentSlipData(appointment);
      
      // Get clinic info from context or use default
      const clinicInfo: ClinicInfo = {
        name: currentClinic?.name || "",
        address: {
          street: currentClinic?.address?.street || "",
          city: currentClinic?.address?.city || "", 
          state: currentClinic?.address?.state || "",
          zipCode: currentClinic?.address?.zipCode || ""
        },
        contact: {
          phone: currentClinic?.phone || "",
          email: currentClinic?.email || "",
          website: currentClinic?.website || ""
        }
      };

      await AppointmentSlipPDFGenerator.generateAppointmentSlipPDF(
        appointmentSlipData,
        clinicInfo,
        {
          includeHeader: true,
          includeFooter: true,
          includeNotes: true
        }
      );

      toast({
        title: t("Success"),
        description: t("Appointment slip downloaded successfully."),
      });
    } catch (error) {
      console.error('Download appointment slip error:', error);
      toast({
        title: t("Error"),
        description: t("Failed to download appointment slip."),
        variant: "destructive",
      });
    }
  };

  const confirmCancelAppointment = async () => {
    if (!cancelModal.appointment) return;
    
    try {
      console.log('Cancelling appointment:', { id: cancelModal.appointment.id, status: 'cancelled' });
      
      const result = await updateAppointmentMutation.mutateAsync({
        id: cancelModal.appointment.id,
        data: { status: 'cancelled' }
      });
      
      console.log('Cancel appointment result:', result);
      
      setCancelModal({ open: false, appointment: null });
      toast({
        title: t("Success"),
        description: t("Appointment has been cancelled."),
      });
    } catch (error) {
      console.error('Cancel appointment error:', error);
      toast({
        title: t("Error"),
        description: t("Failed to cancel appointment."),
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editModal.appointment) return;

    // Validate required fields
    if (!editFormData.patientId || editFormData.patientId === "loading" || editFormData.patientId === "no-patients") {
      toast({
        title: t("Validation Error"),
        description: t("Please select a valid patient."),
        variant: "destructive",
      });
      return;
    }

    if (!editFormData.doctorId || editFormData.doctorId === "loading" || editFormData.doctorId === "no-doctors") {
      toast({
        title: t("Validation Error"), 
        description: t("Please select a valid doctor."),
        variant: "destructive",
      });
      return;
    }

    if (!editFormData.date || !editFormData.time) {
      toast({
        title: t("Validation Error"),
        description: t("Please provide both date and time for the appointment."),
        variant: "destructive",
      });
      return;
    }

    if (!editFormData.type || editFormData.type === "") {
      toast({
        title: t("Validation Error"),
        description: t("Please select an appointment type."),
        variant: "destructive",
      });
      return;
    }

    const duration = parseInt(editFormData.duration);
    if (isNaN(duration) || duration < 15 || duration > 240) {
      toast({
        title: t("Validation Error"),
        description: t("Duration must be between 15 and 240 minutes."),
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a proper Date object ensuring local timezone interpretation
      // Parse the date and time components separately to avoid timezone confusion
      const [year, month, day] = editFormData.date.split('-').map(Number);
      const [hours, minutes] = editFormData.time.split(':').map(Number);
      
      // Create date in local timezone
      const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
      
      // Validate the date is not invalid
      if (isNaN(appointmentDateTime.getTime())) {
        toast({
          title: t("Validation Error"),
          description: t("Please provide a valid date and time."),
          variant: "destructive",
        });
        return;
      }
      
      const updateData: {
        patient_id: string;
        doctor_id: string;
        appointment_date: string;
        duration: number;
        type: string;
        notes: string;
        nurse_id?: string;
      } = {
        patient_id: editFormData.patientId,
        doctor_id: editFormData.doctorId,
        appointment_date: appointmentDateTime.toISOString(),
        duration: duration,
        type: editFormData.type,
        notes: editFormData.notes || "",
      };

      // Only add nurse_id if a nurse is selected
      if (editFormData.nurseId && editFormData.nurseId !== 'none') {
        updateData.nurse_id = editFormData.nurseId;
      }

      console.log('Updating appointment with data:', updateData);

      await updateAppointmentMutation.mutateAsync({
        id: editModal.appointment.id,
        data: updateData
      });

      setEditModal({ open: false, appointment: null });
      toast({
        title: t("Success"),
        description: t("Appointment has been updated successfully."),
      });
    } catch (error) {
      console.error('Update appointment error:', error);
      toast({
        title: t("Error"),
        description: t("Failed to update appointment. Please try again."),
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (appointmentsLoading) {
    return (
      <div className="space-y-6 w-full max-w-full overflow-hidden">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (appointmentsError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t("Failed to load appointments. Please check your connection and try again.")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-3 xs:space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground">
            {t("Appointments")}
          </h1>
          <p className="text-xs xs:text-sm sm:text-base text-muted-foreground mt-1">
            {t("Manage patient appointments and schedules")}
          </p>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto">
          <NewAppointmentModal />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="p-3 xs:p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {t("Today's Appointments")}
                  </p>
                  <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                    {appointmentsLoading ? "..." : todayStats.today}
                  </p>
                </div>
                <Calendar className="h-6 w-6 xs:h-8 xs:w-8 text-primary flex-shrink-0 ml-2" />
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
            <CardContent className="p-3 xs:p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {t("Completed")}
                  </p>
                  <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                    {appointmentsLoading ? "..." : todayStats.completed}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 xs:h-8 xs:w-8 text-green-600 flex-shrink-0 ml-2" />
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
            <CardContent className="p-3 xs:p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {t("Pending")}
                  </p>
                  <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                    {appointmentsLoading ? "..." : todayStats.scheduled}
                  </p>
                </div>
                <Clock className="h-6 w-6 xs:h-8 xs:w-8 text-orange-600 flex-shrink-0 ml-2" />
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
            <CardContent className="p-3 xs:p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {t("Cancelled")}
                  </p>
                  <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                    {appointmentsLoading ? "..." : todayStats.cancelled}
                  </p>
                </div>
                <XCircle className="h-6 w-6 xs:h-8 xs:w-8 text-red-600 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-3 xs:p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Search appointments by patient or doctor...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full h-10"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 sm:gap-4">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full xs:w-40">
                  <SelectValue placeholder={t("Status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("All Status")}</SelectItem>
                  <SelectItem value="scheduled">{t("Scheduled")}</SelectItem>
                  <SelectItem value="confirmed">{t("Confirmed")}</SelectItem>
                  <SelectItem value="completed">{t("Completed")}</SelectItem>
                  <SelectItem value="cancelled">{t("Cancelled")}</SelectItem>
                  <SelectItem value="no-show">{t("No Show")}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-full xs:w-48">
                  <SelectValue placeholder={t("Date Range")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">{t("Today")}</SelectItem>
                  <SelectItem value="tomorrow">{t("Tomorrow")}</SelectItem>
                  <SelectItem value="this-week">{t("This Week")}</SelectItem>
                  <SelectItem value="next-week">{t("Next Week")}</SelectItem>
                  <SelectItem value="all">{t("All Dates")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Selector and Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base xs:text-lg sm:text-xl">{t("Appointment Schedule")}</CardTitle>
                <CardDescription className="text-xs xs:text-sm">
                  {t("Manage and track all patient appointments")}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
                <Button
                  variant={currentView === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentView("table")}
                  className="h-8 px-3"
                >
                  <TableIcon className="h-4 w-4 mr-1" />
                  {t("Table")}
                </Button>
                <Button
                  variant={currentView === "calendar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentView("calendar")}
                  className="h-8 px-3"
                >
                  <CalendarDays className="h-4 w-4 mr-1" />
                  {t("Calendar")}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-3 xs:px-4 sm:px-6">
            {currentView === "table" ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Patient")}</TableHead>
                    <TableHead>{t("Doctor")}</TableHead>
                    <TableHead>{t("Date & Time")}</TableHead>
                    <TableHead>{t("Type")}</TableHead>
                    <TableHead>{t("Status")}</TableHead>
                    <TableHead className="text-right">{t("Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointmentsLoading ? (
                    // Loading skeletons
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                      </TableRow>
                    ))
                  ) : appointmentsError ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Alert variant="destructive" className="mx-auto max-w-md">
                          <AlertDescription>
                            {t("Failed to load appointments. Please try again.")}
                          </AlertDescription>
                        </Alert>
                      </TableCell>
                    </TableRow>
                  ) : filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-muted-foreground">
                          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">{t("No appointments found")}</p>
                          {searchTerm && (
                            <p className="text-xs mt-1">
                              {t("Try adjusting your search criteria")}
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <TableRow key={appointment.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {appointment.patient?.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">
                                {appointment.patient?.name || t("Unknown Patient")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {appointment.patient?.phone}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">
                              {appointment.doctor?.name || t("Unknown Doctor")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.doctor?.specialty}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">
                              {formatDate(appointment.date)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatTime(appointment.date)} • {appointment.duration} min
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {appointment.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-xs ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1 capitalize">{appointment.status}</span>
                          </Badge>
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
                              <DropdownMenuItem onClick={() => handleViewDetails(appointment)}>
                                <Eye className="mr-2 h-4 w-4" />
                                {t("View Details")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditAppointment(appointment)}>
                                <Edit className="mr-2 h-4 w-4" />
                                {t("Edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadSlip(appointment)}>
                                <Download className="mr-2 h-4 w-4" />
                                {t("Download Slip")}
                              </DropdownMenuItem>
                              {appointment.status !== "completed" && (
                                <DropdownMenuItem onClick={() => handleMarkComplete(appointment)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  {t("Mark Complete")}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleCancelAppointment(appointment)}
                                className="text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                {t("Cancel")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

                          {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {appointmentsLoading ? (
                  // Loading skeletons for mobile
                  Array.from({ length: 5 }).map((_, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </Card>
                  ))
                ) : appointmentsError ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Failed to load appointments. Please try again.
                    </AlertDescription>
                  </Alert>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">{t("No appointments found")}</p>
                    {searchTerm && (
                      <p className="text-xs mt-1">
                        {t("Try adjusting your search criteria")}
                      </p>
                    )}
                  </div>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <Card key={appointment.id} className="p-4 hover:shadow-md transition-shadow">
                      {/* Header with patient and status */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback className="text-sm">
                              {appointment.patient?.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {appointment.patient?.name || t("Unknown Patient")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {appointment.patient?.phone}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs flex items-center space-x-1 ${getStatusColor(appointment.status)}`}
                        >
                          {getStatusIcon(appointment.status)}
                          <span className="capitalize">{appointment.status}</span>
                        </Badge>
                      </div>

                      {/* Appointment details */}
                      <div className="space-y-2 p-3 bg-muted/50 rounded-lg mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Stethoscope className="h-4 w-4 text-primary" />
                            <span className="font-medium">{t("Doctor")}</span>
                          </div>
                          <span className="text-foreground">
                            {appointment.doctor?.name || t("Unknown Doctor")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{t("Date")}</span>
                          </div>
                          <span className="text-foreground">
                            {formatDate(appointment.date)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <span className="font-medium">{t("Time")}</span>
                          </div>
                          <span className="text-foreground">
                            {formatTime(appointment.date)} ({appointment.duration} min)
                          </span>
                        </div>
                      </div>

                      {/* Type and actions */}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {appointment.type}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              <MoreVertical className="h-4 w-4 mr-1" />
                              {t("Actions")}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleViewDetails(appointment)}>
                              <Eye className="mr-2 h-4 w-4" />
                              {t("View Details")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditAppointment(appointment)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t("Edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadSlip(appointment)}>
                              <Download className="mr-2 h-4 w-4" />
                              {t("Download Slip")}
                            </DropdownMenuItem>
                            {appointment.status !== "completed" && (
                              <DropdownMenuItem onClick={() => handleMarkComplete(appointment)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {t("Mark Complete")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleCancelAppointment(appointment)}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              {t("Cancel")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))
                )}
              </div>

            {/* Functional Pagination */}
            <div className="flex flex-col xs:flex-row items-center justify-between gap-3 xs:gap-4 mt-4 pt-4 border-t">
              <div className="flex flex-col xs:flex-row items-center gap-2 xs:gap-4">
                <div className="text-xs xs:text-sm text-muted-foreground">
                  {t("Showing")} {((pagination.page - 1) * pagination.limit) + 1} {t("to")} {Math.min(pagination.page * pagination.limit, pagination.total)} {t("of")} {pagination.total} {t("appointments")}
                </div>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-20 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-8 px-2"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-3 w-3 mr-1" />
                  {t("Previous")}
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="text-xs h-8 w-8 p-0"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-8 px-2"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.pages}
                >
                  {t("Next")}
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
                </>
              ) : (
                /* Calendar View */
                <div className="space-y-4">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {currentCalendarDate.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateCalendar('prev')}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentCalendarDate(new Date())}
                      >
                        {t("Today")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateCalendar('next')}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Calendar Grid */}
                  <div className="hidden md:grid grid-cols-7 gap-1">
                    {/* Day headers */}
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div
                        key={day}
                        className="p-2 text-center text-sm font-medium text-muted-foreground border-b border-border"
                      >
                        {day}
                      </div>
                    ))}

                    {/* Calendar days */}
                    {getCalendarDays(currentCalendarDate).map((date, index) => {
                      const dayAppointments = getAppointmentsForDate(date);
                      const isCurrentMonthDay = isCurrentMonth(date);
                      const isTodayDate = isToday(date);

                      return (
                        <div
                          key={index}
                          className={`
                            min-h-[120px] p-2 border border-border 
                            ${!isCurrentMonthDay ? "bg-muted/50 text-muted-foreground" : "bg-background"}
                            ${isTodayDate ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700" : ""}
                            hover:bg-muted/50 transition-colors
                          `}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`
                                text-sm font-medium
                                ${isTodayDate ? "text-blue-600 dark:text-blue-400 font-bold" : ""}
                              `}
                            >
                              {date.getDate()}
                            </span>
                            {dayAppointments.length > 0 && (
                              <Badge
                                variant="secondary"
                                className="text-xs h-5 px-1"
                              >
                                {dayAppointments.length}
                              </Badge>
                            )}
                          </div>

                          {/* Appointments for the day */}
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 3).map((appointment) => (
                              <div
                                key={appointment.id}
                                className={`
                                  text-xs p-1 rounded cursor-pointer
                                  ${getStatusColor(appointment.status)}
                                  hover:opacity-80 transition-opacity
                                `}
                                onClick={() => handleViewDetails(appointment)}
                                title={`${appointment.patient?.name} - ${formatTime(appointment.date)}`}
                              >
                                <div className="truncate font-medium">
                                  {appointment.patient?.name}
                                </div>
                                <div className="truncate text-xs opacity-80">
                                  {formatTime(appointment.date)}
                                </div>
                              </div>
                            ))}
                            {dayAppointments.length > 3 && (
                              <div
                                className="text-xs text-muted-foreground text-center cursor-pointer hover:text-foreground hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDayAppointmentsModal({ open: true, date, appointments: dayAppointments });
                                }}
                              >
                                +{dayAppointments.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobile Calendar View */}
                  <div className="md:hidden space-y-2">
                    {getCalendarDays(currentCalendarDate)
                      .filter((date) => isCurrentMonth(date))
                      .map((date) => {
                        const dayAppointments = getAppointmentsForDate(date);
                        const isTodayDate = isToday(date);

                        return (
                          <Card
                            key={date.toDateString()}
                            className={`p-3 ${isTodayDate ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20" : ""}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className={`font-medium ${isTodayDate ? "text-blue-600 dark:text-blue-400" : ""}`}>
                                {date.toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                                {isTodayDate && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    {t("Today")}
                                  </Badge>
                                )}
                              </h4>
                              {dayAppointments.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {dayAppointments.length} {t(dayAppointments.length === 1 ? "appointment" : "appointments")}
                                </Badge>
                              )}
                            </div>

                            {dayAppointments.length === 0 ? (
                              <p className="text-sm text-muted-foreground">{t("No appointments")}</p>
                            ) : (
                              <div className="space-y-2">
                                {dayAppointments.map((appointment) => (
                                  <div
                                    key={appointment.id}
                                    className={`
                                      p-2 rounded-lg cursor-pointer border
                                      ${getStatusColor(appointment.status)}
                                      hover:opacity-80 transition-opacity
                                    `}
                                    onClick={() => handleViewDetails(appointment)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">
                                          {appointment.patient?.name}
                                        </p>
                                        <p className="text-xs opacity-80">
                                          {formatTime(appointment.date)} • {appointment.type}
                                        </p>
                                      </div>
                                      <div className="ml-2 flex items-center">
                                        {getStatusIcon(appointment.status)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </Card>
                        );
                      })}
                  </div>

                  {/* Calendar Legend */}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded"></div>
                      <span>{t("Completed")}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded"></div>
                      <span>{t("Scheduled")}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded"></div>
                      <span>{t("Cancelled")}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded"></div>
                      <span>{t("No Show")}</span>
                    </div>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      </motion.div>

      {/* View Details Modal */}
      <Dialog open={viewDetailsModal.open} onOpenChange={(open) => setViewDetailsModal({ open, appointment: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{t("Appointment Details")}</DialogTitle>
                <DialogDescription>
                  {t("View complete appointment information")}
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadSlip(viewDetailsModal.appointment)}
                className="ml-4"
              >
                <Download className="h-4 w-4 mr-2" />
                {t("Download Slip")}
              </Button>
            </div>
          </DialogHeader>
          {viewDetailsModal.appointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t("Patient")}</h4>
                  <p className="text-lg font-medium text-foreground">{viewDetailsModal.appointment.patient?.name}</p>
                  <p className="text-sm text-muted-foreground">{viewDetailsModal.appointment.patient?.phone}</p>
                  <p className="text-sm text-muted-foreground">{viewDetailsModal.appointment.patient?.email}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t("Doctor")}</h4>
                  <p className="text-lg font-medium text-foreground">{viewDetailsModal.appointment.doctor?.name}</p>
                  <p className="text-sm text-muted-foreground">{viewDetailsModal.appointment.doctor?.specialty}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t("Date & Time")}</h4>
                  <p className="text-lg font-medium text-foreground">{formatDate(viewDetailsModal.appointment.date)} at {formatTime(viewDetailsModal.appointment.date)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t("Duration")}</h4>
                  <p className="text-lg font-medium text-foreground">{viewDetailsModal.appointment.duration} {t("minutes")}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t("Type")}</h4>
                  <p className="text-lg font-medium text-foreground capitalize">{viewDetailsModal.appointment.type}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t("Status")}</h4>
                  <Badge className={`${getStatusColor(viewDetailsModal.appointment.status)}`}>
                    {viewDetailsModal.appointment.status}
                  </Badge>
                </div>
              </div>

              {viewDetailsModal.appointment.notes && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t("Notes")}</h4>
                  <p className="text-sm text-foreground bg-muted p-3 rounded-lg">{viewDetailsModal.appointment.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Day Appointments Modal - shows all appointments when "+X more" is clicked */}
      <Dialog
        open={dayAppointmentsModal.open}
        onOpenChange={(open) => setDayAppointmentsModal({ open, date: null, appointments: [] })}
      >
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {t("Appointments")} - {dayAppointmentsModal.date?.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </DialogTitle>
            <DialogDescription>
              {t("Click an appointment to view details")}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto space-y-2 pr-2 -mr-2">
            {dayAppointmentsModal.appointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`
                  p-3 rounded-lg cursor-pointer border transition-colors
                  ${getStatusColor(appointment.status)}
                  hover:opacity-90
                `}
                onClick={() => {
                  setDayAppointmentsModal({ open: false, date: null, appointments: [] });
                  handleViewDetails(appointment);
                }}
              >
                <div className="font-medium">{appointment.patient?.name}</div>
                <div className="text-sm opacity-80">
                  {formatTime(appointment.date)} • {appointment.duration} min • {appointment.type}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Modal */}
      <Dialog open={editModal.open} onOpenChange={(open) => setEditModal({ open, appointment: null })}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("Edit Appointment")}</DialogTitle>
            <DialogDescription>
              {t("Update appointment details for")} {editModal.appointment?.patient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Patient, Doctor and Nurse Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("Patient, Doctor & Nurse")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-patient">{t("Select Patient")} *</Label>
                  <Select
                    value={editFormData.patientId}
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, patientId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("Choose a patient")} />
                    </SelectTrigger>
                    <SelectContent>
                      {editModalData.loading ? (
                        <SelectItem value="loading" disabled>
                          {t("Loading patients...")}
                        </SelectItem>
                      ) : (
                        editModalData.patients.map((patient) => (
                          <SelectItem key={patient._id} value={patient._id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {patient.first_name} {patient.last_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {patient.phone}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-doctor">{t("Select Doctor")} *</Label>
                  <Select
                    value={editFormData.doctorId}
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, doctorId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("Choose a doctor")} />
                    </SelectTrigger>
                    <SelectContent>
                      {editModalData.loading ? (
                        <SelectItem value="loading" disabled>
                          {t("Loading doctors...")}
                        </SelectItem>
                      ) : editModalData.doctors.length === 0 ? (
                        <SelectItem value="no-doctors" disabled>
                          {t("No doctors available.")}
                        </SelectItem>
                      ) : (
                        editModalData.doctors.map((doctor) => (
                          <SelectItem key={doctor._id} value={doctor._id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {doctor.first_name} {doctor.last_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {doctor.role} • {doctor.phone}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-nurse">{t("Select Nurse (Optional)")}</Label>
                  <Select
                    value={editFormData.nurseId}
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, nurseId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("Choose a nurse (optional)")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("No nurse assigned")}</SelectItem>
                      {editModalData.loading ? (
                        <SelectItem value="loading" disabled>
                          {t("Loading nurses...")}
                        </SelectItem>
                      ) : editModalData.nurses.length === 0 ? (
                        <SelectItem value="no-nurses" disabled>
                          {t("No nurses available.")}
                        </SelectItem>
                      ) : (
                        editModalData.nurses.map((nurse) => (
                          <SelectItem key={nurse._id} value={nurse._id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {nurse.first_name} {nurse.last_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {nurse.role} • {nurse.phone}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Service Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("Service & Schedule")}</h3>
              <div className="space-y-2">
                <Label htmlFor="edit-service">{t("Service Type")}</Label>
                <Select
                  value={editFormData.serviceId}
                  onValueChange={(value) => {
                    setEditFormData(prev => ({ ...prev, serviceId: value }));
                    // Auto-set duration when service is selected
                    const selectedService = editModalData.services.find((s) => s.id === value);
                    if (selectedService) {
                      setEditFormData(prev => ({
                        ...prev,
                        duration: selectedService.duration.toString(),
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select service type")} />
                  </SelectTrigger>
                  <SelectContent>
                    {editModalData.loading ? (
                      <SelectItem value="loading" disabled>
                        {t("Loading services...")}
                      </SelectItem>
                    ) : editModalData.services.length === 0 ? (
                      <SelectItem value="no-services" disabled>
                        {t("No services available.")}
                      </SelectItem>
                    ) : (
                      editModalData.services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex justify-between w-full">
                            <span className="font-medium">{service.name}</span>
                            <span className="text-sm text-muted-foreground ml-4">
                              {service.duration}min - ${service.price}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">{t("Date")}</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time">{t("Time")}</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editFormData.time}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">{t("Duration (minutes)")}</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    min="15"
                    max="240"
                    step="15"
                    value={editFormData.duration}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, duration: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">{t("Type")}</Label>
                  <Select 
                    value={editFormData.type} 
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select type")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">{t("Consultation")}</SelectItem>
                      <SelectItem value="follow-up">{t("Follow-up")}</SelectItem>
                      <SelectItem value="check-up">{t("Check-up")}</SelectItem>
                      <SelectItem value="vaccination">{t("Vaccination")}</SelectItem>
                      <SelectItem value="procedure">{t("Procedure")}</SelectItem>
                      <SelectItem value="emergency">{t("Emergency")}</SelectItem>
                      <SelectItem value="screening">{t("Screening")}</SelectItem>
                      <SelectItem value="therapy">{t("Therapy")}</SelectItem>
                      <SelectItem value="other">{t("Other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("Additional Information")}</h3>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">{t("Notes")}</Label>
                <Textarea
                  id="edit-notes"
                  placeholder={t("Add any additional notes...")}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditModal({ open: false, appointment: null })}
            >
              {t("Cancel")}
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={updateAppointmentMutation.isPending}
            >
              {updateAppointmentMutation.isPending ? t("Saving...") : t("Save Changes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Modal */}
      <AlertDialog open={cancelModal.open} onOpenChange={(open) => setCancelModal({ open, appointment: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Cancel Appointment")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("Are you sure you want to cancel this appointment with")} {cancelModal.appointment?.patient?.name}? 
              {t("This action cannot be undone.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Keep Appointment")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancelAppointment}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("Cancel Appointment")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Appointments;
