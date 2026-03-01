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
import {
  Plus,
  Settings,
  Beaker,
  TestTube2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api";
import { CreateTestMethodologyRequest } from "@/types";

interface AddMethodologyModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const AddMethodologyModal: React.FC<AddMethodologyModalProps> = ({
  trigger,
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTestMethodologyRequest>({
    name: "",
    code: "",
    description: "",
    category: "",
    equipment: "",
    principles: "",
    applications: [],
    advantages: "",
    limitations: "",
    isActive: true,
  });

  const [applicationsText, setApplicationsText] = useState("");

  const handleApplicationsChange = (value: string) => {
    setApplicationsText(value);
    // Convert text to array by splitting on newlines or commas
    const applicationsArray = value
      .split(/[,\n]/)
      .map(app => app.trim())
      .filter(app => app.length > 0);
    setFormData(prev => ({ ...prev, applications: applicationsArray }));
  };

  const categories = [
    "Hematology",
    "Clinical Chemistry",
    "Microbiology",
    "Immunology",
    "Endocrinology",
    "Cardiology",
    "Toxicology",
    "Molecular Diagnostics",
    "Histopathology",
    "Cytology",
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
      const categoryCode = formData.category.substring(0, 3).toUpperCase();
      const randomNum = Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, "0");
      const generatedCode = `${categoryCode}-${nameCode}${randomNum}`;
      handleChange("code", generatedCode);
    } else {
      toast({
        title: "Info",
        description: "Please enter methodology name and select category first",
        variant: "default",
      });
    }
  };

  const validateForm = () => {
    const required = ["name", "code", "description", "category", "principles"];
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
      await api.createTestMethodology(formData);

      toast({
        title: "Methodology created successfully",
        description: `${formData.name} (${formData.code}) has been added to the methodology catalog.`,
      });

      // Reset form
      setFormData({
        name: "",
        code: "",
        description: "",
        category: "",
        equipment: "",
        principles: "",
        applications: [],
        advantages: "",
        limitations: "",
        isActive: true,
      });
      setApplicationsText("");

      setOpen(false);
      onSuccess?.(); // Call the success callback to refresh the parent component
    } catch (error) {
      console.error("Error creating methodology:", error);
      toast({
        title: "Error",
        description: "Failed to create methodology. Please try again.",
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
            Add Methodology
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Settings className="h-5 w-5 mr-2 text-blue-600" />
            Add New Test Methodology
          </DialogTitle>
          <DialogDescription>
            Create a new testing methodology with detailed specifications and
            procedures.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Beaker className="h-4 w-4 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Methodology Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g., Automated Cell Counter"
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
                      placeholder="e.g., HEM-AUTOCNT01"
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
                      <SelectItem key={category} value={category}>
                        {category}
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
                  placeholder="Detailed description of the methodology..."
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TestTube2 className="h-4 w-4 mr-2" />
                Technical Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="principles">Principles *</Label>
                <Textarea
                  id="principles"
                  value={formData.principles}
                  onChange={(e) => handleChange("principles", e.target.value)}
                  placeholder="Scientific principles behind the methodology..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipment Required</Label>
                  <Textarea
                    id="equipment"
                    value={formData.equipment}
                    onChange={(e) => handleChange("equipment", e.target.value)}
                    placeholder="List of required equipment..."
                    rows={3}
                  />
                </div>

              </div>

              <div className="space-y-2">
                <Label htmlFor="applications">Applications</Label>
                <Textarea
                  id="applications"
                  value={applicationsText}
                  onChange={(e) => handleApplicationsChange(e.target.value)}
                  placeholder="Tests and applications that use this methodology (one per line or comma-separated)..."
                  rows={2}
                />
              </div>


            </CardContent>
          </Card>

          {/* Advantages & Limitations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Advantages & Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="advantages">Advantages</Label>
                  <Textarea
                    id="advantages"
                    value={formData.advantages}
                    onChange={(e) => handleChange("advantages", e.target.value)}
                    placeholder="Key advantages and benefits..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limitations">Limitations</Label>
                  <Textarea
                    id="limitations"
                    value={formData.limitations}
                    onChange={(e) =>
                      handleChange("limitations", e.target.value)
                    }
                    placeholder="Known limitations and considerations..."
                    rows={3}
                  />
                </div>
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
                  Make this methodology active and available for use
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
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Methodology
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMethodologyModal;
