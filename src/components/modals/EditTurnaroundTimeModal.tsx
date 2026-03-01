import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Clock,
  Zap,
  AlertTriangle,
  Timer,
  Save,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTurnaroundTime, useUpdateTurnaroundTime } from "@/hooks/useApi";

interface EditTurnaroundTimeModalProps {
  turnaroundTimeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EditTurnaroundTimeModal: React.FC<EditTurnaroundTimeModalProps> = ({
  turnaroundTimeId,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { data: turnaroundTime, isLoading: isLoadingData } = useTurnaroundTime(turnaroundTimeId || "");
  const updateMutation = useUpdateTurnaroundTime();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    duration: "",
    durationMinutes: "",
    priority: "",
    category: "",
    description: "",
    examples: "",
    isActive: true,
  });

  // Load existing data when turnaroundTime is available
  useEffect(() => {
    if (turnaroundTime) {
      setFormData({
        name: turnaroundTime.name || "",
        code: turnaroundTime.code || "",
        duration: turnaroundTime.duration || "",
        durationMinutes: turnaroundTime.durationMinutes?.toString() || "",
        priority: turnaroundTime.priority || "",
        category: turnaroundTime.category || "",
        description: turnaroundTime.description || "",
        examples: turnaroundTime.examples?.join(", ") || "",
        isActive: turnaroundTime.isActive ?? true,
      });
    }
  }, [turnaroundTime]);

  const priorities = [
    { value: "stat", label: "STAT (Emergency)" },
    { value: "urgent", label: "Urgent" },
    { value: "routine", label: "Routine" },
    { value: "extended", label: "Extended" },
  ];

  const categories = [
    "Emergency",
    "Urgent",
    "Routine",
    "Standard",
    "Extended",
    "Specialized",
    "Batch",
    "Research",
  ];

  const durationPresets = [
    { display: "< 1 hour", minutes: 60 },
    { display: "1-2 hours", minutes: 120 },
    { display: "4-6 hours", minutes: 360 },
    { display: "Same Day", minutes: 480 },
    { display: "Next Day", minutes: 1440 },
    { display: "2-3 Days", minutes: 4320 },
    { display: "1 Week", minutes: 10080 },
    { display: "2 Weeks", minutes: 20160 },
  ];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDurationPreset = (preset: { display: string; minutes: number }) => {
    setFormData(prev => ({
      ...prev,
      duration: preset.display,
      durationMinutes: preset.minutes.toString(),
    }));
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "stat":
        return <Zap className="h-4 w-4 text-red-600" />;
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "routine":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "extended":
        return <Clock className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const validateForm = () => {
    const required = [
      "name",
      "code",
      "duration",
      "durationMinutes",
      "priority",
      "category",
      "description",
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

    const minutes = parseInt(formData.durationMinutes);
    if (isNaN(minutes) || minutes <= 0) {
      toast({
        title: "Validation Error",
        description: "Duration in minutes must be a positive number",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !turnaroundTimeId) {
      return;
    }

    try {
      // Prepare data for API
      const apiData = {
        name: formData.name,
        code: formData.code,
        duration: formData.duration,
        durationMinutes: parseInt(formData.durationMinutes),
        priority: formData.priority as "stat" | "urgent" | "routine" | "extended",
        category: formData.category,
        description: formData.description,
        examples: formData.examples.split(',').map(ex => ex.trim()).filter(ex => ex),
        isActive: formData.isActive,
      };

      await updateMutation.mutateAsync({ id: turnaroundTimeId, data: apiData });

      toast({
        title: "Success",
        description: `${formData.name} has been updated successfully.`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update turnaround time. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Edit className="h-5 w-5 mr-2 text-blue-600" />
            Edit Turnaround Time
          </DialogTitle>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading turnaround time...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Timer className="h-4 w-4 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="e.g., STAT (Emergency)"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) =>
                        handleChange("code", e.target.value.toUpperCase())
                      }
                      placeholder="e.g., STAT"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => handleChange("priority", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center space-x-2">
                              {getPriorityIcon(priority.value)}
                              <span>{priority.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Describe when this turnaround time category should be used..."
                    rows={3}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Duration Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Duration Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration Display *</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => handleChange("duration", e.target.value)}
                      placeholder="e.g., < 1 hour, 4-6 hours"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="durationMinutes">Duration (Minutes) *</Label>
                    <Input
                      id="durationMinutes"
                      type="number"
                      min="1"
                      value={formData.durationMinutes}
                      onChange={(e) =>
                        handleChange("durationMinutes", e.target.value)
                      }
                      placeholder="e.g., 60, 360"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Quick Duration Presets</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {durationPresets.map((preset) => (
                      <Button
                        key={preset.display}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDurationPreset(preset)}
                        className="text-xs"
                      >
                        {preset.display}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="examples">Test Examples</Label>
                  <Textarea
                    id="examples"
                    value={formData.examples}
                    onChange={(e) => handleChange("examples", e.target.value)}
                    placeholder="List tests that typically use this turnaround time (separate with commas)..."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    Enter test names separated by commas (e.g., Troponin, Blood Gas, Glucose)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status</CardTitle>
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
                    Make this turnaround time category active and available for use
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Turnaround Time
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

export default EditTurnaroundTimeModal; 