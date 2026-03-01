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
import { Edit, TestTube2, Loader2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { Test, TestCategory, SampleType, TestMethodology, TurnaroundTime, CreateTestRequest } from "@/types";

interface EditTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testId: string | null;
  onTestUpdated: () => void;
}

const EditTestModal: React.FC<EditTestModalProps> = ({ open, onOpenChange, testId, onTestUpdated }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalTest, setOriginalTest] = useState<Test | null>(null);
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [sampleTypes, setSampleTypes] = useState<SampleType[]>([]);
  const [methodologies, setMethodologies] = useState<TestMethodology[]>([]);
  const [turnaroundTimes, setTurnaroundTimes] = useState<TurnaroundTime[]>([]);
  
  const [formData, setFormData] = useState<CreateTestRequest>({
    name: "",
    code: "",
    category: "",
    description: "",
    turnaroundTime: "",
    sampleType: "",
    methodology: "",
    normalRange: "",
    units: "",
  });

  // Fetch test data and supporting data
  useEffect(() => {
    const fetchData = async () => {
      if (!testId || !open) {
        // Reset form when modal is closed
        if (!open) {
          setFormData({
            name: "",
            code: "",
            category: "",
            description: "",
            turnaroundTime: "",
            sampleType: "",
            methodology: "",
            normalRange: "",
            units: "",
          });
          setOriginalTest(null);
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

        setOriginalTest(testResponse);
        setCategories(categoriesResponse.data?.categories || []);
        setSampleTypes(sampleTypesResponse.data?.sampleTypes || []);
        setMethodologies(methodologiesResponse.data?.methodologies || []);
        setTurnaroundTimes(turnaroundResponse.data?.turnaroundTimes || []);

        // Populate form with existing test data
        const getCategoryId = (category: string | TestCategory): string => {
          if (typeof category === 'object' && category !== null) {
            return category._id;
          }
          return category;
        };

        const getSampleTypeId = (sampleType: string | SampleType | undefined): string => {
          if (!sampleType) return "";
          if (typeof sampleType === 'object' && sampleType !== null) {
            return sampleType._id;
          }
          return sampleType;
        };

        const getMethodologyId = (methodology: string | TestMethodology | undefined): string => {
          if (!methodology) return "";
          if (typeof methodology === 'object' && methodology !== null) {
            return methodology._id;
          }
          return methodology;
        };

        const getTurnaroundTimeId = (turnaroundTime: string | TurnaroundTime): string => {
          if (typeof turnaroundTime === 'object' && turnaroundTime !== null) {
            return turnaroundTime._id;
          }
          return turnaroundTime;
        };

        setFormData({
          name: testResponse.name,
          code: testResponse.code,
          category: getCategoryId(testResponse.category),
          description: testResponse.description || "",
          turnaroundTime: getTurnaroundTimeId(testResponse.turnaroundTime),
          sampleType: getSampleTypeId(testResponse.sampleType),
          methodology: getMethodologyId(testResponse.methodology),
          normalRange: testResponse.normalRange || "",
          units: testResponse.units || "",
        });
      } catch (err) {
        console.error('Error fetching test data:', err);
        toast({
          title: "Error",
          description: "Failed to load test data. Please try again.",
          variant: "destructive",
        });
        onOpenChange(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [testId, open]);

  const handleChange = (field: keyof CreateTestRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ["name", "code", "category", "description", "turnaroundTime"];
    const missing = required.filter((field) => !formData[field as keyof CreateTestRequest]);

    if (missing.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${missing.join(", ")}`,
        variant: "destructive",
      });
      return false;
    }

    if (formData.code.length < 2) {
      toast({
        title: "Validation Error",
        description: "Test code must be at least 2 characters long",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !testId) {
      return;
    }

    setIsSaving(true);

    try {
      await apiService.updateTest(testId, formData);

      toast({
        title: "Success",
        description: `Test "${formData.name}" has been updated successfully.`,
      });

      onTestUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating test:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalTest) {
      // Reset form to original values
      const getCategoryId = (category: string | TestCategory): string => {
        if (typeof category === 'object' && category !== null) {
          return category._id;
        }
        return category;
      };

      const getSampleTypeId = (sampleType: string | SampleType | undefined): string => {
        if (!sampleType) return "";
        if (typeof sampleType === 'object' && sampleType !== null) {
          return sampleType._id;
        }
        return sampleType;
      };

      const getMethodologyId = (methodology: string | TestMethodology | undefined): string => {
        if (!methodology) return "";
        if (typeof methodology === 'object' && methodology !== null) {
          return methodology._id;
        }
        return methodology;
      };

      const getTurnaroundTimeId = (turnaroundTime: string | TurnaroundTime): string => {
        if (typeof turnaroundTime === 'object' && turnaroundTime !== null) {
          return turnaroundTime._id;
        }
        return turnaroundTime;
      };

      setFormData({
        name: originalTest.name,
        code: originalTest.code,
        category: getCategoryId(originalTest.category),
        description: originalTest.description || "",
        turnaroundTime: getTurnaroundTimeId(originalTest.turnaroundTime),
        sampleType: getSampleTypeId(originalTest.sampleType),
        methodology: getMethodologyId(originalTest.methodology),
        normalRange: originalTest.normalRange || "",
        units: originalTest.units || "",
      });
    }
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Edit className="h-5 w-5 mr-2 text-blue-600" />
            Edit Test
          </DialogTitle>
          <DialogDescription>
            Update the details of this laboratory test.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading test details...</span>
            </div>
          </div>
        ) : originalTest ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Test Status */}
            {originalTest && (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <TestTube2 className="h-4 w-4" />
                  <span className="font-medium">Current Status:</span>
                </div>
                <Badge variant={originalTest.isActive ? "default" : "secondary"}>
                  {originalTest.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            )}

            {/* Basic Test Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TestTube2 className="h-4 w-4 mr-2" />
                  Basic Test Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Test Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="e.g., Complete Blood Count"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Test Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                      placeholder="e.g., CBC"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select test category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="turnaroundTime">Turnaround Time *</Label>
                    <Select
                      value={formData.turnaroundTime}
                      onValueChange={(value) => handleChange("turnaroundTime", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select turnaround time" />
                      </SelectTrigger>
                      <SelectContent>
                        {turnaroundTimes.map((time) => (
                          <SelectItem key={time._id} value={time._id}>
                            {time.name} ({Math.round(time.durationMinutes / 60)}h)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Detailed description of what this test measures..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sampleType">Sample Type</Label>
                    <Select
                      value={formData.sampleType || ""}
                      onValueChange={(value) => handleChange("sampleType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sample type" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleTypes.map((type) => (
                          <SelectItem key={type._id} value={type._id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="methodology">Methodology</Label>
                    <Select
                      value={formData.methodology || ""}
                      onValueChange={(value) => handleChange("methodology", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select methodology" />
                      </SelectTrigger>
                      <SelectContent>
                        {methodologies.map((method) => (
                          <SelectItem key={method._id} value={method._id}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="normalRange">Normal Range</Label>
                    <Input
                      id="normalRange"
                      value={formData.normalRange || ""}
                      onChange={(e) => handleChange("normalRange", e.target.value)}
                      placeholder="e.g., 4.5-5.5 x 10^12/L"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="units">Units</Label>
                    <Input
                      id="units"
                      value={formData.units || ""}
                      onChange={(e) => handleChange("units", e.target.value)}
                      placeholder="e.g., mg/dL, mmol/L"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating Test...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Test
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Test not found or failed to load.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditTestModal; 