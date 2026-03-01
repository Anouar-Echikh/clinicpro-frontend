import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  User,
  Stethoscope,
  TrendingUp,
  Clock,
  DollarSign,
  Edit,
  Save,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Download,
  Plus,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ToothChart from "@/components/odontogram/ToothChart";
import ToothConditionModal from "@/components/modals/ToothConditionModal";
import ExportModal from "@/components/modals/ExportModal";
import { 
  Odontogram, 
  ToothCondition, 
  ToothSurface,
  DentalConditionType, 
  CreateToothConditionRequest,
  UpdateToothConditionRequest,
  TreatmentPlan,
  TreatmentStatus,
  TreatmentPriority,
  PeriodontalAssessment
} from "@/types";
import odontogramApi from "@/services/api/odontogramApi";

interface OdontogramDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  odontogramId: string | null;
  editable?: boolean;
}

const OdontogramDetailModal: React.FC<OdontogramDetailModalProps> = ({
  open,
  onOpenChange,
  odontogramId,
  editable = false,
}) => {
  const [odontogram, setOdontogram] = useState<Odontogram | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [selectedSurface, setSelectedSurface] = useState<ToothSurface | undefined>(undefined);
  const [editMode, setEditMode] = useState(true);
  const [toothConditionModalOpen, setToothConditionModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  
  // Treatment editing states
  const [editingTreatments, setEditingTreatments] = useState<{[key: number]: boolean}>({});
  const [treatmentChanges, setTreatmentChanges] = useState<{[key: number]: Partial<TreatmentPlan>}>({});
  const [addingNewTreatment, setAddingNewTreatment] = useState(false);
  const [newTreatmentToothNumber, setNewTreatmentToothNumber] = useState<number>(1);
  
  // Periodontal and notes editing states
  const [editingPeriodontal, setEditingPeriodontal] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [periodontalChanges, setPeriodontalChanges] = useState<Partial<PeriodontalAssessment>>({});
  const [notesChanges, setNotesChanges] = useState('');

  // Fetch odontogram data
  const fetchOdontogram = async () => {
    if (!odontogramId) return;
    
    try {
      setLoading(true);
      const response = await odontogramApi.getOdontogramById(odontogramId);
      
      // Debug logging
      console.log('Fetched Odontogram Data:', {
        treatment_progress: response.treatment_progress,
        pending_treatments: response.pending_treatments,
        treatment_summary: response.treatment_summary,
        teeth_conditions_with_treatments: response.teeth_conditions?.filter(t => t.treatment_plan)
      });
      
      setOdontogram(response);
    } catch (error) {
      console.error("Error fetching odontogram:", error);
      toast({
        title: "Error",
        description: "Failed to fetch odontogram details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && odontogramId) {
      fetchOdontogram();
    }
  }, [open, odontogramId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedTooth(null);
      setSelectedSurface(undefined);
      setEditMode(true); // Default to edit mode
      setOdontogram(null);
      setToothConditionModalOpen(false);
      setExportModalOpen(false);
      setEditingTreatments({});
      setTreatmentChanges({});
      setAddingNewTreatment(false);
      setNewTreatmentToothNumber(1);
      setEditingPeriodontal(false);
      setEditingNotes(false);
      setPeriodontalChanges({});
      setNotesChanges('');
    }
  }, [open]);

  const handleToothClick = (toothNumber: number, surface?: ToothSurface) => {
    if (editMode) {
      setSelectedTooth(toothNumber);
      setSelectedSurface(surface);
      setToothConditionModalOpen(true);
    }
  };

  const getToothCondition = (toothNumber: number): ToothCondition | undefined => {
    return odontogram?.teeth_conditions?.find(
      tooth => tooth.tooth_number === toothNumber
    );
  };

  const handleSaveToothCondition = async (conditionData: CreateToothConditionRequest | UpdateToothConditionRequest) => {
    if (!odontogram || !selectedTooth) return;

    try {
      // Check if tooth condition already exists
      const existingCondition = getToothCondition(selectedTooth);
      
      if (existingCondition) {
        // Update existing condition
        await odontogramApi.updateToothCondition(odontogram._id, selectedTooth, conditionData as UpdateToothConditionRequest);
      } else {
        // Create new condition
        await odontogramApi.createToothCondition(odontogram._id, conditionData as CreateToothConditionRequest);
      }

      // Refresh odontogram data
      await fetchOdontogram();
      
      toast({
        title: "Success",
        description: "Tooth condition updated successfully",
      });
    } catch (error) {
      console.error("Error saving tooth condition:", error);
      throw error; // Re-throw to let ToothConditionModal handle the error
    }
  };

  const getToothName = (toothNumber: number): string => {
    // Simple tooth naming based on Universal numbering
    const toothNames: Record<number, string> = {
      // Adult teeth (Universal numbering)
      1: "Upper Right 3rd Molar", 2: "Upper Right 2nd Molar", 3: "Upper Right 1st Molar",
      4: "Upper Right 2nd Premolar", 5: "Upper Right 1st Premolar", 6: "Upper Right Canine",
      7: "Upper Right Lateral Incisor", 8: "Upper Right Central Incisor",
      9: "Upper Left Central Incisor", 10: "Upper Left Lateral Incisor", 11: "Upper Left Canine",
      12: "Upper Left 1st Premolar", 13: "Upper Left 2nd Premolar", 14: "Upper Left 1st Molar",
      15: "Upper Left 2nd Molar", 16: "Upper Left 3rd Molar",
      17: "Lower Left 3rd Molar", 18: "Lower Left 2nd Molar", 19: "Lower Left 1st Molar",
      20: "Lower Left 2nd Premolar", 21: "Lower Left 1st Premolar", 22: "Lower Left Canine",
      23: "Lower Left Lateral Incisor", 24: "Lower Left Central Incisor",
      25: "Lower Right Central Incisor", 26: "Lower Right Lateral Incisor", 27: "Lower Right Canine",
      28: "Lower Right 1st Premolar", 29: "Lower Right 2nd Premolar", 30: "Lower Right 1st Molar",
      31: "Lower Right 2nd Molar", 32: "Lower Right 3rd Molar",
      
      // Primary teeth (FDI numbering)
      55: "Upper Right 2nd Molar", 54: "Upper Right 1st Molar", 53: "Upper Right Canine",
      52: "Upper Right Lateral Incisor", 51: "Upper Right Central Incisor",
      61: "Upper Left Central Incisor", 62: "Upper Left Lateral Incisor", 63: "Upper Left Canine",
      64: "Upper Left 1st Molar", 65: "Upper Left 2nd Molar",
      75: "Lower Left 2nd Molar", 74: "Lower Left 1st Molar", 73: "Lower Left Canine",
      72: "Lower Left Lateral Incisor", 71: "Lower Left Central Incisor",
      81: "Lower Right Central Incisor", 82: "Lower Right Lateral Incisor", 83: "Lower Right Canine",
      84: "Lower Right 1st Molar", 85: "Lower Right 2nd Molar",
    };
    
    return toothNames[toothNumber] || `Tooth ${toothNumber}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Treatment editing functions
  const startEditingTreatment = (toothNumber: number, treatment: TreatmentPlan) => {
    setEditingTreatments(prev => ({ ...prev, [toothNumber]: true }));
    setTreatmentChanges(prev => ({ ...prev, [toothNumber]: { ...treatment } }));
  };

  const cancelEditingTreatment = (toothNumber: number) => {
    setEditingTreatments(prev => {
      const newState = { ...prev };
      delete newState[toothNumber];
      return newState;
    });
    setTreatmentChanges(prev => {
      const newState = { ...prev };
      delete newState[toothNumber];
      return newState;
    });
  };

  const updateTreatmentField = (toothNumber: number, field: keyof TreatmentPlan, value: any) => {
    setTreatmentChanges(prev => ({
      ...prev,
      [toothNumber]: {
        ...prev[toothNumber],
        [field]: value,
        // Auto-set completed date when status is completed
        ...(field === 'status' && value === 'completed' && !prev[toothNumber]?.completed_date 
          ? { completed_date: new Date() } 
          : {})
      }
    }));
  };

  const saveTreatmentChanges = async (toothNumber: number) => {
    if (!odontogram || !treatmentChanges[toothNumber]) return;

    try {
      setLoading(true);
      
      const treatmentData = {
        tooth_number: toothNumber,
        treatment_plan: treatmentChanges[toothNumber] as TreatmentPlan
      };

      await odontogramApi.updateToothCondition(odontogram._id, toothNumber, treatmentData);
      
      // Refresh odontogram data
      await fetchOdontogram();
      
      // Reset editing state
      cancelEditingTreatment(toothNumber);
      
      toast({
        title: "Success",
        description: `Treatment plan for tooth ${toothNumber} updated successfully`,
      });
    } catch (error) {
      console.error("Error updating treatment:", error);
      toast({
        title: "Error",
        description: "Failed to update treatment plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTreatment = async (toothNumber: number) => {
    if (!odontogram) return;

    try {
      setLoading(true);
      
      const treatmentData = {
        tooth_number: toothNumber,
        treatment_plan: null
      };

      await odontogramApi.updateToothCondition(odontogram._id, toothNumber, treatmentData);
      
      // Refresh odontogram data
      await fetchOdontogram();
      
      toast({
        title: "Success",
        description: `Treatment plan for tooth ${toothNumber} deleted successfully`,
      });
    } catch (error) {
      console.error("Error deleting treatment:", error);
      toast({
        title: "Error",
        description: "Failed to delete treatment plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addNewTreatment = async () => {
    if (!odontogram) return;

    try {
      setLoading(true);
      
      const treatmentData = {
        tooth_number: newTreatmentToothNumber,
        treatment_plan: {
          planned_treatment: "New Treatment",
          priority: "medium" as TreatmentPriority,
          status: "planned" as TreatmentStatus,
          estimated_cost: 0,
          estimated_duration: "30 minutes",
          planned_date: new Date(),
          notes: ""
        }
      };

      await odontogramApi.updateToothCondition(odontogram._id, newTreatmentToothNumber, treatmentData);
      
      // Refresh odontogram data
      await fetchOdontogram();
      
      // Reset add state and start editing the new treatment
      setAddingNewTreatment(false);
      setTimeout(() => {
        const tooth = odontogram.teeth_conditions?.find(t => t.tooth_number === newTreatmentToothNumber);
        if (tooth?.treatment_plan) {
          startEditingTreatment(newTreatmentToothNumber, tooth.treatment_plan);
        }
      }, 100);
      
      toast({
        title: "Success",
        description: `New treatment plan added for tooth ${newTreatmentToothNumber}`,
      });
    } catch (error) {
      console.error("Error adding treatment:", error);
      toast({
        title: "Error",
        description: "Failed to add treatment plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Periodontal assessment editing functions
  const startEditingPeriodontal = () => {
    setEditingPeriodontal(true);
    setPeriodontalChanges({
      bleeding_on_probing: odontogram?.periodontal_assessment?.bleeding_on_probing ?? false,
      calculus_present: odontogram?.periodontal_assessment?.calculus_present ?? false,
      plaque_index: odontogram?.periodontal_assessment?.plaque_index ?? 0,
      gingival_index: odontogram?.periodontal_assessment?.gingival_index ?? 0,
      general_notes: odontogram?.periodontal_assessment?.general_notes ?? ''
    });
  };

  const cancelEditingPeriodontal = () => {
    setEditingPeriodontal(false);
    setPeriodontalChanges({});
  };

  const savePeriodontalChanges = async () => {
    if (!odontogram) return;

    try {
      setLoading(true);
      await odontogramApi.updateOdontogram(odontogram._id, {
        periodontal_assessment: {
          bleeding_on_probing: periodontalChanges.bleeding_on_probing ?? false,
          calculus_present: periodontalChanges.calculus_present ?? false,
          plaque_index: periodontalChanges.plaque_index ?? 0,
          gingival_index: periodontalChanges.gingival_index ?? 0,
          general_notes: periodontalChanges.general_notes ?? ''
        }
      });

      // Refresh odontogram data
      await fetchOdontogram();
      setEditingPeriodontal(false);
      setPeriodontalChanges({});

      toast({
        title: "Success",
        description: "Periodontal assessment updated successfully",
      });
    } catch (error) {
      console.error("Error updating periodontal assessment:", error);
      toast({
        title: "Error",
        description: "Failed to update periodontal assessment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // General notes editing functions
  const startEditingNotes = () => {
    setEditingNotes(true);
    setNotesChanges(odontogram?.general_notes ?? '');
  };

  const cancelEditingNotes = () => {
    setEditingNotes(false);
    setNotesChanges('');
  };

  const saveNotesChanges = async () => {
    if (!odontogram) return;

    try {
      setLoading(true);
      await odontogramApi.updateOdontogram(odontogram._id, {
        general_notes: notesChanges
      });

      // Refresh odontogram data
      await fetchOdontogram();
      setEditingNotes(false);
      setNotesChanges('');

      toast({
        title: "Success",
        description: "General notes updated successfully",
      });
    } catch (error) {
      console.error("Error updating general notes:", error);
      toast({
        title: "Error",
        description: "Failed to update general notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "planned":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!odontogram) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 w-[95vw] sm:w-full flex flex-col overflow-y-auto">
        <DialogHeader className="flex-shrink-0 px-3 md:px-6 py-3 md:py-4 border-b !mt-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg md:text-xl truncate">
                Dental Chart - {odontogram.patient_id 
                  ? `${odontogram.patient_id.first_name || ''} ${odontogram.patient_id.last_name || ''}`.trim() || 'Unknown Patient'
                  : 'Unknown Patient'}
              </DialogTitle>
              <div className="space-y-1">
                <p className="text-xs md:text-sm text-gray-500">
                  Age: {odontogram.patient_id?.age || 'N/A'} • {odontogram.patient_id?.gender || 'N/A'} • DOB: {formatDate(odontogram.patient_id?.date_of_birth)}
                </p>
                <p className="text-xs md:text-sm text-gray-500">
                  📞 {odontogram.patient_id?.phone || 'N/A'} • ✉️ {odontogram.patient_id?.email || 'N/A'}
                </p>
                <p className="text-xs md:text-sm text-gray-500">
                  🏥 {(odontogram.clinic_id as any)?.name || 'N/A'} • Examined: {formatDate(odontogram.examination_date)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {odontogram.numbering_system.toUpperCase()} System
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {odontogram.patient_type} Patient
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={odontogram.is_active ? "default" : "secondary"}>
                {odontogram.is_active ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline">v{odontogram.version}</Badge>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExportModalOpen(true)}
              >
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              
              {editable && (
                <Button
                  variant={editMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">View Only</span>
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Edit Mode</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1">
          <Tabs defaultValue="chart" className="h-full flex flex-col">
            <div className="flex-shrink-0">
              <TabsList className="mx-3 md:mx-6 mt-3 md:mt-4 grid w-auto grid-cols-4">
                <TabsTrigger value="chart" className="text-xs md:text-sm px-2 md:px-3">Chart</TabsTrigger>
                <TabsTrigger value="treatments" className="text-xs md:text-sm px-2 md:px-3">Treatments</TabsTrigger>
                <TabsTrigger value="periodontal" className="text-xs md:text-sm px-2 md:px-3">Periodontal</TabsTrigger>
                <TabsTrigger value="notes" className="text-xs md:text-sm px-2 md:px-3">Notes</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0">
              <TabsContent value="chart" className="h-full overflow-y-auto p-3 md:p-6 data-[state=active]:flex data-[state=active]:flex-col scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="flex flex-col xl:flex-row gap-4 md:gap-6 flex-1 min-h-0">
                  {/* Main chart */}
                  <div className="flex-1 xl:flex-[2] order-1 relative flex flex-col min-h-0" id="dental-chart">
                    <div className="overflow-x-auto overflow-y-visible pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex-1">
                      <div className="min-w-[800px] w-full h-full">
                        <ToothChart
                          odontogram={odontogram}
                          onToothClick={handleToothClick}
                          editable={editMode}
                          highlightTooth={selectedTooth || undefined}
                          showLabels={true}
                          numberingSystem={odontogram.numbering_system}
                        />
                      </div>
                    </div>
                    {/* Scroll indicator for mobile */}
                    <div className="xl:hidden absolute bottom-1 right-1 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded pointer-events-none">
                      ← Scroll to view all teeth →
                    </div>
                  </div>

                  {/* Tooth details sidebar */}
                  <div className="space-y-4 order-2 xl:order-3 xl:flex-1 xl:min-w-[300px] flex-shrink-0">
                    {/* Treatment Progress */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                          <div className="flex items-center">
                            <TrendingUp className="mr-2 h-5 w-5" />
                            Treatment Progress
                          </div>
                          {editMode && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={fetchOdontogram}
                              title="Refresh progress data"
                            >
                              <Loader2 className="h-4 w-4" />
                            </Button>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Overall Progress</span>
                            <span className={`text-lg font-semibold ${getProgressColor(odontogram.treatment_progress || 0)}`}>
                              {odontogram.treatment_progress || 0}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 transition-all"
                              style={{ width: `${odontogram.treatment_progress || 0}%` }}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Total Planned</div>
                              <div className="font-semibold">{odontogram.treatment_summary?.total_planned_treatments || 0}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Completed</div>
                              <div className="font-semibold">{odontogram.treatment_summary?.completed_treatments || 0}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">In Progress</div>
                              <div className="font-semibold text-yellow-600">{odontogram.treatment_summary?.in_progress_treatments || 0}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Pending</div>
                              <div className="font-semibold text-blue-600">{odontogram.pending_treatments || 0}</div>
                            </div>
                          </div>
                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Estimated Cost</span>
                              <span className="font-semibold">
                                {formatCurrency(odontogram.treatment_summary?.estimated_total_cost)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Doctor Info */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Stethoscope className="mr-2 h-5 w-5" />
                          Doctor Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">
                                {odontogram.doctor_id?.first_name && odontogram.doctor_id?.last_name ? 
                                  `Dr. ${odontogram.doctor_id.first_name} ${odontogram.doctor_id.last_name}` :
                                  "No Doctor Assigned"
                                }
                              </div>
                              {odontogram.doctor_id?.specialization && (
                                <div className="text-sm text-gray-500">
                                  {odontogram.doctor_id.specialization}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              Examined: {formatDate(odontogram.examination_date)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Selected Tooth Details */}
                    {selectedTooth && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">
                            Tooth #{selectedTooth}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {(() => {
                            const toothCondition = getToothCondition(selectedTooth);
                            
                            if (!toothCondition) {
                              return (
                                <div className="text-sm text-gray-500">
                                  No specific conditions recorded for this tooth.
                                </div>
                              );
                            }

                            return (
                              <div className="space-y-3">
                                <div>
                                  <div className="text-sm text-gray-600">Overall Condition</div>
                                  <Badge variant="outline" className="capitalize">
                                    {toothCondition.overall_condition.replace('_', ' ')}
                                  </Badge>
                                </div>

                                {/* Tooth Name from API */}
                                {toothCondition.tooth_name && (
                                  <div>
                                    <div className="text-sm text-gray-600">Tooth Name</div>
                                    <div className="text-sm font-medium">{toothCondition.tooth_name}</div>
                                  </div>
                                )}

                                {/* Mobility */}
                                {toothCondition.mobility !== undefined && (
                                  <div>
                                    <div className="text-sm text-gray-600">Mobility</div>
                                    <Badge variant={toothCondition.mobility > 2 ? "destructive" : toothCondition.mobility > 1 ? "secondary" : "outline"}>
                                      Level {toothCondition.mobility}
                                    </Badge>
                                  </div>
                                )}

                                {/* Periodontal Pocket Depth */}
                                {toothCondition.periodontal_pocket_depth && (
                                  <div>
                                    <div className="text-sm text-gray-600 mb-2">Periodontal Pocket Depth (mm)</div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div className="flex justify-between">
                                        <span>Mesial:</span>
                                        <span className="font-semibold">{toothCondition.periodontal_pocket_depth.mesial}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Distal:</span>
                                        <span className="font-semibold">{toothCondition.periodontal_pocket_depth.distal}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Buccal:</span>
                                        <span className="font-semibold">{toothCondition.periodontal_pocket_depth.buccal}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Lingual:</span>
                                        <span className="font-semibold">{toothCondition.periodontal_pocket_depth.lingual}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Surface Conditions */}
                                {toothCondition.surfaces && toothCondition.surfaces.length > 0 && (
                                  <div>
                                    <div className="text-sm text-gray-600 mb-2">Surface Conditions</div>
                                    <div className="space-y-2">
                                      {toothCondition.surfaces.map((surface, index) => (
                                        <div key={(surface as any)._id || index} className="bg-gray-50 p-2 rounded text-xs">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium capitalize">{surface.surface}</span>
                                            <Badge variant="outline" className="text-xs">
                                              {surface.condition.replace('_', ' ')}
                                            </Badge>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                            <div>Severity: <span className="font-medium capitalize">{surface.severity}</span></div>
                                            <div>Date: <span className="font-medium">{formatDate(surface.date_diagnosed)}</span></div>
                                          </div>
                                          {surface.notes && (
                                            <div className="mt-1 text-xs text-gray-600">
                                              Note: {surface.notes}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Treatment Plan */}
                                {toothCondition.treatment_plan && (
                                  <div>
                                    <div className="text-sm text-gray-600">Treatment Plan</div>
                                    <div className="space-y-1">
                                      <div className="flex items-center space-x-2">
                                        {getStatusIcon(toothCondition.treatment_plan.status)}
                                        <span className="text-sm capitalize">
                                          {toothCondition.treatment_plan.status.replace('_', ' ')}
                                        </span>
                                      </div>
                                      <Badge className={getPriorityColor(toothCondition.treatment_plan.priority)}>
                                        {toothCondition.treatment_plan.priority} priority
                                      </Badge>
                                      {toothCondition.treatment_plan.estimated_cost && (
                                        <div className="text-sm">
                                          Cost: {formatCurrency(toothCondition.treatment_plan.estimated_cost)}
                                        </div>
                                      )}
                                      {toothCondition.treatment_plan.estimated_duration && (
                                        <div className="text-sm">
                                          Duration: {toothCondition.treatment_plan.estimated_duration}
                                        </div>
                                      )}
                                      {toothCondition.treatment_plan.planned_date && (
                                        <div className="text-sm">
                                          Planned: {formatDate(toothCondition.treatment_plan.planned_date)}
                                        </div>
                                      )}
                                      {toothCondition.treatment_plan.completed_date && (
                                        <div className="text-sm">
                                          Completed: {formatDate(toothCondition.treatment_plan.completed_date)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Attachments */}
                                {toothCondition.attachments && toothCondition.attachments.length > 0 && (
                                  <div>
                                    <div className="text-sm text-gray-600">Attachments</div>
                                    <div className="text-sm text-blue-600">
                                      {toothCondition.attachments.length} file(s) attached
                                    </div>
                                  </div>
                                )}

                                {/* Notes */}
                                {toothCondition.notes && (
                                  <div>
                                    <div className="text-sm text-gray-600">Notes</div>
                                    <div className="text-sm bg-gray-50 p-2 rounded">
                                      {toothCondition.notes}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="treatments" className="h-full overflow-y-auto p-3 md:p-6 data-[state=active]:flex data-[state=active]:flex-col scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="space-y-4 flex-1 min-h-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Treatment Plans</h3>
                      {editMode && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAddingNewTreatment(true)}
                          disabled={addingNewTreatment}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Treatment
                        </Button>
                      )}
                    </div>

                    {/* Add New Treatment Form */}
                    {addingNewTreatment && (
                      <Card className="border-dashed border-2 border-blue-300">
                        <CardContent className="pt-4">
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <Label htmlFor="tooth-number">Tooth Number:</Label>
                              <Select
                                value={newTreatmentToothNumber.toString()}
                                onValueChange={(value) => setNewTreatmentToothNumber(parseInt(value))}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 32 }, (_, i) => i + 1).map((num) => (
                                    <SelectItem key={num} value={num.toString()}>
                                      #{num}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={addNewTreatment} size="sm" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Treatment
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAddingNewTreatment(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Treatment Plans */}
                    {odontogram.teeth_conditions
                      ?.filter(tooth => tooth.treatment_plan)
                      .map((tooth) => {
                        const isEditing = editingTreatments[tooth.tooth_number];
                        const treatmentData = isEditing 
                          ? treatmentChanges[tooth.tooth_number] 
                          : tooth.treatment_plan!;

                        return (
                          <Card key={tooth.tooth_number}>
                            <CardContent className="pt-4">
                              {!isEditing ? (
                                // Read-only view
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="outline">Tooth #{tooth.tooth_number}</Badge>
                                      <Badge className={getPriorityColor(tooth.treatment_plan!.priority)}>
                                        {tooth.treatment_plan!.priority}
                                      </Badge>
                                    </div>
                                    <div className="font-medium">
                                      {tooth.treatment_plan!.planned_treatment}
                                    </div>
                                    {tooth.treatment_plan!.estimated_duration && (
                                      <div className="text-xs text-gray-500">
                                        Duration: {tooth.treatment_plan!.estimated_duration}
                                      </div>
                                    )}
                                    {tooth.treatment_plan!.planned_date && (
                                      <div className="text-xs text-gray-500">
                                        Planned: {formatDate(tooth.treatment_plan!.planned_date)}
                                      </div>
                                    )}
                                    {tooth.treatment_plan!.completed_date && (
                                      <div className="text-xs text-green-600">
                                        Completed: {formatDate(tooth.treatment_plan!.completed_date)}
                                      </div>
                                    )}
                                    {tooth.treatment_plan!.notes && (
                                      <div className="text-sm text-gray-600">
                                        {tooth.treatment_plan!.notes}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right space-y-1">
                                    <div className="flex items-center space-x-2">
                                      {getStatusIcon(tooth.treatment_plan!.status)}
                                      <span className="text-sm capitalize">
                                        {tooth.treatment_plan!.status.replace('_', ' ')}
                                      </span>
                                    </div>
                                    {tooth.treatment_plan!.estimated_cost && (
                                      <div className="text-sm font-semibold">
                                        {formatCurrency(tooth.treatment_plan!.estimated_cost)}
                                      </div>
                                    )}
                                    {editMode && (
                                      <div className="flex gap-1 mt-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => startEditingTreatment(tooth.tooth_number, tooth.treatment_plan!)}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => deleteTreatment(tooth.tooth_number)}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                // Editing view
                                <div className="space-y-4">
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline">Tooth #{tooth.tooth_number}</Badge>
                                    <span className="text-sm text-gray-600">Editing</span>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Treatment Procedure</Label>
                                      <Input
                                        value={treatmentData?.planned_treatment || ''}
                                        onChange={(e) => updateTreatmentField(tooth.tooth_number, 'planned_treatment', e.target.value)}
                                        placeholder="e.g., Composite filling, Crown prep..."
                                      />
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label>Status</Label>
                                      <Select
                                        value={treatmentData?.status || 'planned'}
                                        onValueChange={(value: TreatmentStatus) => updateTreatmentField(tooth.tooth_number, 'status', value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="planned">Planned</SelectItem>
                                          <SelectItem value="in_progress">In Progress</SelectItem>
                                          <SelectItem value="completed">Completed</SelectItem>
                                          <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label>Priority</Label>
                                      <Select
                                        value={treatmentData?.priority || 'medium'}
                                        onValueChange={(value: TreatmentPriority) => updateTreatmentField(tooth.tooth_number, 'priority', value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="low">Low</SelectItem>
                                          <SelectItem value="medium">Medium</SelectItem>
                                          <SelectItem value="high">High</SelectItem>
                                          <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label>Estimated Cost</Label>
                                      <Input
                                        type="number"
                                        value={treatmentData?.estimated_cost || 0}
                                        onChange={(e) => updateTreatmentField(tooth.tooth_number, 'estimated_cost', parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                      />
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label>Estimated Duration</Label>
                                      <Input
                                        value={treatmentData?.estimated_duration || ''}
                                        onChange={(e) => updateTreatmentField(tooth.tooth_number, 'estimated_duration', e.target.value)}
                                        placeholder="e.g., 30 minutes, 1 hour"
                                      />
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label>Planned Date</Label>
                                      <Input
                                        type="date"
                                        value={treatmentData?.planned_date ? new Date(treatmentData.planned_date).toISOString().split('T')[0] : ''}
                                        onChange={(e) => updateTreatmentField(tooth.tooth_number, 'planned_date', e.target.value ? new Date(e.target.value) : null)}
                                      />
                                    </div>
                                    
                                    {treatmentData?.status === 'completed' && (
                                      <div className="space-y-2">
                                        <Label>Completed Date</Label>
                                        <Input
                                          type="date"
                                          value={treatmentData?.completed_date ? new Date(treatmentData.completed_date).toISOString().split('T')[0] : ''}
                                          onChange={(e) => updateTreatmentField(tooth.tooth_number, 'completed_date', e.target.value ? new Date(e.target.value) : null)}
                                        />
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Textarea
                                      value={treatmentData?.notes || ''}
                                      onChange={(e) => updateTreatmentField(tooth.tooth_number, 'notes', e.target.value)}
                                      placeholder="Treatment notes..."
                                      rows={3}
                                    />
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => saveTreatmentChanges(tooth.tooth_number)}
                                      size="sm"
                                      disabled={loading}
                                    >
                                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                      <Save className="mr-2 h-4 w-4" />
                                      Save
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => cancelEditingTreatment(tooth.tooth_number)}
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })
                    }
                    
                    {odontogram.teeth_conditions?.filter(tooth => tooth.treatment_plan).length === 0 && !addingNewTreatment && (
                      <Card className="border-dashed">
                        <CardContent className="pt-8 pb-8 text-center text-gray-500">
                          <div>No treatment plans found</div>
                          {editMode && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-4"
                              onClick={() => setAddingNewTreatment(true)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add First Treatment
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
              </TabsContent>

              <TabsContent value="periodontal" className="h-full overflow-y-auto p-3 md:p-6 data-[state=active]:flex data-[state=active]:flex-col scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="space-y-4 flex-1 min-h-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Periodontal Assessment</h3>
                      {editMode && (
                        <Button
                          variant={editingPeriodontal ? "destructive" : "outline"}
                          size="sm"
                          onClick={editingPeriodontal ? cancelEditingPeriodontal : startEditingPeriodontal}
                        >
                          {editingPeriodontal ? (
                            <>
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </>
                          ) : (
                            <>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    
                    <Card>
                      <CardContent className="pt-4">
                        {editingPeriodontal ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Bleeding on Probing</Label>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      checked={periodontalChanges.bleeding_on_probing ?? false}
                                      onCheckedChange={(checked) => 
                                        setPeriodontalChanges(prev => ({ ...prev, bleeding_on_probing: checked }))
                                      }
                                    />
                                    <span className="text-sm text-gray-600">
                                      {periodontalChanges.bleeding_on_probing ? "Yes" : "No"}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Calculus Present</Label>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      checked={periodontalChanges.calculus_present ?? false}
                                      onCheckedChange={(checked) => 
                                        setPeriodontalChanges(prev => ({ ...prev, calculus_present: checked }))
                                      }
                                    />
                                    <span className="text-sm text-gray-600">
                                      {periodontalChanges.calculus_present ? "Yes" : "No"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Plaque Index (0-3)</Label>
                                  <div className="space-y-2">
                                    <Slider
                                      value={[periodontalChanges.plaque_index ?? 0]}
                                      onValueChange={([value]) => 
                                        setPeriodontalChanges(prev => ({ ...prev, plaque_index: value }))
                                      }
                                      max={3}
                                      min={0}
                                      step={1}
                                      className="w-full"
                                    />
                                    <div className="text-sm text-gray-600 text-center">
                                      {periodontalChanges.plaque_index ?? 0}/3
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Gingival Index (0-3)</Label>
                                  <div className="space-y-2">
                                    <Slider
                                      value={[periodontalChanges.gingival_index ?? 0]}
                                      onValueChange={([value]) => 
                                        setPeriodontalChanges(prev => ({ ...prev, gingival_index: value }))
                                      }
                                      max={3}
                                      min={0}
                                      step={1}
                                      className="w-full"
                                    />
                                    <div className="text-sm text-gray-600 text-center">
                                      {periodontalChanges.gingival_index ?? 0}/3
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Periodontal Notes</Label>
                              <Textarea
                                value={periodontalChanges.general_notes ?? ''}
                                onChange={(e) => 
                                  setPeriodontalChanges(prev => ({ ...prev, general_notes: e.target.value }))
                                }
                                placeholder="Add periodontal assessment notes..."
                                rows={3}
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                onClick={savePeriodontalChanges}
                                size="sm"
                                disabled={loading}
                              >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelEditingPeriodontal}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {odontogram?.periodontal_assessment ? (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">Bleeding on Probing</span>
                                      <Badge variant={odontogram.periodontal_assessment.bleeding_on_probing ? "destructive" : "secondary"}>
                                        {odontogram.periodontal_assessment.bleeding_on_probing ? "Yes" : "No"}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">Calculus Present</span>
                                      <Badge variant={odontogram.periodontal_assessment.calculus_present ? "destructive" : "secondary"}>
                                        {odontogram.periodontal_assessment.calculus_present ? "Yes" : "No"}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">Plaque Index</span>
                                      <span className="font-semibold">{odontogram.periodontal_assessment.plaque_index ?? 0}/3</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">Gingival Index</span>
                                      <span className="font-semibold">{odontogram.periodontal_assessment.gingival_index ?? 0}/3</span>
                                    </div>
                                  </div>
                                </div>
                                {odontogram.periodontal_assessment.general_notes && (
                                  <div className="mt-4 pt-4 border-t">
                                    <div className="text-sm text-gray-600 mb-2">Notes</div>
                                    <div className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                                      {odontogram.periodontal_assessment.general_notes}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                No periodontal assessment recorded
                                {editMode && (
                                  <div className="mt-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={startEditingPeriodontal}
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Add Assessment
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
              </TabsContent>

              <TabsContent value="notes" className="h-full overflow-y-auto p-3 md:p-6 data-[state=active]:flex data-[state=active]:flex-col scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="space-y-4 flex-1 min-h-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">General Notes</h3>
                      {editMode && (
                        <Button
                          variant={editingNotes ? "destructive" : "outline"}
                          size="sm"
                          onClick={editingNotes ? cancelEditingNotes : startEditingNotes}
                        >
                          {editingNotes ? (
                            <>
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </>
                          ) : (
                            <>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    
                    <Card>
                      <CardContent className="pt-4">
                        {editingNotes ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">General Notes</Label>
                              <Textarea
                                value={notesChanges}
                                onChange={(e) => setNotesChanges(e.target.value)}
                                placeholder="Add general notes about the patient's dental condition, treatment history, or other relevant information..."
                                rows={8}
                                className="w-full"
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                onClick={saveNotesChanges}
                                size="sm"
                                disabled={loading}
                              >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" />
                                Save Notes
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelEditingNotes}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {odontogram?.general_notes ? (
                              <div className="text-sm bg-gray-50 p-4 rounded whitespace-pre-wrap">
                                {odontogram.general_notes}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                No general notes recorded
                                {editMode && (
                                  <div className="mt-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={startEditingNotes}
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Add Notes
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>

      {/* Tooth Condition Modal */}
      {selectedTooth && (
        <ToothConditionModal
          open={toothConditionModalOpen}
          onOpenChange={setToothConditionModalOpen}
          toothNumber={selectedTooth}
          toothName={getToothName(selectedTooth)}
          selectedSurface={selectedSurface}
          existingCondition={getToothCondition(selectedTooth)}
          onSave={handleSaveToothCondition}
        />
      )}

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        odontogram={odontogram}
        chartElementId="dental-chart"
      />
    </Dialog>
  );
};

export default OdontogramDetailModal;
