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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  TestTube2, 
  Loader2, 
  Beaker, 
  Heart, 
  Zap, 
  Microscope, 
  Clock,
  Calendar,
  User
} from "lucide-react";
import { apiService } from "@/services/api";
import { Test, TestCategory, SampleType, TestMethodology, TurnaroundTime } from "@/types";

interface ViewTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testId: string | null;
}

const ViewTestModal: React.FC<ViewTestModalProps> = ({ open, onOpenChange, testId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [test, setTest] = useState<Test | null>(null);
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [sampleTypes, setSampleTypes] = useState<SampleType[]>([]);
  const [methodologies, setMethodologies] = useState<TestMethodology[]>([]);
  const [turnaroundTimes, setTurnaroundTimes] = useState<TurnaroundTime[]>([]);

  // Fetch test data
  useEffect(() => {
    const fetchTestData = async () => {
      if (!testId || !open) {
        // Reset test data when modal is closed
        if (!open) {
          setTest(null);
        }
        return;
      }
      
      setIsLoading(true);
      try {
        const [testResponse, categoriesResponse, sampleTypesResponse, methodologiesResponse, turnaroundResponse] = await Promise.all([
          apiService.getTest(testId),
          apiService.getTestCategories({ limit: 100, status: 'active' }),
          apiService.getSampleTypes({ limit: 100, status: 'active' }),
          apiService.getTestMethodologies({ limit: 100, status: 'active' }),
          apiService.getTurnaroundTimes({ limit: 100, status: 'active' }),
        ]);

        setTest(testResponse);
        setCategories(categoriesResponse.data?.categories || []);
        setSampleTypes(sampleTypesResponse.data?.sampleTypes || []);
        setMethodologies(methodologiesResponse.data?.methodologies || []);
        setTurnaroundTimes(turnaroundResponse.data?.turnaroundTimes || []);
      } catch (err) {
        console.error('Error fetching test data:', err);
        setTest(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestData();
  }, [testId, open]);

  const getCategoryName = (categoryId: string | TestCategory) => {
    if (typeof categoryId === 'object' && categoryId !== null) {
      return categoryId.name;
    }
    const category = categories.find(c => c._id === categoryId);
    return category?.name || categoryId;
  };

  const getSampleTypeName = (sampleTypeId: string | SampleType | undefined): string => {
    if (!sampleTypeId) return 'N/A';
    if (typeof sampleTypeId === 'object' && sampleTypeId !== null) {
      return sampleTypeId.name;
    }
    const sampleType = sampleTypes.find(st => st._id === sampleTypeId);
    return sampleType?.name || String(sampleTypeId);
  };

  const getMethodologyName = (methodologyId: string | TestMethodology | undefined): string => {
    if (!methodologyId) return 'N/A';
    if (typeof methodologyId === 'object' && methodologyId !== null) {
      return methodologyId.name;
    }
    const methodology = methodologies.find(m => m._id === methodologyId);
    return methodology?.name || String(methodologyId);
  };

  const getTurnaroundTimeName = (turnaroundId: string | TurnaroundTime): string => {
    if (typeof turnaroundId === 'object' && turnaroundId !== null) {
      const tat = turnaroundId as TurnaroundTime;
      return `${tat.name} (${Math.round(tat.durationMinutes / 60)}h)`;
    }
    const turnaround = turnaroundTimes.find(t => t._id === turnaroundId);
    return turnaround ? `${turnaround.name} (${Math.round(turnaround.durationMinutes / 60)}h)` : String(turnaroundId);
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "hematology":
        return <Beaker className="h-4 w-4 text-red-600" />;
      case "clinical chemistry":
        return <TestTube2 className="h-4 w-4 text-blue-600" />;
      case "cardiology":
        return <Heart className="h-4 w-4 text-pink-600" />;
      case "endocrinology":
        return <Zap className="h-4 w-4 text-purple-600" />;
      default:
        return <Microscope className="h-4 w-4 text-green-600" />;
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Eye className="h-5 w-5 mr-2 text-blue-600" />
            Test Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this laboratory test.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading test details...</span>
            </div>
          </div>
        ) : test ? (
          <div className="space-y-6">
            {/* Test Status and Basic Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <TestTube2 className="h-4 w-4 mr-2" />
                    {test.name}
                  </CardTitle>
                  <Badge variant={test.isActive ? "default" : "secondary"}>
                    {test.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Test Code</Label>
                    <Input value={test.code} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted">
                      {getCategoryIcon(getCategoryName(test.category as string))}
                      <span>{getCategoryName(test.category as string)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={test.description || 'No description available'} 
                    readOnly 
                    className="bg-muted min-h-[80px]" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sample Type</Label>
                    <Input 
                      value={getSampleTypeName(test.sampleType)} 
                      readOnly 
                      className="bg-muted" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Methodology</Label>
                    <Input 
                      value={getMethodologyName(test.methodology)} 
                      readOnly 
                      className="bg-muted" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Turnaround Time</Label>
                    <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{getTurnaroundTimeName(test.turnaroundTime)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Normal Range</Label>
                    <Input 
                      value={test.normalRange || 'Not specified'} 
                      readOnly 
                      className="bg-muted" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Units</Label>
                  <Input 
                    value={test.units || 'Not specified'} 
                    readOnly 
                    className="bg-muted" 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Test Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Created Date</Label>
                    <Input 
                      value={test.created_at ? new Date(test.created_at).toLocaleDateString() : 'N/A'} 
                      readOnly 
                      className="bg-muted" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Updated</Label>
                    <Input 
                      value={test.updated_at ? new Date(test.updated_at).toLocaleDateString() : 'N/A'} 
                      readOnly 
                      className="bg-muted" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Test ID</Label>
                  <Input 
                    value={test._id} 
                    readOnly 
                    className="bg-muted font-mono text-sm" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Test not found or failed to load.</p>
          </div>
        )}

        {/* Dialog Actions */}
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewTestModal; 