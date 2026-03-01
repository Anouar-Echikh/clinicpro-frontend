import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Search,
  User,
  Users,
  Calendar,
  Stethoscope,
  Plus,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CreateOdontogramRequest, ToothNumberingSystem } from "@/types";
import odontogramApi from "@/services/api/odontogramApi";
import { apiService, Patient as ApiPatient } from "@/services/api";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  age: number;
  gender: string;
  phone?: string;
  email?: string;
}

interface NewOdontogramModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const NewOdontogramModal: React.FC<NewOdontogramModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [step, setStep] = useState<'patient' | 'details'>('patient');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingAllPatients, setLoadingAllPatients] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectionMethod, setSelectionMethod] = useState<'search' | 'dropdown'>('search');
  
  // Form data
  const [formData, setFormData] = useState({
    examination_date: new Date().toISOString().split('T')[0],
    numbering_system: 'universal' as ToothNumberingSystem,
    patient_type: 'adult' as 'adult' | 'child',
    general_notes: '',
    periodontal_assessment: {
      bleeding_on_probing: false,
      calculus_present: false,
      plaque_index: undefined as number | undefined,
      gingival_index: undefined as number | undefined,
      general_notes: ''
    }
  });

  // Helper function to calculate age from date of birth
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

  // Convert API patient to local patient format
  const convertApiPatient = (apiPatient: ApiPatient): Patient => {
    return {
      id: apiPatient._id,
      firstName: apiPatient.first_name,
      lastName: apiPatient.last_name,
      dateOfBirth: new Date(apiPatient.date_of_birth),
      age: calculateAge(apiPatient.date_of_birth),
      gender: apiPatient.gender,
      phone: apiPatient.phone,
      email: apiPatient.email
    };
  };

  // Search patients using real API
  const searchPatients = async (searchQuery: string) => {
    setLoadingPatients(true);
    try {
      const response = await apiService.getPatients({
        search: searchQuery,
        limit: 20 // Limit results for modal display
      });
      
      const convertedPatients = response.data.patients.map(convertApiPatient);
      setPatients(convertedPatients);
    } catch (error) {
      console.error("Error searching patients:", error);
      toast({
        title: "Error",
        description: "Failed to search patients",
        variant: "destructive",
      });
    } finally {
      setLoadingPatients(false);
    }
  };

  // Fetch all patients for dropdown
  const fetchAllPatients = async () => {
    setLoadingAllPatients(true);
    try {
      const response = await apiService.getPatients({
        limit: 1000 // Get a large number to show all patients
      });
      
      const convertedPatients = response.data.patients.map(convertApiPatient);
      setAllPatients(convertedPatients);
    } catch (error) {
      console.error("Error fetching all patients:", error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    } finally {
      setLoadingAllPatients(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (selectionMethod === 'search' && searchTerm.length >= 2) {
      const delayedSearch = setTimeout(() => {
        searchPatients(searchTerm);
      }, 300);
      return () => clearTimeout(delayedSearch);
    } else {
      setPatients([]);
    }
  }, [searchTerm, selectionMethod]);

  // Fetch all patients when modal opens and dropdown is selected
  useEffect(() => {
    if (open && selectionMethod === 'dropdown' && allPatients.length === 0) {
      fetchAllPatients();
    }
  }, [open, selectionMethod]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    
    // Auto-detect patient type based on age
    const patientType = patient.age < 18 ? 'child' : 'adult';
    setFormData(prev => ({
      ...prev,
      patient_type: patientType
    }));
    
    setStep('details');
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePeriodontalChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      periodontal_assessment: {
        ...prev.periodontal_assessment,
        [field]: value
      }
    }));
  };

  const handleCreate = async () => {
    if (!selectedPatient) return;

    try {
      setCreating(true);

      const odontogramData: CreateOdontogramRequest = {
        examination_date: new Date(formData.examination_date),
        numbering_system: formData.numbering_system,
        patient_type: formData.patient_type,
        general_notes: formData.general_notes || undefined,
        periodontal_assessment: {
          bleeding_on_probing: formData.periodontal_assessment.bleeding_on_probing,
          calculus_present: formData.periodontal_assessment.calculus_present,
          plaque_index: formData.periodontal_assessment.plaque_index,
          gingival_index: formData.periodontal_assessment.gingival_index,
          general_notes: formData.periodontal_assessment.general_notes || undefined
        },
        teeth_conditions: [] // Start with empty teeth conditions
      };

      await odontogramApi.createOdontogram(selectedPatient.id, odontogramData);

      toast({
        title: "Success",
        description: `Odontogram created successfully for ${selectedPatient.firstName} ${selectedPatient.lastName}`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating odontogram:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create odontogram",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const resetModal = () => {
    setStep('patient');
    setSelectedPatient(null);
    setSearchTerm("");
    setPatients([]);
    setAllPatients([]);
    setSelectionMethod('search');
    setFormData({
      examination_date: new Date().toISOString().split('T')[0],
      numbering_system: 'universal',
      patient_type: 'adult',
      general_notes: '',
      periodontal_assessment: {
        bleeding_on_probing: false,
        calculus_present: false,
        plaque_index: undefined,
        gingival_index: undefined,
        general_notes: ''
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetModal();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2 text-blue-600" />
            Create New Odontogram
          </DialogTitle>
          <DialogDescription>
            {step === 'patient' 
              ? "Search and select a patient to create their dental chart"
              : `Creating dental chart for ${selectedPatient?.firstName} ${selectedPatient?.lastName}`
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'patient' && (
          <div className="space-y-4">
            {/* Selection Method Toggle */}
            <div className="flex items-center space-x-4 p-2 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium">Select method:</Label>
              <div className="flex space-x-2">
                <Button
                  variant={selectionMethod === 'search' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectionMethod('search')}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button
                  variant={selectionMethod === 'dropdown' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectionMethod('dropdown')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  All Patients
                </Button>
              </div>
            </div>

            {/* Search Method */}
            {selectionMethod === 'search' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-search">Search Patient</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="patient-search"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {loadingPatients && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  )}
                  
                  {!loadingPatients && searchTerm.length >= 2 && patients.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No patients found matching your search
                    </div>
                  )}

                  {patients.map((patient) => (
                    <Card key={patient.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardContent className="p-4" onClick={() => handlePatientSelect(patient)}>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">
                                {patient.firstName} {patient.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                Age: {patient.age}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.email} • {patient.phone}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {searchTerm.length < 2 && (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Type at least 2 characters to search for patients</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dropdown Method */}
            {selectionMethod === 'dropdown' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-dropdown">Select Patient</Label>
                  <Select onValueChange={(patientId) => {
                    const patient = allPatients.find(p => p.id === patientId);
                    if (patient) {
                      handlePatientSelect(patient);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        loadingAllPatients 
                          ? "Loading patients..." 
                          : allPatients.length === 0 
                            ? "No patients available"
                            : "Select a patient"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingAllPatients ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading patients...
                          </div>
                        </SelectItem>
                      ) : allPatients.length === 0 ? (
                        <SelectItem value="no-patients" disabled>
                          No patients found in this clinic
                        </SelectItem>
                      ) : (
                        allPatients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{patient.firstName} {patient.lastName}</span>
                              <span className="text-sm text-gray-500 ml-2">
                                Age: {patient.age}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Patient count display */}
                {!loadingAllPatients && allPatients.length > 0 && (
                  <div className="text-sm text-gray-500 text-center">
                    {allPatients.length} patient{allPatients.length !== 1 ? 's' : ''} available in this clinic
                  </div>
                )}

                {/* Empty state */}
                {!loadingAllPatients && allPatients.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No patients found in this clinic</p>
                    <p className="text-sm mt-1">Add patients first to create dental charts</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 'details' && selectedPatient && (
          <div className="space-y-6">
            {/* Selected Patient Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-blue-900">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </div>
                    <div className="text-sm text-blue-700">
                      Age: {selectedPatient.age} • {selectedPatient.gender}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep('patient')}
                    className="ml-auto"
                  >
                    Change Patient
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Odontogram Details Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="examination-date">Examination Date</Label>
                <Input
                  id="examination-date"
                  type="date"
                  value={formData.examination_date}
                  onChange={(e) => handleFormChange('examination_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numbering-system">Numbering System</Label>
                <Select value={formData.numbering_system} onValueChange={(value) => handleFormChange('numbering_system', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="universal">Universal (1-32)</SelectItem>
                    <SelectItem value="palmer">Palmer Notation</SelectItem>
                    <SelectItem value="fdi">FDI (ISO 3950)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient-type">Patient Type</Label>
                <Select value={formData.patient_type} onValueChange={(value) => handleFormChange('patient_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adult">Adult (Permanent Teeth)</SelectItem>
                    <SelectItem value="child">Child (Primary Teeth)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Periodontal Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Initial Periodontal Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="bleeding-on-probing"
                      checked={formData.periodontal_assessment.bleeding_on_probing}
                      onChange={(e) => handlePeriodontalChange('bleeding_on_probing', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="bleeding-on-probing">Bleeding on Probing</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="calculus-present"
                      checked={formData.periodontal_assessment.calculus_present}
                      onChange={(e) => handlePeriodontalChange('calculus_present', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="calculus-present">Calculus Present</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plaque-index">Plaque Index (0-3)</Label>
                    <Input
                      id="plaque-index"
                      type="number"
                      min="0"
                      max="3"
                      step="0.1"
                      value={formData.periodontal_assessment.plaque_index || ''}
                      onChange={(e) => handlePeriodontalChange('plaque_index', e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gingival-index">Gingival Index (0-3)</Label>
                    <Input
                      id="gingival-index"
                      type="number"
                      min="0"
                      max="3"
                      step="0.1"
                      value={formData.periodontal_assessment.gingival_index || ''}
                      onChange={(e) => handlePeriodontalChange('gingival_index', e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* General Notes */}
            <div className="space-y-2">
              <Label htmlFor="general-notes">General Notes</Label>
              <Textarea
                id="general-notes"
                placeholder="Initial examination notes..."
                value={formData.general_notes}
                onChange={(e) => handleFormChange('general_notes', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          
          {step === 'details' && (
            <Button 
              onClick={handleCreate}
              disabled={creating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Odontogram
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewOdontogramModal;
