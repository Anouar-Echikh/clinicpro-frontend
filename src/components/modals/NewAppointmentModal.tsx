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
import { Calendar, Plus, Clock, User, Stethoscope } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { parseApiError } from "@/utils/errorHandler";
import { apiService } from "@/services/api";
import { useCreateAppointment } from "@/hooks/useApi";
import type { Patient, User as Doctor, Appointment } from "@/services/api";
import type { Service } from "@/types";
import { serviceApi } from "@/services/api/serviceApi";

interface NewAppointmentModalProps {
  trigger?: React.ReactNode;
  preSelectedPatientId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  trigger,
  preSelectedPatientId,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use external open state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;
  const [loadingData, setLoadingData] = useState(false);
  
  // Add validation state
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [validationVariant, setValidationVariant] = useState<"default" | "destructive">("default");
  
  // React Query mutation for creating appointments
  const createAppointmentMutation = useCreateAppointment();
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    nurseId: "",
    serviceId: "",
    date: "",
    time: "",
    duration: "30",
    symptoms: "",
    notes: "",
    appointmentType: "consultation",
  });

  // State for API data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [nurses, setNurses] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ];

  // Load patients, doctors, and services when modal opens
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  // Set pre-selected patient when available
  useEffect(() => {
    if (preSelectedPatientId && open) {
      setFormData(prev => ({ ...prev, patientId: preSelectedPatientId }));
    }
  }, [preSelectedPatientId, open]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [patientsResponse, doctorsResponse, nursesResponse, servicesResponse] = await Promise.all([
        apiService.getPatients({ limit: 100 }),
        apiService.getDoctors({ limit: 100 }),
        apiService.getNurses({ limit: 100 }),
        serviceApi.getServices({ isActive: true, limit: 100 })
      ]);

      setPatients(patientsResponse.data.patients);
      setDoctors(doctorsResponse.data.items);
      setNurses(nursesResponse.data.items);
      setServices(servicesResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
      
      toast({
        title: "Error loading data",
        description: parseApiError(error),
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  // Validation helper function
  const validateDateTime = (date: string, time: string) => {
    if (!date || !time) {
      setValidationMessage("");
      return;
    }

    // Parse the date and time components separately for consistent timezone handling
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    
    // Create date in local timezone
    const selectedDateTime = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

    if (selectedDateTime <= now) {
      setValidationMessage("⚠️ Selected date and time is in the past");
      setValidationVariant("destructive");
      return false;
    }

    if (selectedDateTime <= thirtyMinutesFromNow) {
      setValidationMessage("⚠️ Appointments must be scheduled at least 30 minutes in advance");
      setValidationVariant("destructive");
      return false;
    }

    const dayOfWeek = selectedDateTime.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      setValidationMessage("💡 Weekend appointment - please confirm availability");
      setValidationVariant("default");
      return true;
    }

    setValidationMessage("✅ Valid appointment time");
    setValidationVariant("default");
    return true;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-set duration when service is selected
    if (field === "serviceId") {
      const selectedService = services.find((s) => s.id === value);
      if (selectedService) {
        setFormData((prev) => ({
          ...prev,
          duration: selectedService.duration.toString(),
        }));
      }
    }

    // Validate date/time when either is changed
    if (field === "date" || field === "time") {
      const newDate = field === "date" ? value : formData.date;
      const newTime = field === "time" ? value : formData.time;
      validateDateTime(newDate, newTime);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.patientId) {
      toast({
        title: "Validation Error",
        description: "Please select a patient.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.doctorId) {
      toast({
        title: "Validation Error",
        description: "Please select a doctor.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.date || !formData.time) {
      toast({
        title: "Validation Error",
        description: "Please select both date and time.",
        variant: "destructive",
      });
      return;
    }

    // Final date/time validation
    if (!validateDateTime(formData.date, formData.time)) {
      toast({
        title: "Validation Error",
        description: "Please select a valid future date and time.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a proper Date object ensuring local timezone interpretation
      // Parse the date and time components separately to avoid timezone confusion
      const [year, month, day] = formData.date.split('-').map(Number);
      const [hours, minutes] = formData.time.split(':').map(Number);
      
      // Create date in local timezone
      const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
      
      // Prepare appointment data according to API schema
      const appointmentData: Omit<Appointment, '_id' | 'created_at' | 'updated_at'> = {
        patient_id: formData.patientId,
        doctor_id: formData.doctorId,
        ...(formData.nurseId && { nurse_id: formData.nurseId }),
        ...(formData.serviceId && { service_id: formData.serviceId }),
        appointment_date: appointmentDateTime.toISOString(),
        duration: parseInt(formData.duration),
        status: 'scheduled',
        type: formData.appointmentType,
        notes: formData.notes,
      };

      // Create appointment via mutation
      await createAppointmentMutation.mutateAsync(appointmentData);

      toast({
        title: "Appointment scheduled successfully",
        description: `Appointment has been scheduled for ${appointmentDateTime.toLocaleString()}.`,
      });

      // Reset form
      setFormData({
        patientId: "",
        doctorId: "",
        nurseId: "",
        serviceId: "",
        date: "",
        time: "",
        duration: "30",
        symptoms: "",
        notes: "",
        appointmentType: "consultation",
      });

      setValidationMessage("");
      setOpen(false);
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: parseApiError(error),
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
            New Appointment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full min-h-0">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center text-lg sm:text-xl">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
              Schedule New Appointment
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Create a new appointment for a patient with a doctor.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 min-h-0">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Patient & Doctor Selection */}
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Patient & Doctor Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patientId" className="text-sm font-medium">Patient *</Label>
                      <Select
                        value={formData.patientId}
                        onValueChange={(value) => handleChange("patientId", value)}
                        disabled={loadingData}
                      >
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue placeholder={loadingData ? "Loading patients..." : "Select a patient"} />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient._id} value={patient._id}>
                              {patient.first_name} {patient.last_name} - {patient.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doctorId" className="text-sm font-medium">Doctor *</Label>
                      <Select
                        value={formData.doctorId}
                        onValueChange={(value) => handleChange("doctorId", value)}
                        disabled={loadingData}
                      >
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue placeholder={loadingData ? "Loading doctors..." : "Select a doctor"} />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor._id} value={doctor._id}>
                              Dr. {doctor.first_name} {doctor.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nurseId" className="text-sm font-medium">Nurse (Optional)</Label>
                      <Select
                        value={formData.nurseId}
                        onValueChange={(value) => handleChange("nurseId", value)}
                        disabled={loadingData}
                      >
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue placeholder={loadingData ? "Loading nurses..." : "Select a nurse"} />
                        </SelectTrigger>
                        <SelectContent>
                          {nurses.map((nurse) => (
                            <SelectItem key={nurse._id} value={nurse._id}>
                              {nurse.first_name} {nurse.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="serviceId" className="text-sm font-medium">Service (Optional)</Label>
                      <Select
                        value={formData.serviceId}
                        onValueChange={(value) => handleChange("serviceId", value)}
                        disabled={loadingData}
                      >
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue placeholder={loadingData ? "Loading services..." : "Select a service"} />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} - ${service.price} ({service.duration}min)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Date & Time */}
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-sm font-medium">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleChange("date", e.target.value)}
                        required
                        className="h-9 sm:h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time" className="text-sm font-medium">Time *</Label>
                      <Select
                        value={formData.time}
                        onValueChange={(value) => handleChange("time", value)}
                      >
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-sm font-medium">Duration (min)</Label>
                      <Select
                        value={formData.duration}
                        onValueChange={(value) => handleChange("duration", value)}
                      >
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue placeholder="Duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 min</SelectItem>
                          <SelectItem value="30">30 min</SelectItem>
                          <SelectItem value="45">45 min</SelectItem>
                          <SelectItem value="60">60 min</SelectItem>
                          <SelectItem value="90">90 min</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="appointmentType" className="text-sm font-medium">Type</Label>
                      <Select
                        value={formData.appointmentType}
                        onValueChange={(value) => handleChange("appointmentType", value)}
                      >
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="follow-up">Follow-up</SelectItem>
                          <SelectItem value="check-up">Check-up</SelectItem>
                          <SelectItem value="vaccination">Vaccination</SelectItem>
                          <SelectItem value="procedure">Procedure</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="screening">Screening</SelectItem>
                          <SelectItem value="therapy">Therapy</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {validationMessage && (
                    <div className={`p-3 rounded-lg text-sm ${
                      validationVariant === "destructive" 
                        ? "bg-red-50 text-red-700 border border-red-200" 
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}>
                      {validationMessage}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="symptoms" className="text-sm font-medium">Symptoms</Label>
                    <Textarea
                      id="symptoms"
                      value={formData.symptoms}
                      onChange={(e) => handleChange("symptoms", e.target.value)}
                      placeholder="Describe the patient's symptoms..."
                      className="min-h-[80px] resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      placeholder="Any additional notes for the appointment..."
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Footer with buttons */}
          <div className="border-t bg-background px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={createAppointmentMutation.isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                onClick={handleSubmit}
                disabled={createAppointmentMutation.isPending || loadingData}
                className="w-full sm:w-auto"
              >
                {createAppointmentMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewAppointmentModal;

