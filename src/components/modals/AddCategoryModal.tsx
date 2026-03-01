import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCreateTestCategory } from "@/hooks/useApi";
import { CreateTestCategoryRequest } from "@/types";

interface AddCategoryModalProps {
  trigger?: React.ReactNode;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ trigger }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
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

  const createCategory = useCreateTestCategory();

  const departments = [
    t("Laboratory Medicine"),
    t("Pathology"), 
    t("Molecular Laboratory"),
    t("Microbiology"),
    t("Blood Bank"),
    t("Chemistry"),
    t("Hematology"),
    t("Immunology"),
    t("Cytology"),
    t("Histology"),
  ];

  const iconOptions = [
    { value: "folder", label: t("Folder"), icon: <Folder className="h-4 w-4" /> },
    { value: "beaker", label: t("Beaker"), icon: <Beaker className="h-4 w-4" /> },
    {
      value: "test-tube",
      label: t("Test Tube"),
      icon: <TestTube2 className="h-4 w-4" />,
    },
    { value: "heart", label: t("Heart"), icon: <Heart className="h-4 w-4" /> },
    { value: "zap", label: t("Lightning"), icon: <Zap className="h-4 w-4" /> },
    {
      value: "microscope",
      label: t("Microscope"),
      icon: <Microscope className="h-4 w-4" />,
    },
  ];

  const colorOptions = [
    { value: "#EF4444", label: t("Red"), bg: "bg-red-500" },
    { value: "#F97316", label: t("Orange"), bg: "bg-orange-500" },
    { value: "#F59E0B", label: t("Amber"), bg: "bg-amber-500" },
    { value: "#EAB308", label: t("Yellow"), bg: "bg-yellow-500" },
    { value: "#84CC16", label: t("Lime"), bg: "bg-lime-500" },
    { value: "#22C55E", label: t("Green"), bg: "bg-green-500" },
    { value: "#10B981", label: t("Emerald"), bg: "bg-emerald-500" },
    { value: "#14B8A6", label: t("Teal"), bg: "bg-teal-500" },
    { value: "#06B6D4", label: t("Cyan"), bg: "bg-cyan-500" },
    { value: "#0EA5E9", label: t("Sky"), bg: "bg-sky-500" },
    { value: "#3B82F6", label: t("Blue"), bg: "bg-blue-500" },
    { value: "#6366F1", label: t("Indigo"), bg: "bg-indigo-500" },
    { value: "#8B5CF6", label: t("Violet"), bg: "bg-violet-500" },
    { value: "#A855F7", label: t("Purple"), bg: "bg-purple-500" },
    { value: "#D946EF", label: t("Fuchsia"), bg: "bg-fuchsia-500" },
    { value: "#EC4899", label: t("Pink"), bg: "bg-pink-500" },
    { value: "#F43F5E", label: t("Rose"), bg: "bg-rose-500" },
    { value: "#6B7280", label: t("Gray"), bg: "bg-gray-500" },
  ];

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
        title: t("Info"),
        description: t("Please enter category name first"),
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
        title: t("Validation Error"),
        description: `${t("Please fill in all required fields:")}: ${missing.join(", ")}`,
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
      // Process common tests from input
      const commonTests = commonTestsInput
        .split(",")
        .map((test) => test.trim())
        .filter((test) => test.length > 0);

      const categoryData: CreateTestCategoryRequest = {
        ...formData,
        commonTests,
      };

      await createCategory.mutateAsync(categoryData);

      toast({
        title: t("Category created successfully"),
        description: `${formData.name} (${formData.code}) ${t("has been added to the category catalog.")}`
      });

      // Reset form
      setFormData({
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
      setCommonTestsInput("");
      setOpen(false);
    } catch (error) {
      toast({
        title: t("Error creating category"),
        description: error instanceof Error ? error.message : t("Something went wrong"),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("Add Category")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("Add New Test Category")}</DialogTitle>
          <DialogDescription>
            {t("Create a new test category to organize your laboratory tests effectively.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  {t("Basic Information")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {t("Category Name")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder={t("e.g., Hematology")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">
                    {t("Category Code")} <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                      placeholder={t("e.g., HEM")}
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
                    {t("Auto-generate from category name or enter manually")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    {t("Description")} <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder={t("Brief description of this test category...")}
                    className="min-h-20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">
                    {t("Department")} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleChange("department", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select department")} />
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
                  {t("Visual Settings")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("Icon")}</Label>
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
                  <Label>{t("Color")}</Label>
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
                      {t("Selected:")}: {formData.color}
                    </span>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label>{t("Preview")}</Label>
                  <div className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      {getIconComponent(formData.icon, formData.color)}
                      <div>
                        <div className="font-medium">
                          {formData.name || t("Category Name")}
                        </div>
                        <div className="text-sm text-gray-500">
                          {t("Code:")}: {formData.code || t("CODE")}
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
                {t("Additional Information")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commonTests">{t("Common Tests")}</Label>
                  <Textarea
                    id="commonTests"
                    value={commonTestsInput}
                    onChange={(e) => setCommonTestsInput(e.target.value)}
                    placeholder={t("Enter common tests, separated by commas (e.g., CBC, ESR, Platelet Count)")}
                    className="min-h-20"
                  />
                  <p className="text-xs text-gray-500">
                    {t("Enter test names separated by commas")}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">{t("Sort Order")}</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => handleChange("sortOrder", parseInt(e.target.value) || 0)}
                      placeholder={t("0")}
                    />
                    <p className="text-xs text-gray-500">
                      {t("Lower numbers appear first in lists")}
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
                      <span>{t("Active Category")}</span>
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
              onClick={() => setOpen(false)}
              disabled={createCategory.isPending}
            >
              {t("Cancel")}
            </Button>
            <Button 
              type="submit" 
              disabled={createCategory.isPending}
            >
              {createCategory.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("Creating...")}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("Create Category")}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryModal;
