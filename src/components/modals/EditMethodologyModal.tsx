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
  Edit,
  Settings,
  Beaker,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api";
import { CreateTestMethodologyRequest, TestMethodology } from "@/types";

interface EditMethodologyModalProps {
  methodologyId?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

const EditMethodologyModal: React.FC<EditMethodologyModalProps> = ({
  methodologyId,
  trigger,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

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

  const fetchMethodology = async () => {
    if (!methodologyId) return;
    
    try {
      setInitialLoading(true);
      const methodology = await api.getTestMethodology(methodologyId);
      
      setFormData({
        name: methodology.name || "",
        code: methodology.code || "",
        description: methodology.description || "",
        category: methodology.category || "",
        equipment: methodology.equipment || "",
        principles: methodology.principles || "",
        applications: methodology.applications || [],
        advantages: methodology.advantages || "",
        limitations: methodology.limitations || "",
        isActive: methodology.isActive ?? true,
      });
      
      setApplicationsText((methodology.applications || []).join('\n'));
    } catch (error) {
      console.error("Error fetching methodology:", error);
      toast({
        title: "Error",
        description: "Failed to load methodology details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && methodologyId) {
      fetchMethodology();
    }
  }, [isOpen, methodologyId]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplicationsChange = (value: string) => {
    setApplicationsText(value);
    // Convert text to array by splitting on newlines or commas
    const applicationsArray = value
      .split(/[,\n]/)
      .map(app => app.trim())
      .filter(app => app.length > 0);
    setFormData(prev => ({ ...prev, applications: applicationsArray }));
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

    if (!validateForm() || !methodologyId) {
      return;
    }

    setIsLoading(true);

    try {
      await api.updateTestMethodology(methodologyId, formData);

      toast({
        title: "Methodology updated successfully",
        description: `${formData.name} (${formData.code}) has been updated.`,
      });

      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating methodology:", error);
      toast({
        title: "Error",
        description: "Failed to update methodology. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Edit className="h-5 w-5 mr-2 text-blue-600" />
            Edit Test Methodology
          </DialogTitle>
          <DialogDescription>
            Update the methodology information and specifications.
          </DialogDescription>
        </DialogHeader>

        {initialLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
            Loading methodology details...
          </div>
        ) : (
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
                      placeholder="Enter methodology name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Methodology Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                      placeholder="Enter unique code"
                      maxLength={20}
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
                      required
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Detailed methodology description..."
                    rows={3}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Technical Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Technical Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="principles">Scientific Principles *</Label>
                  <Textarea
                    id="principles"
                    value={formData.principles}
                    onChange={(e) => handleChange("principles", e.target.value)}
                    placeholder="Scientific principles behind the methodology..."
                    rows={3}
                    required
                  />
                </div>

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
                      onChange={(e) => handleChange("limitations", e.target.value)}
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
                    onCheckedChange={(checked) => handleChange("isActive", checked)}
                  />
                  <Label htmlFor="isActive" className="text-sm">
                    Keep this methodology active and available for use
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Methodology
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditMethodologyModal; 