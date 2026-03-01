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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Stethoscope,
  Pill,
  Calendar,
  AlertTriangle,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { Prescription, CreatePrescriptionRequest, Medication } from "@/types";

interface EditPrescriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescriptionId: string | null;
  onSuccess?: () => void;
}

interface FormMedication extends Medication {
  id: string;
}

const EditPrescriptionModal: React.FC<EditPrescriptionModalProps> = ({
  open,
  onOpenChange,
  prescriptionId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    diagnosis: "",
    notes: "",
    followUpDate: "",
    status: "pending" as const,
  });

  const [medications, setMedications] = useState<FormMedication[]>([]);

  const commonMedications = [
    { name: "Paracetamol", dosages: ["500mg", "650mg", "1000mg"] },
    { name: "Amoxicillin", dosages: ["250mg", "500mg", "875mg"] },
    { name: "Ibuprofen", dosages: ["200mg", "400mg", "600mg"] },
    { name: "Metformin", dosages: ["500mg", "850mg", "1000mg"] },
    { name: "Amlodipine", dosages: ["2.5mg", "5mg", "10mg"] },
    { name: "Lisinopril", dosages: ["5mg", "10mg", "20mg"] },
    { name: "Omeprazole", dosages: ["20mg", "40mg"] },
    { name: "Atorvastatin", dosages: ["10mg", "20mg", "40mg", "80mg"] },
    { name: "Aspirin", dosages: ["75mg", "100mg", "325mg"] },
    { name: "Simvastatin", dosages: ["10mg", "20mg", "40mg"] },
  ];

  const frequencies = [
    "Once daily",
    "Twice daily",
    "Three times daily",
    "Four times daily",
    "Every 4 hours",
    "Every 6 hours",
    "Every 8 hours",
    "Every 12 hours",
    "As needed",
    "Before meals",
    "After meals",
    "At bedtime",
  ];

  const durations = [
    "3 days",
    "5 days",
    "7 days",
    "10 days",
    "14 days",
    "21 days",
    "30 days",
    "60 days",
    "90 days",
    "Until finished",
    "As needed",
  ];

  useEffect(() => {
    if (open && prescriptionId) {
      fetchPrescriptionDetails();
    }
  }, [open, prescriptionId]);

  const fetchPrescriptionDetails = async () => {
    if (!prescriptionId) return;

    try {
      setLoading(true);
      setError(null);
      const prescriptionData = await apiService.getPrescription(prescriptionId);
      setPrescription(prescriptionData);
      
      // Populate form data
      setFormData({
        diagnosis: prescriptionData.diagnosis || "",
        notes: prescriptionData.notes || "",
        followUpDate: prescriptionData.follow_up_date 
          ? new Date(prescriptionData.follow_up_date).toISOString().split('T')[0] 
          : "",
        status: prescriptionData.status || "pending",
      });

      // Populate medications with IDs for form handling
      const medicationsWithIds = prescriptionData.medications.map((med, index) => ({
        ...med,
        id: `med_${index}`,
      }));
      setMedications(medicationsWithIds);

    } catch (err: any) {
      console.error("Error fetching prescription details:", err);
      setError(err.message || "Failed to fetch prescription details");
      toast({
        title: "Error",
        description: "Failed to fetch prescription details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addMedication = () => {
    const newMedication: FormMedication = {
      id: `med_${Date.now()}`,
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      quantity: 1,
    };
    setMedications([...medications, newMedication]);
  };

  const removeMedication = (id: string) => {
    if (medications.length > 1) {
      setMedications(medications.filter((med) => med.id !== id));
    }
  };

  const updateMedication = (
    id: string,
    field: keyof FormMedication,
    value: string | number,
  ) => {
    setMedications(
      medications.map((med) =>
        med.id === id ? { ...med, [field]: value } : med,
      ),
    );
  };

  const selectCommonMedication = (medId: string, medicationName: string) => {
    const selectedMed = commonMedications.find(
      (med) => med.name === medicationName,
    );
    if (selectedMed) {
      updateMedication(medId, "name", selectedMed.name);
      // Auto-select first dosage if available
      if (selectedMed.dosages.length > 0) {
        updateMedication(medId, "dosage", selectedMed.dosages[0]);
      }
    }
  };

  const calculateTotalQuantity = () => {
    return medications.reduce((total, med) => total + med.quantity, 0);
  };

  const resetForm = () => {
    setFormData({
      diagnosis: "",
      notes: "",
      followUpDate: "",
      status: "pending",
    });
    setMedications([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prescription) {
      toast({
        title: "Error",
        description: "Prescription data not loaded",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.diagnosis) {
        throw new Error("Please fill in the diagnosis");
      }

      // Validate medications
      const validMedications = medications.filter(
        (med) => med.name && med.dosage && med.frequency && med.duration,
      );
      if (validMedications.length === 0) {
        throw new Error("Please add at least one complete medication");
      }

      // Prepare prescription data for API
      const prescriptionData: Partial<CreatePrescriptionRequest> = {
        patient_id: prescription.patient_id._id,
        doctor_id: prescription.doctor_id._id,
        diagnosis: formData.diagnosis,
        medications: validMedications.map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions || "",
          quantity: med.quantity,
        })),
        status: formData.status,
        notes: formData.notes || undefined,
        follow_up_date: formData.followUpDate || undefined,
      };

      // Update prescription via API
      const updatedPrescription = await apiService.updatePrescription(
        prescription._id, 
        prescriptionData
      );

      toast({
        title: "Prescription updated successfully",
        description: `Prescription ${updatedPrescription.prescription_id} has been updated with ${validMedications.length} medication(s).`,
      });

      // Close modal and call success callback
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error updating prescription:", error);
      
      // Handle validation errors from backend
      let errorMessage = "Failed to update prescription. Please try again.";
      
      if (error.response?.data?.errors) {
        // Handle express-validator errors
        const validationErrors = error.response.data.errors;
        errorMessage = validationErrors.map((err: any) => err.msg).join(", ");
      } else if (error.response?.data?.message) {
        // Handle other backend errors
        errorMessage = error.response.data.message;
      } else if (error.message) {
        // Handle client-side errors
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading prescription...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !prescription) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">{error || "Prescription not found"}</p>
              <Button 
                onClick={fetchPrescriptionDetails} 
                className="mt-2"
                disabled={!prescriptionId}
              >
                Try Again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
            Edit Prescription {prescription.prescription_id}
          </DialogTitle>
          <DialogDescription>
            Update prescription details, medications, and instructions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient and Doctor Information (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient & Doctor Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Patient</Label>
                  <p className="text-lg font-semibold">
                    {prescription.patient_id 
                      ? `${prescription.patient_id.first_name} ${prescription.patient_id.last_name}`
                      : 'Unknown Patient'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {prescription.patient_id 
                      ? `${prescription.patient_id.gender} • ${new Date().getFullYear() - new Date(prescription.patient_id.date_of_birth).getFullYear()} years old`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Doctor</Label>
                  <p className="text-lg font-semibold">
                    {prescription.doctor_id?.first_name && prescription.doctor_id?.last_name ? 
                      `Dr. ${prescription.doctor_id.first_name} ${prescription.doctor_id.last_name}` :
                      "No Doctor Assigned"
                    }
                  </p>
                  {prescription.doctor_id?.specialization && (
                    <p className="text-sm text-gray-600">{prescription.doctor_id.specialization}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prescription Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prescription Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis *</Label>
                  <Input
                    id="diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => handleChange("diagnosis", e.target.value)}
                    placeholder="Primary diagnosis"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center">
                  <Pill className="h-4 w-4 mr-2" />
                  Medications
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    Total: {calculateTotalQuantity()} units
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMedication}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {medications.map((medication, index) => (
                <div
                  key={medication.id}
                  className="border rounded-lg p-4 space-y-4 bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Medication {index + 1}</h4>
                    {medications.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(medication.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Medication Name *</Label>
                      <Input
                        value={medication.name}
                        onChange={(e) =>
                          updateMedication(
                            medication.id,
                            "name",
                            e.target.value,
                          )
                        }
                        placeholder="Enter medication name"
                        required
                      />
                      <Select
                        onValueChange={(value) =>
                          selectCommonMedication(medication.id, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Or select from common medications" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonMedications.map((med) => (
                            <SelectItem key={med.name} value={med.name}>
                              {med.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Dosage *</Label>
                      <Input
                        value={medication.dosage}
                        onChange={(e) =>
                          updateMedication(
                            medication.id,
                            "dosage",
                            e.target.value,
                          )
                        }
                        placeholder="e.g., 500mg"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Frequency *</Label>
                      <Select
                        value={medication.frequency}
                        onValueChange={(value) =>
                          updateMedication(medication.id, "frequency", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="How often" />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencies.map((freq) => (
                            <SelectItem key={freq} value={freq}>
                              {freq}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Duration *</Label>
                      <Select
                        value={medication.duration}
                        onValueChange={(value) =>
                          updateMedication(medication.id, "duration", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="How long" />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map((duration) => (
                            <SelectItem key={duration} value={duration}>
                              {duration}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={medication.quantity}
                        onChange={(e) =>
                          updateMedication(
                            medication.id,
                            "quantity",
                            parseInt(e.target.value) || 1,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Instructions</Label>
                    <Textarea
                      value={medication.instructions}
                      onChange={(e) =>
                        updateMedication(
                          medication.id,
                          "instructions",
                          e.target.value,
                        )
                      }
                      placeholder="Special instructions for taking this medication..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="followUpDate">Follow-up Date</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => handleChange("followUpDate", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Clinical Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Additional clinical notes, warnings, or special instructions..."
                  rows={3}
                />
              </div>

              {/* Warning for drug interactions */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">
                      Drug Interaction Check
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Please verify drug interactions and patient allergies
                      before finalizing changes to this prescription.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating Prescription...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Prescription
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPrescriptionModal; 