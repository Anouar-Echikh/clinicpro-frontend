import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  apiService, 
  Patient, 
  Appointment, 
  MedicalRecord, 
  Invoice, 
  InventoryItem,
  User 
} from '@/services/api';
import { Lead, Prescription, PrescriptionStats, CreatePrescriptionRequest, TestCategory, CreateTestCategoryRequest, CreateTurnaroundTimeRequest } from '@/types';
import { useClinic } from '@/contexts/ClinicContext';

// Query Keys
export const queryKeys = {
  patients: (clinicId: string | null) => ['patients', clinicId] as const,
  patient: (clinicId: string | null, id: string) => ['patients', clinicId, id] as const,
  appointments: (clinicId: string | null) => ['appointments', clinicId] as const,
  appointment: (clinicId: string | null, id: string) => ['appointments', clinicId, id] as const,
  medicalRecords: (clinicId: string | null) => ['medical-records', clinicId] as const,
  medicalRecord: (clinicId: string | null, id: string) => ['medical-records', clinicId, id] as const,
  invoices: (clinicId: string | null) => ['invoices', clinicId] as const,
  invoice: (clinicId: string | null, id: string) => ['invoices', clinicId, id] as const,
  inventory: (clinicId: string | null) => ['inventory', clinicId] as const,
  inventoryItem: (clinicId: string | null, id: string) => ['inventory', clinicId, id] as const,
  leads: (clinicId: string | null) => ['leads', clinicId] as const,
  lead: (clinicId: string | null, id: string) => ['leads', clinicId, id] as const,
  prescriptions: (clinicId: string | null) => ['prescriptions', clinicId] as const,
  prescription: (clinicId: string | null, id: string) => ['prescriptions', clinicId, id] as const,
  prescriptionStats: (clinicId: string | null) => ['prescription-stats', clinicId] as const,
  currentUser: ['current-user'] as const,
  testCategories: (clinicId: string | null) => ['test-categories', clinicId] as const,
  testCategory: (clinicId: string | null, id: string) => ['test-categories', clinicId, id] as const,
  testCategoryStats: (clinicId: string | null) => ['test-category-stats', clinicId] as const,
  tests: (clinicId: string | null) => ['tests', clinicId] as const,
  test: (clinicId: string | null, id: string) => ['tests', clinicId, id] as const,
  testStats: (clinicId: string | null) => ['test-stats', clinicId] as const,
  testMethodologies: (clinicId: string | null) => ['test-methodologies', clinicId] as const,
  testMethodology: (clinicId: string | null, id: string) => ['test-methodologies', clinicId, id] as const,
  testMethodologyStats: (clinicId: string | null) => ['test-methodology-stats', clinicId] as const,
  sampleTypes: (clinicId: string | null) => ['sample-types', clinicId] as const,
  sampleType: (clinicId: string | null, id: string) => ['sample-types', clinicId, id] as const,
  sampleTypeStats: (clinicId: string | null) => ['sample-type-stats', clinicId] as const,
  testReports: (clinicId: string | null) => ['test-reports', clinicId] as const,
  testReport: (clinicId: string | null, id: string) => ['test-reports', clinicId, id] as const,
  testReportStats: (clinicId: string | null) => ['test-report-stats', clinicId] as const,
  turnaroundTimes: (clinicId: string | null) => ['turnaround-times', clinicId] as const,
  turnaroundTime: (clinicId: string | null, id: string) => ['turnaround-times', clinicId, id] as const,
  turnaroundTimeStats: (clinicId: string | null) => ['turnaround-time-stats', clinicId] as const,
};

// Patient Hooks
export const usePatients = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  tenantScoped?: boolean;
}) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: [...queryKeys.patients(clinicId), params],
    queryFn: () => apiService.getPatients(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clinicId,
  });
};

export const usePatient = (id: string) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: queryKeys.patient(clinicId, id),
    queryFn: () => apiService.getPatient(id),
    enabled: !!id && !!clinicId,
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;
  
  return useMutation({
    mutationFn: (patientData: Omit<Patient, '_id' | 'created_at' | 'updated_at'>) => 
      apiService.createPatient(patientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.patients(clinicId),
        exact: false 
      });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) => {
      // Convert id to _id if needed for the backend API
      if (id.includes('undefined')) {
        console.error('Invalid patient ID provided for update:', id);
        throw new Error('Invalid patient ID');
      }
      return apiService.updatePatient(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.patients(null),
        exact: false 
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.patient(null, id) });
    },
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.patients(null),
        exact: false 
      });
    },
  });
};

export const usePatientStats = (params?: { tenantScoped?: boolean }) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: ['patient-stats', clinicId, params],
    queryFn: () => apiService.getPatientStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clinicId,
  });
};

