import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Stethoscope,
  User,
  Pill,
  Calendar,
  Clock,
  Printer,
  Send,
  CheckCircle,
  AlertTriangle,
  FileText,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { Prescription } from "@/types";

interface PrescriptionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescriptionId: string | null;
  onPrint?: (prescriptionId: string) => void;
  onSendToPharmacy?: (prescriptionId: string) => void;
}

const PrescriptionDetailModal: React.FC<PrescriptionDetailModalProps> = ({
  open,
  onOpenChange,
  prescriptionId,
  onPrint,
  onSendToPharmacy,
}) => {
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "cancelled":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string | Date | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateAge = (dateOfBirth: string | Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handlePrint = () => {
    if (prescription && onPrint) {
      onPrint(prescription._id);
    }
  };

  const handleSendToPharmacy = () => {
    if (prescription && onSendToPharmacy) {
      onSendToPharmacy(prescription._id);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading prescription details...</span>
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
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto z-50">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Stethoscope className="h-6 w-6 text-blue-600" />
              <div>
                <DialogTitle className="text-xl">
                  Prescription {prescription.prescription_id}
                </DialogTitle>
                <DialogDescription>
                  Detailed view of prescription and medication information
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(prescription.status)}
              <Badge className={`${getStatusColor(prescription.status)}`}>
                {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-lg font-semibold">
                      {prescription.patient_id 
                        ? `${prescription.patient_id.first_name} ${prescription.patient_id.last_name}`
                        : 'Unknown Patient'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p>{prescription.patient_id?.date_of_birth ? formatDate(prescription.patient_id.date_of_birth) : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Age</label>
                    <p>{prescription.patient_id?.date_of_birth ? `${calculateAge(prescription.patient_id.date_of_birth)} years old` : 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="capitalize">{prescription.patient_id?.gender || 'N/A'}</p>
                  </div>
                  {prescription.patient_id?.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {prescription.patient_id.phone}
                      </p>
                    </div>
                  )}
                  {prescription.patient_id?.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {prescription.patient_id.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Stethoscope className="h-5 w-5 mr-2" />
                Prescribing Doctor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Doctor Name</label>
                  <p className="text-lg font-semibold">
                    {prescription.doctor_id?.first_name && prescription.doctor_id?.last_name ? 
                      `Dr. ${prescription.doctor_id.first_name} ${prescription.doctor_id.last_name}` :
                      "No Doctor Assigned"
                    }
                  </p>
                </div>
                {prescription.doctor_id?.specialization && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Specialization</label>
                    <p>{prescription.doctor_id.specialization}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Prescription Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 mr-2" />
                Prescription Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Diagnosis</label>
                  <p className="text-lg">{prescription.diagnosis}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date Prescribed</label>
                  <p>{formatDate(prescription.created_at)} at {formatTime(prescription.created_at)}</p>
                </div>
                {prescription.follow_up_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Follow-up Date</label>
                    <p className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(prescription.follow_up_date)}
                    </p>
                  </div>
                )}
                {prescription.appointment_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Related Appointment</label>
                    <p>{prescription.appointment_id._id}</p>
                  </div>
                )}
              </div>
              {prescription.notes && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Clinical Notes</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg">{prescription.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center">
                  <Pill className="h-5 w-5 mr-2" />
                  Medications ({prescription.medications.length})
                </div>
                <Badge variant="outline">
                  Total: {prescription.medications.reduce((sum, med) => sum + med.quantity, 0)} units
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescription.medications.map((medication, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Pill className="h-5 w-5 text-blue-600 mt-1" />
                        <div>
                          <h4 className="font-semibold text-lg">{medication.name}</h4>
                          <p className="text-gray-600">{medication.dosage}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        Qty: {medication.quantity}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Frequency</label>
                        <p>{medication.frequency}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Duration</label>
                        <p>{medication.duration}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Quantity</label>
                        <p>{medication.quantity} units</p>
                      </div>
                    </div>
                    
                    {medication.instructions && (
                      <div className="mt-3">
                        <label className="text-sm font-medium text-gray-500">Instructions</label>
                        <p className="mt-1 p-2 bg-blue-50 rounded text-sm">{medication.instructions}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pharmacy Information */}
          {prescription.pharmacy_dispensed && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Pharmacy Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Badge className="bg-green-100 text-green-800">
                    Sent to Pharmacy
                  </Badge>
                  {prescription.dispensed_date && (
                    <p className="text-sm text-gray-600">
                      Dispensed on: {formatDate(prescription.dispensed_date)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <div className="text-sm text-gray-500">
            Last updated: {formatDate(prescription.updated_at)} at {formatTime(prescription.updated_at)}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionDetailModal; 