import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient, usePatientStats } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Patient as ApiPatient } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveTable, MobileActionDropdown } from "@/components/ui/table";
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveHeader,
  ResponsiveStatsCard,
  ResponsiveButtonGroup,
} from "@/components/ui/responsive-container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  UserPlus,
  Users,
} from "lucide-react";
import { Patient } from "@/types";
import AddPatientModal from "@/components/modals/AddPatientModal";
import PatientDetailsModal from "@/components/modals/PatientDetailsModal";
import EditItemModal from "@/components/modals/EditItemModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";

const Patients = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // API hooks
  const { 
    data: patientsData, 
    isLoading, 
    error,
    refetch 
  } = usePatients({ 
    page: currentPage, 
    limit: pageSize, 
    search: searchTerm || undefined,
    tenantScoped: true  // Force tenant-scoped filtering
  });
  
  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();
  const deletePatientMutation = useDeletePatient();
  
  // Patient statistics with tenant scoping
  const { 
    data: patientStats, 
    isLoading: statsLoading 
  } = usePatientStats({ tenantScoped: true });

  // Modal states
  
  const [viewDetailsModal, setViewDetailsModal] = useState<{
    open: boolean;
    item: Patient | null;
  }>({ open: false, item: null });

  const [editModal, setEditModal] = useState<{
    open: boolean;
    item: Patient | null;
  }>({ open: false, item: null });

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    item: Patient | null;
  }>({ open: false, item: null });

  // Action handlers
  const handleViewDetails = (patient: Patient) => {
    setViewDetailsModal({ open: true, item: patient });
  };

  const handleEdit = (patient: Patient) => {
    setEditModal({ open: true, item: patient });
  };

  const handleDelete = (patient: Patient) => {
    setDeleteModal({ open: true, item: patient });
  };

  const handleSaveEdit = async (updatedData: Record<string, any>) => {
    if (!editModal.item) return;
    
    try {
      // Prepare patient data for API (only fields supported by the API)
      const patientUpdateData: any = {
        first_name: updatedData.firstName,
        last_name: updatedData.lastName,
        email: updatedData.email,
        phone: updatedData.phone,
        address: updatedData.address,
        gender: updatedData.gender,
        date_of_birth: typeof updatedData.dateOfBirth === 'string' 
          ? updatedData.dateOfBirth 
          : updatedData.dateOfBirth?.toISOString().split('T')[0],
      };

      // Add password if provided (for updating patient portal access)
      if (updatedData.password && updatedData.password.trim() !== '') {
        patientUpdateData.password = updatedData.password;
      }

      // Add last visit if provided
      if (updatedData.lastVisit) {
        patientUpdateData.last_visit = typeof updatedData.lastVisit === 'string' 
          ? new Date(updatedData.lastVisit)
          : updatedData.lastVisit;
      }

      // Add emergency contact if provided
      if (updatedData.emergencyContactName) {
        patientUpdateData.emergency_contact = {
          name: updatedData.emergencyContactName,
          phone: updatedData.emergencyContactPhone,
          relationship: updatedData.emergencyContactRelationship,
        };
      }

      // Add insurance info if provided
      if (updatedData.insuranceProvider) {
        patientUpdateData.insurance_info = {
          provider: updatedData.insuranceProvider,
          policy_number: updatedData.insurancePolicyNumber,
        };
      }

      // Make sure we have a valid ID
      const patientId = editModal.item.id;
      if (!patientId) {
        throw new Error('Invalid patient ID');
      }

      await updatePatientMutation.mutateAsync({
        id: patientId,
        data: patientUpdateData
      });
      
      setEditModal({ open: false, item: null });
      toast({
        title: t("Patient updated"),
        description: `${updatedData.firstName} ${updatedData.lastName} ${t("has been updated successfully.")}`,
      });
      
      // Refetch the patients list to get updated data
      refetch();

      // Note: Medical fields (height, weight, allergies, medicalHistory, bloodGroup) 
      // would typically be stored in medical records, not patient profile
      if (updatedData.height || updatedData.weight || updatedData.allergies || updatedData.medicalHistory || updatedData.bloodGroup) {
        toast({
          title: t("Note"),
          description: t("Medical information (height, weight, allergies, medical history, blood group) should be updated through medical records."),
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({
        title: t("Error"),
        description: t("Failed to update patient. Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.item) return;
    
    try {
      await deletePatientMutation.mutateAsync(deleteModal.item.id);
      setDeleteModal({ open: false, item: null });
      toast({
        title: t("Patient deleted"),
        description: t("Patient has been removed from the system."),
      });
    } catch (error) {
      toast({
        title: t("Error"),
        description: t("Failed to delete patient. Please try again."),
        variant: "destructive",
      });
    }
  };

  // Convert API patients to local Patient type
  const convertApiPatientToLocal = (apiPatient: ApiPatient): Patient => {
    const patient: Patient = {
      id: apiPatient._id || '',
      firstName: apiPatient.first_name,
      lastName: apiPatient.last_name,
      email: apiPatient.email,
      phone: apiPatient.phone,
      address: apiPatient.address,
      dateOfBirth: new Date(apiPatient.date_of_birth),
      gender: apiPatient.gender,
      emergencyContact: {
        name: apiPatient.emergency_contact?.name || '',
        phone: apiPatient.emergency_contact?.phone || '',
        relationship: apiPatient.emergency_contact?.relationship || '',
      },
      bloodGroup: '', // This would come from medical records
      allergies: [], // Array as per Patient interface
      medicalHistory: [], // Array as per Patient interface
      height: undefined, // Number or undefined as per Patient interface
      weight: undefined, // Number or undefined as per Patient interface
      createdAt: new Date(apiPatient.created_at || Date.now()),
      updatedAt: new Date(apiPatient.updated_at || Date.now()),
      // Additional fields for UI
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${apiPatient.first_name} ${apiPatient.last_name}`,
      lastVisit: apiPatient.last_visit ? new Date(apiPatient.last_visit) : undefined,
      totalVisits: 0, // This would come from appointments count
      status: 'active',
    };
    return patient;
  };

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Process data for display
  const patients = patientsData?.data?.patients?.map(convertApiPatientToLocal) || [];
  const totalPatients = patientsData?.data?.pagination?.total || 0;
  const totalPages = Math.ceil(totalPatients / pageSize);

  // Filter patients based on search and gender
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = !searchTerm || 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm);
    
    const matchesGender = selectedGender === "all" || patient.gender === selectedGender;
    
    return matchesSearch && matchesGender;
  });

  // Table columns configuration
  const tableColumns = [
    {
      key: 'patient',
      label: t('Patient'),
      render: (patient: Patient) => (
        <div className="flex items-center space-x-3">
          <Avatar className="avatar-responsive">
            <AvatarImage src={patient.avatar} alt={patient.firstName} />
            <AvatarFallback>{getInitials(patient.firstName, patient.lastName)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm xs:text-base">
              {patient.firstName} {patient.lastName}
            </div>
            <div className="text-xs xs:text-sm text-muted-foreground">
              {patient.gender} • {calculateAge(patient.dateOfBirth)} {t('years')}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      label: t('Contact'),
      render: (patient: Patient) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Phone className="icon-sm text-muted-foreground" />
            <span className="text-xs xs:text-sm">{patient.phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="icon-sm text-muted-foreground" />
            <span className="text-xs xs:text-sm truncate max-w-32">{patient.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'age',
      label: t('Age'),
      render: (patient: Patient) => (
        <span className="text-sm font-medium">{calculateAge(patient.dateOfBirth)} {t("years")}</span>
      ),
    },
    {
      key: 'bloodGroup',
      label: t('Blood Group'),
      render: (patient: Patient) => (
        <Badge variant="outline" className="badge-responsive">
                        {patient.bloodGroup || t('N/A')}
        </Badge>
      ),
    },
    {
      key: 'lastVisit',
      label: t('Last Visit'),
      render: (patient: Patient) => (
        <span className="text-xs xs:text-sm text-muted-foreground">
          {patient.lastVisit?.toLocaleDateString() || t('Never')}
        </span>
      ),
    },
  ];

  // Mobile card configuration
  const mobileCardConfig = {
    title: (patient: Patient) => (
      <div className="flex items-center space-x-3">
        <Avatar className="avatar-responsive">
          <AvatarImage src={patient.avatar} alt={patient.firstName} />
          <AvatarFallback>{getInitials(patient.firstName, patient.lastName)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-sm xs:text-base">
            {patient.firstName} {patient.lastName}
          </div>
          <div className="text-xs xs:text-sm text-muted-foreground">
            {patient.gender} • {calculateAge(patient.dateOfBirth)} {t('years')}
          </div>
        </div>
      </div>
    ),
    content: (patient: Patient) => (
      <div className="space-y-3">
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Phone className="icon-sm text-muted-foreground" />
            <span className="text-xs xs:text-sm">{patient.phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="icon-sm text-muted-foreground" />
            <span className="text-xs xs:text-sm truncate">{patient.email}</span>
          </div>
        </div>
        {patient.address && (
          <div className="flex items-start space-x-2">
            <MapPin className="icon-sm text-muted-foreground mt-0.5" />
            <span className="text-xs xs:text-sm text-muted-foreground">{patient.address}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {patient.bloodGroup && (
            <Badge variant="outline" className="badge-responsive">
              {t("Blood")}: {patient.bloodGroup}
            </Badge>
          )}
          <Badge variant="secondary" className="badge-responsive">
            {t("Last visit")}: {patient.lastVisit?.toLocaleDateString() || t('Never')}
          </Badge>
        </div>
      </div>
    ),
    actions: (patient: Patient) => (
      <MobileActionDropdown
                  actions={[
            {
              label: t("View Details"),
            icon: Eye,
            onClick: () => handleViewDetails(patient),
          },
                      {
              label: t("Edit Patient"),
            icon: Edit,
            onClick: () => handleEdit(patient),
          },
                      {
              label: t("Delete Patient"),
            icon: Trash2,
            onClick: () => handleDelete(patient),
            variant: "destructive",
          },
        ]}
      />
    ),
  };

  // Action buttons for table
  const tableActions = (patient: Patient) => (
              <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <MoreVertical className="h-4 w-4 mr-1" />
                {t("Actions")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewDetails(patient)}>
                <Eye className="mr-2 h-4 w-4" />
                {t("View Details")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(patient)}>
                <Edit className="mr-2 h-4 w-4" />
                {t("Edit Patient")}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(patient)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("Delete Patient")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
  );

  // Handle create patient
  const handleCreatePatient = async (data: Record<string, any>) => {
    try {
      // Prepare patient data for API (only fields supported by the API)
      const patientData: any = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        gender: data.gender,
        date_of_birth: typeof data.dateOfBirth === 'string' 
          ? data.dateOfBirth 
          : data.dateOfBirth?.toISOString().split('T')[0],
      };

      // Add last visit if provided
      if (data.lastVisit) {
        patientData.last_visit = typeof data.lastVisit === 'string' 
          ? new Date(data.lastVisit)
          : data.lastVisit;
      }

      // Add emergency contact if provided
      if (data.emergencyContactName) {
        patientData.emergency_contact = {
          name: data.emergencyContactName,
          phone: data.emergencyContactPhone,
          relationship: data.emergencyContactRelationship,
        };
      }

      // Add insurance info if provided
      if (data.insuranceProvider) {
        patientData.insurance_info = {
          provider: data.insuranceProvider,
          policy_number: data.insurancePolicyNumber,
        };
      }

      await createPatientMutation.mutateAsync(patientData);
      

      toast({
        title: t("Patient added"),
        description: `${data.firstName} ${data.lastName} ${t("has been added successfully.")}`,
      });
      
      // Refetch patients list
      refetch();
    } catch (error) {
      toast({
        title: t("Error"),
        description: t("Failed to add patient. Please try again."),
        variant: "destructive",
      });
    }
  };

  return (
    <ResponsiveContainer>
      {/* Header */}
      <ResponsiveHeader
        title={t("Patients")}
        subtitle={t("Manage patient records and information")}
        actions={
          <AddPatientModal
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("Add Patient")}
              </Button>
            }
          />
        }
      />

      {/* Stats Cards */}
      <ResponsiveGrid columns={4} className="mb-6">
        <ResponsiveStatsCard
          title={t("Total Patients")}
          value={statsLoading ? "..." : (patientStats?.totalPatients || totalPatients)}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <ResponsiveStatsCard
          title={t("New This Month")}
          value={statsLoading ? "..." : (patientStats?.newThisMonth || 0)}
          icon={UserPlus}
          trend={{ value: 8, isPositive: true }}
        />
        <ResponsiveStatsCard
          title={t("Active Patients")}
          value={statsLoading ? "..." : (patientStats?.activePatients || filteredPatients.length)}
          icon={Eye}
        />
        <ResponsiveStatsCard
          title={t("Avg Age")}
          value={statsLoading ? "..." : (patientStats?.averageAge || 45)}
          icon={Calendar}
        />
      </ResponsiveGrid>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="responsive-card-padding pb-3">
          <CardTitle className="responsive-text-lg">{t("Search & Filter")}</CardTitle>
        </CardHeader>
        <CardContent className="responsive-card-padding pt-0">
          <div className="flex flex-col xs:flex-row gap-3 xs:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("Search patients by name, email, or phone...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 xs:gap-3">
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="btn-responsive border border-input bg-background px-3 py-2 rounded-md"
              >
                <option value="all">{t("All Genders")}</option>
                <option value="male">{t("Male")}</option>
                <option value="female">{t("Female")}</option>
                <option value="other">{t("Other")}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader className="responsive-card-padding pb-3">
            <CardTitle className="responsive-text-lg">{t("Patient Records")}</CardTitle>
            <CardDescription className="responsive-text-sm">
              {t("A list of all patients in your clinic with their details")}
            </CardDescription>
          </CardHeader>
          <CardContent className="responsive-card-padding">
            {error && (
              <Alert className="mb-4">
                <AlertDescription>
                  {t("Failed to load patients. Please try again.")}
                </AlertDescription>
              </Alert>
            )}

            <ResponsiveTable
              data={filteredPatients}
              columns={tableColumns}
              mobileCard={mobileCardConfig}
              actions={tableActions}
              loading={isLoading}
              emptyMessage={t("No patients found. Add your first patient to get started.")}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col xs:flex-row items-center justify-between gap-3 mt-6">
                <p className="responsive-text-sm text-muted-foreground">
                  {t("Showing")} {((currentPage - 1) * pageSize) + 1} {t("to")} {Math.min(currentPage * pageSize, totalPatients)} {t("of")} {totalPatients} {t("patients")}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="btn-responsive-sm"
                  >
                    {t("Previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-responsive-sm"
                  >
                    {t("Next")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modals */}

      <PatientDetailsModal
        open={viewDetailsModal.open && !!viewDetailsModal.item}
        onOpenChange={() => setViewDetailsModal({ open: false, item: null })}
        patient={viewDetailsModal.item}
      />

      <EditItemModal
        open={editModal.open}
        onOpenChange={() => setEditModal({ open: false, item: null })}
        onSave={handleSaveEdit}
        data={editModal.item || {}}
        title={t("Edit Patient")}
        fields={[
          { key: "firstName", label: t("First Name"), type: "text", required: true },
          { key: "lastName", label: t("Last Name"), type: "text", required: true },
          { key: "email", label: t("Email"), type: "text", required: true },
          { key: "phone", label: t("Phone"), type: "text", required: true },
          { key: "address", label: t("Address"), type: "textarea" },
          { key: "gender", label: t("Gender"), type: "select", options: [
            { value: "male", label: t("Male") },
            { value: "female", label: t("Female") },
            { value: "other", label: t("Other") }
          ]},
          { key: "dateOfBirth", label: t("Date of Birth"), type: "date", required: true },
          { key: "lastVisit", label: t("Last Visit Date"), type: "date" },
          { key: "bloodGroup", label: t("Blood Group"), type: "select", options: [
            { value: "A+", label: "A+" },
            { value: "A-", label: "A-" },
            { value: "B+", label: "B+" },
            { value: "B-", label: "B-" },
            { value: "AB+", label: "AB+" },
            { value: "AB-", label: "AB-" },
            { value: "O+", label: "O+" },
            { value: "O-", label: "O-" }
          ]},
          { key: "emergencyContact.name", label: t("Emergency Contact Name"), type: "text" },
          { key: "emergencyContact.phone", label: t("Emergency Contact Phone"), type: "text" },
          { key: "emergencyContact.relationship", label: t("Emergency Contact Relationship"), type: "text" },
          { 
            key: "password", 
            label: t("New Password (Optional)"), 
            type: "password",
            placeholder: t("Leave blank to keep current password"),
            description: t("Update password for patient portal access. Minimum 6 characters.")
          },
        ]}
      />

      <DeleteConfirmModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, item: open ? deleteModal.item : null })}
        onConfirm={handleConfirmDelete}
        title={t("Delete Patient")}
        description={t("Are you sure you want to delete this patient? This action cannot be undone.")}
        itemName={`${deleteModal.item?.firstName || ''} ${deleteModal.item?.lastName || ''}`.trim() || t('this patient')}
      />
    </ResponsiveContainer>
  );
};

export default Patients;
