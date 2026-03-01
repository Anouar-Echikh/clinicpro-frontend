import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  FileText,
  Receipt,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  LogOut,
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface DashboardStats {
  total_appointments: number;
  upcoming_appointments: number;
  total_prescriptions: number;
  active_prescriptions: number;
  total_invoices: number;
  pending_invoices: number;
}

interface Appointment {
  _id: string;
  appointment_date: string;
  duration: number;
  type: string;
  status: string;
  notes?: string;
  doctor_id: {
    first_name: string;
    last_name: string;
    specialization?: string;
  };
}

interface Prescription {
  _id: string;
  diagnosis: string;
  status: string;
  created_at: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  doctor_id: {
    first_name: string;
    last_name: string;
  };
}

interface Invoice {
  _id: string;
  invoice_number: string;
  total_amount: number;
  status: string;
  due_date: string;
  created_at: string;
  services: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
}

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats
      const statsResponse = await apiService.get('/patient-portal/dashboard-stats');
      setStats(statsResponse.data.stats);

      // Fetch appointments
      const appointmentsResponse = await apiService.get('/patient-portal/appointments?limit=5');
      setAppointments(appointmentsResponse.data.appointments || []);

      // Fetch prescriptions
      const prescriptionsResponse = await apiService.get('/patient-portal/prescriptions?limit=5');
      setPrescriptions(prescriptionsResponse.data.prescriptions || []);

      // Fetch invoices
      const invoicesResponse = await apiService.get('/patient-portal/invoices?limit=5');
      setInvoices(invoicesResponse.data.invoices || []);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    navigate('/login');
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-orange-100 text-orange-800',
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Welcome, {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-sm text-muted-foreground">Patient Portal</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcoming_appointments}</div>
                <p className="text-xs text-muted-foreground">
                  Upcoming • {stats.total_appointments} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_prescriptions}</div>
                <p className="text-xs text-muted-foreground">
                  Active • {stats.total_prescriptions} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Invoices</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending_invoices}</div>
                <p className="text-xs text-muted-foreground">
                  Pending • {stats.total_invoices} total
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs Content */}
        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Appointments</CardTitle>
                <CardDescription>View your scheduled appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No appointments found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {format(new Date(appointment.appointment_date), 'PPP p')}
                            </span>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>Doctor:</strong> Dr. {appointment.doctor_id.first_name}{' '}
                            {appointment.doctor_id.last_name}
                            {appointment.doctor_id.specialization && (
                              <span> • {appointment.doctor_id.specialization}</span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Type:</strong> {appointment.type} • <strong>Duration:</strong>{' '}
                            {appointment.duration} mins
                          </p>
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Notes:</strong> {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Prescriptions</CardTitle>
                <CardDescription>View your prescription history</CardDescription>
              </CardHeader>
              <CardContent>
                {prescriptions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No prescriptions found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {prescriptions.map((prescription) => (
                      <div
                        key={prescription._id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {format(new Date(prescription.created_at), 'PPP')}
                            </span>
                            {getStatusBadge(prescription.status)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Doctor:</strong> Dr. {prescription.doctor_id.first_name}{' '}
                          {prescription.doctor_id.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong>Diagnosis:</strong> {prescription.diagnosis}
                        </p>
                        <div className="border-t pt-3">
                          <p className="text-sm font-medium mb-2">Medications:</p>
                          <div className="space-y-2">
                            {prescription.medications.map((med, index) => (
                              <div key={index} className="text-sm bg-muted/30 p-3 rounded">
                                <p className="font-medium">{med.name}</p>
                                <p className="text-muted-foreground">
                                  <strong>Dosage:</strong> {med.dosage} •{' '}
                                  <strong>Frequency:</strong> {med.frequency} •{' '}
                                  <strong>Duration:</strong> {med.duration}
                                </p>
                                <p className="text-muted-foreground">
                                  <strong>Instructions:</strong> {med.instructions}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Invoices</CardTitle>
                <CardDescription>View your billing invoices</CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No invoices found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice._id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium">Invoice #{invoice.invoice_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(invoice.created_at), 'PPP')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold">${invoice.total_amount.toFixed(2)}</p>
                            {getStatusBadge(invoice.status)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Due Date:</strong> {format(new Date(invoice.due_date), 'PPP')}
                        </p>
                        <div className="border-t pt-3">
                          <p className="text-sm font-medium mb-2">Services:</p>
                          <div className="space-y-1">
                            {invoice.services.map((service, index) => (
                              <div
                                key={index}
                                className="flex justify-between text-sm text-muted-foreground"
                              >
                                <span>
                                  {service.description} (x{service.quantity})
                                </span>
                                <span>${service.total.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDashboard;

