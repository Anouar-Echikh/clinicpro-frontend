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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Folder,
  Beaker,
  TestTube2,
  Heart,
  Zap,
  Microscope,
  CheckCircle,
  Palette,
  Hash,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUpdateTestCategory, useTestCategory } from "@/hooks/useApi";
import { CreateTestCategoryRequest, TestCategory } from "@/types";

interface EditCategoryModalProps {
  categoryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  categoryId,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateTestCategoryRequest>({
    name: "",
    code: "",
    description: "",
    department: "",
    color: "#3B82F6",
    icon: "folder",
    testCount: 0,
    commonTests: [],
    isActive: true,
    sortOrder: 0,
  });
  const [commonTestsInput, setCommonTestsInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // API hooks
  const {
    data: category,
    isLoading: categoryLoading,
    error: categoryError,
  } = useTestCategory(categoryId);
  
  const updateCategory = useUpdateTestCategory();

  const departments = [
    "Laboratory Medicine",
    "Pathology", 
    "Molecular Laboratory",
    "Microbiology",
    "Blood Bank",
    "Chemistry",
    "Hematology",
    "Immunology",
    "Cytology",
    "Histology",
  ];

  const iconOptions = [
    { value: "folder", label: "Folder", icon: <Folder className="h-4 w-4" /> },
    { value: "beaker", label: "Beaker", icon: <Beaker className="h-4 w-4" /> },
    {
      value: "test-tube",
      label: "Test Tube",
      icon: <TestTube2 className="h-4 w-4" />,
    },
    { value: "heart", label: "Heart", icon: <Heart className="h-4 w-4" /> },
    { value: "zap", label: "Lightning", icon: <Zap className="h-4 w-4" /> },
    {
      value: "microscope",
      label: "Microscope",
      icon: <Microscope className="h-4 w-4" />,
    },
  ];

  const colorOptions = [
    { value: "#EF4444", label: "Red", bg: "bg-red-500" },
    { value: "#F97316", label: "Orange", bg: "bg-orange-500" },
    { value: "#F59E0B", label: "Amber", bg: "bg-amber-500" },
    { value: "#EAB308", label: "Yellow", bg: "bg-yellow-500" },
    { value: "#84CC16", label: "Lime", bg: "bg-lime-500" },
    { value: "#22C55E", label: "Green", bg: "bg-green-500" },
    { value: "#10B981", label: "Emerald", bg: "bg-emerald-500" },
    { value: "#14B8A6", label: "Teal", bg: "bg-teal-500" },
    { value: "#06B6D4", label: "Cyan", bg: "bg-cyan-500" },
    { value: "#0EA5E9", label: "Sky", bg: "bg-sky-500" },
    { value: "#3B82F6", label: "Blue", bg: "bg-blue-500" },
    { value: "#6366F1", label: "Indigo", bg: "bg-indigo-500" },
    { value: "#8B5CF6", label: "Violet", bg: "bg-violet-500" },
    { value: "#A855F7", label: "Purple", bg: "bg-purple-500" },
    { value: "#D946EF", label: "Fuchsia", bg: "bg-fuchsia-500" },
    { value: "#EC4899", label: "Pink", bg: "bg-pink-500" },
    { value: "#F43F5E", label: "Rose", bg: "bg-rose-500" },
    { value: "#6B7280", label: "Gray", bg: "bg-gray-500" },
  ];

  // Load category data when modal opens
  useEffect(() => {
    if (open && category) {
      setFormData({
        name: category.name,
        code: category.code,
        description: category.description,
        department: category.department,
        color: category.color,
        icon: category.icon,
        testCount: category.testCount || 0,
        commonTests: category.commonTests || [],
        isActive: category.isActive,
        sortOrder: category.sortOrder || 0,
      });
      setCommonTestsInput((category.commonTests || []).join(", "));
    }
  }, [open, category]);

  const handleChange = (field: keyof CreateTestCategoryRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateCode = () => {
    if (formData.name) {
      const nameWords = formData.name
        .split(" ")
        .filter((word) => word.length > 0);
      const code = nameWords
        .map((word) => word.substring(0, 3))
        .join("")
        .toUpperCase();
      handleChange("code", code);
    } else {
      toast({
        title: "Info",
        description: "Please enter category name first",
        variant: "default",
      });
    }
  };

  const getIconComponent = (iconName: string, color: string) => {
    const iconProps = { className: "h-4 w-4", style: { color } };
    switch (iconName) {
      case "beaker":
        return <Beaker {...iconProps} />;
      case "test-tube":
        return <TestTube2 {...iconProps} />;
      case "heart":
        return <Heart {...iconProps} />;
      case "zap":
        return <Zap {...iconProps} />;
      case "microscope":
        return <Microscope {...iconProps} />;
      default:
        return <Folder {...iconProps} />;
    }
  };

  const validateForm = () => {
    const required = ["name", "code", "description", "department"];
    const missing = required.filter(
      (field) => !formData[field as keyof CreateTestCategoryRequest],
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

    try {
      setIsLoading(true);

      // Process common tests from input
      const commonTests = commonTestsInput
        .split(",")
        .map((test) => test.trim())
        .filter((test) => test.length > 0);

      const categoryData: Partial<CreateTestCategoryRequest> = {
        ...formData,
        commonTests,
      };

      await updateCategory.mutateAsync({ id: categoryId, data: categoryData });

      toast({
        title: "Category updated successfully",
        description: `${formData.name} (${formData.code}) has been updated.`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error updating category",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (categoryLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading category details...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (categoryError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Error loading category details</p>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Test Category</DialogTitle>
          <DialogDescription>
            Update the test category information and settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Category Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g., Hematology"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">
                    Category Code <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                      placeholder="e.g., HEM"
                      className="flex-1"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateCode}
                      size="sm"
                    >
                      <Hash className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Auto-generate from category name or enter manually
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Brief description of this test category..."
                    className="min-h-20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleChange("department", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Visual Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Visual Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {iconOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange("icon", option.value)}
                        className={`p-3 border rounded-lg flex flex-col items-center space-y-1 hover:bg-gray-50 transition-colors ${
                          formData.icon === option.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        {option.icon}
                        <span className="text-xs">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleChange("color", color.value)}
                        className={`w-8 h-8 rounded-full border-2 ${color.bg} ${
                          formData.color === color.value
                            ? "border-gray-900"
                            : "border-gray-200"
                        }`}
                        title={color.label}
                      />
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Palette className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Selected: {formData.color}
                    </span>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      {getIconComponent(formData.icon, formData.color)}
                      <div>
                        <div className="font-medium">
                          {formData.name || "Category Name"}
                        </div>
                        <div className="text-sm text-gray-500">
                          Code: {formData.code || "CODE"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commonTests">Common Tests</Label>
                  <Textarea
                    id="commonTests"
                    value={commonTestsInput}
                    onChange={(e) => setCommonTestsInput(e.target.value)}
                    placeholder="Enter common tests, separated by commas (e.g., CBC, ESR, Platelet Count)"
                    className="min-h-20"
                  />
                  <p className="text-xs text-gray-500">
                    Enter test names separated by commas
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => handleChange("sortOrder", parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500">
                      Lower numbers appear first in lists
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleChange("isActive", checked)}
                    />
                    <Label htmlFor="isActive" className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Active Category</span>
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading || updateCategory.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || updateCategory.isPending}
            >
              {isLoading || updateCategory.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Category
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryModal; 