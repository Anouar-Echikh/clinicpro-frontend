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
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Clock,
  User,
  MapPin,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useClinic } from "@/contexts/ClinicContext";
import appointmentApi, { CalendarEvent } from "@/services/api/appointmentApi";
import userApi, { Doctor } from "@/services/api/userApi";

const Calendar = () => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { currentClinic, loading: clinicLoading, error: clinicError } = useClinic();
  
  // API data states
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cache to prevent duplicate API calls
  const [lastFilterKey, setLastFilterKey] = useState<string>("");

  // Load initial data when clinic is available
  useEffect(() => {
    const loadData = async () => {
      if (!currentClinic) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Load appointments and doctors in parallel
        const [appointmentsData, doctorsData] = await Promise.all([
          appointmentApi.getThisMonthAppointments(),
          userApi.getDoctors(),
        ]);
        
        setEvents(appointmentsData);
        setDoctors(doctorsData);
      } catch (err) {
        console.error("Error loading calendar data:", err);
        const errorMessage = err instanceof Error && err.message.includes('401') 
          ? t("Access denied. Please check your clinic permissions.") 
          : err instanceof Error && err.message.includes('403')
          ? t("Insufficient permissions to view appointments for this clinic.")
          : t("Failed to load calendar data. Please try again.");
        
        setError(errorMessage);
        toast({
          title: t("Error"),
          description: errorMessage,
          variant: "destructive",
        });
        setEvents([]);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentClinic]);

  // Helper function to get date range based on view mode
  const getDateRange = (date: Date, mode: "month" | "week" | "day") => {
    const startDate = new Date(date);
    const endDate = new Date(date);

    switch (mode) {
      case "day":
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "week":
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "month":
      default:
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(endDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    return { startDate, endDate };
  };

  // Reload appointments when filters or date/view mode change
  useEffect(() => {
    // Debounce API calls to prevent too many requests
    const timeoutId = setTimeout(async () => {
      const loadFilteredAppointments = async () => {
        try {
          const { startDate, endDate } = getDateRange(currentDate, viewMode);
          
          const filters: any = {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            limit: 100,
          };
          
          if (selectedDoctor !== "all") {
            // Find doctor ID from selected doctor name
            const doctor = doctors.find(d => d.name === selectedDoctor);
            if (doctor) {
              filters.doctor_id = doctor.id;
            }
          }
          
          if (selectedStatus !== "all") {
            filters.status = selectedStatus;
          }
          
          // Create a cache key to prevent duplicate API calls
          const filterKey = JSON.stringify({
            ...filters,
            viewMode,
            currentDate: currentDate.toISOString().split('T')[0]
          });
          
          // Skip API call if filters haven't changed
          if (filterKey === lastFilterKey) {
            return;
          }
          
          setFilterLoading(true);
          setError(null);
          setLastFilterKey(filterKey);
          
          const appointmentsData = await appointmentApi.getAppointments(filters);
          setEvents(appointmentsData);
        } catch (err) {
          console.error("Error loading filtered appointments:", err);
          setError(err instanceof Error ? err.message : "Failed to load appointments");
          
          // Show user-friendly message for rate limiting
          const message = err instanceof Error && err.message.includes('Too many requests')
            ? t("Too many requests. Please wait a moment before trying again.")
            : t("Failed to load appointments. Please try again.");
            
          toast({
            title: t("Error"),
            description: message,
            variant: "destructive",
          });
        } finally {
          setFilterLoading(false);
        }
      };

      // Only reload if we have doctors data and clinic (initial load is complete)
      if (doctors.length > 0 && currentClinic) {
        await loadFilteredAppointments();
      }
    }, 300); // 300ms debounce to prevent rapid API calls

    // Cleanup timeout on dependency change
    return () => clearTimeout(timeoutId);
  }, [selectedDoctor, selectedStatus, doctors, currentDate, viewMode, lastFilterKey, currentClinic]);

  // Handle appointment actions
  const handleViewAppointment = async (appointmentId: string) => {
    try {
      const appointment = await appointmentApi.getAppointmentById(appointmentId);
      // Here you could open a modal or navigate to appointment details
      toast({
        title: t("Appointment Details"),
        description: `${appointment.title} - ${appointment.patientName}`,
      });
    } catch (err) {
      toast({
        title: t("Error"),
        description: t("Failed to load appointment details."),
        variant: "destructive",
      });
    }
  };

  const handleEditAppointment = (appointmentId: string) => {
    // Here you could open an edit modal or navigate to edit page
    toast({
      title: t("Edit Appointment"),
      description: t("Edit functionality would open here."),
    });
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await appointmentApi.cancelAppointment(appointmentId);
      
      // Update the local state to reflect the change
      setEvents(prev => prev.map(event => 
        event.id === appointmentId 
          ? { ...event, status: "cancelled" as const }
          : event
      ));
      
      toast({
        title: t("Success"),
        description: t("Appointment cancelled successfully."),
      });
    } catch (err) {
      toast({
        title: t("Error"),
        description: t("Failed to cancel appointment."),
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange(currentDate, viewMode);
      const appointmentsData = await appointmentApi.getAppointmentsInRange(
        startDate.toISOString(),
        endDate.toISOString()
      );
      setEvents(appointmentsData);
      toast({
        title: t("Success"),
        description: t("Calendar refreshed successfully."),
      });
    } catch (err) {
      toast({
        title: t("Error"),
        description: t("Failed to refresh calendar."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Date navigation functions
  const handlePreviousPeriod = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case "day":
        newDate.setDate(newDate.getDate() - 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() - 7);
        break;
      case "month":
      default:
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case "day":
        newDate.setDate(newDate.getDate() + 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() + 7);
        break;
      case "month":
      default:
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { icon: Clock, className: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300" },
      confirmed: {
        icon: CheckCircle,
        className: "bg-green-100 text-green-800",
      },
      completed: { icon: CheckCircle, className: "bg-muted text-muted-foreground" },
      cancelled: { icon: XCircle, className: "bg-red-100 text-red-800" },
      "no-show": {
        icon: AlertTriangle,
        className: "bg-orange-100 text-orange-800",
      },
      "in-progress": {
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800",
      },
    };

    // Get config with fallback for unknown status
    const config = statusConfig[status as keyof typeof statusConfig] || {
      icon: AlertTriangle,
      className: "bg-muted text-muted-foreground",
    };
    
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace("-", " ")}
      </Badge>
    );
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      appointment: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300",
      surgery: "bg-red-100 text-red-800",
      consultation: "bg-purple-100 text-purple-800",
      emergency: "bg-red-100 text-red-800",
      meeting: "bg-muted text-muted-foreground",
    };
    return colors[type as keyof typeof colors] || "bg-muted text-muted-foreground";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatHeaderDate = (date: Date, mode: "month" | "week" | "day") => {
    switch (mode) {
      case "day":
        return date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      case "week":
        const { startDate, endDate } = getDateRange(date, mode);
        if (startDate.getMonth() === endDate.getMonth()) {
          return `${startDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
          })} - ${endDate.toLocaleDateString("en-US", {
            day: "numeric",
            year: "numeric",
          })}`;
        } else {
          return `${startDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })} - ${endDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}`;
        }
      case "month":
      default:
        return date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
    }
  };

  // Client-side search filtering (for real-time search without API calls)
  const filteredEvents = events.filter((event) => {
    if (searchTerm === "") return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(searchLower) ||
      event.doctorName.toLowerCase().includes(searchLower) ||
      (event.patientName && event.patientName.toLowerCase().includes(searchLower)) ||
      (event.notes && event.notes.toLowerCase().includes(searchLower))
    );
  });

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
          <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">{t('No Clinic Selected')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('Please select a clinic to view and manage appointments.')}
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
            {t('Calendar View')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentClinic ? (
              <>{t('Manage appointments, surgeries, and clinic events for')} <span className="font-semibold text-primary">{currentClinic.name}</span></>
            ) : (
              t('Manage appointments, surgeries, and clinic events')
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-shrink-0">
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleToday} disabled={loading || filterLoading}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            {t('Today')}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleRefresh} disabled={loading || filterLoading}>
            {loading || filterLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CalendarIcon className="h-4 w-4 mr-2" />
            )}
            {loading || filterLoading ? t("Loading...") : t("Refresh")}
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Date Navigation */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePreviousPeriod}
                disabled={loading || filterLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold min-w-0 text-center">
                {formatHeaderDate(currentDate, viewMode)}
              </h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextPeriod}
                disabled={loading || filterLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("month")}
                disabled={loading || filterLoading}
              >
                {t('Month')}
              </Button>
              <Button
                variant={viewMode === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("week")}
                disabled={loading || filterLoading}
              >
                {t('Week')}
              </Button>
              <Button
                variant={viewMode === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("day")}
                disabled={loading || filterLoading}
              >
                {t('Day')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-0 sm:min-w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('Search events, doctors, or patients...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder={t('Doctor')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Doctors')}</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.name}>
                      {doctor.name}
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
                  <SelectItem value="scheduled">{t('Scheduled')}</SelectItem>
                  <SelectItem value="confirmed">{t('Confirmed')}</SelectItem>
                  <SelectItem value="completed">{t('Completed')}</SelectItem>
                  <SelectItem value="cancelled">{t('Cancelled')}</SelectItem>
                  <SelectItem value="no-show">{t('No Show')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>
              {viewMode === "day" ? t("Today's Events") : 
               viewMode === "week" ? t("This Week's Events") : 
               t("Upcoming Events")}
            </CardTitle>
            <CardDescription>
              {viewMode === "day" 
                ? `${t('Events for')} ${formatDate(currentDate)}`
                : viewMode === "week"
                ? t("All appointments and events for this week")
                : t("All scheduled appointments, consultations, and events")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Loading State */}
            {(loading || filterLoading) && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">
                  {loading ? t("Loading appointments...") : t("Applying filters...")}
                </span>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto text-red-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('Error Loading Appointments')}
                </h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={handleRefresh} variant="outline">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {t('Try Again')}
                </Button>
              </div>
            )}

            {/* Desktop Table View */}
            {!loading && !filterLoading && !error && (
              <div className="hidden md:block">
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      style={{
                        borderLeftColor: event.color,
                        borderLeftWidth: "4px",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-lg">
                              {event.title}
                            </h3>
                            <Badge className={getEventTypeColor(event.type)}>
                              {event.type}
                            </Badge>
                            {getStatusBadge(event.status)}
                          </div>
                          <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-2" />
                              {formatTime(event.startTime)} -{" "}
                              {formatTime(event.endTime)}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <User className="h-4 w-4 mr-2" />
                              {event.doctorName}
                            </div>
                            {event.room && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 mr-2" />
                                {event.room}
                              </div>
                            )}
                          </div>
                          {event.patientName && (
                            <div className="mt-1 text-sm font-medium">
                              {t('Patient:')} {event.patientName}
                            </div>
                          )}
                          {event.notes && (
                            <div className="mt-1 text-sm text-muted-foreground">
                              {event.notes}
                            </div>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              <MoreVertical className="h-4 w-4 mr-1" />
                              {t('Actions')}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewAppointment(event.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              {t('View Details')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditAppointment(event.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t('Edit Event')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleCancelAppointment(event.id)}
                              disabled={event.status === "cancelled" || event.status === "completed"}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('Cancel Event')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Card View */}
            {!loading && !filterLoading && !error && (
              <div className="md:hidden space-y-4">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border rounded-lg p-4 space-y-3 bg-card shadow-sm"
                    style={{
                      borderLeftColor: event.color,
                      borderLeftWidth: "4px",
                    }}
                  >
                    {/* Header with Event Title and Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div>
                          <div className="font-semibold text-lg">
                            {event.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(event.startTime)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge className={getEventTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                        {getStatusBadge(event.status)}
                      </div>
                    </div>

                    {/* Time and Location */}
                    <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-foreground">
                          {formatTime(event.startTime)} -{" "}
                          {formatTime(event.endTime)}
                        </span>
                      </div>
                      {event.room && (
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-foreground">{event.room}</span>
                        </div>
                      )}
                    </div>

                    {/* People Involved */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          {t('Doctor')}
                        </div>
                        <div className="text-sm font-medium">
                          {event.doctorName}
                        </div>
                      </div>
                      {event.patientName && (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground uppercase tracking-wide">
                            {t('Patient')}
                          </div>
                          <div className="text-sm font-medium">
                            {event.patientName}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {event.notes && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          {t('Notes')}
                        </div>
                        <div className="text-sm text-muted-foreground p-2 bg-muted/50 rounded">
                          {event.notes}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-xs text-muted-foreground">
                        {t('Event ID:')} #{event.id}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4 mr-1" />
                            {t('Actions')}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewAppointment(event.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('View Details')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditAppointment(event.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t('Edit Event')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleCancelAppointment(event.id)}
                            disabled={event.status === "cancelled" || event.status === "completed"}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('Cancel Event')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Events State */}
            {!loading && !filterLoading && !error && filteredEvents.length === 0 && (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {t('No events found')}
                </h3>
                <p className="text-muted-foreground">
                  {t('Try adjusting your search criteria or add a new event.')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Calendar;
