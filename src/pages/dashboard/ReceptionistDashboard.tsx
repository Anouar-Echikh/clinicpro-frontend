import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Users,
  Clock,
  Phone,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  Plus,
  Eye,
  TrendingUp,
  MessageSquare,
  DollarSign,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { apiService } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface ReceptionistStats {
  todayAppointments: number;
  todayWalkIns: number;
  pendingCheckIns: number;
  callsToday: number;
}

interface UpcomingAppointment {
  id: string;
  patient: string;
  phone: string;
  time: string;
  doctor: string;
  type: string;
  status: string;
  duration: number;
}

interface CurrentPatient {
  id: string;
  name: string;
  checkedIn: string;
  doctor: string;
  status: string;
  waitTime: number;
}

interface PendingTask {
  id: string;
  task: string;
  patient: string;
  priority: string;
  time: string;
  phone?: string;
  source?: string;
}

const ReceptionistDashboard = () => {
  const [dashboardData, setDashboardData] = useState<{
    stats: ReceptionistStats;
    upcomingAppointments: UpcomingAppointment[];
    currentPatients: CurrentPatient[];
    pendingTasks: PendingTask[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await apiService.getReceptionistDashboard();
        setDashboardData(data);
      } catch (err: any) {
        console.error("Error fetching receptionist dashboard:", err);
        setError(err.message || "Failed to load dashboard data");
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCheckIn = async (appointmentId: string) => {
    try {
      await apiService.checkInPatient(appointmentId);
      toast({
        title: "Success",
        description: "Patient checked in successfully.",
      });
      
      // Refresh dashboard data
      const data = await apiService.getReceptionistDashboard();
      setDashboardData(data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to check in patient. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      await apiService.updateAppointmentStatus(appointmentId, status);
      toast({
        title: "Success",
        description: `Appointment status updated to ${status}.`,
      });
      
      // Refresh dashboard data
      const data = await apiService.getReceptionistDashboard();
      setDashboardData(data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to update appointment status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const receptionistStats = dashboardData ? [
    {
      title: "Today's Appointments",
      value: dashboardData.stats.todayAppointments.toString(),
      change: "+0", // Would need historical data for real change
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Scheduled today",
    },
    {
      title: "Walk-ins",
      value: dashboardData.stats.todayWalkIns.toString(),
      change: "+0",
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Today's walk-ins",
    },
    {
      title: "Pending Check-ins",
      value: dashboardData.stats.pendingCheckIns.toString(),
      change: "+0",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "Awaiting check-in",
    },
    {
      title: "Calls Today",
      value: dashboardData.stats.callsToday.toString(),
      change: "+0",
      icon: Phone,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Calls handled",
    },
  ] : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "urgent":
      case "in-progress":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
      case "scheduled":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "urgent":
      case "in-progress":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPatientStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800";
      case "in-consultation":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Show error state if data fails to load
  if (error && !loading) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. Please check your connection and try again.
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
            Reception Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Welcome back! Manage appointments, check-ins, and patient flow.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Badge
            variant="outline"
            className="text-green-600 border-green-200 text-xs sm:text-sm"
          >
            <Users className="h-3 w-3 mr-1" />
            Receptionist
          </Badge>
        </div>
      </div>

      {/* Mobile-Responsive Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="text-right space-y-1">
                      <Skeleton className="h-6 w-8" />
                      <Skeleton className="h-3 w-6" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          receptionistStats.map((stat, index) => (
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
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                          {stat.value}
                        </p>
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
          ))
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-lg sm:text-xl">
                  Upcoming Appointments
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Next appointments to manage
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="self-start sm:self-auto"
              >
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-40" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !dashboardData?.upcomingAppointments.length ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.upcomingAppointments.map((appointment) => (
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
                          {formatTime(appointment.time)} • {appointment.doctor}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {appointment.type}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {appointment.phone}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1 ml-2">
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(appointment.status)} text-xs flex-shrink-0`}
                      >
                        {appointment.status}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-1 h-6 w-6"
                          onClick={() => handleCheckIn(appointment.id)}
                          disabled={appointment.status === 'in-progress' || appointment.status === 'completed'}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Patients */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl">
              Current Patients
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Patients currently in the clinic
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !dashboardData?.currentPatients.length ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No patients currently checked in</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.currentPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                      <p className="text-xs text-gray-600">
                        Checked in: {formatTime(patient.checkedIn)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Wait time: {formatWaitTime(patient.waitTime)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{patient.doctor}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl">Pending Tasks</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Tasks requiring your attention
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          ) : !dashboardData?.pendingTasks.length ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending tasks</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dashboardData.pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900 leading-tight">
                      {task.task}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`${getPriorityColor(task.priority)} text-xs flex-shrink-0 ml-2`}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">
                    Patient: {task.patient}
                  </p>
                  {task.phone && (
                    <p className="text-xs text-gray-500 mb-1">
                      Phone: {task.phone}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(task.time).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Check-in Efficiency
            </h3>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {loading ? <Skeleton className="h-8 w-12 mx-auto" /> : "92%"}
            </div>
            <p className="text-xs text-gray-600">On-time check-ins today</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Call Resolution
            </h3>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {loading ? <Skeleton className="h-8 w-12 mx-auto" /> : "96%"}
            </div>
            <p className="text-xs text-gray-600">Calls resolved today</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Patient Satisfaction
            </h3>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {loading ? <Skeleton className="h-8 w-12 mx-auto" /> : "98%"}
            </div>
            <p className="text-xs text-gray-600">Front desk rating</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
