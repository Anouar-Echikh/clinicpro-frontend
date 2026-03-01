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
import {
  Plus,
  TestTube,
  Droplets,
  FlaskConical,
  CheckCircle,
  AlertTriangle,
  Thermometer,
  Clock,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { SampleType } from "@/types";

interface AddSampleTypeModalProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  sampleType?: SampleType | null; // For editing mode
}

const AddSampleTypeModal: React.FC<AddSampleTypeModalProps> = ({ 
  trigger, 
  isOpen, 
  onClose, 
  onSuccess,
  sampleType 
}) => {
  const [open, setOpen] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const modalOpen = isOpen !== undefined ? isOpen : open;
  const setModalOpen = onClose !== undefined ? (value: boolean) => {
    if (!value) onClose();
  } : setOpen;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    category: "",
    collectionMethod: "",
    container: "",
    preservative: "",
    storageTemp: "",
    storageTime: "",
    volume: "",
    specialInstructions: "",
    commonTests: "",
    handlingRequirements: "",
    processingTime: "",
    transportConditions: "",
    rejectionCriteria: "",
    safetyPrecautions: "",
    isActive: true,
  });

  // Initialize form with sample type data for editing
  useEffect(() => {
    if (sampleType) {
      setFormData({
        name: sampleType.name || "",
        code: sampleType.code || "",
        description: sampleType.description || "",
        category: sampleType.category || "",
        collectionMethod: sampleType.collectionMethod || "",
        container: sampleType.container || "",
        preservative: sampleType.preservative || "",
        storageTemp: sampleType.storageTemp || "",
        storageTime: sampleType.storageTime || "",
        volume: sampleType.volume || "",
        specialInstructions: sampleType.specialInstructions || "",
        commonTests: sampleType.commonTests?.join(", ") || "",
        handlingRequirements: "",
        processingTime: "",
        transportConditions: "",
        rejectionCriteria: "",
        safetyPrecautions: "",
        isActive: sampleType.isActive ?? true,
      });
    } else {
      // Reset form for new sample type
      setFormData({
        name: "",
        code: "",
        description: "",
        category: "",
        collectionMethod: "",
        container: "",
        preservative: "",
        storageTemp: "",
        storageTime: "",
        volume: "",
        specialInstructions: "",
        commonTests: "",
        handlingRequirements: "",
        processingTime: "",
        transportConditions: "",
        rejectionCriteria: "",
        safetyPrecautions: "",
        isActive: true,
      });
    }
  }, [sampleType]);

  const categories = [
    {
      value: "blood",
      label: "Blood",
      icon: <Droplets className="h-4 w-4 text-red-600" />,
    },
    {
      value: "urine",
      label: "Urine",
      icon: <TestTube className="h-4 w-4 text-yellow-600" />,
    },
    {
      value: "body_fluid",
      label: "Body Fluid",
      icon: <FlaskConical className="h-4 w-4 text-blue-600" />,
    },
    {
      value: "tissue",
      label: "Tissue",
      icon: <TestTube className="h-4 w-4 text-green-600" />,
    },
    {
      value: "swab",
      label: "Swab",
      icon: <TestTube className="h-4 w-4 text-purple-600" />,
    },
    {
      value: "other",
      label: "Other",
      icon: <TestTube className="h-4 w-4 text-gray-600" />,
    },
  ];

  const collectionMethods = [
    "Venipuncture",
    "Fingerstick",
    "Heel stick",
    "Arterial puncture",
    "Clean catch midstream",
    "Catheterized specimen",
    "24-hour collection",
    "Lumbar puncture",
    "Thoracentesis",
    "Paracentesis",
    "Swab collection",
    "Biopsy",
    "Aspiration",
    "Other",
  ];

  const containers = [
    "EDTA tube (Lavender top)",
    "Heparin tube (Green top)",
    "Plain tube (Red top)",
    "SST tube (Gold top)",
    "Citrate tube (Blue top)",
    "Oxalate/Fluoride tube (Gray top)",
    "Sterile urine container",
    "24-hour urine container",
    "Sterile tubes",
    "Transport medium",
    "Formalin container",
    "Cryovial",
    "Other",
  ];

  const storageTemperatures = [
    "Room temperature (20-25°C)",
    "Refrigerated (2-8°C)",
    "Frozen (-20°C)",
    "Ultra-low (-80°C)",
    "Dry ice transport",
    "Ice slurry",
    "37°C incubation",
    "Ambient temperature",
  ];

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateCode = () => {
    if (formData.name && formData.category) {
      const nameCode = formData.name
        .split(" ")
        .map((word) => word.substring(0, 2))
        .join("")
        .toUpperCase();
      const categoryCode = formData.category.substring(0, 2).toUpperCase();
      const randomNum = Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, "0");
      const generatedCode = `${categoryCode}-${nameCode}${randomNum}`;
      handleChange("code", generatedCode);
    } else {
      toast({
        title: "Info",
        description: "Please enter sample name and select category first",
        variant: "default",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find((c) => c.value === category);
    return categoryData ? (
      categoryData.icon
    ) : (
      <TestTube className="h-4 w-4 text-gray-600" />
    );
  };

  const validateForm = () => {
    const required = [
      "name",
      "code",
      "description",
      "category",
      "collectionMethod",
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

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare API data
      const apiData = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        category: formData.category as 'blood' | 'urine' | 'body_fluid' | 'tissue' | 'swab' | 'other',
        collectionMethod: formData.collectionMethod,
        container: formData.container,
        preservative: formData.preservative || undefined,
        storageTemp: formData.storageTemp,
        storageTime: formData.storageTime,
        volume: formData.volume,
        specialInstructions: formData.specialInstructions || undefined,
        commonTests: formData.commonTests ? formData.commonTests.split(',').map(test => test.trim()).filter(Boolean) : [],
        isActive: formData.isActive,
      };

      let result;
      if (sampleType) {
        // Update existing sample type
        result = await apiService.updateSampleType(sampleType._id, apiData);
        toast({
          title: "Sample type updated successfully",
          description: `${formData.name} (${formData.code}) has been updated.`,
        });
      } else {
        // Create new sample type
        result = await apiService.createSampleType(apiData);
        toast({
          title: "Sample type created successfully",
          description: `${formData.name} (${formData.code}) has been added to the sample type catalog.`,
        });
      }

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      setModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to ${sampleType ? 'update' : 'create'} sample type. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <TestTube className="h-5 w-5 mr-2 text-blue-600" />
            {sampleType ? 'Edit Sample Type' : 'Add New Sample Type'}
          </DialogTitle>
          <DialogDescription>
            {sampleType ? 'Update the sample type details below.' : 'Create a new sample type with collection and storage specifications.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TestTube className="h-4 w-4 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Sample Type Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g., Whole Blood"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) =>
                        handleChange("code", e.target.value.toUpperCase())
                      }
                      placeholder="e.g., WB"
                      className="flex-1"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateCode}
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
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center space-x-2">
                          {category.icon}
                          <span>{category.label}</span>
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
                  placeholder="Detailed description of the sample type..."
                  rows={3}
                  required
                />
              </div>

              {formData.category && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-blue-700">
                    {getCategoryIcon(formData.category)}
                    <span className="font-medium ml-2">
                      Category:{" "}
                      {
                        categories.find((c) => c.value === formData.category)
                          ?.label
                      }
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Collection Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FlaskConical className="h-4 w-4 mr-2" />
                Collection Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="collectionMethod">Collection Method *</Label>
                  <Select
                    value={formData.collectionMethod}
                    onValueChange={(value) =>
                      handleChange("collectionMethod", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {collectionMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="volume">Volume Required</Label>
                  <Input
                    id="volume"
                    value={formData.volume}
                    onChange={(e) => handleChange("volume", e.target.value)}
                    placeholder="e.g., 3-5 mL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="container">Container Type</Label>
                  <Select
                    value={formData.container}
                    onValueChange={(value) => handleChange("container", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select container" />
                    </SelectTrigger>
                    <SelectContent>
                      {containers.map((container) => (
                        <SelectItem key={container} value={container}>
                          {container}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preservative">
                    Preservative/Anticoagulant
                  </Label>
                  <Input
                    id="preservative"
                    value={formData.preservative}
                    onChange={(e) =>
                      handleChange("preservative", e.target.value)
                    }
                    placeholder="e.g., EDTA, Heparin, None"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions">
                  Special Collection Instructions
                </Label>
                <Textarea
                  id="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={(e) =>
                    handleChange("specialInstructions", e.target.value)
                  }
                  placeholder="Any special instructions for collection..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Storage & Handling */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Thermometer className="h-4 w-4 mr-2" />
                Storage & Handling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storageTemp">Storage Temperature</Label>
                  <Select
                    value={formData.storageTemp}
                    onValueChange={(value) =>
                      handleChange("storageTemp", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select temperature" />
                    </SelectTrigger>
                    <SelectContent>
                      {storageTemperatures.map((temp) => (
                        <SelectItem key={temp} value={temp}>
                          {temp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storageTime">Storage Time/Stability</Label>
                  <Input
                    id="storageTime"
                    value={formData.storageTime}
                    onChange={(e) =>
                      handleChange("storageTime", e.target.value)
                    }
                    placeholder="e.g., 24 hours, 7 days"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="processingTime">Processing Time</Label>
                  <Input
                    id="processingTime"
                    value={formData.processingTime}
                    onChange={(e) =>
                      handleChange("processingTime", e.target.value)
                    }
                    placeholder="e.g., Process within 2 hours"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transportConditions">
                    Transport Conditions
                  </Label>
                  <Input
                    id="transportConditions"
                    value={formData.transportConditions}
                    onChange={(e) =>
                      handleChange("transportConditions", e.target.value)
                    }
                    placeholder="e.g., Room temperature, Ice"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="handlingRequirements">
                  Handling Requirements
                </Label>
                <Textarea
                  id="handlingRequirements"
                  value={formData.handlingRequirements}
                  onChange={(e) =>
                    handleChange("handlingRequirements", e.target.value)
                  }
                  placeholder="Special handling requirements and precautions..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quality & Safety */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Quality & Safety
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejectionCriteria">Rejection Criteria</Label>
                <Textarea
                  id="rejectionCriteria"
                  value={formData.rejectionCriteria}
                  onChange={(e) =>
                    handleChange("rejectionCriteria", e.target.value)
                  }
                  placeholder="Conditions under which the sample should be rejected..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="safetyPrecautions">Safety Precautions</Label>
                <Textarea
                  id="safetyPrecautions"
                  value={formData.safetyPrecautions}
                  onChange={(e) =>
                    handleChange("safetyPrecautions", e.target.value)
                  }
                  placeholder="Safety measures and precautions for handling..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Test Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Test Applications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="commonTests">Common Tests</Label>
                <Textarea
                  id="commonTests"
                  value={formData.commonTests}
                  onChange={(e) => handleChange("commonTests", e.target.value)}
                  placeholder="List common tests performed on this sample type (separate with commas)..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Status
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
                  Make this sample type active and available for use
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {sampleType ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {sampleType ? 'Update Sample Type' : 'Create Sample Type'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSampleTypeModal;
