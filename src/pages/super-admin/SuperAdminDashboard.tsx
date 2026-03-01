import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "recharts";
import {
  Building2,
  Users,
  CheckCircle,
  Crown,
  Loader2,
  CreditCard,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import { tenantApiService, RecentTenant } from "@/services/api/tenantApi";
import { superAdminUserApiService } from "@/services/api/superAdminUserApi";
import { stripeApiService } from "@/services/api/stripeApi";
import { toast } from "@/hooks/use-toast";

const STATUS_COLORS: Record<string, string> = {
  active: "#22c55e",
  pending: "#f59e0b",
  suspended: "#ef4444",
  inactive: "#6b7280",
};

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    inactive: 0,
  });
  const [recentTenants, setRecentTenants] = useState<RecentTenant[]>([]);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    super_admin: 0,
    admin: 0,
  });
  const [analytics, setAnalytics] = useState<{
    activeSubscriptions: number;
    totalRevenue: number;
    subscriptionChartData: { name: string; count: number; fill: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(false);

  // Load dashboard statistics from all APIs
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setAnalyticsError(false);

        const [tenantResult, userResult, analyticsResult] = await Promise.allSettled([
          tenantApiService.getTenantStats(),
          superAdminUserApiService.getUserStats(),
          stripeApiService.getAnalytics().then((res) => res.data?.data),
        ]);

        // Tenant stats
        if (tenantResult.status === "fulfilled") {
          setStats(tenantResult.value.stats);
          setRecentTenants(tenantResult.value.recentTenants || []);
        } else {
          console.error("Tenant stats error:", tenantResult.reason);
          toast({
            title: "Error",
            description: "Failed to load tenant statistics.",
            variant: "destructive",
          });
        }

        // User stats
        if (userResult.status === "fulfilled" && userResult.value.data) {
          setUserStats({
            total: userResult.value.data.total || 0,
            active: userResult.value.data.active || 0,
            super_admin: userResult.value.data.super_admin || 0,
            admin: userResult.value.data.admin || 0,
          });
        }

        // Analytics (Stripe) - graceful fallback if not configured
        if (analyticsResult.status === "fulfilled" && analyticsResult.value) {
          const data = analyticsResult.value as {
            subscription_stats?: { _id: string; count: number; total_revenue: number }[];
            revenue_by_plan?: { revenue: number }[];
            transaction_stats?: { total_amount: number }[];
          };
          const subscriptionStats = data.subscription_stats || [];
          const activeCount = subscriptionStats
            .filter((s) => ["active", "trialing"].includes(s._id))
            .reduce((sum, s) => sum + s.count, 0);
          const totalRevenue =
            (data.transaction_stats || []).reduce(
              (sum, t) => sum + (t.total_amount || 0),
              0
            ) ||
            (data.revenue_by_plan || []).reduce(
              (sum, p) => sum + (p.revenue || 0),
              0
            );

          const chartData = subscriptionStats.map((s) => ({
            name: s._id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            count: s.count,
            fill:
              s._id === "active"
                ? "#22c55e"
                : s._id === "trialing"
                  ? "#3b82f6"
                  : s._id === "past_due"
                    ? "#f59e0b"
                    : ["canceled", "unpaid", "incomplete_expired"].includes(s._id)
                      ? "#ef4444"
                      : "#6b7280",
          }));

          setAnalytics({
            activeSubscriptions: activeCount,
            totalRevenue,
            subscriptionChartData: chartData,
          });
        } else {
          setAnalyticsError(true);
        }
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Pie chart data for tenant status
  const tenantStatusChartData = [
    { name: "Active", value: stats.active, color: STATUS_COLORS.active },
    { name: "Pending", value: stats.pending, color: STATUS_COLORS.pending },
    { name: "Suspended", value: stats.suspended, color: STATUS_COLORS.suspended },
    { name: "Inactive", value: stats.inactive, color: STATUS_COLORS.inactive },
  ].filter((d) => d.value > 0);

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Crown className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold tracking-tight">
              Super Admin Dashboard
            </h1>
          </div>
          <p className="text-slate-600 mt-1">
            Manage and monitor the entire ClinicPro platform
          </p>
        </div>
        <Badge className="bg-green-100 text-green-800 border-green-200 w-fit">
          <CheckCircle className="h-3 w-3 mr-1" />
          All Systems Operational
        </Badge>
      </div>

      {/* 4 Stat Cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                <span>{stats.active} active</span>
                {stats.pending > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {stats.pending} pending
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {userStats.active} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Subscriptions
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsError ? "—" : analytics?.activeSubscriptions ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {analyticsError ? "Stripe not configured" : "Active & trialing"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsError ? "—" : formatCurrency(analytics?.totalRevenue ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {analyticsError ? "Stripe not configured" : "All time"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row */}
      {!loading && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Tenant Status Pie Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tenant Status Overview</CardTitle>
              <CardDescription>
                Distribution of tenant statuses across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {tenantStatusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tenantStatusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {tenantStatusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [value, "Tenants"]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No tenant data to display
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subscription Status Bar Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Subscription Overview</CardTitle>
              <CardDescription>
                Subscription status breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {!analyticsError &&
                analytics?.subscriptionChartData &&
                analytics.subscriptionChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.subscriptionChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={80}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {analytics.subscriptionChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    {analyticsError
                      ? "Stripe analytics not available"
                      : "No subscription data to display"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Tenants Table */}
      {!loading && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">Recent Tenants</CardTitle>
                <CardDescription>
                  Latest tenant organizations added to the platform
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/tenants">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentTenants.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTenants.map((tenant) => (
                    <TableRow key={tenant._id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {tenant.slug}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(tenant.status)}>
                          {tenant.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden sm:table-cell">
                        {formatDate(tenant.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No tenants yet. Create your first tenant to get started.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Welcome / Quick Actions - Compact */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage tenants and monitor system performance from this central
            dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="justify-start h-auto p-4" asChild>
            <Link to="/admin/tenants">
              <div className="bg-blue-500 p-2 rounded-lg mr-4">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium">Manage Tenants</div>
                <div className="text-xs text-muted-foreground">
                  Create, edit, and manage tenant organizations
                </div>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
