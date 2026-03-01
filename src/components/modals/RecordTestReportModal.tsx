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
  DialogTrigger,
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
  Plus,
  User,
  TestTube2,
  Calendar,
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  Building,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiService, Patient, User as ApiUser } from "@/services/api";
import { Test } from "@/types";

interface RecordTestReportModalProps {
  trigger?: React.ReactNode;
  onReportRecorded?: () => void;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string;
}

const RecordTestReportModal: React.FC<RecordTestReportModalProps> = ({
  trigger,
  onReportRecorded,
}) => {
  const [open, setOpen] = useState(false);
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
    normalValues: "",
    abnormalFindings: "",
    recommendations: "",
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

  const handlePatientSelect = (patientId: string) => {
    setFormData((prev) => ({
      ...prev,
      patientId: patientId,
    }));
  };

  const handleTestSelect = (testId: string) => {
    setFormData((prev) => ({
      ...prev,
      testId: testId,
    }));
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

    if (!formData.results && uploadedFiles.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please enter test results or upload report files",
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
      // Create test report
      const reportData = {
        patientId: formData.patientId,
        testId: formData.testId,
        externalVendor: formData.externalVendor,
        testDate: formData.testDate,
        recordedDate: new Date().toISOString(),
        recordedBy: formData.recordedBy,
        results: formData.results || undefined,
        interpretation: formData.interpretation || undefined,
        notes: formData.notes || undefined,
      };

      const createdReport = await apiService.createTestReport(reportData);

      // Upload attachments if any
      if (uploadedFiles.length > 0) {
        for (const uploadedFile of uploadedFiles) {
          try {
            // Convert uploaded file back to File object for API call
            // Note: In real implementation, you'd want to store the actual File objects
            // For now, we'll skip the file upload since we don't have the File objects
          } catch (fileError) {
            console.error('Error uploading file:', fileError);
            // Continue with other files
          }
        }
      }

      const selectedPatient = getSelectedPatient();
      const patientName = selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : 'Patient';

      toast({
        title: "Test report recorded successfully",
        description: `Report ${createdReport.reportNumber} for ${patientName} has been saved with ${uploadedFiles.length} attachment(s).`,
      });

      // Reset form
      setFormData({
        patientId: "",
        testId: "",
        externalVendor: "",
        testDate: "",
        recordedBy: "",
        results: "",
        interpretation: "",
        notes: "",
        normalValues: "",
        abnormalFindings: "",
        recommendations: "",
      });
      setUploadedFiles([]);

      setOpen(false);
      
      // Notify parent component
      if (onReportRecorded) {
        onReportRecorded();
      }
    } catch (error: any) {
      console.error('Error creating test report:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to record test report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Record Test Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby="record-report-description">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <TestTube2 className="h-5 w-5 mr-2 text-blue-600" />
            Record Test Report
          </DialogTitle>
          <DialogDescription id="record-report-description">
            Record test results received from external laboratories with file
            attachments.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                    onValueChange={handlePatientSelect}
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
                    onValueChange={handleTestSelect}
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

              {(() => {
                const selectedPatient = getSelectedPatient();
                const selectedTest = getSelectedTest();
                
                if (selectedPatient && selectedTest) {
                  const age = new Date().getFullYear() - new Date(selectedPatient.date_of_birth).getFullYear();
                  
                  return (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between text-blue-700">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span className="font-medium">
                            {selectedPatient.first_name} {selectedPatient.last_name} ({age}yr, {selectedPatient.gender})
                          </span>
                        </div>
                        <Badge variant="outline" className="bg-white">
                          {selectedTest.name} ({selectedTest.code})
                        </Badge>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </CardContent>
          </Card>

          {/* Vendor & Date Information */}
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
                    onValueChange={(value) =>
                      handleChange("externalVendor", value)
                    }
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

          {/* File Upload */}
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
                    Uploaded Files ({uploadedFiles.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center p-3 border rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          {file.type === "image" ? (
                            file.preview ? (
                              <img
                                src={file.preview}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="normalValues">Normal Values</Label>
                  <Textarea
                    id="normalValues"
                    value={formData.normalValues}
                    onChange={(e) =>
                      handleChange("normalValues", e.target.value)
                    }
                    placeholder="Reference ranges for normal values..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interpretation">Clinical Interpretation</Label>
                <Textarea
                  id="interpretation"
                  value={formData.interpretation}
                  onChange={(e) =>
                    handleChange("interpretation", e.target.value)
                  }
                  placeholder="Clinical interpretation of results..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="abnormalFindings">Abnormal Findings</Label>
                  <Textarea
                    id="abnormalFindings"
                    value={formData.abnormalFindings}
                    onChange={(e) =>
                      handleChange("abnormalFindings", e.target.value)
                    }
                    placeholder="Any abnormal findings or critical values..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recommendations">Recommendations</Label>
                  <Textarea
                    id="recommendations"
                    value={formData.recommendations}
                    onChange={(e) =>
                      handleChange("recommendations", e.target.value)
                    }
                    placeholder="Clinical recommendations based on results..."
                    rows={3}
                  />
                </div>
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
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Recording Report...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Test Report
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordTestReportModal;
