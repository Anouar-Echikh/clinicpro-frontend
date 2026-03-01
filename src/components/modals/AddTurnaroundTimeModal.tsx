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
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Timer,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCreateTurnaroundTime } from "@/hooks/useApi";

interface AddTurnaroundTimeModalProps {
  trigger?: React.ReactNode;
}

const AddTurnaroundTimeModal: React.FC<AddTurnaroundTimeModalProps> = ({
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateTurnaroundTime();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    duration: "",
    durationMinutes: "",
    priority: "",
    category: "",
    description: "",
    examples: "",
    sla: "",
    reportingHours: "",
    criticalNotes: "",
    escalationProcedure: "",
    businessRules: "",
    isActive: true,
  });

  const priorities = [
    {
      value: "stat",
      label: "STAT (Emergency)",
      color: "bg-red-100 text-red-800",
    },
    {
      value: "urgent",
      label: "Urgent",
      color: "bg-orange-100 text-orange-800",
    },
    { value: "routine", label: "Routine", color: "bg-blue-100 text-blue-800" },
    {
      value: "extended",
      label: "Extended",
      color: "bg-purple-100 text-purple-800",
    },
  ];

  const categories = [
    "Emergency",
    "Urgent",
    "Routine",
    "Standard",
    "Extended",
    "Specialized",
    "Batch",
    "Reference",
  ];

  const durationPresets = [
    { display: "< 30 minutes", minutes: 30 },
    { display: "< 1 hour", minutes: 60 },
    { display: "1-2 hours", minutes: 120 },
    { display: "2-4 hours", minutes: 240 },
    { display: "4-6 hours", minutes: 360 },
    { display: "6-8 hours", minutes: 480 },
    { display: "8-12 hours", minutes: 720 },
    { display: "12-24 hours", minutes: 1440 },
    { display: "1-2 days", minutes: 2880 },
    { display: "2-3 days", minutes: 4320 },
    { display: "3-5 days", minutes: 7200 },
    { display: "1-2 weeks", minutes: 20160 },
  ];

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDurationPreset = (preset: {
    display: string;
    minutes: number;
  }) => {
    handleChange("duration", preset.display);
    handleChange("durationMinutes", preset.minutes.toString());
  };

  const generateCode = () => {
    if (formData.name && formData.priority) {
      const nameCode = formData.name
        .split(" ")
        .map((word) => word.substring(0, 2))
        .join("")
        .toUpperCase();
      const priorityCode = formData.priority.substring(0, 2).toUpperCase();
      const randomNum = Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, "0");
      const generatedCode = `TAT-${priorityCode}${nameCode}${randomNum}`;
      handleChange("code", generatedCode);
    } else {
      toast({
        title: "Info",
        description: "Please enter name and select priority first",
        variant: "default",
      });
    }
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
        return <Timer className="h-4 w-4 text-purple-600" />;
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

    if (!validateForm()) {
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

      await createMutation.mutateAsync(apiData);

      toast({
        title: "Success",
        description: `${formData.name} (${formData.code}) has been created successfully.`,
      });

      // Reset form
      setFormData({
        name: "",
        code: "",
        duration: "",
        durationMinutes: "",
        priority: "",
        category: "",
        description: "",
        examples: "",
        sla: "",
        reportingHours: "",
        criticalNotes: "",
        escalationProcedure: "",
        businessRules: "",
        isActive: true,
      });

      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create turnaround time. Please try again.",
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
            Add Turnaround Time
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Add New Turnaround Time Category
          </DialogTitle>
          <DialogDescription>
            Create a new turnaround time category for laboratory tests.
          </DialogDescription>
        </DialogHeader>

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
                  <div className="flex space-x-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) =>
                        handleChange("code", e.target.value.toUpperCase())
                      }
                      placeholder="e.g., TAT-STAT01"
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

              {formData.priority && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-blue-700">
                    {getPriorityIcon(formData.priority)}
                    <span className="font-medium ml-2">
                      Priority:{" "}
                      {
                        priorities.find((p) => p.value === formData.priority)
                          ?.label
                      }
                    </span>
                  </div>
                </div>
              )}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sla">SLA Commitment</Label>
                  <Input
                    id="sla"
                    value={formData.sla}
                    onChange={(e) => handleChange("sla", e.target.value)}
                    placeholder="e.g., 95% of tests within timeframe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportingHours">Reporting Hours</Label>
                  <Input
                    id="reportingHours"
                    value={formData.reportingHours}
                    onChange={(e) =>
                      handleChange("reportingHours", e.target.value)
                    }
                    placeholder="e.g., 24/7, Business hours only"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Examples & Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Test Examples & Applications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="examples">Test Examples</Label>
                <Textarea
                  id="examples"
                  value={formData.examples}
                  onChange={(e) => handleChange("examples", e.target.value)}
                  placeholder="List tests that typically use this turnaround time (separate with commas)..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessRules">Business Rules</Label>
                <Textarea
                  id="businessRules"
                  value={formData.businessRules}
                  onChange={(e) =>
                    handleChange("businessRules", e.target.value)
                  }
                  placeholder="When should this turnaround time be applied? Any special conditions..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Critical Handling */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Critical Handling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="criticalNotes">Critical Notes</Label>
                <Textarea
                  id="criticalNotes"
                  value={formData.criticalNotes}
                  onChange={(e) =>
                    handleChange("criticalNotes", e.target.value)
                  }
                  placeholder="Important notes for handling tests in this category..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="escalationProcedure">
                  Escalation Procedure
                </Label>
                <Textarea
                  id="escalationProcedure"
                  value={formData.escalationProcedure}
                  onChange={(e) =>
                    handleChange("escalationProcedure", e.target.value)
                  }
                  placeholder="What to do if turnaround time cannot be met..."
                  rows={2}
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
                  Make this turnaround time category active and available for
                  use
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
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Turnaround Time
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTurnaroundTimeModal;