// Doctor/User Hooks
export const useDoctors = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['doctors', params],
    queryFn: () => apiService.getDoctors(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Appointment Hooks
export const useAppointments = (params?: {
  page?: number;
  limit?: number;
  patient_id?: string;
  doctor_id?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: [...queryKeys.appointments(clinicId), params],
    queryFn: () => apiService.getAppointments(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!clinicId,
  });
};

export const useAppointment = (id: string) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: queryKeys.appointment(clinicId, id),
    queryFn: () => apiService.getAppointment(id),
    enabled: !!id && !!clinicId,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (appointmentData: Omit<Appointment, '_id' | 'created_at' | 'updated_at'>) => 
      apiService.createAppointment(appointmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments(null) });
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) => 
      apiService.updateAppointment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointment(null, id) });
    },
  });
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments(null) });
    },
  });
};

// Medical Records Hooks
export const useMedicalRecords = (params?: {
  page?: number;
  limit?: number;
  patient_id?: string;
  doctor_id?: string;
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery({
    queryKey: [...queryKeys.medicalRecords(null), params],
    queryFn: () => apiService.getMedicalRecords(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMedicalRecord = (id: string) => {
  return useQuery({
    queryKey: queryKeys.medicalRecord(null, id),
    queryFn: () => apiService.getMedicalRecord(id),
    enabled: !!id,
  });
};

export const useCreateMedicalRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (recordData: Omit<MedicalRecord, '_id' | 'created_at' | 'updated_at'>) => 
      apiService.createMedicalRecord(recordData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medicalRecords(null) });
    },
  });
};

export const useUpdateMedicalRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MedicalRecord> }) => 
      apiService.updateMedicalRecord(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medicalRecords(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.medicalRecord(null, id) });
    },
  });
};

export const useDeleteMedicalRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteMedicalRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medicalRecords(null) });
    },
  });
};

// Invoice Hooks
export const useInvoices = (params?: {
  page?: number;
  limit?: number;
  patient_id?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery({
    queryKey: [...queryKeys.invoices(null), params],
    queryFn: () => apiService.getInvoices(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: queryKeys.invoice(null, id),
    queryFn: () => apiService.getInvoice(id),
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (invoiceData: Omit<Invoice, '_id' | 'invoice_number' | 'created_at' | 'updated_at'>) => 
      apiService.createInvoice(invoiceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices(null) });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) => 
      apiService.updateInvoice(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoice(null, id) });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices(null) });
    },
  });
};

// Inventory Hooks
export const useInventory = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  low_stock?: boolean;
}) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: [...queryKeys.inventory(clinicId), params],
    queryFn: () => apiService.getInventory(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clinicId,
  });
};

export const useInventoryItem = (id: string) => {
  return useQuery({
    queryKey: queryKeys.inventoryItem(null, id),
    queryFn: () => apiService.getInventoryItem(id),
    enabled: !!id,
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (itemData: Omit<InventoryItem, '_id' | 'created_at' | 'updated_at'>) => 
      apiService.createInventoryItem(itemData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory(null) });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) => 
      apiService.updateInventoryItem(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryItem(null, id) });
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory(null) });
    },
  });
};

// User Profile Hooks
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => apiService.getCurrentUser(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: Partial<User>) => apiService.updateProfile(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
};

// Lead Hooks
export const useLeads = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  source?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: [...queryKeys.leads(clinicId), params],
    queryFn: () => apiService.getLeads(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!clinicId,
  });
};

export const useLead = (id: string) => {
  return useQuery({
    queryKey: queryKeys.lead(null, id),
    queryFn: () => apiService.getLead(id),
    enabled: !!id,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => 
      apiService.createLead(leadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads(null) });
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) => 
      apiService.updateLead(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lead(null, id) });
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiService.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads(null) });
    },
  });
};

export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Lead['status'] }) => 
      apiService.updateLeadStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lead(null, id) });
    },
  });
};

export const useConvertLeadToPatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patientData }: { 
      id: string; 
      patientData: Omit<Patient, '_id' | 'created_at' | 'updated_at'> 
    }) => apiService.convertLeadToPatient(id, patientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.patients(null) });
    },
  });
};

// Prescription Hooks
export const usePrescriptions = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  doctor_id?: string;
  patient_id?: string;
  date_from?: string;
  date_to?: string;
}) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: [...queryKeys.prescriptions(clinicId), params],
    queryFn: () => apiService.getPrescriptions(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!clinicId,
  });
};

export const usePrescription = (id: string) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: queryKeys.prescription(clinicId, id),
    queryFn: () => apiService.getPrescription(id),
    enabled: !!id && !!clinicId,
  });
};

