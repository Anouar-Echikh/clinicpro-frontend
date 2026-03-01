import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  User,
  TrendingUp,
  Eye,
  FileText,
  Clock,
  ArrowRight,
  Activity,
  Loader2,
  AlertCircle,
  CheckCircle,
  History,
  BarChart3,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ToothChart from "@/components/odontogram/ToothChart";
import { 
  Odontogram, 
  OdontogramHistory,
  ToothCondition,
  DentalConditionType 
} from "@/types";
import odontogramApi from "@/services/api/odontogramApi";

interface OdontogramHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string | null;
  patientName?: string;
}

const OdontogramHistoryModal: React.FC<OdontogramHistoryModalProps> = ({
  open,
  onOpenChange,
  patientId,
  patientName
}) => {
  const [historyData, setHistoryData] = useState<OdontogramHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOdontogram, setSelectedOdontogram] = useState<Odontogram | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonOdontograms, setComparisonOdontograms] = useState<[Odontogram | null, Odontogram | null]>([null, null]);

  // Fetch patient's odontogram history
  const fetchHistory = async () => {
    if (!patientId) return;
    
    try {
      setLoading(true);
      const response = await odontogramApi.getPatientHistory(patientId);
      setHistoryData(response);
      
      // Auto-select the most recent odontogram
      if (response.odontograms.length > 0) {
        setSelectedOdontogram(response.odontograms[0]);
      }
    } catch (error) {
      console.error("Error fetching odontogram history:", error);
      toast({
        title: "Error",
        description: "Failed to fetch patient's dental history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && patientId) {
      fetchHistory();
    }
  }, [open, patientId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setHistoryData(null);
      setSelectedOdontogram(null);
      setComparisonMode(false);
      setComparisonOdontograms([null, null]);
    }
  }, [open]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? "default" : "secondary";
  };

  const getConditionCounts = (odontogram: Odontogram) => {
    const counts: Record<string, number> = {};
    
    odontogram.teeth_conditions?.forEach(tooth => {
      const condition = tooth.overall_condition;
      counts[condition] = (counts[condition] || 0) + 1;
      
      // Count surface conditions too
      tooth.surfaces?.forEach(surface => {
        if (surface.condition !== 'healthy') {
          const surfaceKey = `${surface.condition}_surface`;
          counts[surfaceKey] = (counts[surfaceKey] || 0) + 1;
        }
      });
    });
    
    return counts;
  };

  const getTreatmentProgress = (odontogram: Odontogram) => {
    const totalTreatments = odontogram.treatment_summary?.total_planned_treatments || 0;
    const completedTreatments = odontogram.treatment_summary?.completed_treatments || 0;
    
    if (totalTreatments === 0) return 0;
    return Math.round((completedTreatments / totalTreatments) * 100);
  };

  const startComparison = (odontogram: Odontogram) => {
    setComparisonMode(true);
    setComparisonOdontograms([odontogram, null]);
  };

  const selectForComparison = (odontogram: Odontogram, position: 0 | 1) => {
    const newComparison = [...comparisonOdontograms] as [Odontogram | null, Odontogram | null];
    newComparison[position] = odontogram;
    setComparisonOdontograms(newComparison);
  };

  const getProgressionAnalysis = () => {
    if (!historyData || historyData.odontograms.length < 2) return null;

    const latest = historyData.odontograms[0];
    const previous = historyData.odontograms[1];
    
    const latestCounts = getConditionCounts(latest);
    const previousCounts = getConditionCounts(previous);
    
    const changes = {
      improved: 0,
      worsened: 0,
      newTreatments: 0,
      completedTreatments: 0
    };

    // Simple progression analysis
    const latestCaries = latestCounts['caries'] || 0;
    const previousCaries = previousCounts['caries'] || 0;
    
    if (latestCaries < previousCaries) changes.improved++;
    if (latestCaries > previousCaries) changes.worsened++;
    
    const latestProgress = getTreatmentProgress(latest);
    const previousProgress = getTreatmentProgress(previous);
    
    if (latestProgress > previousProgress) {
      changes.completedTreatments++;
    }

    return changes;
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading dental history...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Dental History - {patientName || historyData?.patient.full_name}
          </DialogTitle>
        </DialogHeader>

        {!historyData || historyData.odontograms.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg text-gray-600">No dental records found</p>
            <p className="text-sm text-gray-500">No odontograms have been created for this patient yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Records</p>
                      <p className="text-2xl font-bold">{historyData.odontograms.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Latest Visit</p>
                      <p className="text-sm font-semibold">
                        {formatDate(historyData.odontograms[0].examination_date)}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Treatment Progress</p>
                      <p className="text-2xl font-bold">{getTreatmentProgress(historyData.odontograms[0])}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Issues</p>
                      <p className="text-2xl font-bold">
                        {getConditionCounts(historyData.odontograms[0])['caries'] || 0}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="timeline">Timeline View</TabsTrigger>
                <TabsTrigger value="comparison">Compare Records</TabsTrigger>
                <TabsTrigger value="progression">Progress Analysis</TabsTrigger>
              </TabsList>

              {/* Timeline View */}
              <TabsContent value="timeline" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* History List */}
                  <div className="lg:col-span-1">
                    <h3 className="text-lg font-semibold mb-4">Examination Records</h3>
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {historyData.odontograms.map((odontogram, index) => (
                          <Card 
                            key={odontogram._id}
                            className={`cursor-pointer transition-all ${
                              selectedOdontogram?._id === odontogram._id 
                                ? 'ring-2 ring-blue-500 bg-blue-50' 
                                : 'hover:shadow-md'
                            }`}
                            onClick={() => setSelectedOdontogram(odontogram)}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">
                                    {formatDate(odontogram.examination_date)}
                                  </span>
                                  <Badge variant={getStatusBadgeVariant(odontogram.is_active)}>
                                    {odontogram.is_active ? 'Active' : `v${odontogram.version}`}
                                  </Badge>
                                </div>
                                
                                <div className="text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <User className="h-3 w-3" />
                                    {odontogram.doctor_id?.first_name && odontogram.doctor_id?.last_name ? 
                                      `Dr. ${odontogram.doctor_id.first_name} ${odontogram.doctor_id.last_name}` :
                                      "No Doctor Assigned"
                                    }
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-500">
                                    {odontogram.teeth_conditions?.length || 0} conditions
                                  </span>
                                  <span className="text-gray-500">
                                    {getTreatmentProgress(odontogram)}% complete
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Selected Record Details */}
                  <div className="lg:col-span-2">
                    {selectedOdontogram ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">
                            Record from {formatDate(selectedOdontogram.examination_date)}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startComparison(selectedOdontogram)}
                            >
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Compare
                            </Button>
                          </div>
                        </div>
                        
                        <ToothChart
                          odontogram={selectedOdontogram}
                          editable={false}
                          showLabels={true}
                          numberingSystem={selectedOdontogram.numbering_system}
                        />
                        
                        {/* Record Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Conditions Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {Object.entries(getConditionCounts(selectedOdontogram))
                                  .filter(([_, count]) => count > 0)
                                  .map(([condition, count]) => (
                                    <div key={condition} className="flex justify-between">
                                      <span className="text-sm capitalize">
                                        {condition.replace('_', ' ')}
                                      </span>
                                      <span className="text-sm font-semibold">{count}</span>
                                    </div>
                                  ))
                                }
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Treatment Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm">Planned</span>
                                  <span className="text-sm font-semibold">
                                    {selectedOdontogram.treatment_summary?.total_planned_treatments || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Completed</span>
                                  <span className="text-sm font-semibold">
                                    {selectedOdontogram.treatment_summary?.completed_treatments || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">In Progress</span>
                                  <span className="text-sm font-semibold">
                                    {selectedOdontogram.treatment_summary?.in_progress_treatments || 0}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-96 text-gray-500">
                        <div className="text-center">
                          <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Select a record to view details</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Comparison View */}
              <TabsContent value="comparison" className="space-y-4">
                {comparisonMode ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Compare Records</h3>
                      <Button
                        variant="outline"
                        onClick={() => setComparisonMode(false)}
                      >
                        Exit Comparison
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* First Record */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            {comparisonOdontograms[0] 
                              ? formatDate(comparisonOdontograms[0].examination_date)
                              : 'Select First Record'
                            }
                          </h4>
                          {!comparisonOdontograms[0] && (
                            <div className="text-sm text-gray-500">Click a record below</div>
                          )}
                        </div>
                        
                        {comparisonOdontograms[0] && (
                          <ToothChart
                            odontogram={comparisonOdontograms[0]}
                            editable={false}
                            showLabels={true}
                            numberingSystem={comparisonOdontograms[0].numbering_system}
                          />
                        )}
                      </div>

                      {/* Second Record */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            {comparisonOdontograms[1] 
                              ? formatDate(comparisonOdontograms[1].examination_date)
                              : 'Select Second Record'
                            }
                          </h4>
                          {!comparisonOdontograms[1] && (
                            <div className="text-sm text-gray-500">Click a record below</div>
                          )}
                        </div>
                        
                        {comparisonOdontograms[1] && (
                          <ToothChart
                            odontogram={comparisonOdontograms[1]}
                            editable={false}
                            showLabels={true}
                            numberingSystem={comparisonOdontograms[1].numbering_system}
                          />
                        )}
                      </div>
                    </div>

                    {/* Record Selection for Comparison */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Select Records to Compare:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {historyData.odontograms.map((odontogram) => (
                          <Card 
                            key={odontogram._id}
                            className="cursor-pointer hover:shadow-md transition-all"
                          >
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    {formatDate(odontogram.examination_date)}
                                  </span>
                                  <Badge variant={getStatusBadgeVariant(odontogram.is_active)}>
                                    v{odontogram.version}
                                  </Badge>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => selectForComparison(odontogram, 0)}
                                    disabled={comparisonOdontograms[1]?._id === odontogram._id}
                                  >
                                    First
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => selectForComparison(odontogram, 1)}
                                    disabled={comparisonOdontograms[0]?._id === odontogram._id}
                                  >
                                    Second
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg text-gray-600">Record Comparison</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Compare dental records to track treatment progress and changes over time.
                    </p>
                    <Button
                      onClick={() => {
                        setComparisonMode(true);
                        if (historyData.odontograms.length > 0) {
                          setComparisonOdontograms([historyData.odontograms[0], null]);
                        }
                      }}
                    >
                      Start Comparison
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Progress Analysis */}
              <TabsContent value="progression" className="space-y-4">
                {(() => {
                  const analysis = getProgressionAnalysis();
                  
                  if (!analysis) {
                    return (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg text-gray-600">Insufficient Data</p>
                        <p className="text-sm text-gray-500">
                          At least 2 dental records are needed for progress analysis.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Treatment Progress Analysis</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="pt-4">
                            <div className="text-center">
                              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                              <p className="text-2xl font-bold text-green-600">{analysis.improved}</p>
                              <p className="text-sm text-gray-600">Improved Conditions</p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="pt-4">
                            <div className="text-center">
                              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                              <p className="text-2xl font-bold text-red-600">{analysis.worsened}</p>
                              <p className="text-sm text-gray-600">Worsened Conditions</p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="pt-4">
                            <div className="text-center">
                              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                              <p className="text-2xl font-bold text-blue-600">{analysis.completedTreatments}</p>
                              <p className="text-sm text-gray-600">Completed Treatments</p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="pt-4">
                            <div className="text-center">
                              <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                              <p className="text-2xl font-bold text-purple-600">{analysis.newTreatments}</p>
                              <p className="text-sm text-gray-600">New Treatments</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Timeline Visualization */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Treatment Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {historyData.odontograms
                              .slice(0, 5)
                              .map((odontogram, index) => (
                                <div key={odontogram._id} className="flex items-center gap-4">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">
                                        {formatDate(odontogram.examination_date)}
                                      </span>
                                      <div className="text-sm text-gray-600">
                                        {getTreatmentProgress(odontogram)}% complete
                                      </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {odontogram.teeth_conditions?.length || 0} conditions recorded
                                    </div>
                                  </div>
                                  {index < historyData.odontograms.length - 1 && (
                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OdontogramHistoryModal;
