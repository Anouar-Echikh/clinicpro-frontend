import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveTable } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, type AITestAnalysis, type AITestAnalysisStats, type Patient } from "@/services/api";
import {
  Upload,
  Brain,
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
  Zap,
  TestTube2,
  FileImage,
  Loader2,
  RefreshCw,
  Microscope,
  AlertTriangle
} from "lucide-react";

const AITestAnalysis: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyses, setAnalyses] = useState<AITestAnalysis[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<AITestAnalysisStats | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AITestAnalysis | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showResults, setShowResults] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [analysisStage, setAnalysisStage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [viewModalAnalysis, setViewModalAnalysis] = useState<AITestAnalysis | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [analysisToDelete, setAnalysisToDelete] = useState<AITestAnalysis | null>(null);

  // File upload handler
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: t("Invalid file type"),
          description: t("Please select a JPEG, PNG image or PDF file."),
          variant: "destructive",
        });
        return;
      }

      // Validate file size (15MB limit)
      if (file.size > 15 * 1024 * 1024) {
        toast({
          title: t("File too large"),
          description: t("Please select a file under 15MB."),
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  }, [toast, t]);

  // Drag and drop handlers
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] }
      } as any;
      handleFileSelect(fakeEvent);
    }
  }, [handleFileSelect]);

  // Submit analysis
  const handleAnalyzeTestReport = async () => {
    if (!selectedFile || !selectedPatient) {
      toast({
        title: t("Missing information"),
        description: t("Please select both a test report file and a patient."),
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setUploadProgress(0);
    setAnalysisStage(t("Preparing upload..."));

    try {
      const formData = new FormData();
      formData.append('test_report', selectedFile);
      formData.append('patient_id', selectedPatient);
      if (customPrompt.trim()) {
        formData.append('custom_prompt', customPrompt);
      }

      // Enhanced progress simulation for long-running analysis
      let currentStage = 0;
      const stages = [
        t("Uploading test report..."),
        t("Processing with AI..."),
        t("Analyzing test values..."),
        t("Interpreting results..."),
        t("Generating report...")
      ];
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 2;
          
          // Update stage based on progress
          if (newProgress > 20 && currentStage < 1) {
            currentStage = 1;
            setAnalysisStage(stages[1]);
          } else if (newProgress > 40 && currentStage < 2) {
            currentStage = 2;
            setAnalysisStage(stages[2]);
          } else if (newProgress > 60 && currentStage < 3) {
            currentStage = 3;
            setAnalysisStage(stages[3]);
          } else if (newProgress > 80 && currentStage < 4) {
            currentStage = 4;
            setAnalysisStage(stages[4]);
          }
          
          if (newProgress >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return newProgress;
        });
      }, 3000);

      setAnalysisStage(t("Uploading test report..."));
      const result = await apiService.analyzeTestReport(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setAnalysisStage(t("Analysis completed!"));
      
      toast({
        title: t("Analysis completed!"),
        description: t("Your test report has been successfully analyzed."),
      });

      setCurrentAnalysis(result);
      setShowResults(true);
      
      // Reset form
      setSelectedFile(null);
      setSelectedPatient("");
      setCustomPrompt("");
      
      // Refresh analyses list
      await fetchAnalyses();

    } catch (error: any) {
      console.error('Analysis error:', error);
      
      let errorMessage = t("There was an error analyzing the test report. Please try again.");
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        if (error.message.includes('timeout')) {
          errorMessage = t("Analysis timed out. The file may be too large or the service is busy. Please try again.");
        } else if (error.message.includes('Network Error')) {
          errorMessage = t("Network error. Please check your internet connection and try again.");
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: t("Analysis failed"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
      setAnalysisStage("");
    }
  };

  // Fetch data functions
  const fetchPatients = async () => {
    try {
      const result = await apiService.getPatients();
      setPatients(result.data.patients || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchAnalyses = async () => {
    try {
      const result = await apiService.getAITestAnalyses();
      setAnalyses(result.analyses || []);
    } catch (error: any) {
      console.error('Error fetching analyses:', error);
      toast({
        title: t("Error loading analyses"),
        description: getApiErrorMessage(error, t('Could not load AI test analysis history. Please try again.')),
        variant: "destructive",
      });
    }
  };

  const fetchStats = async () => {
    try {
      const stats = await apiService.getAITestAnalysisStats();
      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Initialize data
  React.useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchPatients(),
          fetchAnalyses(),
          fetchStats()
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
        toast({
          title: t("Error loading data"),
          description: t("Some data could not be loaded. Please refresh the page."),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Filter analyses
  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = searchTerm === '' || (
      analysis.structured_data?.test_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.analysis_result?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatus = statusFilter === 'all' || analysis.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'processing': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'failed': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Helper function to format analysis text
  const formatAnalysisText = (text: string): JSX.Element => {
    if (!text) return <span>{t("No analysis result available")}</span>;
    
    // Split by lines and process each line
    const lines = text.split('\n');
    const formattedLines = lines.map((line, index) => {
      // Replace **text** with bold formatting
      const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Create JSX element with proper formatting
      return (
        <span key={index}>
          <span dangerouslySetInnerHTML={{ __html: boldFormatted }} />
          {index < lines.length - 1 && <br />}
        </span>
      );
    });
    
    return <>{formattedLines}</>;
  };

  // Get test values from structured JSON data 
  const getTestResults = (analysis: AITestAnalysis) => {
    // First try to use the new JSON structure
    if (analysis.structured_data?.test_results && analysis.structured_data.test_results.length > 0) {
      return analysis.structured_data.test_results.map(result => ({
        testName: result.parameter,
        value: result.value,
        referenceRange: result.reference_range,
        status: result.status,
        unit: result.unit
      }));
    }
    
    // Fallback to parsing from text if new structure is not available
    if (!analysis.analysis_result) return [];
    
    const testValues = [];
    const lines = analysis.analysis_result.split('\n');
    let inKeyValuesSection = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Start capturing when we reach "Key Values:" section
      if (trimmedLine.includes('Key Values:') || trimmedLine.includes('- Key Values:')) {
        inKeyValuesSection = true;
        continue;
      }
      
      // Stop capturing when we reach next section
      if (inKeyValuesSection && (
        trimmedLine.includes('Abnormal Findings:') || 
        trimmedLine.includes('Patient Summary:') ||
        trimmedLine.includes('Recommendations:') ||
        trimmedLine === ''
      )) {
        if (trimmedLine.includes('Abnormal Findings:') || 
            trimmedLine.includes('Patient Summary:') ||
            trimmedLine.includes('Recommendations:')) {
          break;
        }
        continue;
      }
      
      // Parse test values when in the right section
      if (inKeyValuesSection && trimmedLine.startsWith('-')) {
        // Pattern: - TestName: Value (Ref: Range)
        const match = trimmedLine.match(/^-\s*([^:]+):\s*([^(]+)(?:\(Ref:\s*([^)]+)\))?/);
        if (match) {
          const testName = match[1].trim();
          const value = match[2].trim();
          const referenceRange = match[3]?.trim() || '';
          
          // Determine status based on common patterns
          let status = 'Normal';
          const lowerLine = line.toLowerCase();
          if (lowerLine.includes('high') || lowerLine.includes('elevated') || lowerLine.includes('above')) {
            status = 'High';
          } else if (lowerLine.includes('low') || lowerLine.includes('below') || lowerLine.includes('deficiency')) {
            status = 'Low';
          } else if (lowerLine.includes('present') && testName.toLowerCase().includes('glucose')) {
            status = 'Abnormal';
          }
          
          testValues.push({
            testName,
            value,
            referenceRange,
            status
          });
        }
      }
    }
    
    return testValues;
  };

  // Get abnormal findings from structured JSON data
  const getAbnormalFindings = (analysis: AITestAnalysis) => {
    // First try to use the new JSON structure
    if (analysis.structured_data?.abnormal_findings && analysis.structured_data.abnormal_findings.length > 0) {
      return analysis.structured_data.abnormal_findings.map(finding => {
        if (typeof finding === 'string') {
          return finding;
        }
        return finding.clinical_significance || `${finding.parameter}: ${finding.value} (${finding.status})`;
      });
    }
    
    // Fallback to parsing from text if new structure is not available
    if (!analysis.analysis_result) return [];
    
    const findings = [];
    const lines = analysis.analysis_result.split('\n');
    let inAbnormalSection = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Start capturing when we reach "Abnormal Findings:" section
      if (trimmedLine.includes('Abnormal Findings:') || trimmedLine.includes('- Abnormal Findings:')) {
        inAbnormalSection = true;
        continue;
      }
      
      // Stop capturing when we reach next section
      if (inAbnormalSection && (
        trimmedLine.includes('Patient Summary:') ||
        trimmedLine.includes('Recommendations:') ||
        (trimmedLine === '' && findings.length > 0)
      )) {
        if (trimmedLine.includes('Patient Summary:') || trimmedLine.includes('Recommendations:')) {
          break;
        }
        continue;
      }
      
      // Parse abnormal findings
      if (inAbnormalSection && trimmedLine.startsWith('-')) {
        const finding = trimmedLine.replace(/^-\s*/, '').trim();
        if (finding && !finding.includes(':')) { // Avoid duplicate parsing of key values
          findings.push(finding);
        }
      }
    }
    
    return findings;
  };

  // Get patient summary from structured JSON data
  const getPatientSummary = (analysis: AITestAnalysis) => {
    // First try to use the new JSON structure
    if (analysis.structured_data?.patient_summary) {
      const summary = analysis.structured_data.patient_summary;
      return summary.main_findings || summary.overall_status || '';
    }
    
    // Fallback to parsing from text if new structure is not available
    if (!analysis.analysis_result) return '';
    
    const lines = analysis.analysis_result.split('\n');
    let inSummarySection = false;
    let summaryLines = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Start capturing when we reach "Patient Summary:" section
      if (trimmedLine.includes('Patient Summary:') || trimmedLine.includes('- Patient Summary:')) {
        inSummarySection = true;
        continue;
      }
      
      // Stop capturing when we reach next section
      if (inSummarySection && (
        trimmedLine.includes('Abnormal Findings:') ||
        trimmedLine.includes('Recommendations:') ||
        trimmedLine.startsWith('###') ||
        trimmedLine.startsWith('##')
      )) {
        break;
      }
      
      // Collect summary content
      if (inSummarySection && trimmedLine) {
        summaryLines.push(trimmedLine);
      }
    }
    
    return summaryLines.join(' ').trim();
  };

  // Action handlers
  const handleViewReport = (analysis: AITestAnalysis) => {
    setViewModalAnalysis(analysis);
    setShowViewModal(true);
  };

  const handleDownloadReport = async (analysis: AITestAnalysis) => {
    try {
      // Clean up markdown formatting for download
      const cleanAnalysisText = (analysis.analysis_result || '').replace(/\*\*(.*?)\*\*/g, '$1');
      
      const reportContent = `
AI TEST REPORT ANALYSIS
=======================

Patient: ${typeof analysis.patient_id === 'object' && analysis.patient_id ? 
  `${analysis.patient_id.first_name || ''} ${analysis.patient_id.last_name || ''}`.trim() || 'Unknown Patient' : 
  analysis.patient_id || 'Unknown Patient'}
Analysis Date: ${new Date(analysis.analysis_date).toLocaleDateString()}
Doctor: ${typeof analysis.doctor_id === 'object' && analysis.doctor_id ? 
  `${analysis.doctor_id.first_name || ''} ${analysis.doctor_id.last_name || ''}`.trim() || 'Unknown Doctor' : 
  analysis.doctor_id || 'Unknown Doctor'}
Status: ${analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}

TEST IDENTIFICATION:
${analysis.structured_data?.test_name || 'Not identified'}

ANALYSIS RESULTS:
${cleanAnalysisText || 'No analysis result available'}

STRUCTURED DATA:
Test Values: ${analysis.structured_data?.test_values?.join(', ') || 'None'}
Abnormal Findings: ${analysis.structured_data?.abnormal_findings?.join(', ') || 'None'}
Recommendations: ${analysis.structured_data?.recommendations?.join(', ') || 'None'}
Clinical Interpretation: ${analysis.structured_data?.interpretation || 'None'}

Generated on: ${new Date().toLocaleString()}
      `;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-test-analysis-${analysis._id}-${new Date(analysis.analysis_date).toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: t("Download started"),
        description: t("AI test analysis report is being downloaded."),
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: t("Download failed"),
        description: t("Could not download the report. Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnalysis = (analysis: AITestAnalysis) => {
    setAnalysisToDelete(analysis);
    setShowDeleteModal(true);
  };

  const confirmDeleteAnalysis = async () => {
    if (!analysisToDelete) return;

    try {
      await apiService.deleteAITestAnalysis(analysisToDelete._id);
      
      toast({
        title: t("Analysis deleted"),
        description: t("AI test analysis has been successfully deleted."),
      });

      // Refresh the analyses list
      await fetchAnalyses();
      
      // If the deleted analysis was currently being viewed, clear it
      if (currentAnalysis?._id === analysisToDelete._id) {
        setCurrentAnalysis(null);
        setShowResults(false);
      }

      // Close the modal
      setShowDeleteModal(false);
      setAnalysisToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: t("Delete failed"),
        description: t("Could not delete the analysis. Please try again."),
        variant: "destructive",
      });
      setShowDeleteModal(false);
      setAnalysisToDelete(null);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Brain className="w-8 h-8 text-primary" />
              {t("AI Test Report Analysis")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("Loading...")}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            {t("AI Test Report Analysis")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("Upload test reports and get AI-powered analysis and interpretation")}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Total Analyses")}</CardTitle>
              <TestTube2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_analyses}</div>
              <p className="text-xs text-muted-foreground">
                {stats.recent_analyses} {t("in last 30 days")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Completed")}</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed_analyses}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_analyses > 0 ? Math.round((stats.completed_analyses / stats.total_analyses) * 100) : 0}% {t("success rate")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Processing")}</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.processing_analyses}</div>
              <p className="text-xs text-muted-foreground">
                {t("Currently processing")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Top Test Type")}</CardTitle>
              <Microscope className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.top_test_types?.[0]?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.top_test_types?.[0]?.testName || t("No data")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="analyze" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="analyze" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {t("New Analysis")}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {t("Analysis History")}
          </TabsTrigger>
        </TabsList>

        {/* New Analysis Tab */}
        <TabsContent value="analyze" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="w-5 h-5" />
                {t("Upload Test Report")}
              </CardTitle>
              <CardDescription>
                {t("Select a test report image or PDF and add optional analysis instructions. PDFs are limited to first 5 pages for analysis.")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-4">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">{selectedFile.name}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      {t("Change File")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t("Drop your test report here, or click to browse")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("Supports JPEG, PNG, PDF (max 15MB). For PDFs, first 5 pages are analyzed.")}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="test-report-upload"
                    />
                    <label htmlFor="test-report-upload">
                      <Button variant="outline" size="sm" asChild>
                        <span>{t("Browse Files")}</span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>

              {/* Patient Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Select Patient")}</label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Choose a patient...")} />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient._id} value={patient._id}>
                        {patient?.first_name || t('Unknown')} {patient?.last_name || t('Patient')} - {patient?.phone || 'N/A'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Prompt */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("Custom Analysis Instructions (Optional)")}
                </label>
                <Textarea
                  placeholder={t("e.g., Focus on liver function tests, check for diabetes markers...")}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {t("Leave empty to use default comprehensive analysis")}
                </p>
              </div>

              {/* Upload Progress */}
              {isAnalyzing && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 animate-spin" />
                      {analysisStage}
                    </span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-muted-foreground text-center">
                    {t("This may take several minutes. Please don't close the browser.")}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleAnalyzeTestReport}
                disabled={!selectedFile || !selectedPatient || isAnalyzing}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    {t("Analyzing Report...")}
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    {t("Analyze Test Report")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Display */}
          {showResults && currentAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    {t("Analysis Results")}
                  </CardTitle>
                  <CardDescription>
                    {t("AI-generated analysis for test report")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Test Information */}
                  {currentAnalysis.structured_data?.test_name && (
                    <div>
                      <h4 className="font-medium mb-2">{t("Test Identified")}:</h4>
                      <Badge variant="outline" className="text-sm">
                        {currentAnalysis.structured_data.test_name}
                      </Badge>
                    </div>
                  )}

                  {/* Test Results Table */}
                  {(() => {
                    const testValues = getTestResults(currentAnalysis);
                    const abnormalFindings = getAbnormalFindings(currentAnalysis);
                    
                    return testValues.length > 0 ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-3 text-foreground">{t("Test Results")}:</h4>
                          <ResponsiveTable 
                            data={testValues}
                            columns={[
                              {
                                key: 'testName',
                                label: t("Test Parameter"),
                                className: 'font-medium'
                              },
                              {
                                key: 'value',
                                label: t("Result"),
                                className: 'font-mono'
                              },
                              {
                                key: 'referenceRange',
                                label: t("Reference Range"),
                                className: 'text-muted-foreground',
                                render: (item) => item.referenceRange || '-'
                              },
                              {
                                key: 'status',
                                label: t("Status"),
                                render: (item) => (
                                  <Badge 
                                    variant={
                                      item.status === 'High' ? 'destructive' :
                                      item.status === 'Low' ? 'destructive' :
                                      item.status === 'Abnormal' ? 'destructive' :
                                      'outline'
                                    }
                                    className={
                                      item.status === 'Normal' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : ''
                                    }
                                  >
                                    {item.status}
                                  </Badge>
                                )
                              }
                            ]}
                            className="border rounded-lg overflow-hidden"
                          />
                        </div>
                        
                        {/* Patient Summary */}
                        {(() => {
                          const patientSummary = getPatientSummary(currentAnalysis);
                          return patientSummary && (
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                              <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                {t("Clinical Summary")}:
                              </h4>
                              <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                                {patientSummary}
                              </p>
                            </div>
                          );
                        })()}
                        
                        {/* Abnormal Findings Summary */}
                        {abnormalFindings.length > 0 && (
                          <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-800">
                            <h4 className="font-medium mb-2 text-red-800 dark:text-red-300 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              {t("Key Abnormal Findings")}:
                            </h4>
                            <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                              {abnormalFindings.map((finding, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                                  {finding}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Fallback to formatted text if parsing fails
                      <div className="prose max-w-none">
                        <div className="bg-muted p-4 rounded-lg">
                          <h4 className="font-medium mb-2 text-foreground">{t("Detailed Analysis")}:</h4>
                          <div className="text-sm leading-relaxed text-foreground">
                            {formatAnalysisText(currentAnalysis?.analysis_result || '')}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Structured Data */}
                  {currentAnalysis.structured_data && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {currentAnalysis.structured_data.abnormal_findings?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">{t("Abnormal Findings")}:</h4>
                          <div className="space-y-1">
                            {currentAnalysis.structured_data.abnormal_findings.map((finding, index) => (
                              <Badge key={index} variant="destructive" className="mr-2 mb-1">
                                {typeof finding === 'string' ? finding : `${finding.parameter}: ${finding.value} (${finding.status})`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {currentAnalysis.structured_data.recommendations?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">{t("Recommendations")}:</h4>
                          <div className="space-y-1">
                            {currentAnalysis.structured_data.recommendations.map((rec, index) => (
                              <Badge key={index} variant="outline" className="mr-2 mb-1">
                                {typeof rec === 'string' ? rec : rec.action || rec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        {/* Analysis History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("Analysis History")}</CardTitle>
              <CardDescription>
                {t("View and manage all AI test report analyses")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={t("Search by test name...")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t("Filter by status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("All Status")}</SelectItem>
                    <SelectItem value="completed">{t("Completed")}</SelectItem>
                    <SelectItem value="processing">{t("Processing")}</SelectItem>
                    <SelectItem value="failed">{t("Failed")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Analysis Table */}
              <ResponsiveTable
                data={filteredAnalyses}
                columns={[
                  {
                    key: "test",
                    label: t("Test Type"),
                    render: (analysis) => (
                      <div>
                        <p className="font-medium">
                          {analysis.structured_data?.test_name || t('Unknown Test')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {analysis.file_type === 'application/pdf' ? 'PDF' : 'Image'}
                        </p>
                      </div>
                    )
                  },
                  {
                    key: "patient",
                    label: t("Patient"),
                    render: (analysis) => (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {(() => {
                              if (analysis.patient_id && typeof analysis.patient_id === 'object') {
                                const firstInitial = analysis.patient_id.first_name?.charAt(0) || '';
                                const lastInitial = analysis.patient_id.last_name?.charAt(0) || '';
                                return (firstInitial + lastInitial).toUpperCase() || 'PA';
                              }
                              return String(analysis.patient_id || '').slice(0, 2).toUpperCase() || 'PA';
                            })()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {(() => {
                              if (analysis.patient_id && typeof analysis.patient_id === 'object') {
                                const firstName = analysis.patient_id.first_name || '';
                                const lastName = analysis.patient_id.last_name || '';
                                return `${firstName} ${lastName}`.trim() || 'Unknown Patient';
                              }
                              return String(analysis.patient_id || 'Unknown Patient');
                            })()}
                          </p>
                        </div>
                      </div>
                    )
                  },
                  {
                    key: "date",
                    label: t("Analysis Date"),
                    render: (analysis) => (
                      <div>
                        <p className="font-medium">
                          {new Date(analysis.analysis_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(analysis.analysis_date).toLocaleTimeString()}
                        </p>
                      </div>
                    )
                  },
                  {
                    key: "status",
                    label: t("Status"),
                    render: (analysis) => (
                      <Badge className={getStatusColor(analysis.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(analysis.status)}
                          {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
                        </span>
                      </Badge>
                    )
                  },
                  {
                    key: "findings",
                    label: t("Key Findings"),
                    render: (analysis) => (
                      <div className="space-y-1">
                        {analysis.structured_data?.abnormal_findings?.length > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            {analysis.structured_data.abnormal_findings.length} {t("abnormal")}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">{t("Normal")}</Badge>
                        )}
                      </div>
                    )
                  }
                ]}
                actions={(analysis) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewReport(analysis)}>
                        <Eye className="w-4 h-4 mr-2" />
                        {t("View Report")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadReport(analysis)}>
                        <Download className="w-4 h-4 mr-2" />
                        {t("Download")}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteAnalysis(analysis)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t("Delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                emptyMessage={t("No AI test analyses found")}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Report Modal */}
      <Dialog open={showViewModal} onOpenChange={(open) => {
        setShowViewModal(open);
        if (!open) {
          setViewModalAnalysis(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              {t("AI Test Report Analysis")}
            </DialogTitle>
            <DialogDescription>
              {t("Detailed analysis report for")} {viewModalAnalysis?.structured_data?.test_name || t('test report')}
            </DialogDescription>
          </DialogHeader>

          {viewModalAnalysis && (
            <div className="space-y-6">
              {/* Analysis Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-card-foreground">{t("Analysis Information")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{t("Test Type")}:</span> {viewModalAnalysis.structured_data?.test_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{t("Date")}:</span> {new Date(viewModalAnalysis.analysis_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{t("File Type")}:</span> {viewModalAnalysis.file_type === 'application/pdf' ? 'PDF' : 'Image'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{t("Status")}:</span>
                        <Badge className={getStatusColor(viewModalAnalysis.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(viewModalAnalysis.status)}
                            {viewModalAnalysis.status.charAt(0).toUpperCase() + viewModalAnalysis.status.slice(1)}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-card-foreground">{t("Patient & Doctor")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{t("Patient")}:</span> {(() => {
                          if (viewModalAnalysis.patient_id && typeof viewModalAnalysis.patient_id === 'object') {
                            const firstName = viewModalAnalysis.patient_id.first_name || '';
                            const lastName = viewModalAnalysis.patient_id.last_name || '';
                            return `${firstName} ${lastName}`.trim() || 'Unknown Patient';
                          }
                          return String(viewModalAnalysis.patient_id || 'Unknown Patient');
                        })()}
                      </p>
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{t("Doctor")}:</span> {(() => {
                          if (viewModalAnalysis.doctor_id && typeof viewModalAnalysis.doctor_id === 'object') {
                            const firstName = viewModalAnalysis.doctor_id.first_name || '';
                            const lastName = viewModalAnalysis.doctor_id.last_name || '';
                            return `${firstName} ${lastName}`.trim() || 'Unknown Doctor';
                          }
                          return String(viewModalAnalysis.doctor_id || 'Unknown Doctor');
                        })()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analysis Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {t("Test Results")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const testValues = getTestResults(viewModalAnalysis);
                    const abnormalFindings = getAbnormalFindings(viewModalAnalysis);
                    
                    return testValues.length > 0 ? (
                      <div className="space-y-4">
                        <ResponsiveTable 
                          data={testValues}
                          columns={[
                            {
                              key: 'testName',
                              label: t("Test Parameter"),
                              className: 'font-medium'
                            },
                            {
                              key: 'value',
                              label: t("Result"),
                              className: 'font-mono'
                            },
                            {
                              key: 'referenceRange',
                              label: t("Reference Range"),
                              className: 'text-muted-foreground',
                              render: (item) => item.referenceRange || '-'
                            },
                            {
                              key: 'status',
                              label: t("Status"),
                              render: (item) => (
                                <Badge 
                                  variant={
                                    item.status === 'High' ? 'destructive' :
                                    item.status === 'Low' ? 'destructive' :
                                    item.status === 'Abnormal' ? 'destructive' :
                                    'outline'
                                  }
                                  className={
                                    item.status === 'Normal' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : ''
                                  }
                                >
                                  {item.status}
                                </Badge>
                              )
                            }
                          ]}
                          className="border rounded-lg overflow-hidden"
                        />
                        
                        {/* Patient Summary */}
                        {(() => {
                          const patientSummary = getPatientSummary(viewModalAnalysis);
                          return patientSummary && (
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                              <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                {t("Clinical Summary")}:
                              </h4>
                              <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                                {patientSummary}
                              </p>
                            </div>
                          );
                        })()}
                        
                        {/* Abnormal Findings Summary */}
                        {abnormalFindings.length > 0 && (
                          <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-800">
                            <h4 className="font-medium mb-2 text-red-800 dark:text-red-300 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              {t("Key Abnormal Findings")}:
                            </h4>
                            <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                              {abnormalFindings.map((finding, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                                  {finding}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Fallback to formatted text if parsing fails
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="text-sm leading-relaxed text-foreground">
                          {formatAnalysisText(viewModalAnalysis.analysis_result || '')}
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Structured Data */}
              {viewModalAnalysis.structured_data && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {viewModalAnalysis.structured_data.abnormal_findings?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          {t("Abnormal Findings")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {viewModalAnalysis.structured_data.abnormal_findings.map((finding, index) => (
                            <Badge key={index} variant="destructive" className="mr-2 mb-1">
                              {typeof finding === 'string' ? finding : `${finding.parameter}: ${finding.value} (${finding.status})`}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {viewModalAnalysis.structured_data.recommendations?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          {t("Recommendations")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {viewModalAnalysis.structured_data.recommendations.map((rec, index) => (
                            <Badge key={index} variant="outline" className="mr-2 mb-1">
                              {typeof rec === 'string' ? rec : rec.action || rec}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadReport(viewModalAnalysis)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t("Download Report")}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowViewModal(false);
                    setViewModalAnalysis(null);
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
          setAnalysisToDelete(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              {t("Delete Analysis")}
            </DialogTitle>
            <DialogDescription>
              {t("This action cannot be undone. This will permanently delete the AI test analysis.")}
            </DialogDescription>
          </DialogHeader>

          {analysisToDelete && (
            <div className="py-4">
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-red-800 dark:text-red-200">
                      {analysisToDelete.structured_data?.test_name || 'Unknown Test'}
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      {t("Analysis Date")}: {new Date(analysisToDelete.analysis_date).toLocaleDateString()}
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
                setAnalysisToDelete(null);
              }}
            >
              {t("Cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteAnalysis}
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

export default AITestAnalysis;
