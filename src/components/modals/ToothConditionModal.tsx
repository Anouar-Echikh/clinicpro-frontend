import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Zap,
  Activity,
  AlertTriangle,
  Camera,
  FileText,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Circle,
  ChevronDown,
  Search,
  Plus,
  Edit,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useServices } from "@/hooks/useServices";
import {
  DentalConditionType,
  ToothSurface,
  ToothCondition,
  CreateToothConditionRequest,
  UpdateToothConditionRequest,
  SurfaceCondition,
  TreatmentPlan,
  PeriodontalPocketDepth,
  TreatmentPriority,
  TreatmentStatus,
  Service,
} from "@/types";

// Color mapping for conditions (consistent with ToothChart)
const conditionColors: Record<DentalConditionType, string> = {
  healthy: "#22c55e",
  caries: "#ef4444",
  filling: "#3b82f6",
  crown: "#f59e0b",
  bridge: "#8b5cf6",
  implant: "#6b7280",
  extraction: "#000000",
  root_canal: "#dc2626",
  missing: "#f3f4f6",
  fractured: "#f97316",
  wear: "#facc15",
  restoration_needed: "#ec4899",
  sealant: "#06b6d4",
  veneer: "#a855f7",
  temporary_filling: "#84cc16",
  periapical_lesion: "#7c2d12",
};

// Treatment priority colors
const priorityColors: Record<TreatmentPriority, string> = {
  low: "#22c55e",
  medium: "#f59e0b", 
  high: "#f97316",
  urgent: "#ef4444",
};

interface ToothConditionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toothNumber: number;
  toothName: string;
  selectedSurface?: ToothSurface;
  existingCondition?: ToothCondition;
  onSave: (condition: CreateToothConditionRequest | UpdateToothConditionRequest) => Promise<void>;
}

