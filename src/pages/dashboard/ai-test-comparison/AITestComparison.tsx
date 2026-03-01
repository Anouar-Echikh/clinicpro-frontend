import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Patient } from "@/types";
import { apiService, type AITestComparison, type AITestComparisonStats, type ParameterComparison } from "@/services/api";
import { ResponsiveTable } from "@/components/ui/table";
import {
  Upload,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  MoreVertical,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  FileImage,
  Loader2,
  RefreshCw,
  Microscope,
  AlertTriangle,
  Plus,
  X
} from "lucide-react";

const AITestComparison: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [comparisonName, setComparisonName] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentComparison, setCurrentComparison] = useState<AITestComparison | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [patients, setPatients] = useState<any[]>([]);
  
  // Comparison management
  const [comparisons, setComparisons] = useState<AITestComparison[]>([]);
  const [comparisonStats, setComparisonStats] = useState<AITestComparisonStats | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [viewModalComparison, setViewModalComparison] = useState<AITestComparison | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [comparisonToDelete, setComparisonToDelete] = useState<AITestComparison | null>(null);
  
  // Polling management
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Stop polling function
  const stopPolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  }, []);

  // File upload handlers
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFilesSelected(files);
  }, []);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const validFiles = newFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: t("Invalid File Type"),
          description: `${file.name} is not supported. Only JPEG, PNG, and PDF files are allowed.`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    // Check total number of files (max 10)
    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > 10) {
      toast({
        title: t("Too Many Files"),
        description: t("Maximum 10 test reports can be compared at once."),
        variant: "destructive",
      });
      return;
    }

    // Check minimum files (at least 2)
    const updatedFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(updatedFiles);

    if (updatedFiles.length >= 2) {
      toast({
        title: t("Files Ready"),
        description: `${updatedFiles.length} files selected for comparison.`,
      });
    }
  }, [selectedFiles, t, toast]);

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
  };

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const files = Array.from(event.dataTransfer.files);
    handleFilesSelected(files);
  }, [handleFilesSelected]);

  // Fetch patients for selection
  const fetchPatients = useCallback(async () => {
    try {
      const result = await apiService.getPatients();
      const patientsList = result.data?.patients || [];
      setPatients(patientsList);
    } catch (error: any) {
      console.error('Fetch patients error:', error);
      toast({
        title: t("Error Loading Patients"),
        description: t("Could not load patients list."),
        variant: "destructive",
      });
    }
  }, [t, toast]);

  // Fetch comparisons and stats (optimized with stable dependencies)
  const fetchComparisons = useCallback(async (filterStatus?: string) => {
    try {
      setIsLoading(true);
      const currentFilter = filterStatus ?? statusFilter;
      const [comparisonsResponse, statsResponse] = await Promise.all([
        apiService.getAITestComparisons({ 
          status: currentFilter === 'all' ? undefined : currentFilter,
          limit: 50 
        }),
        apiService.getAITestComparisonStats()
      ]);
      
      setComparisons(comparisonsResponse.comparisons);
      setComparisonStats(statsResponse);
    } catch (error: any) {
      console.error('Fetch comparisons error:', error);
      toast({
        title: t("Error Loading Comparisons"),
        description: t("Could not load comparison history."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [t, toast]); // Removed statusFilter to make it more stable
  
  // Debounced fetch function to prevent rapid API calls
  const debouncedFetchComparisons = useCallback((filterStatus: string) => {
    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new debounced call
    debounceTimeoutRef.current = setTimeout(() => {
      fetchComparisons(filterStatus);
    }, 300); // 300ms debounce
  }, [fetchComparisons]);

  useEffect(() => {
    fetchPatients();
    fetchComparisons();
  }, []); // Remove dependencies to prevent infinite loops
  
  // Separate effect for status filter changes (with debounce)
  useEffect(() => {
    debouncedFetchComparisons(statusFilter);
  }, [statusFilter, debouncedFetchComparisons]);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
    };
  }, []);

  // Handle comparison submission
  const handleCompareReports = async () => {
    if (selectedFiles.length < 2) {
      toast({
        title: t("Insufficient Files"),
        description: t("Please select at least 2 test reports for comparison."),
        variant: "destructive",
      });
      return;
    }

    if (!selectedPatient) {
      toast({
        title: t("Patient Required"),
        description: t("Please select a patient for the comparison."),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);

      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('test_reports', file);
      });
      formData.append('patient_id', selectedPatient);
      formData.append('comparison_name', comparisonName || `Test Comparison - ${new Date().toLocaleDateString()}`);
      if (customPrompt) {
        formData.append('custom_prompt', customPrompt);
      }

      setUploadProgress(30);

      const response = await apiService.compareTestReports(formData);
      
      setUploadProgress(50);
      
      toast({
        title: t("Comparison Started"),
        description: t("AI is analyzing your test reports. This may take a few minutes."),
      });

      // Start polling for results
      const comparisonId = response.comparison_id;
      pollComparisonStatus(comparisonId);

    } catch (error: any) {
      setIsUploading(false);
      setUploadProgress(0);
      
      console.error('Comparison error:', error);
      toast({
        title: t("Comparison Failed"),
        description: error.response?.data?.message || t("Failed to start comparison."),
        variant: "destructive",
      });
    }
  };

  // Poll comparison status with proper cleanup
  const pollComparisonStatus = async (comparisonId: string, attempts = 0) => {
    // Clear any existing timeout
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    
    if (attempts > 30) { // Max 10 minutes of polling (30 * 20 seconds)
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: t("Comparison Timeout"),
        description: t("The comparison is taking longer than expected. Please check back later."),
        variant: "destructive",
      });
      return;
    }

    try {
      const comparison = await apiService.getAITestComparisonById(comparisonId);
      
      if (comparison.status === 'completed') {
        setCurrentComparison(comparison);
        setShowResults(true);
        setIsUploading(false);
        setUploadProgress(100);
        
        toast({
          title: t("Comparison Complete"),
          description: t("Your test reports have been successfully compared!"),
        });

        // Clear form
        setSelectedFiles([]);
        setSelectedPatient("");
        setComparisonName("");
        setCustomPrompt("");
        
        // Refresh comparisons list
        fetchComparisons();
        
      } else if (comparison.status === 'failed') {
        setIsUploading(false);
        setUploadProgress(0);
        
        toast({
          title: t("Comparison Failed"),
          description: comparison.error_message || t("The comparison failed to process."),
          variant: "destructive",
        });
        
      } else {
        // Still processing, continue polling
        const progressMap = {
          'pending': 20,
          'processing': 60
        };
        setUploadProgress(progressMap[comparison.status as keyof typeof progressMap] || 70);
        
        // Poll again after 20 seconds (reduced frequency)
        pollingTimeoutRef.current = setTimeout(() => pollComparisonStatus(comparisonId, attempts + 1), 20000);
      }
      
    } catch (error) {
      console.error('Polling error:', error);
      // Continue polling even on error (with reduced frequency)
      pollingTimeoutRef.current = setTimeout(() => pollComparisonStatus(comparisonId, attempts + 1), 20000);
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-600" />;
      case 'fluctuating':
        return <BarChart3 className="w-4 h-4 text-orange-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Handle delete comparison
  const handleDeleteComparison = (comparison: AITestComparison) => {
    setComparisonToDelete(comparison);
    setShowDeleteModal(true);
  };

  const confirmDeleteComparison = async () => {
    if (!comparisonToDelete) return;

    try {
      await apiService.deleteAITestComparison(comparisonToDelete._id);
      
      toast({
        title: t("Comparison deleted"),
        description: t("AI test comparison has been successfully deleted."),
      });

      // Refresh the comparisons list
      await fetchComparisons();
      
      // If the deleted comparison was currently being viewed, clear it
      if (currentComparison?._id === comparisonToDelete._id) {
        setCurrentComparison(null);
        setShowResults(false);
      }

      // Close the modal
      setShowDeleteModal(false);
      setComparisonToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: t("Delete failed"),
        description: t("Could not delete the comparison. Please try again."),
        variant: "destructive",
      });
      setShowDeleteModal(false);
      setComparisonToDelete(null);
    }
  };

  // Generate comparison table data
  const getComparisonTableData = (comparison: AITestComparison) => {
    if (!comparison.parameter_comparisons) return [];

    const tableData = comparison.parameter_comparisons.map((param: ParameterComparison) => {
      const row: any = {
        parameter: param.parameter,
        unit: param.unit,
        reference_range: param.reference_range,
        trend: param.trend,
        trend_analysis: param.trend_analysis,
        is_concerning: param.is_concerning,
      };

      // Add values for each report date
      param.values.forEach((value, index) => {
        row[`report_${index}`] = {
          value: value.value,
          status: value.status,
          date: new Date(value.date).toLocaleDateString(),
          file_name: value.file_name
        };
      });

      return row;
    });

    return tableData;
  };

  // Generate table columns dynamically based on reports
  const getComparisonTableColumns = (comparison: AITestComparison) => {
    if (!comparison.individual_analyses) return [];

    const baseColumns = [
      {
        key: 'parameter',
        label: t('Parameter'),
        className: 'font-medium',
        render: (item: any) => (
          <div className="flex items-center gap-2">
            <span>{item.parameter}</span>
            {item.is_concerning && (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
          </div>
        )
      }
    ];

    // Add columns for each report
    const reportColumns = comparison.individual_analyses.map((analysis, index) => ({
      key: `report_${index}`,
      label: new Date(analysis.analysis_date).toLocaleDateString(),
      render: (item: any) => {
        const reportData = item[`report_${index}`];
        if (!reportData) return <span className="text-gray-400">-</span>;
        
        const statusColor = reportData.status === 'Normal' ? 'text-green-600' : 
                          reportData.status === 'High' ? 'text-red-600' : 
                          reportData.status === 'Low' ? 'text-orange-600' : 'text-red-600';
        
        return (
          <div className="text-center">
            <div className={`font-medium ${statusColor}`}>
              {reportData.value}
            </div>
            <div className="text-xs text-gray-500">
              {reportData.status}
            </div>
          </div>
        );
      }
    }));

    const trendColumn = {
      key: 'trend',
      label: t('Trend'),
      className: 'text-center',
      render: (item: any) => (
        <div className="flex items-center justify-center gap-2">
          {getTrendIcon(item.trend)}
          <span className="text-xs capitalize">{item.trend}</span>
        </div>
      )
    };

    return [...baseColumns, ...reportColumns, trendColumn];
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">{t("Loading AI test comparisons...")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Brain className="w-7 h-7 text-blue-600" />
            {t("Compare Test Reports using AI")}
          </h1>
          <p className="text-muted-foreground">
            {t("Upload multiple test reports to compare parameters across different dates")}
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Microscope className="w-3 h-3 mr-1" />
          {t("AI Powered")}
        </Badge>
      </div>

      <Tabs defaultValue="compare" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compare">{t("Compare Reports")}</TabsTrigger>
          <TabsTrigger value="history">{t("Comparison History")}</TabsTrigger>
        </TabsList>

        {/* Compare Reports Tab */}
        <TabsContent value="compare" className="space-y-6">
          {!showResults ? (
            <>
              {/* Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-blue-600" />
                    {t("Upload Test Reports")}
                  </CardTitle>
                  <CardDescription>
                    {t("Upload 2-10 test reports (PDF or Images) to compare parameters across different dates. For PDFs, first 5 pages are analyzed.")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* File Upload Area */}
                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">
                      {t("Drag and drop your test reports here")}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      {t("or click to browse files")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t("Supported formats: JPEG, PNG, PDF (max 15MB each, 2-10 files)")}
                    </p>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Selected Files Display */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label className="font-medium">{t("Selected Files")} ({selectedFiles.length})</Label>
                      <div className="grid gap-3">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              {file.type.includes('pdf') ? (
                                <FileText className="w-6 h-6 text-red-600" />
                              ) : (
                                <FileImage className="w-6 h-6 text-blue-600" />
                              )}
                              <div>
                                <p className="font-medium truncate max-w-xs">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Patient Selection */}
                  <div className="grid gap-2">
                    <Label htmlFor="patient">{t("Select Patient")} *</Label>
                    <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Choose a patient")} />
                      </SelectTrigger>
                      <SelectContent>
                        {patients && patients.length > 0 ? (
                          patients.map((patient) => (
                            <SelectItem key={patient.id || patient._id} value={patient.id || patient._id}>
                              {patient.firstName || patient.first_name} {patient.lastName || patient.last_name}
                              {patient.phone && ` - ${patient.phone}`}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-patients" disabled>
                            {t("No patients found")}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Comparison Name */}
                  <div className="grid gap-2">
                    <Label htmlFor="comparison-name">{t("Comparison Name")} ({t("Optional")})</Label>
                    <Input
                      id="comparison-name"
                      value={comparisonName}
                      onChange={(e) => setComparisonName(e.target.value)}
                      placeholder={t("e.g., Blood Tests - Q1 2024 vs Q2 2024")}
                    />
                  </div>

                  {/* Custom Prompt */}
                  <div className="grid gap-2">
                    <Label htmlFor="custom-prompt">{t("Custom Instructions")} ({t("Optional")})</Label>
                    <Textarea
                      id="custom-prompt"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder={t("Any specific instructions for the AI analysis and comparison...")}
                      rows={3}
                    />
                  </div>

                  {/* Progress Bar */}
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{t("Processing comparison...")}</span>
                        <span className="text-sm text-gray-500">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    onClick={handleCompareReports}
                    disabled={selectedFiles.length < 2 || !selectedPatient || isUploading}
                    className="w-full"
                    size="lg"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t("Comparing Reports...")}
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        {t("Compare Test Reports")}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Results Display */
            currentComparison && (
              <div className="space-y-6">
                {/* Results Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="w-5 h-5 text-blue-600" />
                          {currentComparison.comparison_name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {t("Comparison of")} {currentComparison.report_count} {t("test reports from")} {' '}
                          {new Date(currentComparison.date_range.start_date).toLocaleDateString()} {t("to")} {' '}
                          {new Date(currentComparison.date_range.end_date).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowResults(false)}>
                          <Plus className="w-4 h-4 mr-2" />
                          {t("New Comparison")}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{currentComparison.report_count}</div>
                        <div className="text-sm text-gray-600">{t("Reports Analyzed")}</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {currentComparison.comparison_analysis?.stable_parameters?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">{t("Stable Parameters")}</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {currentComparison.comparison_analysis?.concerning_parameters?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">{t("Concerning Changes")}</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {Math.round(currentComparison.processing_time_ms / 1000)}s
                        </div>
                        <div className="text-sm text-gray-600">{t("Processing Time")}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comparison Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      {t("Parameter Comparison")}
                    </CardTitle>
                    <CardDescription>
                      {t("Compare test parameter values across different report dates")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      <ResponsiveTable
                        data={getComparisonTableData(currentComparison)}
                        columns={getComparisonTableColumns(currentComparison)}
                        emptyMessage={t("No parameter comparisons available")}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Summary */}
                {currentComparison.comparison_analysis && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Key Changes */}
                    {currentComparison.comparison_analysis.key_changes.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">{t("Key Changes")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {currentComparison.comparison_analysis.key_changes.map((change, index) => (
                              <Badge key={index} variant="outline" className="mr-2 mb-1">
                                {change}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Recommendations */}
                    {currentComparison.comparison_analysis.recommendations.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">{t("Recommendations")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {currentComparison.comparison_analysis.recommendations.map((rec, index) => (
                              <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                                    {rec.priority}
                                  </Badge>
                                  <span className="text-xs text-gray-500">{rec.timeline}</span>
                                </div>
                                <p className="text-sm">{rec.action}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Patient Summary */}
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-lg">{t("Patient Summary")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">{t("Overall Status")}:</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {currentComparison.comparison_analysis.patient_summary.overall_status}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">{t("Main Findings")}:</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {currentComparison.comparison_analysis.patient_summary.main_findings}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">{t("Next Steps")}:</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {currentComparison.comparison_analysis.patient_summary.next_steps}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          {/* Statistics Cards */}
          {comparisonStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{comparisonStats.total_comparisons}</p>
                      <p className="text-xs text-muted-foreground">{t("Total Comparisons")}</p>
                    </div>
                    <Brain className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{comparisonStats.completed}</p>
                      <p className="text-xs text-muted-foreground">{t("Completed")}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{comparisonStats.processing}</p>
                      <p className="text-xs text-muted-foreground">{t("Processing")}</p>
                    </div>
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{comparisonStats.this_month}</p>
                      <p className="text-xs text-muted-foreground">{t("This Month")}</p>
                    </div>
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("Search comparisons...")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("All Status")}</SelectItem>
                    <SelectItem value="completed">{t("Completed")}</SelectItem>
                    <SelectItem value="processing">{t("Processing")}</SelectItem>
                    <SelectItem value="pending">{t("Pending")}</SelectItem>
                    <SelectItem value="failed">{t("Failed")}</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => fetchComparisons()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t("Refresh")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comparisons Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Comparison History")}</CardTitle>
              <CardDescription>
                {t("View and manage your AI test report comparisons")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveTable
                data={comparisons.filter(comparison => 
                  searchTerm === "" || 
                  comparison.comparison_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (typeof comparison.patient_id === 'object' && comparison.patient_id && 
                   `${comparison.patient_id.first_name} ${comparison.patient_id.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
                )}
                columns={[
                  {
                    key: "comparison_name",
                    label: t("Comparison Name"),
                    render: (comparison) => (
                      <div>
                        <p className="font-medium">{comparison.comparison_name}</p>
                        <p className="text-sm text-gray-500">
                          {comparison.report_count} {t("reports")}
                        </p>
                      </div>
                    )
                  },
                  {
                    key: "patient",
                    label: t("Patient"),
                    render: (comparison) => (
                      <div>
                        <p className="font-medium">
                          {typeof comparison.patient_id === 'object' && comparison.patient_id ? 
                            `${comparison.patient_id.first_name} ${comparison.patient_id.last_name}` : 
                            'Unknown Patient'}
                        </p>
                      </div>
                    )
                  },
                  {
                    key: "date_range",
                    label: t("Date Range"),
                    render: (comparison) => (
                      <div className="text-sm">
                        <div>{new Date(comparison.date_range.start_date).toLocaleDateString()}</div>
                        <div className="text-gray-500">to {new Date(comparison.date_range.end_date).toLocaleDateString()}</div>
                      </div>
                    )
                  },
                  {
                    key: "status",
                    label: t("Status"),
                    render: (comparison) => (
                      <Badge className={getStatusColor(comparison.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(comparison.status)}
                          {comparison.status}
                        </div>
                      </Badge>
                    )
                  },
                  {
                    key: "actions",
                    label: t("Actions"),
                    render: (comparison) => (
                      <div className="flex gap-2">
                        {comparison.status === 'completed' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setViewModalComparison(comparison);
                              setShowViewModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteComparison(comparison)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )
                  }
                ]}
                emptyMessage={t("No comparisons found")}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Comparison Modal */}
      <Dialog open={showViewModal} onOpenChange={(open) => {
        setShowViewModal(open);
        if (!open) {
          setViewModalComparison(null);
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              {t("Test Comparison Details")}
            </DialogTitle>
            <DialogDescription>
              {viewModalComparison?.comparison_name}
            </DialogDescription>
          </DialogHeader>

          {viewModalComparison && (
            <div className="space-y-6">
              {/* Summary Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{t("Patient")}:</p>
                  <p className="text-sm">
                    {typeof viewModalComparison.patient_id === 'object' && viewModalComparison.patient_id ? 
                      `${viewModalComparison.patient_id.first_name} ${viewModalComparison.patient_id.last_name}` : 
                      'Unknown Patient'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t("Date Range")}:</p>
                  <p className="text-sm">
                    {new Date(viewModalComparison.date_range.start_date).toLocaleDateString()} - {' '}
                    {new Date(viewModalComparison.date_range.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t("Reports Analyzed")}:</p>
                  <p className="text-sm">{viewModalComparison.report_count}</p>
                </div>
              </div>

              {/* Comparison Table */}
              <div>
                <h4 className="font-medium mb-3">{t("Parameter Comparison")}:</h4>
                <div className="border rounded-lg overflow-hidden">
                  <ResponsiveTable
                    data={getComparisonTableData(viewModalComparison)}
                    columns={getComparisonTableColumns(viewModalComparison)}
                    emptyMessage={t("No parameter comparisons available")}
                  />
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowViewModal(false);
                    setViewModalComparison(null);
                  }}
                >
                  {t("Close")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={(open) => {
        setShowDeleteModal(open);
        if (!open) {
          setComparisonToDelete(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              {t("Delete Comparison")}
            </DialogTitle>
            <DialogDescription>
              {t("This action cannot be undone. This will permanently delete the test comparison.")}
            </DialogDescription>
          </DialogHeader>

          {comparisonToDelete && (
            <div className="py-4">
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-red-800 dark:text-red-200">
                      {comparisonToDelete.comparison_name}
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      {comparisonToDelete.report_count} {t("reports")} • {new Date(comparisonToDelete.comparison_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setComparisonToDelete(null);
              }}
            >
              {t("Cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteComparison}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t("Delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AITestComparison;
