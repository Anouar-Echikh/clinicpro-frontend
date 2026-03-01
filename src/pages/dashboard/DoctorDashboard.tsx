import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Users,
  Clock,
  FileText,
  Stethoscope,
  CheckCircle,
  AlertTriangle,
  Plus,
  Eye,
  TrendingUp,
  Activity,
  AlertCircle,
} from "lucide-react";
import { useAppointments, usePatients } from "@/hooks/useApi";
import { apiService } from "@/services/api";
import { PrescriptionStats } from "@/types";
import { toast } from "@/hooks/use-toast";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [prescriptionStats, setPrescriptionStats] = useState<PrescriptionStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Fetch appointments for today
  const { 
    data: appointmentsData, 
    isLoading: appointmentsLoading, 
    error: appointmentsError 
  } = useAppointments({ 
    limit: 100,
    // Backend will automatically filter for doctor's appointments
  });

  // Fetch recent patients
  const { 
    data: patientsData, 
    isLoading: patientsLoading, 
    error: patientsError 
  } = usePatients({ 
    limit: 10,
    // Backend will automatically filter for doctor's patients
  });

  // Fetch prescription stats
  useEffect(() => {
    const fetchPrescriptionStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);
        const stats = await apiService.getPrescriptionStats();
        setPrescriptionStats(stats);
      } catch (err: any) {
        console.error("Error fetching prescription stats:", err);
        setStatsError(err.message || "Failed to fetch prescription stats");
      } finally {
        setStatsLoading(false);
      }
    };

    fetchPrescriptionStats();
  }, []);

  // Process appointments data
  const appointments = (appointmentsData as any)?.data?.appointments || [];
  const todayAppointments = appointments
    .filter((apt: any) => {
      const appointmentDate = new Date(apt.appointment_date);
      const today = new Date();
      return appointmentDate.toDateString() === today.toDateString();
    })
    .map((apt: any) => ({
      id: apt._id,
      patient: apt.patient_id ? `${apt.patient_id.first_name} ${apt.patient_id.last_name}` : "Unknown Patient",
      time: new Date(apt.appointment_date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      type: apt.type || "Consultation",
      status: apt.status,
      duration: `${apt.duration || 30} min`,
    }))
    .slice(0, 4); // Show only first 4 appointments

  // Process patients data for recent patients
  const patients = (patientsData as any)?.data?.patients || [];
  const recentPatients = patients
    .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 4)
    .map((patient: any) => ({
      name: `${patient.first_name} ${patient.last_name}`,
      lastVisit: new Date(patient.updated_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      condition: "General Care", // This would come from medical records in a real system
      status: "stable", // This would come from medical records in a real system
    }));

  // Calculate stats from real data
  const totalTodayAppointments = todayAppointments.length;
  const completedAppointments = todayAppointments.filter(apt => apt.status === "completed").length;
  const pendingAppointments = todayAppointments.filter(apt => 
    apt.status === "scheduled" || apt.status === "confirmed"
  ).length;
  const totalPrescriptions = prescriptionStats?.totalPrescriptions || 0;

  const doctorStats = [
    {
      title: "Today's Patients",
      value: totalTodayAppointments.toString(),
      change: "+0", // Would need historical data to calculate real change
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Scheduled today",
    },
    {
      title: "Completed",
      value: completedAppointments.toString(),
      change: "+0",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Consultations done",
    },
    {
      title: "Pending",
      value: pendingAppointments.toString(),
      change: "+0",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "Awaiting consultation",
    },
    {
      title: "Prescriptions",
      value: totalPrescriptions.toString(),
      change: "+0",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Total prescribed",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-orange-100 text-orange-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "scheduled":
      case "confirmed":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "cancelled":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "no-show":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPatientStatusColor = (status: string) => {
    switch (status) {
      case "stable":
        return "bg-green-100 text-green-800";
      case "monitoring":
        return "bg-yellow-100 text-yellow-800";
      case "improved":
        return "bg-blue-100 text-blue-800";
      case "follow-up":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Show error state if any critical data fails to load
  const hasError = appointmentsError || patientsError || statsError;
  const isLoading = appointmentsLoading || patientsLoading || statsLoading;

  if (hasError && !isLoading) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please check your connection and try again.
          </AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* Mobile-First Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Doctor Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Welcome back, Dr. Smith. Here's your schedule and patient overview.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Badge
            variant="outline"
            className="text-blue-600 border-blue-200 text-xs sm:text-sm"
          >
            <Stethoscope className="h-3 w-3 mr-1" />
            Doctor
          </Badge>
        </div>
      </div>

      {/* Mobile-Responsive Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {doctorStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-2 rounded-lg ${stat.bgColor} flex-shrink-0`}
                    >
                      <stat.icon
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`}
                      />
                    </div>
                    <div className="text-right min-w-0">
                      {isLoading ? (
                        <Skeleton className="h-6 sm:h-8 w-8 sm:w-12" />
                      ) : (
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                      )}
                      <div className="flex items-center justify-end">
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-600">
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                      {stat.title}
                    </p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Today's Schedule - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-lg sm:text-xl">
                    Today's Schedule
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Your appointments for today
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="self-start sm:self-auto"
                  onClick={() => navigate("/dashboard/calendar")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Calendar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {appointmentsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="mt-2 flex space-x-4">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No appointments scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getStatusIcon(appointment.status)}
                          <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                            {appointment.patient}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                          <p className="text-xs sm:text-sm text-gray-600">
                            {appointment.time} • {appointment.duration}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {appointment.type}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(appointment.status)} text-xs flex-shrink-0 ml-2`}
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/dashboard/appointments")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  View Full Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Patients - Takes 1 column */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">
                Recent Patients
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Recently treated patients
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {patientsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-3 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>
              ) : recentPatients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent patients</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPatients.map((patient, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {patient.name}
                        </p>
                        <Badge
                          variant="secondary"
                          className={`${getPatientStatusColor(patient.status)} text-xs flex-shrink-0`}
                        >
                          {patient.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        {patient.condition}
                      </p>
                      <p className="text-xs text-gray-500">{patient.lastVisit}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  View All Patients
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Patient Satisfaction
            </h3>
            <div className="text-2xl font-bold text-blue-600 mb-2">96%</div>
            <Progress value={96} className="h-2 mb-2" />
            <p className="text-xs text-gray-600">Based on recent feedback</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Avg. Consultation
            </h3>
            <div className="text-2xl font-bold text-green-600 mb-2">28m</div>
            <Progress value={85} className="h-2 mb-2" />
            <p className="text-xs text-gray-600">This month average</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Efficiency Score
            </h3>
            <div className="text-2xl font-bold text-purple-600 mb-2">94%</div>
            <Progress value={94} className="h-2 mb-2" />
            <p className="text-xs text-gray-600">Above clinic average</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard;