export const usePrescriptionStats = () => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: queryKeys.prescriptionStats(clinicId),
    queryFn: () => apiService.getPrescriptionStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clinicId,
  });
};

export const useCreatePrescription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (prescriptionData: CreatePrescriptionRequest) => 
      apiService.createPrescription(prescriptionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptionStats(null) });
    },
  });
};

export const useUpdatePrescription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePrescriptionRequest> }) => 
      apiService.updatePrescription(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.prescription(null, id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptionStats(null) });
    },
  });
};

export const useDeletePrescription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deletePrescription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptionStats(null) });
    },
  });
};

export const useUpdatePrescriptionStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      apiService.updatePrescriptionStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.prescription(null, id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptionStats(null) });
    },
  });
};

export const useSendToPharmacy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.sendToPharmacy(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.prescription(null, id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptionStats(null) });
    },
  });
};

// Health Check Hook
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const result = await apiService.healthCheck();
      // Ensure we never return undefined
      return result || {
        status: 'unknown',
        timestamp: new Date().toISOString()
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 2, // Retry failed requests 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

// Test Category Hooks
export const useTestCategories = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
}) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: [...queryKeys.testCategories(clinicId), params],
    queryFn: () => apiService.getTestCategories(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clinicId,
  });
};

export const useTestCategory = (id: string) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: queryKeys.testCategory(clinicId, id),
    queryFn: () => apiService.getTestCategory(id),
    enabled: !!id && !!clinicId,
  });
};

export const useTestCategoryStats = () => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: queryKeys.testCategoryStats(clinicId),
    queryFn: () => apiService.getTestCategoryStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clinicId,
  });
};

export const useCreateTestCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (categoryData: CreateTestCategoryRequest) => 
      apiService.createTestCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testCategories(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testCategoryStats(null) });
    },
  });
};

export const useUpdateTestCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTestCategoryRequest> }) => 
      apiService.updateTestCategory(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testCategories(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testCategory(null, id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testCategoryStats(null) });
    },
  });
};

export const useDeleteTestCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteTestCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testCategories(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testCategoryStats(null) });
    },
  });
};

export const useToggleTestCategoryStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.toggleTestCategoryStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testCategories(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testCategory(null, id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testCategoryStats(null) });
    },
  });
};

// Turnaround Time Hooks
export const useTurnaroundTimes = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  priority?: string;
  status?: string;
}) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: [...queryKeys.turnaroundTimes(clinicId), params],
    queryFn: () => apiService.getTurnaroundTimes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clinicId,
  });
};

export const useTurnaroundTime = (id: string) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: queryKeys.turnaroundTime(clinicId, id),
    queryFn: () => apiService.getTurnaroundTime(id),
    enabled: !!id && !!clinicId,
  });
};

export const useTurnaroundTimeStats = () => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: queryKeys.turnaroundTimeStats(clinicId),
    queryFn: () => apiService.getTurnaroundTimeStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clinicId,
  });
};

export const useCreateTurnaroundTime = () => {
  const queryClient = useQueryClient();
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;
  
  return useMutation({
    mutationFn: (turnaroundData: CreateTurnaroundTimeRequest) => 
      apiService.createTurnaroundTime(turnaroundData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.turnaroundTimes(clinicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.turnaroundTimeStats(clinicId) });
    },
  });
};

export const useUpdateTurnaroundTime = () => {
  const queryClient = useQueryClient();
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTurnaroundTimeRequest> }) => 
      apiService.updateTurnaroundTime(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.turnaroundTimes(clinicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.turnaroundTime(clinicId, id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.turnaroundTimeStats(clinicId) });
    },
  });
};

export const useDeleteTurnaroundTime = () => {
  const queryClient = useQueryClient();
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteTurnaroundTime(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.turnaroundTimes(clinicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.turnaroundTimeStats(clinicId) });
    },
  });
};

export const useToggleTurnaroundTimeStatus = () => {
  const queryClient = useQueryClient();
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;
  
  return useMutation({
    mutationFn: (id: string) => apiService.toggleTurnaroundTimeStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.turnaroundTimes(clinicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.turnaroundTime(clinicId, id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.turnaroundTimeStats(clinicId) });
    },
  });
};

// Tests Hooks
export const useTests = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: [...queryKeys.tests(clinicId), params],
    queryFn: () => apiService.getTests(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clinicId,
  });
};

export const useTest = (id: string) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: queryKeys.test(clinicId, id),
    queryFn: () => apiService.getTest(id),
    enabled: !!id && !!clinicId,
  });
};

export const useTestStats = () => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: queryKeys.testStats(clinicId),
    queryFn: () => apiService.getTestStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clinicId,
  });
};

