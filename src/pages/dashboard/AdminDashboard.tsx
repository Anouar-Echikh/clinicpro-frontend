import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAdminDashboardStats, useRevenueAnalytics } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Calendar,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Heart,
  Shield,
  ChevronRight,
  Package,
  Eye,
  UserPlus,
  Phone,
  Mail,
  Stethoscope,
} from "lucide-react";
import ApiTest from "@/components/ApiTest";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { formatAmount, currencyInfo } = useCurrency();
  const navigate = useNavigate();

  // Fetch comprehensive dashboard data from dedicated APIs
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useAdminDashboardStats();
  const { data: revenueAnalyticsData, isLoading: revenueLoading, error: revenueError } = useRevenueAnalytics();

  // Extract real stats from dashboard API
  const totalPatients = dashboardData?.overview?.totalPatients || 0;
  const todayAppointments = dashboardData?.overview?.todayAppointments || 0;
  const monthlyRevenue = dashboardData?.overview?.monthlyRevenue || 0;
  const lowStockItems = dashboardData?.lowStockItems || [];
  const appointmentStatsData = dashboardData?.appointmentStats || [];
  const recentAppointmentsData = dashboardData?.recentAppointments || [];
  const recentLeadsData = dashboardData?.recentLeads || [];
  const percentageChanges = dashboardData?.percentageChanges || { revenue: '0', patients: '0', appointments: '0', lowStock: '0' };

  const isLoading = dashboardLoading || revenueLoading;
  const hasError = dashboardError || revenueError;

  // Helper function for appointment status colors (defined before use)
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#22c55e";
      case "scheduled":
        return "#3b82f6";
      case "cancelled":
        return "#ef4444";
      case "no-show":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  // Helper function to get trend direction
  const getTrend = (percentage: string) => {
    const value = parseFloat(percentage);
    if (value > 0) return "up";
    if (value < 0) return "down";
    return "neutral";
  };

  // Helper function to format percentage change
  const formatPercentageChange = (percentage: string) => {
    const value = parseFloat(percentage);
    if (value === 0) return "0%";
    if (value > 0) return `+${percentage}%`;
    return `${percentage}%`;
  };

  // Helper function to get trend icon and color
  const getTrendIconAndColor = (trend: string) => {
    switch (trend) {
      case "up":
        return {
          icon: TrendingUp,
          iconColor: "text-green-500 dark:text-green-400",
          textColor: "text-green-600 dark:text-green-400"
        };
      case "down":
        return {
          icon: TrendingDown,
          iconColor: "text-red-500 dark:text-red-400",
          textColor: "text-red-600 dark:text-red-400"
        };
      case "neutral":
      default:
        return {
          icon: Minus,
          iconColor: "text-muted-foreground",
          textColor: "text-muted-foreground"
        };
    }
  };

  // Real stats from API data with dynamic percentage changes
  const stats = [
    {
      title: t("Today's Appointments"),
      value: isLoading ? "..." : todayAppointments.toString(),
      change: formatPercentageChange(percentageChanges.appointments),
      trend: getTrend(percentageChanges.appointments),
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
      description: t("Scheduled today"),
    },
    {
      title: t("Total Patients"),
      value: isLoading ? "..." : totalPatients.toLocaleString(),
      change: formatPercentageChange(percentageChanges.patients),
      trend: getTrend(percentageChanges.patients),
      icon: Users,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      description: t("Active patients"),
    },
    {
      title: t("Monthly Revenue"),
      value: isLoading ? "..." : formatAmount(monthlyRevenue),
      change: formatPercentageChange(percentageChanges.revenue),
      trend: getTrend(percentageChanges.revenue),
      icon: DollarSign,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      description: t("This month"),
    },
    {
      title: t("Low Stock Items"),
      value: isLoading ? "..." : lowStockItems.length.toString(),
      change: lowStockItems.length === 0 ? "0%" : lowStockItems.length > 5 ? t("High Alert") : t("Low Alert"),
      trend: lowStockItems.length === 0 ? "neutral" : lowStockItems.length > 5 ? "down" : "up",
      icon: Package,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      description: t("Need attention"),
    },
  ];

  // Transform API data for charts and components
  const revenueChartData = (() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueData = revenueAnalyticsData?.revenueData || [];
    const expenseData = revenueAnalyticsData?.expenseData || [];
    
    // Create a map of all unique months from both revenue and expense data
    const monthMap = new Map();
    
    // Add revenue data
    revenueData.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      monthMap.set(key, {
        year: item._id.year,
        month: item._id.month,
        revenue: item.revenue || 0,
        expenses: 0
      });
    });
    
    // Add/update expense data
    expenseData.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      if (monthMap.has(key)) {
        monthMap.get(key).expenses = item.expenses || 0;
      } else {
        monthMap.set(key, {
          year: item._id.year,
          month: item._id.month,
          revenue: 0,
          expenses: item.expenses || 0
        });
      }
    });
    
    // Convert to array and sort by year/month
    const chartData = Array.from(monthMap.values())
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      })
      .map(item => ({
        month: monthNames[item.month - 1] || `M${item.month}`,
        revenue: item.revenue,
        expenses: item.expenses
      }));
    
    // If no data, return default
    if (chartData.length === 0) {
      return [
        { month: "Jan", revenue: 0, expenses: 0 },
        { month: "Feb", revenue: 0, expenses: 0 },
        { month: "Mar", revenue: 0, expenses: 0 },
        { month: "Apr", revenue: 0, expenses: 0 },
        { month: "May", revenue: 0, expenses: 0 },
        { month: "Jun", revenue: 0, expenses: 0 },
      ];
    }
    
    return chartData;
  })();

  const appointmentStatusData = appointmentStatsData?.map(stat => ({
    name: t(stat._id.charAt(0).toUpperCase() + stat._id.slice(1)),
    value: stat.count,
    color: getStatusColor(stat._id)
  })) || [
    { name: t("Completed"), value: 0, color: "#22c55e" },
    { name: t("Scheduled"), value: 0, color: "#3b82f6" },
    { name: t("Cancelled"), value: 0, color: "#ef4444" },
    { name: t("No Show"), value: 0, color: "#f59e0b" },
  ];

  // Use real appointment data from dashboard API
  const recentAppointments = recentAppointmentsData?.slice(0, 10).map(appointment => {
    // Handle patient_id (could be string or populated object)
    const patientName = typeof appointment.patient_id === 'string' 
      ? `Patient ${appointment.patient_id.slice(-4)}` 
      : `${(appointment.patient_id as any)?.first_name || 'Patient'} ${(appointment.patient_id as any)?.last_name || ''}`.trim();
    
    // Handle doctor_id (could be string or populated object)  
    const doctorName = typeof appointment.doctor_id === 'string' 
      ? `Doctor ${appointment.doctor_id.slice(-4)}` 
      : `Dr. ${(appointment.doctor_id as any)?.first_name || 'Doctor'} ${(appointment.doctor_id as any)?.last_name || ''}`.trim();

    return {
      id: appointment._id,
      patient: patientName,
      doctor: doctorName,
      time: new Date(appointment.appointment_date).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      status: appointment.status,
      type: appointment.type,
    };
  }) || [];

  // Transform real leads data from dashboard API
  const recentLeads = recentLeadsData?.slice(0, 10).map(lead => ({
    id: lead._id,
    name: `${lead.firstName} ${lead.lastName}`,
    phone: lead.phone,
    email: lead.email || 'N/A',
    source: lead.source.charAt(0).toUpperCase() + lead.source.slice(1),
    status: lead.status,
    service: lead.serviceInterest,
    time: new Date(lead.created_at).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }),
    priority: lead.status === 'new' ? 'high' : lead.status === 'contacted' ? 'medium' : 'low'
  })) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300";
      case "scheduled":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getLeadIcon = (status: string) => {
    switch (status) {
      case "new":
        return <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case "contacted":
        return <Phone className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      case "scheduled":
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      default:
        return <Mail className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getLeadStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
      case "contacted":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300";
      case "scheduled":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "medium":
        return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
      case "low":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      default:
        return "bg-muted border-border";
    }
  };

  // Show error state if any API calls failed
  if (hasError) {
    return (
      <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {t("Failed to load dashboard data. Please check your connection and try again.")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-3 xs:space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* Mobile-First Header */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground truncate">
            {t("Admin Dashboard")}
          </h1>
          <p className="text-xs xs:text-sm sm:text-base text-muted-foreground mt-1">
            {t("Complete overview of your clinic operations and system health.")}
          </p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
          <Badge
            variant="outline"
            className="text-primary border-primary/20 text-xs sm:text-sm"
          >
            <Shield className="h-3 w-3 mr-1" />
            {t("Administrator")}
          </Badge>
        </div>
      </div>

      {/* Mobile-Responsive Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 xs:p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                      {stat.title}
                    </p>
                    <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      {(() => {
                        const trendInfo = getTrendIconAndColor(stat.trend);
                        const TrendIcon = trendInfo.icon;
                        return (
                          <>
                            <TrendIcon className={`h-3 w-3 ${trendInfo.iconColor} mr-1 flex-shrink-0`} />
                            <span className={`text-xs sm:text-sm ${trendInfo.textColor} mr-1`}>
                              {stat.change}
                            </span>
                          </>
                        );
                      })()}
                      <span className="text-xs text-muted-foreground truncate">
                        {t("from last month")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 hidden xs:block">
                      {stat.description}
                    </p>
                  </div>
                  <div
                    className={`p-2 sm:p-3 rounded-full ${stat.bgColor} flex-shrink-0 ml-2 sm:ml-3`}
                  >
                    <stat.icon
                      className={`h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 ${stat.color}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Dashboard Content */}
      <div className="space-y-3 xs:space-y-4 sm:space-y-6 mt-3 xs:mt-4 sm:mt-6">
          {/* Charts Section - Mobile Responsive */}
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3 xs:gap-4 sm:gap-6">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-base xs:text-lg sm:text-xl">
                        {t("Revenue Overview")}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {t("Monthly revenue vs expenses")}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex"
                      onClick={() => navigate("/dashboard/reports")}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t("View Details")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-3 xs:px-4 sm:px-6">
                  <div className="h-48 xs:h-56 sm:h-64 lg:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={revenueChartData}
                        margin={{ 
                          top: 20, 
                          right: typeof window !== "undefined" && window.innerWidth < 640 ? 5 : 10, 
                          left: typeof window !== "undefined" && window.innerWidth < 640 ? 5 : 0, 
                          bottom: 5 
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: typeof window !== "undefined" && window.innerWidth < 640 ? 10 : 12, fill: "var(--muted-foreground)" }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: typeof window !== "undefined" && window.innerWidth < 640 ? 10 : 12, fill: "var(--muted-foreground)" }}
                          tickFormatter={(value) => `${currencyInfo?.symbol || '$'}${value / 1000}k`}
                        />
                        <Tooltip
                          formatter={(value: any) => [
                            formatAmount(value),
                            value === revenueChartData[0]?.revenue
                              ? "Revenue"
                              : "Expenses",
                          ]}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            fontSize: typeof window !== "undefined" && window.innerWidth < 640 ? "12px" : "14px",
                          }}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="expenses"
                          fill="#ef4444"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Appointment Status Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base xs:text-lg sm:text-xl">
                    {t("Appointment Status")}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {t("Distribution of appointment statuses")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3 xs:px-4 sm:px-6">
                  <div className="h-48 xs:h-56 sm:h-64 lg:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={appointmentStatusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={typeof window !== "undefined" && window.innerWidth < 640 ? 60 : 80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            typeof window !== "undefined" && window.innerWidth < 640 
                              ? `${(percent * 100).toFixed(0)}%`
                              : `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {appointmentStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [value, name]}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            fontSize: typeof window !== "undefined" && window.innerWidth < 640 ? "12px" : "14px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Activities Section - Mobile Responsive */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 xs:gap-4 sm:gap-6">
            {/* Recent Appointments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-base xs:text-lg sm:text-xl">
                      {t("Recent Appointments")}
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/dashboard/appointments")}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {t("View All")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-3 xs:px-4 sm:px-6">
                  <div className="space-y-3">
                    {recentAppointments.length > 0 ? (
                      recentAppointments.map((appointment, index) => (
                        <div
                          key={index}
                          className="flex flex-col xs:flex-row xs:items-center justify-between p-3 bg-muted/50 rounded-lg space-y-2 xs:space-y-0"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-foreground truncate">
                                {appointment.patient}
                              </p>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${getStatusBadgeColor(appointment.status)}`}
                              >
                                {getStatusIcon(appointment.status)}
                                <span className="ml-1 hidden xs:inline">{appointment.status}</span>
                              </Badge>
                            </div>
                            <div className="flex flex-col xs:flex-row xs:items-center xs:space-x-4 mt-1 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Stethoscope className="h-3 w-3 mr-1" />
                                {appointment.doctor}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {appointment.time}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 xs:ml-3">
                            <Badge variant="outline" className="text-xs">
                              {appointment.type}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">{t("No recent appointments")}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Leads */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-base xs:text-lg sm:text-xl">
                      {t("Recent Leads")}
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/dashboard/leads")}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {t("View All")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-3 xs:px-4 sm:px-6">
                  <div className="space-y-3">
                    {recentLeads.length > 0 ? (
                      recentLeads.map((lead, index) => (
                        <div
                          key={index}
                          className="flex flex-col xs:flex-row xs:items-center justify-between p-3 bg-muted/50 rounded-lg space-y-2 xs:space-y-0"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-foreground truncate">
                                {lead.name}
                              </p>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${getLeadStatusColor(lead.status)}`}
                              >
                                {getLeadIcon(lead.status)}
                                <span className="ml-1 hidden xs:inline capitalize">{lead.status}</span>
                              </Badge>
                            </div>
                            <div className="flex flex-col xs:flex-row xs:items-center xs:space-x-4 mt-1 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {lead.phone}
                              </span>
                              <span className="flex items-center truncate">
                                <Mail className="h-3 w-3 mr-1" />
                                {lead.email}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 xs:ml-3">
                            <Badge variant="outline" className="text-xs">
                              {lead.source}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">{t("No recent leads")}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Low Stock Alert - Mobile Responsive */}
          {lowStockItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                <CardHeader className="pb-3">
                  <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <CardTitle className="text-base xs:text-lg sm:text-xl text-orange-800 dark:text-orange-300">
                        {t("Low Stock Alert")}
                      </CardTitle>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/dashboard/inventory")}
                      className="border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      {t("Manage Inventory")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-3 xs:px-4 sm:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {lowStockItems.slice(0, 6).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-background rounded-lg border border-orange-200 dark:border-orange-800"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("Stock")}: {item.current_stock} / {item.minimum_stock}
                          </p>
                        </div>
                        <Badge variant="destructive" className="text-xs ml-2">
                          {t("Low")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Debug API Test - Admin Only */}
          <ApiTest />
      </div>
    </div>
  );
};

export default AdminDashboard;
