import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  ResponsiveTable,
  MobileActionDropdown,
} from "@/components/ui/table";
import {
  ResponsiveHeader,
  ResponsiveStatsCard,
  ResponsiveContainer,
  ResponsiveGrid,
} from "@/components/ui/responsive-container";
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
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  FileText,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  Edit2,
  Printer,
  Send,
  Upload,
  TestTube2,
  Microscope,
  Stethoscope,
  Image as ImageIcon,
  FileImage,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import RecordTestReportModal from "@/components/modals/RecordTestReportModal";
import EditTestReportModal from "@/components/modals/EditTestReportModal";
import ViewTestReportModal from "@/components/modals/ViewTestReportModal";
import { TestReport, Test } from "@/types";
import { apiService, Patient } from "@/services/api";
import { 
  useTestReports, 
  useTestReportStats, 
  useTests,
  usePatients,
  useUpdateTestReportStatus,
  useVerifyTestReport,
  useDeliverTestReport,
  useDeleteTestReport
} from "@/hooks/useApi";

const TestReports = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<TestReport | null>(null);
  const [viewReportId, setViewReportId] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Build API parameters
  const getApiParams = () => {
    const params: any = {
      page: currentPage,
      limit: pageSize,
    };

    if (searchTerm) params.search = searchTerm;
    if (selectedStatus !== "all") params.status = selectedStatus;
    if (selectedCategory !== "all") params.category = selectedCategory;
    if (selectedVendor !== "all") params.vendor = selectedVendor;

    return params;
  };

  // Use React Query hooks for data fetching
  const { 
    data: testReportsResponse, 
    isLoading, 
    error,
    refetch: refetchReports
  } = useTestReports(getApiParams());

  const { 
    data: statsData,
    isLoading: statsLoading
  } = useTestReportStats();

  // Extract stats with defaults
  const stats = statsData || {
    totalReports: 0,
    pendingReports: 0,
    recordedReports: 0,
    verifiedReports: 0,
    deliveredReports: 0,
  };

  const { 
    data: testsResponse,
    isLoading: testsLoading
  } = useTests({ limit: 100, status: 'active' });

  const { 
    data: patientsResponse,
    isLoading: patientsLoading
  } = usePatients({ limit: 100 });

  // Extract data from responses
  const testReports = testReportsResponse?.data?.items || [];
  const totalPages = testReportsResponse?.data?.pagination?.pages || 1;
  const totalItems = testReportsResponse?.data?.pagination?.total || 0;
  const tests = testsResponse?.data?.items || [];
  const patients = patientsResponse?.data?.patients || [];

  // Mutations
  const updateStatusMutation = useUpdateTestReportStatus();
  const verifyMutation = useVerifyTestReport();
  const deliverMutation = useDeliverTestReport();
  const deleteMutation = useDeleteTestReport();

  // Extract vendors from test reports
  const vendors = Array.from(new Set((testReports || []).map(report => report.externalVendor).filter(Boolean)));

  // Reset page when search term changes
  React.useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, selectedStatus, selectedCategory, selectedVendor]);

  const handleRefresh = () => {
    refetchReports();
  };

  const getPatientName = (patientId: string | Patient) => {
    if (typeof patientId === 'object' && patientId !== null) {
      const patient = patientId as Patient;
      return `${patient.first_name} ${patient.last_name}`;
    }
    const patient = (patients || []).find(p => p._id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : t('Unknown Patient');
  };

  const getTestName = (testId: string | Test) => {
    if (typeof testId === 'object' && testId !== null) {
      const test = testId as Test;
      return test.name;
    }
    const test = (tests || []).find(t => t._id === testId);
    return test?.name || t('Unknown Test');
  };

  const getTestCode = (testId: string | Test) => {
    if (typeof testId === 'object' && testId !== null) {
      const test = testId as Test;
      return test.code;
    }
    const test = (tests || []).find(t => t._id === testId);
    return test?.code || t('N/A');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "recorded":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "delivered":
        return <Send className="h-4 w-4 text-purple-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "recorded":
        return "bg-orange-100 text-orange-800";
      case "verified":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return t('0 Bytes');
    const k = 1024;
    const sizes = [t('Bytes'), t('KB'), t('MB'), t('GB')];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleViewReport = async (reportId: string) => {
    setViewReportId(reportId);
    setIsViewModalOpen(true);
  };

  const handleEditReport = (report: TestReport) => {
    setSelectedReport(report);
    setIsEditModalOpen(true);
  };

  const handlePrintReport = async (reportId: string) => {
    try {
      // First fetch the report details
      const report = await apiService.getTestReport(reportId);
      
      // Create a print-friendly version
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const patientName = typeof report.patientId === 'object' 
          ? `${report.patientId.first_name} ${report.patientId.last_name}`
          : report.patientName;
        
        const testName = typeof report.testId === 'object'
          ? report.testId.name
          : report.testName;

        printWindow.document.write(`
          <html>
            <head>
              <title>${t('Test Report')} - ${report.reportNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                .section { margin: 15px 0; }
                .label { font-weight: bold; }
                .results { background: #f5f5f5; padding: 10px; margin: 10px 0; }
                table { width: 100%; border-collapse: collapse; }
                td, th { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${t('Laboratory Test Report')}</h1>
                <h2>${t('Report Number:')}: ${report.reportNumber}</h2>
              </div>
              
              <div class="section">
                <h3>${t('Patient Information')}</h3>
                <table>
                  <tr><td class="label">${t('Name:')}:</td><td>${patientName}</td></tr>
                  <tr><td class="label">${t('Age:')}:</td><td>${report.patientAge} ${t('years')}</td></tr>
                  <tr><td class="label">${t('Gender:')}:</td><td>${report.patientGender}</td></tr>
                </table>
              </div>

              <div class="section">
                <h3>${t('Test Information')}</h3>
                <table>
                  <tr><td class="label">${t('Test Name:')}:</td><td>${testName}</td></tr>
                  <tr><td class="label">${t('Test Code:')}:</td><td>${report.testCode}</td></tr>
                  <tr><td class="label">${t('Category:')}:</td><td>${report.category}</td></tr>
                  <tr><td class="label">${t('External Vendor:')}:</td><td>${report.externalVendor}</td></tr>
                  <tr><td class="label">${t('Test Date:')}:</td><td>${new Date(report.testDate).toLocaleDateString()}</td></tr>
                  <tr><td class="label">${t('Recorded By:')}:</td><td>${report.recordedBy}</td></tr>
                </table>
              </div>

              ${report.results ? `
                <div class="section">
                  <h3>${t('Test Results')}</h3>
                  <div class="results">${
                    typeof report.results === 'object' 
                      ? (report.results.value !== undefined && report.results.unit !== undefined 
                          ? `${report.results.value} ${report.results.unit}`
                          : JSON.stringify(report.results, null, 2))
                      : report.results
                  }</div>
                </div>
              ` : ''}

              ${report.interpretation ? `
                <div class="section">
                  <h3>${t('Clinical Interpretation')}</h3>
                  <div class="results">${report.interpretation}</div>
                </div>
              ` : ''}

              ${report.notes ? `
                <div class="section">
                  <h3>${t('Additional Notes')}</h3>
                  <div class="results">${report.notes}</div>
                </div>
              ` : ''}

              <div class="section" style="margin-top: 40px; text-align: center; font-size: 12px;">
                <p>${t('Generated on')} ${new Date().toLocaleDateString()} ${t('at')} ${new Date().toLocaleTimeString()}</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }

      toast({
        title: t("Print Initiated"),
        description: t("Report has been sent to printer."),
      });
    } catch (error: any) {
      console.error('Error printing report:', error);
      toast({
        title: t("Error"),
        description: t("Failed to print report. Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleSendReport = async (reportId: string) => {
    try {
      // Get the report first to get patient email
      const report = await apiService.getTestReport(reportId);
      
      // For now, just copy the view link to clipboard
      const reportUrl = `${window.location.origin}/test-reports/${reportId}`;
      await navigator.clipboard.writeText(reportUrl);
      
      toast({
        title: t("Report Link Copied"),
        description: t("Report link has been copied to clipboard. You can share this with the patient."),
      });

      // TODO: In a real implementation, you would:
      // 1. Send email to patient with the report
      // 2. Send SMS notification
      // 3. Update report status to delivered
      // await apiService.sendTestReportToPatient(reportId);
      
    } catch (error: any) {
      console.error('Error sending report:', error);
      toast({
        title: t("Error"),
        description: t("Failed to send report. Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleVerifyReport = async (reportId: string) => {
    try {
      await verifyMutation.mutateAsync(reportId);
      toast({
        title: t("Success"),
        description: t("Test report verified successfully."),
      });
    } catch (err: any) {
      console.error('Error verifying test report:', err);
      toast({
        title: t("Error"),
        description: err.response?.data?.message || t("Failed to verify test report."),
        variant: "destructive",
      });
    }
  };

  const handleDeliverReport = async (reportId: string) => {
    try {
      await deliverMutation.mutateAsync(reportId);
      toast({
        title: t("Success"),
        description: t("Test report delivered successfully."),
      });
    } catch (err: any) {
      console.error('Error delivering test report:', err);
      toast({
        title: t("Error"),
        description: err.response?.data?.message || t("Failed to deliver test report."),
        variant: "destructive",
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm(t("Are you sure you want to delete this test report?"))) return;

    try {
      await deleteMutation.mutateAsync(reportId);
      toast({
        title: t("Success"),
        description: t("Test report deleted successfully."),
      });
    } catch (err: any) {
      console.error('Error deleting test report:', err);
      toast({
        title: t("Error"),
        description: err.response?.data?.message || t("Failed to delete test report."),
        variant: "destructive",
      });
    }
  };

  const handleRecordReport = () => {
    setIsRecordModalOpen(true);
  };

  const handleReportRecorded = () => {
    setIsRecordModalOpen(false);
    refetchReports();
  };

  const handleReportUpdated = () => {
    setIsEditModalOpen(false);
    setSelectedReport(null);
    refetchReports();
  };

  // Table column configuration
  const columns = [
    {
      key: "reportNumber",
      label: t("Report Details"),
      render: (report: TestReport) => (
        <div>
          <div className="font-medium">{report.reportNumber}</div>
          <div className="text-sm text-muted-foreground">
            {t('Recorded:')}: {report.recordedDate ? formatDate(report.recordedDate) : t('Not recorded')}
          </div>
        </div>
      ),
    },
    {
      key: "patientId",
      label: t("Patient"),
      render: (report: TestReport) => (
        <div>
          <div className="font-medium">{getPatientName(report.patientId)}</div>
          <div className="text-sm text-muted-foreground flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>{t('Patient')}</span>
          </div>
        </div>
      ),
    },
    {
      key: "testId",
      label: t("Test"),
      render: (report: TestReport) => (
        <div>
          <div className="font-medium">{getTestName(report.testId)}</div>
          <div className="text-sm text-muted-foreground">
            {t('Code:')}: {getTestCode(report.testId)}
          </div>
        </div>
      ),
    },
    {
      key: "externalVendor",
      label: t("Vendor"),
      render: (report: TestReport) => (
        <span className="text-sm">
          {report.externalVendor || t('Internal')}
        </span>
      ),
    },
    {
      key: "testDate",
      label: t("Test Date"),
      render: (report: TestReport) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{formatDate(report.testDate)}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: t("Status"),
      render: (report: TestReport) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(report.status)}
          <Badge className={getStatusColor(report.status)}>
            {report.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      ),
    },
    {
      key: "attachments",
      label: t("Attachments"),
      render: (report: TestReport) => (
        report.attachments && report.attachments.length > 0 ? (
          <div className="flex items-center space-x-1">
            <FileImage className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{report.attachments.length}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">{t('None')}</span>
        )
      ),
    },
  ];

  // Mobile card configuration
  const mobileCard = {
    title: (report: TestReport) => (
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-base">{report.reportNumber}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {getPatientName(report.patientId)}
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {getStatusIcon(report.status)}
          <Badge className={`${getStatusColor(report.status)} text-xs`}>
            {report.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>
    ),
    content: (report: TestReport) => (
      <div className="space-y-3 mt-3">
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center space-x-2 text-sm">
            <TestTube2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium">{getTestName(report.testId)}</span>
            <span className="text-muted-foreground">({getTestCode(report.testId)})</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>{t('Test Date:')}: {formatDate(report.testDate)}</span>
          </div>

          {report.externalVendor && (
            <div className="flex items-center space-x-2 text-sm">
              <Microscope className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{t('Vendor:')}: {report.externalVendor}</span>
            </div>
          )}

          {report.attachments && report.attachments.length > 0 && (
            <div className="flex items-center space-x-2 text-sm">
              <FileImage className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{report.attachments.length} {t('attachment(s)')}</span>
            </div>
          )}

          {report.recordedDate && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>{t('Recorded:')}: {formatDate(report.recordedDate)}</span>
            </div>
          )}
        </div>
      </div>
    ),
    actions: (report: TestReport) => {
      const actions = [
        {
          label: t("View Report"),
          onClick: () => handleViewReport(report._id),
          icon: Eye,
        },
        {
          label: t("Edit Report"),
          onClick: () => handleEditReport(report),
          icon: Edit2,
        },
        {
          label: t("Print Report"),
          onClick: () => handlePrintReport(report._id),
          icon: Printer,
        },
        {
          label: t("Send to Patient"),
          onClick: () => handleSendReport(report._id),
          icon: Send,
        },
      ];

      if (report.status === 'recorded') {
        actions.push({
          label: t("Verify Report"),
          onClick: () => handleVerifyReport(report._id),
          icon: CheckCircle,
        });
      }

      if (report.status === 'verified') {
        actions.push({
          label: t("Mark as Delivered"),
          onClick: () => handleDeliverReport(report._id),
          icon: Send,
        });
      }

      actions.push({
                  label: t("Delete Report"),
        onClick: () => handleDeleteReport(report._id),
        icon: XCircle,
      });

      return (
        <MobileActionDropdown
          actions={actions}
        />
      );
    },
  };

  if (isLoading && testReports.length === 0) {
    return (
      <ResponsiveContainer>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>{t('Loading test reports...')}</span>
          </div>
        </div>
      </ResponsiveContainer>
    );
  }

  if (error && testReports.length === 0) {
    return (
      <ResponsiveContainer>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('Error Loading Test Reports')}</h3>
            <p className="text-gray-600 mb-4">{error?.message || t('An error occurred')}</p>
            <Button onClick={() => refetchReports()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('Try Again')}
            </Button>
          </div>
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer className="space-y-6">
      {/* Header */}
      <ResponsiveHeader
        title={t("Test Reports")}
        subtitle={t("Manage laboratory test reports and results")}
        actions={
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t('Refresh')}
            </Button>
            <RecordTestReportModal 
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('Record Report')}
                </Button>
              }
              onReportRecorded={handleReportRecorded}
            />
          </div>
        }
      />

      {/* Stats Cards */}
      <ResponsiveGrid columns={4} className="gap-4">
        <ResponsiveStatsCard
          title={t("Total Reports")}
          value={stats.totalReports}
          icon={FileText}
          subtitle={`${stats.verifiedReports} ${t('verified')}`}
        />
        <ResponsiveStatsCard
          title={t("Pending")}
          value={stats.pendingReports}
          icon={Clock}
          subtitle={t("Awaiting processing")}
        />
        <ResponsiveStatsCard
          title={t("Recorded")}
          value={stats.recordedReports}
          icon={AlertTriangle}
          subtitle={t("Being processed")}
        />
        <ResponsiveStatsCard
          title={t("Delivered")}
          value={stats.deliveredReports}
          icon={CheckCircle}
          subtitle={t("Completed reports")}
        />
      </ResponsiveGrid>

      {/* Filters */}
      <Card>
        <CardContent className="form-responsive">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("Search reports...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder={t("Status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("All Status")}</SelectItem>
                  <SelectItem value="pending">{t("Pending")}</SelectItem>
                  <SelectItem value="recorded">{t("Recorded")}</SelectItem>
                  <SelectItem value="verified">{t("Verified")}</SelectItem>
                  <SelectItem value="delivered">{t("Delivered")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Test Reports")} ({totalItems})</CardTitle>
          <CardDescription>
            {t("A list of all laboratory test reports and their status.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveTable
            data={testReports || []}
            columns={columns}
            mobileCard={mobileCard}
            loading={isLoading}
            emptyMessage={
              searchTerm || selectedStatus !== "all" || selectedVendor !== "all" 
                ? t("No test reports found. Try adjusting your filters.") 
                : t("No test reports found. Record your first test report to get started.")
            }
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            {t('Showing')} {((currentPage - 1) * pageSize) + 1} {t('to')} {Math.min(currentPage * pageSize, totalItems)} {t('of')} {totalItems} {t('reports')}
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {t('Previous')}
            </Button>
            <div className="text-sm px-2">
              {t('Page')} {currentPage} {t('of')} {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {t('Next')}
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedReport && (
        <EditTestReportModal
          report={selectedReport}
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedReport(null);
          }}
          onReportUpdated={handleReportUpdated}
        />
      )}

      <ViewTestReportModal
        reportId={viewReportId}
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewReportId(null);
        }}
      />
    </ResponsiveContainer>
  );
};

export default TestReports;
