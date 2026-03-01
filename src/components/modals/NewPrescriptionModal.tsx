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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Stethoscope,
  User,
  Pill,
  Calendar,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { parseApiError } from "@/utils/errorHandler";
import { apiService, type Patient, type User as ApiUser, type Appointment } from "@/services/api";
import { CreatePrescriptionRequest, Medication } from "@/types";

interface NewPrescriptionModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

interface FormMedication extends Medication {
  id: string;
}

const NewPrescriptionModal: React.FC<NewPrescriptionModalProps> = ({
  trigger,
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<ApiUser[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    appointmentId: "",
    diagnosis: "",
    notes: "",
    followUpDate: "",
    status: "pending" as const,
  });

  const [medications, setMedications] = useState<FormMedication[]>([
    {
      id: "1",
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      quantity: 1,
    },
  ]);

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

  // Fetch patients and doctors when modal opens
  useEffect(() => {
    if (open) {
      fetchPatients();
      fetchDoctors();
    }
  }, [open]);

  // Fetch appointments when patient is selected
  useEffect(() => {
    if (formData.patientId && formData.patientId !== "") {
      fetchAppointments(formData.patientId);
    } else {
      setAppointments([]);
    }
  }, [formData.patientId]);



  const fetchPatients = async () => {
    try {
      setPatientsLoading(true);
      const response = await apiService.getPatients({ limit: 100 });
      if (response.success && response.data) {
        setPatients(response.data.patients || []);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast({
        title: "Error",
        description: parseApiError(error),
        variant: "destructive",
      });
    } finally {
      setPatientsLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      setDoctorsLoading(true);
      const response = await apiService.getUsers({ 
        role: "doctor",
        limit: 100,
        is_active: true 
      });
      
      if (response.success && response.data && response.data.users) {
        setDoctors(response.data.users);
      } else {
        setDoctors([]);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setDoctors([]);
      toast({
        title: "Error",
        description: parseApiError(error),
        variant: "destructive",
      });
    } finally {
      setDoctorsLoading(false);
    }
  };

  const fetchAppointments = async (patientId: string) => {
    try {
      setAppointmentsLoading(true);
      const response = await apiService.getAppointments({ 
        limit: 100,
        patient_id: patientId
      });
      
      if (response.success && response.data) {
        // The API returns appointments in response.data.appointments structure
        const appointmentsData = (response.data as any).appointments || response.data.items || [];
        // Filter to only show scheduled/confirmed appointments
        const activeAppointments = appointmentsData.filter(
          (apt: any) => apt.status === "scheduled" || apt.status === "confirmed"
        );
        setAppointments(activeAppointments);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
      toast({
        title: "Error",
        description: parseApiError(error),
        variant: "destructive",
      });
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Clear appointment selection when patient changes
      if (field === "patientId" && prev.patientId !== value) {
        newData.appointmentId = "";
      }
      
      return newData;
    });
  };

  const addMedication = () => {
    const newMedication: FormMedication = {
      id: Date.now().toString(),
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

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const resetForm = () => {
    setFormData({
      patientId: "",
      doctorId: "",
      appointmentId: "",
      diagnosis: "",
      notes: "",
      followUpDate: "",
      status: "pending",
    });
    setMedications([
      {
        id: "1",
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        quantity: 1,
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.patientId || !formData.doctorId || !formData.diagnosis) {
        throw new Error("Please fill in all required fields");
      }

      // Validate medications
      const validMedications = medications.filter(
        (med) => med.name && med.dosage && med.frequency && med.duration,
      );
      if (validMedications.length === 0) {
        throw new Error("Please add at least one complete medication");
      }

      // Prepare prescription data for API
      const prescriptionData: CreatePrescriptionRequest = {
        patient_id: formData.patientId,
        doctor_id: formData.doctorId,
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

      // Add appointment_id if provided and not "none"
      if (formData.appointmentId && formData.appointmentId !== "none") {
        prescriptionData.appointment_id = formData.appointmentId;
      }

      // Create prescription via API
      const createdPrescription = await apiService.createPrescription(prescriptionData);

      const selectedPatient = patients.find((p) => p._id === formData.patientId);
      const selectedDoctor = doctors.find((d) => d._id === formData.doctorId);

      toast({
        title: "Prescription created successfully",
        description: `Prescription ${createdPrescription.prescription_id} for ${selectedPatient?.first_name} ${selectedPatient?.last_name} by ${selectedDoctor?.first_name} ${selectedDoctor?.last_name} has been created with ${validMedications.length} medication(s).`,
      });

      // Reset form and close modal
      resetForm();
      setOpen(false);

      // Call onSuccess callback to refresh parent component
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error creating prescription:", error);
      
      toast({
        title: "Error",
        description: parseApiError(error),
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
            New Prescription
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
            Create New Prescription
          </DialogTitle>
          <DialogDescription>
            Create a digital prescription with medications, dosages, and
            instructions for the patient.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient and Doctor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-4 w-4 mr-2" />
                Patient & Doctor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientId">Select Patient *</Label>
                  <Select
                    value={formData.patientId}
                    onValueChange={(value) => handleChange("patientId", value)}
                    disabled={patientsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={patientsLoading ? "Loading patients..." : "Choose a patient"} />
                    </SelectTrigger>
                    <SelectContent>
                      {patientsLoading ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading patients...
                          </div>
                        </SelectItem>
                      ) : (
                        patients.map((patient) => (
                          <SelectItem key={patient._id} value={patient._id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {patient.first_name} {patient.last_name}
                              </span>
                              <span className="text-xs text-gray-500">
                                Age: {calculateAge(patient.date_of_birth)} • {patient.phone}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctorId">Prescribing Doctor *</Label>
                  <Select
                    value={formData.doctorId}
                    onValueChange={(value) => handleChange("doctorId", value)}
                    disabled={doctorsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={doctorsLoading ? "Loading doctors..." : "Choose a doctor"} />
                    </SelectTrigger>
                    <SelectContent>
                      {doctorsLoading ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading doctors...
                          </div>
                        </SelectItem>
                      ) : doctors.length === 0 ? (
                        <SelectItem value="no-doctors" disabled>
                          No doctors available
                        </SelectItem>
                      ) : (
                        doctors.map((doctor) => (
                          <SelectItem key={doctor._id} value={doctor._id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {doctor.first_name} {doctor.last_name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {doctor.role}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

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
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointmentId">Related Appointment (Optional)</Label>
                                  <Select
                    value={formData.appointmentId}
                    onValueChange={(value) => handleChange("appointmentId", value)}
                    disabled={!formData.patientId || appointmentsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !formData.patientId 
                          ? "Select a patient first" 
                          : appointmentsLoading 
                            ? "Loading appointments..." 
                            : "Select an appointment (optional)"
                      } />
                    </SelectTrigger>
                                      <SelectContent>
                      {!formData.patientId ? (
                        <SelectItem value="no-patient" disabled>
                          Please select a patient first
                        </SelectItem>
                      ) : appointmentsLoading ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading appointments...
                          </div>
                        </SelectItem>
                      ) : appointments.length === 0 ? (
                        <SelectItem value="no-appointments" disabled>
                          No appointments found for this patient
                        </SelectItem>
                      ) : (
                                            <>
                        <SelectItem value="none">
                          <span className="text-gray-500">No appointment selected</span>
                        </SelectItem>
                        {appointments.map((appointment) => {
                           // Handle both populated and unpopulated patient/doctor data
                           const patient = typeof appointment.patient_id === 'object' 
                             ? appointment.patient_id 
                             : patients.find(p => p._id === appointment.patient_id);
                           const doctor = typeof appointment.doctor_id === 'object' 
                             ? appointment.doctor_id 
                             : doctors.find(d => d._id === appointment.doctor_id);
                           const appointmentDate = new Date(appointment.appointment_date);
                          
                          return (
                            <SelectItem key={appointment._id} value={appointment._id}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {appointmentDate.toLocaleDateString()} at {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {doctor && ` • Dr. ${doctor.first_name} ${doctor.last_name}`}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </>
                    )}
                  </SelectContent>
                </Select>
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
            <CardContent className="space-y-6">
              {medications.map((medication, index) => (
                <div
                  key={medication.id}
                  className="p-4 border rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Medication {index + 1}</h4>
                    {medications.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(medication.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
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
                      before finalizing this prescription.
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
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Prescription...
                </>
              ) : (
                <>
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Create Prescription
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewPrescriptionModal;
