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
import { Plus, TestTube2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { TestCategory, SampleType, TestMethodology, TurnaroundTime, CreateTestRequest } from "@/types";

interface AddTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTestAdded: () => void;
}

const AddTestModal: React.FC<AddTestModalProps> = ({ open, onOpenChange, onTestAdded }) => {
  const [isLoading, setIsLoading] = useState(false);
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

  // Fetch supporting data
  useEffect(() => {
    const fetchSupportingData = async () => {
      try {
        const [categoriesResponse, sampleTypesResponse, methodologiesResponse, turnaroundResponse] = await Promise.all([
          apiService.getTestCategories({ limit: 100, status: 'active' }),
          apiService.getSampleTypes({ limit: 100, status: 'active' }),
          apiService.getTestMethodologies({ limit: 100, status: 'active' }),
          apiService.getTurnaroundTimes({ limit: 100, status: 'active' }),
        ]);

        setCategories(categoriesResponse.data?.categories || []);
        setSampleTypes(sampleTypesResponse.data?.sampleTypes || []);
        setMethodologies(methodologiesResponse.data?.methodologies || []);
        setTurnaroundTimes(turnaroundResponse.data?.turnaroundTimes || []);
      } catch (err) {
        console.error('Error fetching supporting data:', err);
        toast({
          title: "Error",
          description: "Failed to load form data. Please try again.",
          variant: "destructive",
        });
      }
    };

    if (open) {
      fetchSupportingData();
    }
  }, [open]);

  const handleChange = (field: keyof CreateTestRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateTestCode = () => {
    if (formData.name && formData.category) {
      const nameWords = formData.name.split(" ").filter((word) => word.length > 2);
      const nameCode = nameWords
        .slice(0, 2)
        .map((word) => word.substring(0, 2).toUpperCase())
        .join("");
      const categoryName = categories.find(c => c._id === formData.category)?.name || formData.category;
      const categoryCode = categoryName.substring(0, 2).toUpperCase();
      const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, "0");
      const generatedCode = `${categoryCode}${nameCode}${randomNum}`;
      handleChange("code", generatedCode);
    } else {
      toast({
        title: "Info",
        description: "Please enter test name and select category first",
        variant: "default",
      });
    }
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

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await apiService.createTest(formData);

      toast({
        title: "Success",
        description: `Test "${formData.name}" has been created successfully.`,
      });

      // Reset form
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

      onTestAdded();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating test:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <TestTube2 className="h-5 w-5 mr-2 text-blue-600" />
            Add New Laboratory Test
          </DialogTitle>
          <DialogDescription>
            Create a new test for your laboratory test catalog.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                  <div className="flex space-x-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                      placeholder="e.g., CBC"
                      className="flex-1"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateTestCode}
                      className="whitespace-nowrap"
                    >
                      Generate
                    </Button>
                  </div>
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
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Test...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Test
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTestModal; 