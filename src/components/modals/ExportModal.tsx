import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  FileText,
  Image,
  Printer,
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Odontogram } from "@/types";
import OdontogramExporter, { ExportOptions } from "@/utils/printExport";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  odontogram: Odontogram | null;
  chartElementId?: string; // ID of the chart element to capture
}

const ExportModal: React.FC<ExportModalProps> = ({
  open,
  onOpenChange,
  odontogram,
  chartElementId = "dental-chart"
}) => {
  const [exportType, setExportType] = useState<'pdf'>('pdf');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeChart: true,
    includeTreatmentPlan: true,
    includeNotes: true,
    includePeriodontalAssessment: true,
    quality: 2
  });
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportOptionChange = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getChartElement = (): HTMLElement | undefined => {
    const element = document.getElementById(chartElementId);
    if (!element) {
      console.warn(`Chart element with ID "${chartElementId}" not found`);
      return undefined;
    }
    return element;
  };

  const handleExport = async () => {
    if (!odontogram) {
      toast({
        title: "Error",
        description: "No odontogram selected for export",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    setExportSuccess(false);

    try {
      const chartElement = getChartElement();
      await OdontogramExporter.exportToPDF(odontogram, chartElement, exportOptions);

      setExportSuccess(true);
      toast({
        title: "Success",
        description: "Dental chart exported as PDF successfully",
      });

      // Auto-close modal after successful export
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);

    } catch (error) {
      console.error("Error exporting dental chart:", error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export dental chart",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const resetModal = () => {
    setExportSuccess(false);
    setExporting(false);
    setExportOptions({
      includeChart: true,
      includeTreatmentPlan: true,
      includeNotes: true,
      includePeriodontalAssessment: true,
      quality: 2
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetModal();
    }
    onOpenChange(newOpen);
  };


  if (!odontogram) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Dental Chart
          </DialogTitle>
          <DialogDescription>
            Export or print the dental chart for {odontogram.patient_id.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">PDF Report Export</span>
            </div>
            <p className="text-sm text-blue-700">
              Generate a comprehensive PDF report including dental chart, treatment plans, and patient information.
            </p>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <Label className="text-base font-medium">Export Options</Label>
            </div>

            {/* Content Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeChart"
                  checked={exportOptions.includeChart}
                  onCheckedChange={(checked) => 
                    handleExportOptionChange('includeChart', checked)
                  }
                />
                <Label htmlFor="includeChart" className="text-sm">
                  Include dental chart
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeTreatmentPlan"
                  checked={exportOptions.includeTreatmentPlan}
                  onCheckedChange={(checked) => 
                    handleExportOptionChange('includeTreatmentPlan', checked)
                  }
                />
                <Label htmlFor="includeTreatmentPlan" className="text-sm">
                  Include treatment plans and progress
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includePeriodontalAssessment"
                  checked={exportOptions.includePeriodontalAssessment}
                  onCheckedChange={(checked) => 
                    handleExportOptionChange('includePeriodontalAssessment', checked)
                  }
                />
                <Label htmlFor="includePeriodontalAssessment" className="text-sm">
                  Include periodontal assessment
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeNotes"
                  checked={exportOptions.includeNotes}
                  onCheckedChange={(checked) => 
                    handleExportOptionChange('includeNotes', checked)
                  }
                />
                <Label htmlFor="includeNotes" className="text-sm">
                  Include general notes
                </Label>
              </div>
            </div>

            {/* Quality Options */}
            <div className="space-y-2">
              <Label htmlFor="quality" className="text-sm">
                Chart Image Quality
              </Label>
              <Select
                value={exportOptions.quality?.toString()}
                onValueChange={(value) => 
                  handleExportOptionChange('quality', parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Standard (1x)</SelectItem>
                  <SelectItem value="2">High (2x)</SelectItem>
                  <SelectItem value="3">Ultra (3x)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Preview Information */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="font-medium">PDF Export</span>
            </div>
            <p className="text-sm text-gray-600">
              Generate a comprehensive PDF report including dental chart, treatment plans, and notes
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Patient: {odontogram.patient_id.full_name}</span>
              <span>Date: {new Date(odontogram.examination_date).toLocaleDateString()}</span>
              <span>Version: {odontogram.version}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {exportSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Export completed successfully!</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                <span>PDF report will be downloaded</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={exporting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={exporting || exportSuccess}
              className="min-w-[120px]"
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : exportSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  <span className="ml-2">Export PDF</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
