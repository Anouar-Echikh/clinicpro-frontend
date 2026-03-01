import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  User,
  TestTube2,
  Calendar,
  FileText,
  Image as ImageIcon,
  Building,
  Loader2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  XCircle,
  Download,
  Printer,
  Share,
  MapPin,
  Phone,
  Mail,
  Stethoscope,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { TestReport } from "@/types";

interface ViewTestReportModalProps {
  reportId: string | null;
  open: boolean;
  onClose: () => void;
}

const ViewTestReportModal: React.FC<ViewTestReportModalProps> = ({
  reportId,
  open,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<TestReport | null>(null);

  useEffect(() => {
    if (reportId && open) {
      fetchReport();
    }
  }, [reportId, open]);

  const fetchReport = async () => {
    if (!reportId) return;
    
    setLoading(true);
    try {
      const fetchedReport = await apiService.getTestReport(reportId);
      setReport(fetchedReport);
    } catch (error: any) {
      console.error('Error fetching test report:', error);
      toast({
        title: "Error",
        description: "Failed to load test report details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTestResults = (results: any) => {
    if (!results) return '';
    
    if (typeof results === 'string') {
      return results;
    }
    
    if (typeof results === 'object') {
      // Handle common result object formats
      if (results.value !== undefined && results.unit !== undefined) {
        return `${results.value} ${results.unit}`;
      }
      
      // For complex objects, format as JSON
      return JSON.stringify(results, null, 2);
    }
    
    return String(results);
  };

  const getPatientName = () => {
    if (!report) return 'Unknown Patient';
    if (typeof report.patientId === 'object' && report.patientId !== null) {
      return `${report.patientId.first_name} ${report.patientId.last_name}`;
    }
    return report.patientName || 'Unknown Patient';
  };

  const getPatientDetails = () => {
    if (!report || typeof report.patientId !== 'object' || !report.patientId) {
      return null;
    }
    return report.patientId;
  };

  const getTestName = () => {
    if (!report) return 'Unknown Test';
    if (typeof report.testId === 'object' && report.testId !== null) {
      return report.testId.name;
    }
    return report.testName || 'Unknown Test';
  };

  const getTestDetails = () => {
    if (!report || typeof report.testId !== 'object' || !report.testId) {
      return null;
    }
    return report.testId;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Download functionality will be available soon.",
    });
  };

  const handleShare = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Share functionality will be available soon.",
    });
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl" aria-describedby="loading-description">
          <DialogHeader>
            <DialogTitle>
              <span className="sr-only">Loading Test Report</span>
            </DialogTitle>
            <DialogDescription id="loading-description">
              Please wait while we load the test report details.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center h-96">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading test report...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!report) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl" aria-describedby="error-description">
          <DialogHeader>
            <DialogTitle>Test Report Not Found</DialogTitle>
            <DialogDescription id="error-description">
              The requested test report could not be loaded or does not exist.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Report Not Found</h3>
            <p className="text-gray-600">The requested test report could not be found.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const patientDetails = getPatientDetails();
  const testDetails = getTestDetails();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby="view-report-description">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center">
              <Eye className="h-5 w-5 mr-2 text-blue-600" />
              Test Report - {report.reportNumber}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription id="view-report-description">
            Detailed view of test report and results.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 print:space-y-4">
          {/* Report Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Report Overview</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(report.status)}
                  <Badge className={getStatusColor(report.status)}>
                    {report.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Report Number</div>
                  <div className="text-lg font-semibold">{report.reportNumber}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Test Date</div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{formatDate(report.testDate)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Recorded Date</div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{report.recordedDate ? formatDate(report.recordedDate) : 'Not recorded'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Patient Name</div>
                    <div className="text-lg font-semibold">{getPatientName()}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Age</div>
                      <div>{report.patientAge} years</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Gender</div>
                      <div className="capitalize">{report.patientGender}</div>
                    </div>
                  </div>
                </div>
                {patientDetails && (
                  <div className="space-y-3">
                    {patientDetails.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{patientDetails.phone}</span>
                      </div>
                    )}
                    {patientDetails.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{patientDetails.email}</span>
                      </div>
                    )}
                    {patientDetails.address && (
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                        <span className="text-sm">{patientDetails.address}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TestTube2 className="h-4 w-4 mr-2" />
                Test Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Test Name</div>
                    <div className="text-lg font-semibold">{getTestName()}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Test Code</div>
                      <div>{report.testCode}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Category</div>
                      <div>{report.category}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-500">External Vendor</div>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{report.externalVendor}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Recorded By</div>
                    <div className="flex items-center">
                      <Stethoscope className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{report.recordedBy}</span>
                    </div>
                  </div>
                  {testDetails && (
                    <>
                      {testDetails.normalRange && (
                        <div>
                          <div className="text-sm font-medium text-gray-500">Normal Range</div>
                          <div className="text-sm">{testDetails.normalRange}</div>
                        </div>
                      )}
                      {testDetails.units && (
                        <div>
                          <div className="text-sm font-medium text-gray-500">Units</div>
                          <div className="text-sm">{testDetails.units}</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          {(report.results || report.interpretation) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.results && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Results</div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {formatTestResults(report.results)}
                      </pre>
                    </div>
                  </div>
                )}
                {report.interpretation && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Clinical Interpretation</div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm">{report.interpretation}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          {report.attachments && report.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Attachments ({report.attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-shrink-0">
                        {attachment.type.includes("image") ? (
                          <ImageIcon className="h-10 w-10 text-blue-500" />
                        ) : (
                          <FileText className="h-10 w-10 text-red-500" />
                        )}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {attachment.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(attachment.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(attachment.url, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {report.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-sm">{report.notes}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Information */}
          {(report.verifiedBy || report.verifiedDate) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Verification Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.verifiedBy && (
                    <div>
                      <div className="text-sm font-medium text-gray-500">Verified By</div>
                      <div>{report.verifiedBy}</div>
                    </div>
                  )}
                  {report.verifiedDate && (
                    <div>
                      <div className="text-sm font-medium text-gray-500">Verified Date</div>
                      <div>{formatDate(report.verifiedDate)}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator className="my-6" />

        {/* Footer */}
        <div className="flex justify-end space-x-3 print:hidden">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewTestReportModal; 