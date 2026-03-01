import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  CalendarIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  CreditCard,
  Users,
  Package,
  Filter,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  ArrowUpIcon,
  ArrowDownIcon,
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";
import ErrorHandler from "@/components/ErrorHandler";
import { 
  performanceApi, 
  type PerformanceOverview, 
  type ComparativePerformance,
  type PerformanceQueryParams,
  type DoctorPayoutsResponse 
} from "@/services/api/performanceApi";

const Performance = () => {
  const { t } = useTranslation();
  const { formatAmount } = useCurrency();
  
  // State for data
  const [performanceData, setPerformanceData] = useState<PerformanceOverview | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparativePerformance | null>(null);
  const [doctorPayouts, setDoctorPayouts] = useState<DoctorPayoutsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Filter states
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState<Date>(startOfMonth(subMonths(new Date(), 11)));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [compareWithPrevious, setCompareWithPrevious] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Doctor payouts filters
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  // Load data on component mount and when filters change
  useEffect(() => {
    loadPerformanceData();
    if (compareWithPrevious) {
      loadComparisonData();
    }
  }, [period, startDate, endDate, compareWithPrevious]);

  // Load doctor payouts when filters change
  useEffect(() => {
    loadDoctorPayouts();
  }, [selectedYear, selectedMonth]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const params: PerformanceQueryParams = {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        period: period,
        compare_with_previous: compareWithPrevious
      };

      console.log("Loading performance data with params:", params);
      const response = await performanceApi.getPerformanceOverview(params);
      console.log("Performance response:", response.data);
      
      if (response.data.success) {
        setPerformanceData(response.data.data);
      }
    } catch (err: any) {
      console.error("Error loading performance data:", err);
      setError(err);
      toast.error(t("Failed to load performance data"));
    } finally {
      setLoading(false);
    }
  };

  const loadComparisonData = async () => {
    try {
      const currentStart = startDate;
      const currentEnd = endDate;
      
      // Calculate previous period dates
      const monthsDiff = (currentEnd.getFullYear() - currentStart.getFullYear()) * 12 + 
                        (currentEnd.getMonth() - currentStart.getMonth()) + 1;
      const previousStart = subMonths(currentStart, monthsDiff);
      const previousEnd = subMonths(currentEnd, monthsDiff);

      const params = {
        current_start: currentStart.toISOString().split('T')[0],
        current_end: currentEnd.toISOString().split('T')[0],
        previous_start: previousStart.toISOString().split('T')[0],
        previous_end: previousEnd.toISOString().split('T')[0]
      };

      const response = await performanceApi.getComparativePerformance(params);
      if (response.data.success) {
        setComparisonData(response.data.data);
      }
    } catch (err: any) {
      console.error("Error loading comparison data:", err);
    }
  };

  const loadDoctorPayouts = async () => {
    try {
      setLoadingDoctors(true);
      const response = await performanceApi.getDoctorPayouts({
        year: selectedYear,
        month: selectedMonth
      });
      
      if (response.data.success) {
        setDoctorPayouts(response.data.data);
      }
    } catch (err: any) {
      console.error("Error loading doctor payouts:", err);
      toast.error(t("Failed to load doctor payouts"));
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Chart data formatting
  const formatChartData = () => {
    if (!performanceData) return [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Create a map to combine data from all modules by period
    const dataMap = new Map();

    // Process invoices data
    performanceData.modules.invoices.forEach(item => {
      const key = `${item._id.year}-${item._id.month || item._id.quarter || 1}`;
      const periodLabel = period === 'yearly' 
        ? item._id.year.toString()
        : period === 'quarterly'
        ? `Q${item._id.quarter} ${item._id.year}`
        : `${monthNames[(item._id.month || 1) - 1]} ${item._id.year}`;

      if (!dataMap.has(key)) {
        dataMap.set(key, { period: periodLabel, invoices: 0, payments: 0, expenses: 0, payroll: 0 });
      }
      dataMap.get(key).invoices += item.total_amount || 0;
    });

    // Process payments data
    performanceData.modules.payments.forEach(item => {
      const key = `${item._id.year}-${item._id.month || item._id.quarter || 1}`;
      const periodLabel = period === 'yearly' 
        ? item._id.year.toString()
        : period === 'quarterly'
        ? `Q${item._id.quarter} ${item._id.year}`
        : `${monthNames[(item._id.month || 1) - 1]} ${item._id.year}`;

      if (!dataMap.has(key)) {
        dataMap.set(key, { period: periodLabel, invoices: 0, payments: 0, expenses: 0, payroll: 0 });
      }
      dataMap.get(key).payments += item.total_amount || 0;
    });

    // Process expenses data
    performanceData.modules.expenses.forEach(item => {
      const key = `${item._id.year}-${item._id.month || item._id.quarter || 1}`;
      const periodLabel = period === 'yearly' 
        ? item._id.year.toString()
        : period === 'quarterly'
        ? `Q${item._id.quarter} ${item._id.year}`
        : `${monthNames[(item._id.month || 1) - 1]} ${item._id.year}`;

      if (!dataMap.has(key)) {
        dataMap.set(key, { period: periodLabel, invoices: 0, payments: 0, expenses: 0, payroll: 0 });
      }
      dataMap.get(key).expenses += item.total_amount || 0;
    });

    // Process payroll data
    performanceData.modules.payroll.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      const periodLabel = period === 'yearly' 
        ? item._id.year.toString()
        : `${item._id.month} ${item._id.year}`;

      if (!dataMap.has(key)) {
        dataMap.set(key, { period: periodLabel, invoices: 0, payments: 0, expenses: 0, payroll: 0 });
      }
      dataMap.get(key).payroll += item.total_payroll || 0;
    });

    return Array.from(dataMap.values()).sort((a, b) => a.period.localeCompare(b.period));
  };

  // Summary calculations
  const getSummaryStats = () => {
    if (!performanceData) return null;

    const summary = performanceData.summary;
    const profitMargin = parseFloat(summary.profit_margin);
    
    return {
      totalRevenue: summary.total_revenue,
      totalCosts: summary.total_costs,
      netProfit: summary.net_profit,
      profitMargin: profitMargin,
      isProfit: summary.net_profit >= 0
    };
  };

  // Get change percentage for comparison
  const getChangePercentage = (current: number, previous: number): { value: number; isPositive: boolean } => {
    if (previous === 0) return { value: current > 0 ? 100 : 0, isPositive: current >= 0 };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

  if (error) {
    return <ErrorHandler error={error} onRetry={() => {
      setError(null);
      loadPerformanceData();
    }} />;
  }

  const chartData = formatChartData();
  const summaryStats = getSummaryStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('Performance Analytics')}</h1>
          <p className="text-muted-foreground">
            {t('Comprehensive financial performance across all clinic modules')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {/* TODO: Export functionality */}}>
            <Download className="mr-2 h-4 w-4" />
            {t('Export Report')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('Filters & Date Range')}
          </CardTitle>
          <CardDescription>
            {t('Customize the performance data view with date ranges and comparison options')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="period">{t('Period')}</Label>
              <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('Select period')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t('Monthly')}</SelectItem>
                  <SelectItem value="quarterly">{t('Quarterly')}</SelectItem>
                  <SelectItem value="yearly">{t('Yearly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('Start Date')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : t('Pick a date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>{t('End Date')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : t('Pick a date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col justify-end">
              <Button 
                variant={compareWithPrevious ? "default" : "outline"}
                onClick={() => setCompareWithPrevious(!compareWithPrevious)}
                className="w-full"
              >
                <Activity className="mr-2 h-4 w-4" />
                {compareWithPrevious ? t('Comparing') : t('Compare Period')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {summaryStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Total Revenue')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatAmount(summaryStats.totalRevenue)}
              </div>
              {comparisonData && (
                <div className="flex items-center text-xs text-muted-foreground">
                  {parseFloat(comparisonData.changes.revenue) >= 0 ? (
                    <ArrowUpIcon className="mr-1 h-3 w-3 text-green-600" />
                  ) : (
                    <ArrowDownIcon className="mr-1 h-3 w-3 text-red-600" />
                  )}
                  {Math.abs(parseFloat(comparisonData.changes.revenue))}% {t('from previous period')}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Total Costs')}</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatAmount(summaryStats.totalCosts)}
              </div>
              {comparisonData && (
                <div className="flex items-center text-xs text-muted-foreground">
                  {(parseFloat(comparisonData.changes.expenses) + parseFloat(comparisonData.changes.payroll)) >= 0 ? (
                    <ArrowUpIcon className="mr-1 h-3 w-3 text-red-600" />
                  ) : (
                    <ArrowDownIcon className="mr-1 h-3 w-3 text-green-600" />
                  )}
                  {Math.abs((parseFloat(comparisonData.changes.expenses) + parseFloat(comparisonData.changes.payroll)) / 2)}% {t('from previous period')}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Net Profit')}</CardTitle>
              {summaryStats.isProfit ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                summaryStats.isProfit ? "text-green-600" : "text-red-600"
              )}>
                {formatAmount(summaryStats.netProfit)}
              </div>
              {comparisonData && (
                <div className="flex items-center text-xs text-muted-foreground">
                  {parseFloat(comparisonData.changes.profit) >= 0 ? (
                    <ArrowUpIcon className="mr-1 h-3 w-3 text-green-600" />
                  ) : (
                    <ArrowDownIcon className="mr-1 h-3 w-3 text-red-600" />
                  )}
                  {Math.abs(parseFloat(comparisonData.changes.profit))}% {t('from previous period')}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Profit Margin')}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                summaryStats.profitMargin >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {summaryStats.profitMargin.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {summaryStats.profitMargin >= 20 ? t('Excellent') : 
                 summaryStats.profitMargin >= 10 ? t('Good') : 
                 summaryStats.profitMargin >= 0 ? t('Fair') : t('Loss')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts and Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>{t('Financial Performance Trends')}</CardTitle>
          <CardDescription>
            {t('Track revenue, costs, and profitability trends across all modules')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">{t('No data available')}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('No performance data found for the selected period.')}
              </p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">{t('Overview')}</TabsTrigger>
                <TabsTrigger value="revenue">{t('Revenue Trends')}</TabsTrigger>
                <TabsTrigger value="costs">{t('Cost Analysis')}</TabsTrigger>
                <TabsTrigger value="comparison">{t('Module Comparison')}</TabsTrigger>
                <TabsTrigger value="doctors">{t('Doctor Payouts')}</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatAmount(value)} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="invoices" 
                      stackId="1" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      name={t('Invoices')}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="payments" 
                      stackId="1" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      name={t('Payments')}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expenses" 
                      stackId="2" 
                      stroke="#ffc658" 
                      fill="#ffc658" 
                      name={t('Expenses')}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="payroll" 
                      stackId="2" 
                      stroke="#ff7300" 
                      fill="#ff7300" 
                      name={t('Payroll')}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="revenue" className="space-y-4">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatAmount(value)} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="invoices" 
                      stroke="#8884d8" 
                      strokeWidth={3}
                      name={t('Invoices Revenue')}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="payments" 
                      stroke="#82ca9d" 
                      strokeWidth={3}
                      name={t('Payments Revenue')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="costs" className="space-y-4">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatAmount(value)} />
                    <Legend />
                    <Bar dataKey="expenses" fill="#ffc658" name={t('Expenses')} />
                    <Bar dataKey="payroll" fill="#ff7300" name={t('Payroll')} />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="comparison" className="space-y-4">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatAmount(value)} />
                    <Legend />
                    <Bar dataKey="invoices" fill="#8884d8" name={t('Invoices')} />
                    <Bar dataKey="payments" fill="#82ca9d" name={t('Payments')} />
                    <Bar dataKey="expenses" fill="#ffc658" name={t('Expenses')} />
                    <Bar dataKey="payroll" fill="#ff7300" name={t('Payroll')} />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="doctors" className="space-y-4">
                {/* Doctor Payouts Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {t('Doctor Payouts & Sales Incentives')}
                    </CardTitle>
                    <CardDescription>
                      {t('Monthly breakdown of doctor base salaries and sales incentives based on revenue generated')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 mb-6">
                      <div>
                        <Label htmlFor="year">{t('Year')}</Label>
                        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder={t('Year')} />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="month">{t('Month')}</Label>
                        <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder={t('Month')} />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                              <SelectItem key={month} value={month.toString()}>
                                {format(new Date(2024, month - 1, 1), 'MMMM')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    {doctorPayouts && (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('Total Doctors')}</p>
                                <p className="text-2xl font-bold">{doctorPayouts.totals.total_doctors}</p>
                              </div>
                              <Users className="h-8 w-8 text-primary" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                                <p className="text-2xl font-bold text-green-600">
                                  {formatAmount(doctorPayouts.totals.total_revenue)}
                                </p>
                              </div>
                              <DollarSign className="h-8 w-8 text-green-600" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('Sales Incentives')}</p>
                                <p className="text-2xl font-bold text-blue-600">
                                  {formatAmount(doctorPayouts.totals.total_sales_incentive)}
                                </p>
                              </div>
                              <TrendingUp className="h-8 w-8 text-blue-600" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('Total Payouts')}</p>
                                <p className="text-2xl font-bold text-purple-600">
                                  {formatAmount(doctorPayouts.totals.total_payout)}
                                </p>
                              </div>
                              <CreditCard className="h-8 w-8 text-purple-600" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Doctor Payouts Table */}
                    {loadingDoctors ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : doctorPayouts && doctorPayouts.doctors.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('Doctor')}</TableHead>
                              <TableHead>{t('Sales %')}</TableHead>
                              <TableHead>{t('Revenue Generated')}</TableHead>
                              <TableHead>{t('Base Salary')}</TableHead>
                              <TableHead>{t('Sales Incentive')}</TableHead>
                              <TableHead className="text-right">{t('Total Payout')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {doctorPayouts.doctors.map((doctor) => (
                              <TableRow key={doctor.doctor_id}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{doctor.doctor_name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {doctor.specialization && `${doctor.specialization} • `}
                                      {doctor.appointment_count} {t('appointments')} • {doctor.invoice_count} {t('invoices')}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                                    {doctor.sales_percentage}%
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium text-green-600">
                                    {formatAmount(doctor.revenue_generated)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    {formatAmount(doctor.base_salary)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium text-blue-600">
                                    {formatAmount(doctor.sales_incentive)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {doctor.payout_breakdown.incentive_calculation}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="font-bold text-purple-600">
                                    {formatAmount(doctor.total_payout)}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">{t('No doctors found')}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t('No doctor data available for')} {format(new Date(selectedYear, selectedMonth - 1, 1), 'MMMM yyyy')}.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Performance;
