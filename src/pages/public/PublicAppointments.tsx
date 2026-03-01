import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
  Heart,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

interface Patient {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
}

interface Doctor {
  _id: string;
  first_name: string;
  last_name: string;
  role: string;
  department?: string;
}

interface Appointment {
  _id: string;
  patient_id: Patient;
  doctor_id: Doctor;
  nurse_id?: Doctor;
  appointment_date: string;
  duration: number;
  type: string;
  status: string;
  notes: string;
  created_at: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    patient: Patient;
    appointments: Appointment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}

const PublicAppointments: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Filter states
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  const fetchAppointments = async (page: number = 1) => {
    if (!patientId) return;
    
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/public/appointments/${patientId}?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setAppointments(data.data.appointments);
        setPatient(data.data.patient);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAppointments([]);
      setPatient(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(currentPage);
  }, [patientId, currentPage, statusFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "scheduled":
      case "confirmed":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "no-show":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "scheduled":
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "no-show":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    if (status === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
    }
  };

  if (loading && !appointments.length) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>

          {/* Patient Info Skeleton */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments Skeleton */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ClinicPro</h1>
            <p className="text-gray-600">Patient Appointments Portal</p>
          </div>

          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}. Please check the patient ID and try again.
            </AlertDescription>
          </Alert>

          <div className="text-center mt-6">
            <Button onClick={() => fetchAppointments(currentPage)} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ClinicPro</h1>
          <p className="text-gray-600">Patient Appointments Portal</p>
        </div>

        {/* Patient Information */}
        {patient && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {patient.first_name[0]}{patient.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {patient.first_name} {patient.last_name}
                    </h3>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {patient.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {patient.phone}
                      </div>
                      {patient.date_of_birth && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          Age: {calculateAge(patient.date_of_birth)} years
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Status Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700 mr-2">Filter by status:</span>
              {['all', 'scheduled', 'confirmed', 'completed', 'cancelled'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilter(status)}
                  className="capitalize"
                >
                  {status === 'all' ? 'All Appointments' : status}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Your Appointments
                </div>
                <Badge variant="secondary">
                  {pagination.total} total
                </Badge>
              </CardTitle>
              <CardDescription>
                Your scheduled and past appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                  <p className="text-gray-600">
                    {statusFilter === 'all' 
                      ? "No appointments have been scheduled yet."
                      : `No ${statusFilter} appointments found.`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <motion.div
                      key={appointment._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(appointment.status)} border`}
                          >
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1 capitalize">{appointment.status}</span>
                          </Badge>
                          <Badge variant="secondary" className="capitalize">
                            {appointment.type}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatShortDate(appointment.appointment_date)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatTime(appointment.appointment_date)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Stethoscope className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Doctor</span>
                          </div>
                          <p className="text-sm text-gray-900">
                            {appointment.doctor_id?.first_name && appointment.doctor_id?.last_name ? 
                              `Dr. ${appointment.doctor_id.first_name} ${appointment.doctor_id.last_name}` :
                              "No Doctor Assigned"
                            }
                          </p>
                          {appointment.doctor_id?.department && (
                            <p className="text-xs text-gray-600">{appointment.doctor_id.department}</p>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Duration</span>
                          </div>
                          <p className="text-sm text-gray-900">{appointment.duration} minutes</p>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center space-x-2 mb-1">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium text-gray-700">Notes</span>
                          </div>
                          <p className="text-sm text-gray-600">{appointment.notes}</p>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Appointment scheduled on {formatDate(appointment.appointment_date)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} appointments
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    
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
                            className="w-8 h-8 p-0"
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
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= pagination.pages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>ClinicPro - Patient Portal</p>
          <p>If you have any questions about your appointments, please contact the clinic directly.</p>
        </div>
      </div>
    </div>
  );
};

export default PublicAppointments; 