import React, { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Activity,
  Download,
  FileText,
  PieChart as PieChartIcon,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Heart,
  Stethoscope,
  Pill,
  Filter,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useClinic } from "@/contexts/ClinicContext";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
// Import analytics hooks
import {
  useAnalyticsOverview,
  useAnalyticsStats,
  useDepartmentAnalytics,
  useAppointmentAnalytics,
  usePatientDemographics,
  useServiceAnalytics,
  usePaymentMethodAnalytics,
} from "@/hooks/useDashboard";

const Analytics = () => {
  const { t } = useTranslation();
  const [selectedTimeframe, setSelectedTimeframe] = useState("3months");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const { formatAmount, currencyInfo } = useCurrency();
  const { currentClinic, loading: clinicLoading } = useClinic();

  // Debug logging
  React.useEffect(() => {
    console.log('📊 Analytics - Component state:', {
      selectedTimeframe,
      currentClinic: currentClinic?.name || null,
      clinicId: currentClinic?._id || null,
      clinicLoading
    });
  }, [selectedTimeframe, currentClinic, clinicLoading]);

  // Fetch analytics data using hooks
  const { data: analyticsOverview, isLoading: overviewLoading, error: overviewError, refetch: refetchOverview } = useAnalyticsOverview(selectedTimeframe);
  const { data: analyticsStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useAnalyticsStats();
  const { data: departmentData, isLoading: departmentLoading, error: departmentError, refetch: refetchDepartments } = useDepartmentAnalytics();
  const { data: appointmentStatusData, isLoading: appointmentLoading, error: appointmentError, refetch: refetchAppointments } = useAppointmentAnalytics();
  const { data: demographicsData, isLoading: demographicsLoading, error: demographicsError, refetch: refetchDemographics } = usePatientDemographics();
  const { data: topServicesData, isLoading: servicesLoading, error: servicesError, refetch: refetchServices } = useServiceAnalytics();
  const { data: paymentMethodsData, isLoading: paymentsLoading, error: paymentsError, refetch: refetchPayments } = usePaymentMethodAnalytics();

  // Loading and error states
  const isLoading = clinicLoading || overviewLoading || statsLoading || departmentLoading || appointmentLoading || demographicsLoading || servicesLoading || paymentsLoading;
  
  // Check for actual errors with messages
  const actualErrors = [
    overviewError,
    statsError,
    departmentError,
    appointmentError,
    demographicsError,
    servicesError,
    paymentsError
  ].filter(error => error && error.message);

  // Debug error logging
  React.useEffect(() => {
    if (actualErrors.length > 0) {
      console.error('📊 Analytics - Actual errors detected:', {
        count: actualErrors.length,
        errors: actualErrors.map(error => ({
          message: error.message,
          name: error.name,
          status: (error as any).response?.status
        }))
      });
    }
  }, [actualErrors]);

  // Retry all failed queries
  const retryAll = () => {
    console.log('📊 Analytics - Retrying all queries');
    const refetchPromises = [];
    
    if (overviewError && overviewError.message) refetchPromises.push(refetchOverview());
    if (statsError && statsError.message) refetchPromises.push(refetchStats());
    if (departmentError && departmentError.message) refetchPromises.push(refetchDepartments());
    if (appointmentError && appointmentError.message) refetchPromises.push(refetchAppointments());
    if (demographicsError && demographicsError.message) refetchPromises.push(refetchDemographics());
    if (servicesError && servicesError.message) refetchPromises.push(refetchServices());
    if (paymentsError && paymentsError.message) refetchPromises.push(refetchPayments());
    
    if (refetchPromises.length === 0) {
      // If no specific errors, refetch all
      Promise.all([
        refetchOverview(),
        refetchStats(),
        refetchDepartments(),
        refetchAppointments(),
        refetchDemographics(),
        refetchServices(),
        refetchPayments()
      ]);
    } else {
      Promise.all(refetchPromises);
    }
  };

  // Transform API data or use defaults
  const revenueData = analyticsOverview?.revenueExpenseData || [
    { month: "Jan", revenue: 0, expenses: 0, patients: 0 },
    { month: "Feb", revenue: 0, expenses: 0, patients: 0 },
    { month: "Mar", revenue: 0, expenses: 0, patients: 0 },
    { month: "Apr", revenue: 0, expenses: 0, patients: 0 },
    { month: "May", revenue: 0, expenses: 0, patients: 0 },
    { month: "Jun", revenue: 0, expenses: 0, patients: 0 },
  ];

  // Current month calculations
  const currentMonth = revenueData[revenueData.length - 1] || { revenue: 0, expenses: 0, patients: 0 };
  const previousMonth = revenueData[revenueData.length - 2] || { revenue: 1, expenses: 0, patients: 1 };
  
  // Calculate growth from API data or stats
  const revenueGrowth = analyticsStats?.growth?.revenue || (
    ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
  );
  const patientGrowth = analyticsStats?.growth?.patients || (
    ((currentMonth.patients - previousMonth.patients) / previousMonth.patients) * 100
  );

  // Stats from API or defaults
  const currentRevenue = analyticsStats?.currentMonth?.revenue || currentMonth.revenue;
  const currentPatients = analyticsStats?.currentMonth?.patients || currentMonth.patients;
  const totalAppointments = analyticsStats?.currentMonth?.appointments || 0;
  const completionRate = analyticsStats?.currentMonth?.completionRate || 0;

  // Using the currency context for dynamic currency formatting
  const formatCurrency = (amount: number) => {
    return formatAmount(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Chart data
  const departmentChartData = departmentData || [];
  const appointmentChartData = appointmentStatusData || [];
  const demographicsChartData = demographicsData || [];
  const servicesChartData = topServicesData || [];
  const paymentMethodsChartData = paymentMethodsData || [];

  const COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#06B6D4"];

  const generateReport = (type: string) => {
    toast({
      title: t("Report Generated"),
      description: `${type} ${t("report is being prepared for download.")}`,
    });
  };

  // Show clinic selection required
  if (!currentClinic && !clinicLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{t('Clinic Selection Required')}</h3>
          <p className="text-muted-foreground mb-4">{t('Please select a clinic to view analytics data.')}</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('Loading analytics data...')}</p>
          {currentClinic && (
            <p className="text-sm text-muted-foreground mt-2">{t('For')} {currentClinic.name}</p>
          )}
        </div>
      </div>
    );
  }

  // Show error state only if there are actual errors with messages
  if (actualErrors.length > 0) {
    const errorDetails = actualErrors.map(error => error.message).join(', ');
    
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{t('Error Loading Analytics')}</h3>
          <p className="text-red-600 mb-4">
            {t('Failed to load')} {actualErrors.length} {t('analytics module')}{actualErrors.length > 1 ? t('s') : ''}
          </p>
          {currentClinic && (
            <p className="text-sm text-muted-foreground mb-4">{t('For clinic:')} {currentClinic.name}</p>
          )}
          <details className="text-left mb-4">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              {t('Show error details')}
            </summary>
            <div className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded">
              {errorDetails}
            </div>
          </details>
          <div className="space-x-2">
            <Button onClick={retryAll} variant="default">
              {t('Retry Failed Modules')}
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              {t('Reload Page')}
            </Button>
          </div>
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
            {t('Analytics & Reports')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Comprehensive insights into clinic performance and metrics')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Select
                value={selectedTimeframe}
                onValueChange={setSelectedTimeframe}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder={t('Timeframe')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">{t('Last Month')}</SelectItem>
                  <SelectItem value="3months">{t('Last 3 Months')}</SelectItem>
                  <SelectItem value="6months">{t('Last 6 Months')}</SelectItem>
                  <SelectItem value="1year">{t('Last Year')}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t('Department')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Departments')}</SelectItem>
                  <SelectItem value="general">{t('General Medicine')}</SelectItem>
                  <SelectItem value="cardiology">{t('Cardiology')}</SelectItem>
                  <SelectItem value="pediatrics">{t('Pediatrics')}</SelectItem>
                  <SelectItem value="orthopedics">{t('Orthopedics')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
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
                    {t('Total Revenue')}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    <CurrencyDisplay amount={currentRevenue} variant="large" />
                  </p>
                  <div className="flex items-center mt-2">
                    {revenueGrowth >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {revenueGrowth >= 0 ? '+' : ''}{formatPercentage(revenueGrowth)}
                    </span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
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
                    {t('Total Patients')}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {currentPatients}
                  </p>
                  <div className="flex items-center mt-2">
                    {patientGrowth >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm ${patientGrowth >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {patientGrowth >= 0 ? '+' : ''}{formatPercentage(patientGrowth)}
                    </span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
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
                    {t('Appointments')}
                  </p>
                  <p className="text-3xl font-bold text-foreground">{totalAppointments}</p>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-1" />
                    <span className="text-sm text-purple-600">
                      {Math.round(completionRate)}% {t('completed')}
                    </span>
                  </div>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
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
                    {t('Avg. Wait Time')}
                  </p>
                  <p className="text-3xl font-bold text-foreground">12 {t('min')}</p>
                  <div className="flex items-center mt-2">
                    <TrendingDown className="h-4 w-4 text-orange-600 mr-1" />
                    <span className="text-sm text-orange-600">
                      -15% {t('from last month')}
                    </span>
                  </div>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t('Revenue Trend')}</CardTitle>
              <CardDescription>{t('Monthly revenue and expenses')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatAmount(Number(value))}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.8}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="2"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Department Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t('Department Performance')}</CardTitle>
              <CardDescription>{t('Revenue by department')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatAmount(Number(value))}
                  />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tables Section */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="services">{t('Top Services')}</TabsTrigger>
          <TabsTrigger value="payments">{t('Payment Methods')}</TabsTrigger>
          <TabsTrigger value="demographics">{t('Demographics')}</TabsTrigger>
          <TabsTrigger value="appointments">{t('Appointments')}</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>{t('Top Performing Services')}</CardTitle>
              <CardDescription>
                {t('Most requested services and their revenue')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Service')}</TableHead>
                      <TableHead>{t('Count')}</TableHead>
                      <TableHead>{t('Revenue')}</TableHead>
                      <TableHead>{t('Avg. Price')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(topServicesData || []).map((service, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {service.service}
                        </TableCell>
                        <TableCell>{service.count}</TableCell>
                        <TableCell>{formatCurrency(service.revenue)}</TableCell>
                        <TableCell>
                          {formatCurrency(service.revenue / service.count)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {(topServicesData || []).map((service, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 space-y-3 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-lg">
                        {service.service}
                      </div>
                      <Badge variant="outline"># {index + 1}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          {t('Count')}
                        </div>
                        <div className="text-sm font-medium">
                          {service.count}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          {t('Revenue')}
                        </div>
                        <div className="text-sm font-medium">
                          {formatCurrency(service.revenue)}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {t('Average Price')}
                      </div>
                      <div className="text-sm font-medium">
                        {formatCurrency(service.revenue / service.count)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>{t('Payment Methods')}</CardTitle>
              <CardDescription>
                {t('Distribution of payment methods used')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Payment Method')}</TableHead>
                      <TableHead>{t('Percentage')}</TableHead>
                      <TableHead>{t('Amount')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(paymentMethodsData || []).map((method, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {method.method}
                        </TableCell>
                        <TableCell>{method.percentage}%</TableCell>
                        <TableCell>{formatCurrency(method.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {(paymentMethodsData || []).map((method, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 space-y-3 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-lg">
                        {method.method}
                      </div>
                      <Badge>{method.percentage}%</Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {t('Total Amount')}
                      </div>
                      <div className="text-lg font-medium">
                        {formatCurrency(method.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics">
          <Card>
            <CardHeader>
              <CardTitle>{t('Patient Demographics')}</CardTitle>
              <CardDescription>{t('Age and gender distribution')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={demographicsData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="male" fill="#3B82F6" name={t('Male')} />
                  <Bar dataKey="female" fill="#EC4899" name={t('Female')} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>{t('Appointment Status')}</CardTitle>
              <CardDescription>
                {t('Current appointment status distribution')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={appointmentStatusData || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) =>
                      `${name} ${value}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(appointmentStatusData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