export const useCreateTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiService.createTest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tests(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testStats(null) });
    },
  });
};

export const useUpdateTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiService.updateTest(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tests(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.test(null, id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testStats(null) });
    },
  });
};

export const useDeleteTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteTest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tests(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testStats(null) });
    },
  });
};

export const useToggleTestStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.toggleTestStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tests(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.test(null, id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testStats(null) });
    },
  });
};

// Test Methodologies Hooks
export const useTestMethodologies = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: [...queryKeys.testMethodologies(clinicId), params],
    queryFn: () => apiService.getTestMethodologies(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clinicId,
  });
};

export const useTestMethodology = (id: string) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: queryKeys.testMethodology(clinicId, id),
    queryFn: () => apiService.getTestMethodology(id),
    enabled: !!id && !!clinicId,
  });
};

export const useTestMethodologyStats = () => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: queryKeys.testMethodologyStats(clinicId),
    queryFn: () => apiService.getTestMethodologyStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clinicId,
  });
};

export const useCreateTestMethodology = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiService.createTestMethodology(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testMethodologies(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testMethodologyStats(null) });
    },
  });
};

export const useUpdateTestMethodology = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiService.updateTestMethodology(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testMethodologies(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testMethodology(null, id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testMethodologyStats(null) });
    },
  });
};

export const useDeleteTestMethodology = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteTestMethodology(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testMethodologies(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testMethodologyStats(null) });
    },
  });
};

export const useToggleTestMethodologyStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.toggleTestMethodologyStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testMethodologies(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testMethodology(null, id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testMethodologyStats(null) });
    },
  });
};

// Sample Types Hooks
export const useSampleTypes = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: [...queryKeys.sampleTypes(clinicId), params],
    queryFn: () => apiService.getSampleTypes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clinicId,
  });
};

export const useSampleType = (id: string) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: queryKeys.sampleType(clinicId, id),
    queryFn: () => apiService.getSampleType(id),
    enabled: !!id && !!clinicId,
  });
};

export const useSampleTypeStats = () => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: queryKeys.sampleTypeStats(clinicId),
    queryFn: () => apiService.getSampleTypeStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!clinicId,
  });
};

export const useCreateSampleType = () => {
  const queryClient = useQueryClient();
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;
  
  return useMutation({
    mutationFn: (data: any) => apiService.createSampleType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sampleTypes(clinicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.sampleTypeStats(clinicId) });
    },
  });
};

export const useUpdateSampleType = () => {
  const queryClient = useQueryClient();
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiService.updateSampleType(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sampleTypes(clinicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.sampleType(clinicId, id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.sampleTypeStats(clinicId) });
    },
  });
};

export const useDeleteSampleType = () => {
  const queryClient = useQueryClient();
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteSampleType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sampleTypes(clinicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.sampleTypeStats(clinicId) });
    },
  });
};

export const useToggleSampleTypeStatus = () => {
  const queryClient = useQueryClient();
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;
  
  return useMutation({
    mutationFn: (id: string) => apiService.toggleSampleTypeStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sampleTypes(clinicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.sampleType(clinicId, id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.sampleTypeStats(clinicId) });
    },
  });
};

// Test Reports Hooks
export const useTestReports = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  vendor?: string;
  category?: string;
}) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: [...queryKeys.testReports(clinicId), params],
    queryFn: () => apiService.getTestReports(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!clinicId,
  });
};

export const useTestReport = (id: string) => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: queryKeys.testReport(clinicId, id),
    queryFn: () => apiService.getTestReport(id),
    enabled: !!id && !!clinicId,
  });
};

export const useTestReportStats = () => {
  const { currentClinic } = useClinic();
  const clinicId = currentClinic?._id || null;

  return useQuery({
    queryKey: queryKeys.testReportStats(clinicId),
    queryFn: () => apiService.getTestReportStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!clinicId,
  });
};

export const useCreateTestReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiService.createTestReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testReports(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testReportStats(null) });
    },
  });
};

export const useUpdateTestReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiService.updateTestReport(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testReports(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testReport(null, id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testReportStats(null) });
    },
  });
};

export const useDeleteTestReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteTestReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testReports(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testReportStats(null) });
    },
  });
};

export const useUpdateTestReportStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, verifiedBy }: { id: string; status: string; verifiedBy?: string }) => 
      apiService.updateTestReportStatus(id, { status, verifiedBy }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testReports(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testReport(null, id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testReportStats(null) });
    },
  });
};

export const useVerifyTestReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.verifyTestReport(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testReports(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testReport(null, id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testReportStats(null) });
    },
  });
};

export const useDeliverTestReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deliverTestReport(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testReports(null) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testReport(null, id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testReportStats(null) });
    },
  });
}; 