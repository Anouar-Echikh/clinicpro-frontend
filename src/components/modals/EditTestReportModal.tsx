import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Edit2,
  User,
  TestTube2,
  Calendar,
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  Building,
  Loader2,
  Save,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiService, Patient, User as ApiUser } from "@/services/api";
import { Test, TestReport } from "@/types";

interface EditTestReportModalProps {
  report: TestReport;
  open: boolean;
  onClose: () => void;
  onReportUpdated?: () => void;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  preview?: string;
}

const EditTestReportModal: React.FC<EditTestReportModalProps> = ({
  report,
  open,
  onClose,
  onReportUpdated,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  // Data states
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  
  const [formData, setFormData] = useState({
    patientId: "",
    testId: "",
    externalVendor: "",
    testDate: "",
    recordedBy: "",
    results: "",
    interpretation: "",
    notes: "",
    status: "",
  });

  // External vendors data
  const externalVendors = [
    "City Lab Services",
    "Advanced Diagnostics", 
    "Metro Lab Center",
    "Specialist Lab Solutions",
    "Prime Pathology Labs",
    "Central Medical Lab",
    "Quick Test Center",
    "Elite Diagnostics",
  ];

  // Initialize form data when report changes
  useEffect(() => {
    if (report && open) {
      setFormData({
        patientId: typeof report.patientId === 'object' ? report.patientId._id : report.patientId,
        testId: typeof report.testId === 'object' ? report.testId._id : report.testId,
        externalVendor: report.externalVendor || "",
        testDate: report.testDate ? new Date(report.testDate).toISOString().split('T')[0] : "",
        recordedBy: report.recordedBy || "",
        results: report.results || "",
        interpretation: report.interpretation || "",
        notes: report.notes || "",
        status: report.status || "pending",
      });

      // Set existing attachments
      if (report.attachments) {
        setUploadedFiles(report.attachments.map(att => ({
          id: att.id,
          name: att.name,
          type: att.type.includes("image") ? "image" : "document",
          size: att.size,
          url: att.url,
        })));
      }
    }
  }, [report, open]);

  // Fetch data when modal opens
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const [patientsResponse, testsResponse, usersResponse] = await Promise.all([
        apiService.getPatients({ limit: 100 }),
        apiService.getTests({ limit: 100, is_active: true }),
        apiService.getUsers({ limit: 100 }),
      ]);

      setPatients(patientsResponse.data?.patients || []);
      setTests(testsResponse.data?.items || []);
      setUsers(usersResponse.data?.users || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load required data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getSelectedPatient = () => {
    return patients.find(p => p._id === formData.patientId);
  };

  const getSelectedTest = () => {
    return tests.find(t => t._id === formData.testId);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          toast({
            title: "File too large",
            description: `${file.name} is larger than 10MB`,
            variant: "destructive",
          });
          return;
        }

        const newFile: UploadedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type.includes("image") ? "image" : "document",
          size: file.size,
        };

        // Create preview for images
        if (file.type.includes("image")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            newFile.preview = e.target?.result as string;
            setUploadedFiles((prev) => [...prev, newFile]);
          };
          reader.readAsDataURL(file);
        } else {
          setUploadedFiles((prev) => [...prev, newFile]);
        }
      });
    }
  };

  const removeFile = (fileId: string) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    
    if (fileToRemove?.url) {
      // If file has URL, it's an existing attachment - remove from server
      apiService.removeTestReportAttachment(report._id, fileId).catch(error => {
        console.error('Error removing attachment:', error);
        toast({
          title: "Warning",
          description: "Failed to remove attachment from server",
          variant: "destructive",
        });
      });
    }
    
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateForm = () => {
    const required = [
      "patientId",
      "testId", 
      "externalVendor",
      "testDate",
      "recordedBy",
    ];
    const missing = required.filter(
      (field) => !formData[field as keyof typeof formData],
    );

    if (missing.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${missing.join(", ")}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Update test report
      const reportData = {
        patientId: formData.patientId,
        testId: formData.testId,
        externalVendor: formData.externalVendor,
        testDate: formData.testDate,
        recordedBy: formData.recordedBy,
        results: formData.results || undefined,
        interpretation: formData.interpretation || undefined,
        notes: formData.notes || undefined,
        status: formData.status,
      };

      await apiService.updateTestReport(report._id, reportData);

      const selectedPatient = getSelectedPatient();
      const patientName = selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : 'Patient';

      toast({
        title: "Test report updated successfully",
        description: `Report ${report.reportNumber} for ${patientName} has been updated.`,
      });

      onClose();
      
      // Notify parent component
      if (onReportUpdated) {
        onReportUpdated();
      }
    } catch (error: any) {
      console.error('Error updating test report:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update test report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-report-description">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Edit2 className="h-5 w-5 mr-2 text-blue-600" />
            Edit Test Report - {report?.reportNumber}
          </DialogTitle>
          <DialogDescription id="edit-report-description">
            Update test report information and results.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Report Status</span>
                <Badge className={getStatusColor(formData.status)}>
                  {formData.status.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="recorded">Recorded</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Patient & Test Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-4 w-4 mr-2" />
                Patient & Test Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient *</Label>
                  <Select
                    value={formData.patientId}
                    onValueChange={(value) => handleChange("patientId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataLoading ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading patients...
                        </div>
                      ) : (
                        patients.map((patient) => (
                          <SelectItem key={patient._id} value={patient._id}>
                            {patient.first_name} {patient.last_name} - {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()}yr, {patient.gender}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test">Test *</Label>
                  <Select
                    value={formData.testId}
                    onValueChange={(value) => handleChange("testId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select test" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataLoading ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading tests...
                        </div>
                      ) : (
                        tests.map((test) => (
                          <SelectItem key={test._id} value={test._id}>
                            {test.name} ({test.code})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Test Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="externalVendor">External Vendor *</Label>
                  <Select
                    value={formData.externalVendor}
                    onValueChange={(value) => handleChange("externalVendor", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {externalVendors.map((vendor) => (
                        <SelectItem key={vendor} value={vendor}>
                          {vendor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testDate">Test Date *</Label>
                  <Input
                    id="testDate"
                    type="date"
                    value={formData.testDate}
                    onChange={(e) => handleChange("testDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recordedBy">Recorded By *</Label>
                  <Select
                    value={formData.recordedBy}
                    onValueChange={(value) => handleChange("recordedBy", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataLoading ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading users...
                        </div>
                      ) : (
                        users.map((user) => (
                          <SelectItem key={user._id} value={`${user.first_name} ${user.last_name}`}>
                            {user.first_name} {user.last_name} ({user.role})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Report Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="fileUpload"
                />
                <label htmlFor="fileUpload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, JPG, PNG, DOC files up to 10MB
                    </p>
                  </div>
                </label>
              </div>

              {/* Uploaded Files Display */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">
                    Attachments ({uploadedFiles.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center p-3 border rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          {file.type === "image" ? (
                            file.preview || file.url ? (
                              <img
                                src={file.preview || file.url}
                                alt={file.name}
                                className="h-10 w-10 object-cover rounded"
                              />
                            ) : (
                              <ImageIcon className="h-10 w-10 text-blue-500" />
                            )
                          ) : (
                            <FileText className="h-10 w-10 text-red-500" />
                          )}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          className="ml-2 flex-shrink-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TestTube2 className="h-4 w-4 mr-2" />
                Test Results & Interpretation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="results">Test Results</Label>
                <Textarea
                  id="results"
                  value={formData.results}
                  onChange={(e) => handleChange("results", e.target.value)}
                  placeholder="Enter detailed test results..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interpretation">Clinical Interpretation</Label>
                <Textarea
                  id="interpretation"
                  value={formData.interpretation}
                  onChange={(e) => handleChange("interpretation", e.target.value)}
                  placeholder="Clinical interpretation of results..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Any additional notes or observations..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating Report...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Report
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTestReportModal; 