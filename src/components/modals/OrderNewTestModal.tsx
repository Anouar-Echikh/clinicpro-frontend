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
  User,
  Stethoscope,
  TestTube2,
  Calendar,
  Clock,
  AlertTriangle,
  Beaker,
  Heart,
  Zap,
  Microscope,
  Search,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface OrderNewTestModalProps {
  trigger?: React.ReactNode;
}

interface TestItem {
  id: string;
  name: string;
  category: string;
  code: string;
  price: number;
  turnaroundTime: string;
  requirements?: string;
  description?: string;
}

const OrderNewTestModal: React.FC<OrderNewTestModalProps> = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTests, setSelectedTests] = useState<TestItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    patientAge: "",
    patientGender: "",
    orderingDoctor: "",
    priority: "routine",
    collectionDate: "",
    collectionTime: "",
    fastingRequired: false,
    clinicalNotes: "",
    symptoms: "",
    preliminaryDiagnosis: "",
    specialInstructions: "",
  });

  // Mock patients data
  const patients = [
    { id: "P-001", name: "John Doe", age: 35, gender: "male" },
    { id: "P-002", name: "Sarah Wilson", age: 28, gender: "female" },
    { id: "P-003", name: "Michael Brown", age: 45, gender: "male" },
    { id: "P-004", name: "Emily Davis", age: 32, gender: "female" },
    { id: "P-005", name: "Robert Johnson", age: 58, gender: "male" },
  ];

  // Mock doctors data
  const doctors = [
    "Dr. Sarah Johnson",
    "Dr. John Smith",
    "Dr. Michael Chen",
    "Dr. Emily Davis",
    "Dr. Robert Wilson",
  ];

  // Mock available tests
  const availableTests: TestItem[] = [
    {
      id: "T-001",
      name: "Complete Blood Count (CBC)",
      category: "Hematology",
      code: "CBC",
      price: 35,
      turnaroundTime: "4-6 hours",
      requirements: "No special preparation required",
      description: "Comprehensive blood analysis including WBC, RBC, platelets",
    },
    {
      id: "T-002",
      name: "Lipid Profile",
      category: "Clinical Chemistry",
      code: "LIPID",
      price: 45,
      turnaroundTime: "6-8 hours",
      requirements: "12-hour fasting required",
      description: "Total cholesterol, LDL, HDL, triglycerides",
    },
    {
      id: "T-003",
      name: "HbA1c",
      category: "Clinical Chemistry",
      code: "HBA1C",
      price: 50,
      turnaroundTime: "4-6 hours",
      requirements: "No fasting required",
      description: "3-month average blood glucose levels",
    },
    {
      id: "T-004",
      name: "Thyroid Function Tests",
      category: "Endocrinology",
      code: "TFT",
      price: 75,
      turnaroundTime: "8-12 hours",
      requirements: "Morning sample preferred",
      description: "TSH, T3, T4 levels",
    },
    {
      id: "T-005",
      name: "Cardiac Enzymes",
      category: "Cardiology",
      code: "CARDIAC",
      price: 85,
      turnaroundTime: "2-4 hours",
      requirements: "Immediate processing",
      description: "Troponin I, CK-MB, myoglobin",
    },
    {
      id: "T-006",
      name: "Liver Function Tests",
      category: "Clinical Chemistry",
      code: "LFT",
      price: 55,
      turnaroundTime: "6-8 hours",
      requirements: "No special preparation",
      description: "ALT, AST, bilirubin, alkaline phosphatase",
    },
    {
      id: "T-007",
      name: "Kidney Function Tests",
      category: "Clinical Chemistry",
      code: "KFT",
      price: 40,
      turnaroundTime: "4-6 hours",
      requirements: "No special preparation",
      description: "Creatinine, BUN, eGFR",
    },
    {
      id: "T-008",
      name: "Urine Analysis",
      category: "Clinical Pathology",
      code: "URINE",
      price: 25,
      turnaroundTime: "2-4 hours",
      requirements: "Clean catch midstream sample",
      description: "Complete urinalysis with microscopy",
    },
  ];

  const filteredTests = availableTests.filter(
    (test) =>
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    if (patient) {
      setFormData((prev) => ({
        ...prev,
        patientId: patient.id,
        patientName: patient.name,
        patientAge: patient.age.toString(),
        patientGender: patient.gender,
      }));
    }
  };

  const handleTestSelect = (test: TestItem) => {
    setSelectedTests((prev) => {
      const exists = prev.find((t) => t.id === test.id);
      if (exists) {
        return prev.filter((t) => t.id !== test.id);
      } else {
        return [...prev, test];
      }
    });
  };

  const calculateTotalCost = () => {
    return selectedTests.reduce((total, test) => total + test.price, 0);
  };

  const validateForm = () => {
    const required = ["patientId", "orderingDoctor", "collectionDate"];
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

    if (selectedTests.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one test to order",
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

      const reportNumbers = selectedTests.map(
        (_, index) =>
          `LAB${new Date().getFullYear()}${String(Date.now() + index).slice(-3)}`,
      );

      toast({
        title: "Test orders created successfully",
        description: `${selectedTests.length} test(s) ordered for ${formData.patientName}. Report numbers: ${reportNumbers.join(", ")}`,
      });

      // Reset form
      setFormData({
        patientId: "",
        patientName: "",
        patientAge: "",
        patientGender: "",
        orderingDoctor: "",
        priority: "routine",
        collectionDate: "",
        collectionTime: "",
        fastingRequired: false,
        clinicalNotes: "",
        symptoms: "",
        preliminaryDiagnosis: "",
        specialInstructions: "",
      });
      setSelectedTests([]);
      setSearchTerm("");

      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Order New Test
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <TestTube2 className="h-5 w-5 mr-2 text-blue-600" />
            Order New Laboratory Test
          </DialogTitle>
          <DialogDescription>
            Create new test orders for patients with comprehensive test
            selection and scheduling.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-4 w-4 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient *</Label>
                  <Select
                    value={formData.patientId}
                    onValueChange={handlePatientSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} - {patient.age}yr, {patient.gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderingDoctor">Ordering Doctor *</Label>
                  <Select
                    value={formData.orderingDoctor}
                    onValueChange={(value) =>
                      handleChange("orderingDoctor", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor} value={doctor}>
                          {doctor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.patientName && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-blue-700">
                    <User className="h-4 w-4 mr-2" />
                    <span className="font-medium">
                      Selected: {formData.patientName} ({formData.patientAge}yr,{" "}
                      {formData.patientGender})
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TestTube2 className="h-4 w-4 mr-2" />
                Test Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Tests */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tests by name, category, or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Available Tests */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {filteredTests.map((test) => {
                  const isSelected = selectedTests.find(
                    (t) => t.id === test.id,
                  );
                  return (
                    <div
                      key={test.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleTestSelect(test)}
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={!!isSelected}
                          onChange={() => handleTestSelect(test)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(test.category)}
                            <span className="font-medium">{test.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {test.code}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {test.description}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-blue-600">
                              {test.category}
                            </span>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                ${test.price}
                              </div>
                              <div className="text-xs text-gray-500">
                                {test.turnaroundTime}
                              </div>
                            </div>
                          </div>
                          {test.requirements && (
                            <div className="mt-2 text-xs text-orange-600 flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {test.requirements}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Tests Summary */}
              {selectedTests.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-700">
                      Selected Tests ({selectedTests.length})
                    </span>
                    <span className="font-bold text-green-700">
                      Total: ${calculateTotalCost()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTests.map((test) => (
                      <Badge
                        key={test.id}
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        {test.name} (${test.price})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scheduling & Priority */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Scheduling & Priority
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="collectionDate">Collection Date *</Label>
                  <Input
                    id="collectionDate"
                    type="date"
                    value={formData.collectionDate}
                    onChange={(e) =>
                      handleChange("collectionDate", e.target.value)
                    }
                    min={getTomorrowDate()}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="collectionTime">Preferred Time</Label>
                  <Input
                    id="collectionTime"
                    type="time"
                    value={formData.collectionTime}
                    onChange={(e) =>
                      handleChange("collectionTime", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleChange("priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="stat">STAT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fastingRequired"
                  checked={formData.fastingRequired}
                  onCheckedChange={(checked) =>
                    handleChange("fastingRequired", checked)
                  }
                />
                <Label htmlFor="fastingRequired" className="text-sm">
                  Fasting required (12+ hours)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Stethoscope className="h-4 w-4 mr-2" />
                Clinical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms</Label>
                  <Textarea
                    id="symptoms"
                    value={formData.symptoms}
                    onChange={(e) => handleChange("symptoms", e.target.value)}
                    placeholder="Patient's presenting symptoms..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preliminaryDiagnosis">
                    Preliminary Diagnosis
                  </Label>
                  <Textarea
                    id="preliminaryDiagnosis"
                    value={formData.preliminaryDiagnosis}
                    onChange={(e) =>
                      handleChange("preliminaryDiagnosis", e.target.value)
                    }
                    placeholder="Working diagnosis or differential..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicalNotes">Clinical Notes</Label>
                <Textarea
                  id="clinicalNotes"
                  value={formData.clinicalNotes}
                  onChange={(e) =>
                    handleChange("clinicalNotes", e.target.value)
                  }
                  placeholder="Additional clinical information or history..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions">
                  Special Instructions
                </Label>
                <Textarea
                  id="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={(e) =>
                    handleChange("specialInstructions", e.target.value)
                  }
                  placeholder="Any special handling or processing instructions..."
                  rows={2}
                />
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
                  Creating Orders...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Test Orders
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderNewTestModal;
