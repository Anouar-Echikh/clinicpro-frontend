import React, { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  TestTube2,
  Beaker,
  Heart,
  Zap,
  Microscope,
  Clock,
  AlertTriangle,
  FileText,
  Settings,
  CheckCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AddNewTestModalProps {
  trigger?: React.ReactNode;
}

const AddNewTestModal: React.FC<AddNewTestModalProps> = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "",
    description: "",
    normalRange: "",
    units: "",
    methodology: "",
    turnaroundTime: "",
    sampleType: "",
    sampleVolume: "",
    storageConditions: "",
    clinicalSignificance: "",
    interferences: "",
    limitations: "",
    isActive: true,
    isCritical: false,
    requiresFasting: false,
    requiresSpecialPreparation: false,
    preparationInstructions: "",
  });

  const categories = [
    "Hematology",
    "Clinical Chemistry",
    "Clinical Pathology",
    "Microbiology",
    "Immunology",
    "Endocrinology",
    "Cardiology",
    "Toxicology",
    "Molecular Diagnostics",
    "Genetics",
    "Histopathology",
    "Cytology",
    "Other",
  ];

  const methodologies = [
    "Automated cell counter",
    "Enzymatic colorimetric",
    "Immunoassay",
    "HPLC",
    "Mass spectrometry",
    "PCR",
    "Fluorescence polarization",
    "Turbidimetry",
    "Nephelometry",
    "Ion-selective electrode",
    "Spectrophotometry",
    "Microscopy",
    "Culture",
    "Manual counting",
    "Other",
  ];

  const sampleTypes = [
    "Whole blood",
    "Serum",
    "Plasma",
    "Urine",
    "CSF",
    "Synovial fluid",
    "Pleural fluid",
    "Ascitic fluid",
    "Saliva",
    "Stool",
    "Swab",
    "Tissue",
    "Other",
  ];

  const turnaroundTimes = [
    "STAT (< 1 hour)",
    "1-2 hours",
    "2-4 hours",
    "4-6 hours",
    "6-8 hours",
    "8-12 hours",
    "12-24 hours",
    "1-2 days",
    "2-3 days",
    "3-5 days",
    "5-7 days",
    "1-2 weeks",
    "2-4 weeks",
  ];

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateTestCode = () => {
    if (formData.name && formData.category) {
      const nameWords = formData.name
        .split(" ")
        .filter((word) => word.length > 2);
      const nameCode = nameWords
        .slice(0, 2)
        .map((word) => word.substring(0, 2).toUpperCase())
        .join("");
      const categoryCode = formData.category.substring(0, 2).toUpperCase();
      const randomNum = Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, "0");
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

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
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

  const validateForm = () => {
    const required = [
      "name",
      "code",
      "category",
      "description",
      "methodology",
      "turnaroundTime",
      "sampleType",
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

    // Code format validation
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Test created successfully",
        description: `${formData.name} (${formData.code}) has been added to the test catalog.`,
      });

      // Reset form
      setFormData({
        name: "",
        code: "",
        category: "",
        description: "",
        normalRange: "",
        units: "",
        methodology: "",
        turnaroundTime: "",
        sampleType: "",
        sampleVolume: "",
        storageConditions: "",
        clinicalSignificance: "",
        interferences: "",
        limitations: "",
        isActive: true,
        isCritical: false,
        requiresFasting: false,
        requiresSpecialPreparation: false,
        preparationInstructions: "",
      });

      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test. Please try again.",
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
            Add New Test
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <TestTube2 className="h-5 w-5 mr-2 text-blue-600" />
            Add New Laboratory Test
          </DialogTitle>
          <DialogDescription>
            Create a new test type for your laboratory test catalog with
            complete configuration.
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
                      onChange={(e) =>
                        handleChange("code", e.target.value.toUpperCase())
                      }
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
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(category)}
                          <span>{category}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              {formData.category && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-blue-700">
                    {getCategoryIcon(formData.category)}
                    <span className="font-medium ml-2">
                      Category: {formData.category}
                    </span>
                    {formData.code && (
                      <Badge variant="outline" className="ml-4 bg-white">
                        Code: {formData.code}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reference Values & Units */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Reference Values & Units
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="normalRange">Normal Range</Label>
                  <Textarea
                    id="normalRange"
                    value={formData.normalRange}
                    onChange={(e) =>
                      handleChange("normalRange", e.target.value)
                    }
                    placeholder="e.g., WBC: 4.0-11.0 ×10³/μL, RBC: 4.5-5.9 ×10⁶/μL"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="units">Units</Label>
                  <Input
                    id="units"
                    value={formData.units}
                    onChange={(e) => handleChange("units", e.target.value)}
                    placeholder="e.g., mg/dL, ×10³/μL, mIU/L"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicalSignificance">
                  Clinical Significance
                </Label>
                <Textarea
                  id="clinicalSignificance"
                  value={formData.clinicalSignificance}
                  onChange={(e) =>
                    handleChange("clinicalSignificance", e.target.value)
                  }
                  placeholder="Clinical uses and diagnostic significance of this test..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Technical Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="methodology">Methodology *</Label>
                  <Select
                    value={formData.methodology}
                    onValueChange={(value) =>
                      handleChange("methodology", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select methodology" />
                    </SelectTrigger>
                    <SelectContent>
                      {methodologies.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="turnaroundTime">Turnaround Time *</Label>
                  <Select
                    value={formData.turnaroundTime}
                    onValueChange={(value) =>
                      handleChange("turnaroundTime", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select turnaround time" />
                    </SelectTrigger>
                    <SelectContent>
                      {turnaroundTimes.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sampleType">Sample Type *</Label>
                  <Select
                    value={formData.sampleType}
                    onValueChange={(value) => handleChange("sampleType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sample type" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sampleVolume">Sample Volume</Label>
                  <Input
                    id="sampleVolume"
                    value={formData.sampleVolume}
                    onChange={(e) =>
                      handleChange("sampleVolume", e.target.value)
                    }
                    placeholder="e.g., 5 mL, 2-3 mL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storageConditions">Storage Conditions</Label>
                  <Input
                    id="storageConditions"
                    value={formData.storageConditions}
                    onChange={(e) =>
                      handleChange("storageConditions", e.target.value)
                    }
                    placeholder="e.g., Room temp, 2-8°C"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interferences">Known Interferences</Label>
                  <Textarea
                    id="interferences"
                    value={formData.interferences}
                    onChange={(e) =>
                      handleChange("interferences", e.target.value)
                    }
                    placeholder="Medications, substances, or conditions that may interfere..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limitations">Test Limitations</Label>
                  <Textarea
                    id="limitations"
                    value={formData.limitations}
                    onChange={(e) =>
                      handleChange("limitations", e.target.value)
                    }
                    placeholder="Known limitations or considerations for this test..."
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Preparation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Patient Preparation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresFasting"
                      checked={formData.requiresFasting}
                      onCheckedChange={(checked) =>
                        handleChange("requiresFasting", checked)
                      }
                    />
                    <Label htmlFor="requiresFasting" className="text-sm">
                      Requires fasting
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresSpecialPreparation"
                      checked={formData.requiresSpecialPreparation}
                      onCheckedChange={(checked) =>
                        handleChange("requiresSpecialPreparation", checked)
                      }
                    />
                    <Label
                      htmlFor="requiresSpecialPreparation"
                      className="text-sm"
                    >
                      Requires special preparation
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isCritical"
                      checked={formData.isCritical}
                      onCheckedChange={(checked) =>
                        handleChange("isCritical", checked)
                      }
                    />
                    <Label htmlFor="isCritical" className="text-sm">
                      Critical test (requires immediate attention)
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preparationInstructions">
                    Preparation Instructions
                  </Label>
                  <Textarea
                    id="preparationInstructions"
                    value={formData.preparationInstructions}
                    onChange={(e) =>
                      handleChange("preparationInstructions", e.target.value)
                    }
                    placeholder="Detailed patient preparation instructions..."
                    rows={4}
                  />
                </div>
              </div>

              {(formData.requiresFasting ||
                formData.requiresSpecialPreparation ||
                formData.isCritical) && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center text-orange-700">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="font-medium">Special Requirements:</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {formData.requiresFasting && (
                      <div className="text-sm text-orange-600">
                        • Patient fasting required
                      </div>
                    )}
                    {formData.requiresSpecialPreparation && (
                      <div className="text-sm text-orange-600">
                        �� Special preparation needed
                      </div>
                    )}
                    {formData.isCritical && (
                      <div className="text-sm text-orange-600">
                        • Critical test - priority handling
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Test Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    handleChange("isActive", checked)
                  }
                />
                <Label htmlFor="isActive" className="text-sm">
                  Make this test active and available for ordering
                </Label>
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

export default AddNewTestModal;