const ToothConditionModal: React.FC<ToothConditionModalProps> = ({
  open,
  onOpenChange,
  toothNumber,
  toothName,
  selectedSurface,
  existingCondition,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState("condition");
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [overallCondition, setOverallCondition] = useState<DentalConditionType>("healthy");
  const [surfaceConditions, setSurfaceConditions] = useState<SurfaceCondition[]>([]);
  const [mobility, setMobility] = useState<number>(0);
  const [notes, setNotes] = useState("");
  
  // Periodontal assessment
  const [pocketDepth, setPocketDepth] = useState<PeriodontalPocketDepth>({});
  
  // Treatment plan
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan>({
    planned_treatment: "",
    priority: "medium",
    estimated_cost: 0,
    estimated_duration: "30 minutes",
    status: "planned",
    planned_date: new Date(),
    notes: ""
  });

  // Services integration
  const { services, loading: servicesLoading } = useServices(open);
  const [serviceSearchOpen, setServiceSearchOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);

  // Service selection handler
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setIsManualEntry(false);
    setTreatmentPlan(prev => ({
      ...prev,
      planned_treatment: service.name,
      estimated_cost: service.price,
      estimated_duration: `${service.duration} minutes`
    }));
    setServiceSearchOpen(false);
  };

  // Manual entry handler
  const handleManualEntry = () => {
    setIsManualEntry(true);
    setSelectedService(null);
    setServiceSearchOpen(false);
  };

  // Cost update handler (allows editing even when service is selected)
  const handleCostChange = (newCost: number) => {
    setTreatmentPlan(prev => ({
      ...prev,
      estimated_cost: newCost
    }));
  };

  // Initialize form with existing data
  useEffect(() => {
    if (existingCondition) {
      setOverallCondition(existingCondition.overall_condition);
      setSurfaceConditions(existingCondition.surfaces || []);
      setMobility(existingCondition.mobility || 0);
      setNotes(existingCondition.notes || "");
      setPocketDepth(existingCondition.periodontal_pocket_depth || {});
      if (existingCondition.treatment_plan) {
        setTreatmentPlan({
          ...existingCondition.treatment_plan,
          planned_date: existingCondition.treatment_plan.planned_date || new Date()
        });
      }
    } else {
      // Reset for new condition
      setOverallCondition("healthy");
      setSurfaceConditions([]);
      setMobility(0);
      setNotes("");
      setPocketDepth({});
      setTreatmentPlan({
        planned_treatment: "",
        priority: "medium",
        estimated_cost: 0,
        estimated_duration: "30 minutes",
        status: "planned",
        planned_date: new Date(),
        notes: ""
      });
    }

    // If a specific surface was selected, focus on that surface
    if (selectedSurface && open) {
      setActiveTab("surfaces");
      // Add surface condition if it doesn't exist
      setSurfaceConditions(prev => {
        const existing = prev.find(s => s.surface === selectedSurface);
        if (!existing) {
          return [...prev, {
            surface: selectedSurface,
            condition: "caries",
            date_diagnosed: new Date()
          }];
        }
        return prev;
      });
    }
  }, [existingCondition, selectedSurface, open]);

  const surfaces: ToothSurface[] = ["occlusal", "mesial", "distal", "buccal", "lingual"];

  const updateSurfaceCondition = (surface: ToothSurface, condition: DentalConditionType) => {
    setSurfaceConditions(prev => {
      const existing = prev.find(s => s.surface === surface);
      if (existing) {
        return prev.map(s => s.surface === surface ? { ...s, condition } : s);
      } else {
        return [...prev, { surface, condition, date_diagnosed: new Date() }];
      }
    });
  };

  const removeSurfaceCondition = (surface: ToothSurface) => {
    setSurfaceConditions(prev => prev.filter(s => s.surface !== surface));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const conditionData: CreateToothConditionRequest | UpdateToothConditionRequest = {
        tooth_number: toothNumber,
        tooth_name: toothName,
        overall_condition: overallCondition,
        surfaces: surfaceConditions,
        mobility: mobility > 0 ? mobility : undefined,
        notes: notes || undefined,
        periodontal_pocket_depth: Object.keys(pocketDepth).length > 0 ? pocketDepth : undefined,
        treatment_plan: treatmentPlan.planned_treatment ? treatmentPlan : undefined
      };

      await onSave(conditionData);
      
      toast({
        title: "Success",
        description: `Tooth ${toothNumber} condition updated successfully`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving tooth condition:", error);
      toast({
        title: "Error",
        description: "Failed to save tooth condition",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getSurfaceCondition = (surface: ToothSurface): DentalConditionType => {
    const surfaceCondition = surfaceConditions.find(s => s.surface === surface);
    return surfaceCondition?.condition || "healthy";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Tooth {toothNumber} - {toothName}
          </DialogTitle>
          <DialogDescription>
            {selectedSurface 
              ? `Editing ${selectedSurface} surface condition`
              : "Edit tooth condition, surfaces, and treatment plan"
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="condition">Overall Condition</TabsTrigger>
            <TabsTrigger value="surfaces">Surface Details</TabsTrigger>
            <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Overall Condition Tab */}
          <TabsContent value="condition" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Overall Tooth Condition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Condition</Label>
                  <Select 
                    value={overallCondition} 
                    onValueChange={(value: DentalConditionType) => setOverallCondition(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(conditionColors).map((condition) => (
                        <SelectItem key={condition} value={condition}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded border"
                              style={{ backgroundColor: conditionColors[condition as DentalConditionType] }}
                            />
                            <span className="capitalize">
                              {condition.replace('_', ' ')}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mobility Assessment */}
                <div className="space-y-2">
                  <Label>Tooth Mobility (0-3 scale)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[mobility]}
                      onValueChange={(value) => setMobility(value[0])}
                      max={3}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0 - No mobility</span>
                      <span>1 - Slight</span>
                      <span>2 - Moderate</span>
                      <span>3 - Severe</span>
                    </div>
                    {mobility > 0 && (
                      <Badge variant="destructive">
                        Grade {mobility} Mobility
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>General Notes</Label>
                  <Textarea
                    placeholder="Add any observations or notes about this tooth..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Surface Details Tab */}
          <TabsContent value="surfaces" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Surface-Specific Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {surfaces.map((surface) => {
                    const condition = getSurfaceCondition(surface);
                    const isActive = surfaceConditions.some(s => s.surface === surface);
                    
                    return (
                      <Card 
                        key={surface} 
                        className={`cursor-pointer transition-all ${
                          isActive ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                        } ${selectedSurface === surface ? 'ring-2 ring-yellow-500' : ''}`}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="font-medium capitalize">
                                {surface}
                              </Label>
                              {isActive && (
                                <Badge 
                                  style={{ 
                                    backgroundColor: conditionColors[condition],
                                    color: 'white'
                                  }}
                                >
                                  {condition.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                            
                            <Select 
                              value={condition} 
                              onValueChange={(value: DentalConditionType) => {
                                if (value === 'healthy') {
                                  removeSurfaceCondition(surface);
                                } else {
                                  updateSurfaceCondition(surface, value);
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(conditionColors).map((cond) => (
                                  <SelectItem key={cond} value={cond}>
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-3 h-3 rounded border"
                                        style={{ backgroundColor: conditionColors[cond as DentalConditionType] }}
                                      />
                                      <span className="capitalize">
                                        {cond.replace('_', ' ')}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {surfaceConditions.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">{surfaceConditions.length}</span> surface(s) have conditions assigned
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Treatment Plan Tab */}
          <TabsContent value="treatment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Treatment Planning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center justify-between">
                      <span>Planned Procedure</span>
                      {selectedService && !isManualEntry && (
                        <Badge variant="outline" className="text-xs">
                          From Services
                        </Badge>
                      )}
                    </Label>
                    
                    <div className="flex gap-2">
                      <Popover open={serviceSearchOpen} onOpenChange={setServiceSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1 justify-between"
                            disabled={servicesLoading}
                          >
                            {selectedService && !isManualEntry
                              ? selectedService.name
                              : treatmentPlan.planned_treatment || "Select procedure..."}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search procedures..." />
                            <CommandList>
                              <CommandEmpty>No procedures found.</CommandEmpty>
                              <CommandGroup heading="Available Services">
                                {services.map((service) => (
                                  <CommandItem
                                    key={service.id}
                                    onSelect={() => handleServiceSelect(service)}
                                    className="flex flex-col items-start p-3"
                                  >
                                    <div className="font-medium">{service.name}</div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                      <span>${service.price}</span>
                                      <span>•</span>
                                      <span>{service.duration} min</span>
                                      {service.category && (
                                        <>
                                          <span>•</span>
                                          <span>{service.category}</span>
                                        </>
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              <CommandGroup>
                                <CommandItem onSelect={handleManualEntry}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Enter custom procedure
                                </CommandItem>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      
                      {(selectedService || isManualEntry) && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedService(null);
                            setIsManualEntry(true);
                            setTreatmentPlan(prev => ({ ...prev, planned_treatment: "" }));
                          }}
                          title="Edit manually"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {isManualEntry && (
                      <Input
                        placeholder="Enter procedure name..."
                        value={treatmentPlan.planned_treatment}
                        onChange={(e) => setTreatmentPlan(prev => ({ ...prev, planned_treatment: e.target.value }))}
                        className="mt-2"
                      />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Treatment Status</Label>
                    <Select 
                      value={treatmentPlan.status} 
                      onValueChange={(value: TreatmentStatus) => {
                        const updates: Partial<TreatmentPlan> = { status: value };
                        // Auto-set completed date when status is completed
                        if (value === 'completed' && !treatmentPlan.completed_date) {
                          updates.completed_date = new Date();
                        }
                        setTreatmentPlan(prev => ({ ...prev, ...updates }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {([
                          { value: 'planned', label: 'Planned', color: '#6b7280' },
                          { value: 'in_progress', label: 'In Progress', color: '#f59e0b' },
                          { value: 'completed', label: 'Completed', color: '#10b981' },
                          { value: 'cancelled', label: 'Cancelled', color: '#ef4444' }
                        ] as const).map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full border"
                                style={{ backgroundColor: status.color }}
                              />
                              <span>{status.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Priority Level</Label>
                    <Select 
                      value={treatmentPlan.priority} 
                      onValueChange={(value: TreatmentPriority) => 
                        setTreatmentPlan(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(priorityColors).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded border"
                                style={{ backgroundColor: priorityColors[priority as TreatmentPriority] }}
                              />
                              <span className="capitalize">{priority}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center justify-between">
                      <span>Estimated Cost ($)</span>
                      {selectedService && !isManualEntry && (
                        <Badge variant="secondary" className="text-xs">
                          Editable
                        </Badge>
                      )}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={treatmentPlan.estimated_cost || ""}
                      onChange={(e) => handleCostChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input
                      type="text"
                      placeholder="30 minutes"
                      value={treatmentPlan.estimated_duration}
                      onChange={(e) => setTreatmentPlan(prev => ({ 
                        ...prev, 
                        estimated_duration: e.target.value || "30 minutes"
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Planned Date</Label>
                    <Input
                      type="date"
                      value={treatmentPlan.planned_date instanceof Date 
                        ? treatmentPlan.planned_date.toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0]
                      }
                      onChange={(e) => setTreatmentPlan(prev => ({ 
                        ...prev, 
                        planned_date: new Date(e.target.value) 
                      }))}
                    />
                  </div>

                  {treatmentPlan.status === 'completed' && (
                    <div className="space-y-2">
                      <Label>Completed Date</Label>
                      <Input
                        type="date"
                        value={treatmentPlan.completed_date instanceof Date 
                          ? treatmentPlan.completed_date.toISOString().split('T')[0]
                          : new Date().toISOString().split('T')[0]
                        }
                        onChange={(e) => setTreatmentPlan(prev => ({ 
                          ...prev, 
                          completed_date: new Date(e.target.value) 
                        }))}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Treatment Notes</Label>
                  <Textarea
                    placeholder="Add treatment details, materials needed, special instructions..."
                    value={treatmentPlan.notes}
                    onChange={(e) => setTreatmentPlan(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Periodontal Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mesial Pocket Depth (mm)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={pocketDepth.mesial || ''}
                      onChange={(e) => setPocketDepth(prev => ({ 
                        ...prev, 
                        mesial: parseFloat(e.target.value) || undefined 
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Distal Pocket Depth (mm)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={pocketDepth.distal || ''}
                      onChange={(e) => setPocketDepth(prev => ({ 
                        ...prev, 
                        distal: parseFloat(e.target.value) || undefined 
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Buccal Pocket Depth (mm)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={pocketDepth.buccal || ''}
                      onChange={(e) => setPocketDepth(prev => ({ 
                        ...prev, 
                        buccal: parseFloat(e.target.value) || undefined 
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Lingual Pocket Depth (mm)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={pocketDepth.lingual || ''}
                      onChange={(e) => setPocketDepth(prev => ({ 
                        ...prev, 
                        lingual: parseFloat(e.target.value) || undefined 
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertCircle className="h-4 w-4" />
            Changes will be saved to the patient's dental record
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToothConditionModal;
