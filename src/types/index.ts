export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "super_admin" | "admin" | "doctor" | "nurse" | "receptionist" | "accountant" | "staff";
  avatar?: string;
  phone?: string;
  address?: string;
  bio?: string;
  dateOfBirth?: string;
  specialization?: string;
  licenseNumber?: string;
  department?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  dateOfBirth: Date;
  gender: "male" | "female" | "other";
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: string[];
  allergies: string[];
  bloodGroup?: string;
  height?: number;
  weight?: number;
  createdAt: Date;
  updatedAt: Date;
  // Additional UI properties
  avatar?: string;
  lastVisit?: Date;
  totalVisits?: number;
  status?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  head: string;
  location: string;
  phone: string;
  email: string;
  staffCount: number;
  budget: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: number; // in minutes
  price: number;
  department: string;
  isActive: boolean;
  prerequisites?: string;
  followUpRequired: boolean;
  maxBookingsPerDay: number;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  serviceId: string;
  date: Date;
  duration: number; // in minutes
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  notes?: string;
  symptoms?: string;
  diagnosis?: string;
  prescription?: Prescription[];
  followUp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  _id?: string; // MongoDB _id field
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  source: "website" | "referral" | "social" | "advertisement" | "walk-in";
  serviceInterest: string;
  status: "new" | "contacted" | "converted" | "lost";
  assignedTo?: string;
  notes?: string;
  clinic_id: string; // Clinic context
  created_at: string; // Backend uses snake_case
  updated_at: string; // Backend uses snake_case
  createdAt?: Date; // Keep for backward compatibility
  updatedAt?: Date; // Keep for backward compatibility
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  manufacturer?: string;
  batchNumber?: string;
  expiryDate: Date;
  quantity: number;
  unitPrice: number;
  supplier: string;
  description?: string;
  lowStockAlert: number;
  createdAt: Date;
  updatedAt: Date;
}

// Backend inventory interface for API calls
export interface InventoryItem {
  _id: string;
  name: string;
  category: 'medications' | 'medical-devices' | 'consumables' | 'equipment' | 'laboratory' | 'office-supplies' | 'other';
  sku: string;
  current_stock: number;
  minimum_stock: number;
  unit_price: number;
  supplier: string;
  expiry_date?: Date;
  manufacturer?: string;
  batchNumber?: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
}

export interface Prescription {
  _id: string;
  patient_id: {
    _id: string;
    first_name: string;
    last_name: string;
    date_of_birth: Date;
    gender: string;
    phone?: string;
    email?: string;
  };
  doctor_id: {
    _id: string;
    first_name: string;
    last_name: string;
    specialization?: string;
  };
  appointment_id?: {
    _id: string;
    appointment_date: Date;
    status: string;
  };
  clinic_id: string; // Clinic context
  prescription_id: string;
  diagnosis: string;
  medications: Medication[];
  status: 'active' | 'completed' | 'pending' | 'cancelled' | 'expired';
  notes?: string;
  follow_up_date?: Date;
  pharmacy_dispensed: boolean;
  dispensed_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePrescriptionRequest {
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  diagnosis: string;
  medications: Medication[];
  status?: 'active' | 'completed' | 'pending' | 'cancelled' | 'expired';
  notes?: string;
  follow_up_date?: string;
  pharmacy_dispensed?: boolean;
  dispensed_date?: string;
}

export interface PrescriptionStats {
  totalPrescriptions: number;
  activePrescriptions: number;
  pendingPrescriptions: number;
  dispensedPrescriptions: number;
  statusStats: Array<{ _id: string; count: number }>;
  monthlyStats: Array<{ _id: { year: number; month: number }; count: number }>;
  topMedications: Array<{ _id: string; count: number }>;
  topDiagnoses: Array<{ _id: string; count: number }>;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "admin" | "doctor" | "nurse" | "receptionist" | "technician";
  department: string;
  salary: number;
  salesPercentage: number; // Sales percentage for doctors
  joiningDate: Date;
  address: string;
  qualifications: string[];
  schedule: {
    [key: string]: {
      start: string;
      end: string;
      isWorking: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  patientId: string;
  appointmentId?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  paymentMethod?: "cash" | "card" | "upi" | "bank_transfer";
  paidAt?: Date;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: "service" | "medicine" | "test";
}



export interface PayrollEntry {
  id: string;
  staffId: string;
  month: number;
  year: number;
  baseSalary: number;
  overtime: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  status: "pending" | "paid";
  paidAt?: Date;
  createdAt: Date;
}

export interface ClinicSettings {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  workingHours: {
    [key: string]: {
      start: string;
      end: string;
      isOpen: boolean;
    };
  };
  holidays: Date[];
  currency: string;
  taxRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  todayAppointments: number;
  totalPatients: number;
  monthlyRevenue: number;
  pendingPayments: number;
  lowStockMedicines: number;
  totalStaff: number;
}

export interface ChartData {
  name: string;
  value: number;
  label?: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

// Test-related types for API integration
export interface TestCategory {
  _id: string;
  name: string;
  code: string;
  description: string;
  department: string;
  color: string;
  icon: string;
  testCount: number;
  commonTests: string[];
  isActive: boolean;
  sortOrder: number;
  created_at: string;
  updated_at: string;
}

export interface SampleType {
  _id: string;
  name: string;
  code: string;
  description: string;
  category: 'blood' | 'urine' | 'body_fluid' | 'tissue' | 'swab' | 'other';
  collectionMethod: string;
  container: string;
  preservative?: string;
  storageTemp: string;
  storageTime: string;
  volume: string;
  specialInstructions?: string;
  commonTests: string[];
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestMethodology {
  _id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  equipment: string;
  principles: string;
  applications: string[];
  advantages: string;
  limitations: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

export interface TurnaroundTime {
  _id: string;
  name: string;
  code: string;
  duration: string;
  durationMinutes: number;
  priority: "stat" | "urgent" | "routine" | "extended";
  category: string;
  description: string;
  examples: string[];
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

export interface Test {
  _id: string;
  name: string;
  code: string;
  category: TestCategory | string;
  sampleType?: SampleType | string;
  methodology?: TestMethodology | string;
  turnaroundTime: TurnaroundTime | string;
  description?: string;
  normalRange?: string;
  units?: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestReport {
  _id: string;
  reportNumber: string;
  patientId: any | string; // Will be populated with API Patient type
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  testId: Test | string;
  testName: string;
  testCode: string;
  category: string;
  externalVendor: string;
  testDate: string;
  recordedDate: string;
  recordedBy: string;
  status: 'pending' | 'recorded' | 'verified' | 'delivered';
  results?: any;
  normalRange?: string;
  units?: string;
  interpretation?: string;
  notes?: string;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  verifiedBy?: string;
  verifiedDate?: string;
  created_at: string;
  updated_at: string;
}

// Create/Update request types
export interface CreateTestCategoryRequest {
  name: string;
  code: string;
  description: string;
  department: string;
  color: string;
  icon: string;
  testCount?: number;
  commonTests?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface CreateSampleTypeRequest {
  name: string;
  code: string;
  description: string;
  category: 'blood' | 'urine' | 'body_fluid' | 'tissue' | 'swab' | 'other';
  collectionMethod: string;
  container: string;
  preservative?: string;
  storageTemp: string;
  storageTime: string;
  volume: string;
  specialInstructions?: string;
  commonTests?: string[];
  isActive?: boolean;
}

export interface SampleTypeStats {
  totalSampleTypes: number;
  activeSampleTypes: number;
  inactiveSampleTypes: number;
  bloodSamples: number;
  categoriesCount: number;
  categoryStats: Array<{
    _id: string;
    count: number;
    activeCount: number;
  }>;
}

export interface CreateTestMethodologyRequest {
  name: string;
  code: string;
  description: string;
  category: string;
  equipment: string;
  principles: string;
  applications: string[];
  advantages: string;
  limitations: string;
  isActive?: boolean;
}

export interface CreateTurnaroundTimeRequest {
  name: string;
  code: string;
  duration: string;
  durationMinutes: number;
  priority: "stat" | "urgent" | "routine" | "extended";
  category: string;
  description: string;
  examples: string[];
  isActive?: boolean;
}

export interface CreateTestRequest {
  name: string;
  code: string;
  category: string;
  sampleType?: string;
  methodology?: string;
  turnaroundTime: string;
  description: string;
  normalRange?: string;
  units?: string;
}

export interface CreateTestReportRequest {
  patientId: string;
  testId: string;
  externalVendor: string;
  testDate: string;
  recordedDate: string;
  recordedBy: string;
  status?: 'pending' | 'recorded' | 'verified' | 'delivered';
  results?: any;
  interpretation?: string;
  notes?: string;
}

export interface LabVendor {
  id: string;
  _id?: string;
  name: string;
  code: string;
  type: 'diagnostic_lab' | 'pathology_lab' | 'imaging_center' | 'reference_lab' | 'specialty_lab';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  website?: string;
  license: string;
  accreditation: string[];
  specialties: string[];
  rating: number;
  totalTests: number;
  averageTurnaround: string;
  pricing: 'budget' | 'moderate' | 'premium';
  contractStart: Date;
  contractEnd: Date;
  lastTestDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  created_at?: string; // Backend uses snake_case
  updated_at?: string; // Backend uses snake_case
}

export interface CreateLabVendorRequest {
  name: string;
  code: string;
  type: 'diagnostic_lab' | 'pathology_lab' | 'imaging_center' | 'reference_lab' | 'specialty_lab';
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  website?: string;
  license: string;
  accreditation: string[];
  specialties: string[];
  rating?: number;
  totalTests?: number;
  averageTurnaround: string;
  pricing: 'budget' | 'moderate' | 'premium';
  contractStart: string;
  contractEnd: string;
  lastTestDate?: string;
  notes?: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
}

export interface LabVendorStats {
  totalVendors: number;
  activeVendors: number;
  pendingVendors: number;
  suspendedVendors: number;
  totalTests: number;
  averageRating: number;
  expiringContracts: number;
  typeStats: Array<{ _id: string; count: number }>;
  pricingStats: Array<{ _id: string; count: number }>;
  specialtyStats: Array<{ _id: string; count: number }>;
}

// Odontogram module types

// Tooth numbering systems
export type ToothNumberingSystem = 'universal' | 'palmer' | 'fdi';

// Tooth surfaces
export type ToothSurface = 'mesial' | 'distal' | 'occlusal' | 'buccal' | 'lingual' | 'incisal';

// Dental condition types
export type DentalConditionType = 
  | 'healthy' 
  | 'caries' 
  | 'filling' 
  | 'crown' 
  | 'bridge' 
  | 'implant' 
  | 'extraction' 
  | 'root_canal' 
  | 'missing' 
  | 'fractured' 
  | 'wear' 
  | 'restoration_needed'
  | 'sealant'
  | 'veneer'
  | 'temporary_filling'
  | 'periapical_lesion';

// Treatment status
export type TreatmentStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

// Treatment priority
export type TreatmentPriority = 'low' | 'medium' | 'high' | 'urgent';

// Surface condition interface
export interface SurfaceCondition {
  surface: ToothSurface;
  condition: DentalConditionType;
  notes?: string;
  color_code?: string; // Hex color for visual representation
  date_diagnosed?: Date;
  severity?: 'mild' | 'moderate' | 'severe';
}

// Periodontal pocket depth interface
export interface PeriodontalPocketDepth {
  mesial?: number;
  distal?: number;
  buccal?: number;
  lingual?: number;
}

// Treatment plan interface
export interface TreatmentPlan {
  planned_treatment: string;
  priority: TreatmentPriority;
  estimated_cost?: number;
  estimated_duration?: string; // e.g., "30 minutes"
  status: TreatmentStatus;
  planned_date?: Date;
  completed_date?: Date;
  notes?: string;
}

// Attachment interface
export interface ToothAttachment {
  file_name: string;
  file_url: string;
  file_type: 'image' | 'xray' | 'document';
  uploaded_date: Date;
  description?: string;
}

// Individual tooth condition interface
export interface ToothCondition {
  tooth_number: number; // Universal numbering (1-32 for permanent, 55-85 for primary)
  tooth_name?: string; // e.g., "Upper Right Central Incisor"
  surfaces: SurfaceCondition[];
  overall_condition: DentalConditionType;
  mobility?: number; // 0-3 scale for tooth mobility
  periodontal_pocket_depth?: PeriodontalPocketDepth;
  treatment_plan?: TreatmentPlan;
  attachments?: ToothAttachment[];
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// Treatment summary interface
export interface TreatmentSummary {
  total_planned_treatments: number;
  completed_treatments: number;
  in_progress_treatments: number;
  estimated_total_cost?: number;
}

// Periodontal assessment interface
export interface PeriodontalAssessment {
  bleeding_on_probing: boolean;
  plaque_index?: number; // 0-3 scale
  gingival_index?: number; // 0-3 scale
  calculus_present: boolean;
  general_notes?: string;
}

// Main Odontogram interface
export interface Odontogram {
  _id: string;
  clinic_id: string;
  patient_id: {
    _id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    age: number;
    phone?: string;
    email?: string;
    date_of_birth: Date;
    gender: 'male' | 'female' | 'other';
  } | null; // Allow patient_id to be null
  doctor_id: {
    _id: string;
    first_name: string;
    last_name: string;
    specialization?: string;
  };
  examination_date: Date;
  numbering_system: ToothNumberingSystem;
  patient_type: 'adult' | 'child'; // To handle different tooth sets
  teeth_conditions: ToothCondition[];
  general_notes?: string;
  treatment_summary?: TreatmentSummary;
  periodontal_assessment?: PeriodontalAssessment;
  version: number; // For tracking odontogram versions
  is_active: boolean; // Current active odontogram for patient
  created_at: Date;
  updated_at: Date;
  // Virtual properties from backend
  treatment_progress?: number; // Percentage
  pending_treatments?: number;
}

// Request interfaces for API calls
export interface CreateOdontogramRequest {
  examination_date?: Date;
  numbering_system?: ToothNumberingSystem;
  patient_type?: 'adult' | 'child';
  teeth_conditions?: Omit<ToothCondition, '_id' | 'created_at' | 'updated_at'>[];
  general_notes?: string;
  periodontal_assessment?: PeriodontalAssessment;
}

export interface UpdateOdontogramRequest extends Partial<CreateOdontogramRequest> {
  version?: number;
  is_active?: boolean;
}

export interface CreateToothConditionRequest {
  tooth_number: number;
  tooth_name?: string;
  surfaces?: SurfaceCondition[];
  overall_condition: DentalConditionType;
  mobility?: number;
  periodontal_pocket_depth?: PeriodontalPocketDepth;
  treatment_plan?: TreatmentPlan;
  attachments?: ToothAttachment[];
  notes?: string;
}

export interface UpdateToothConditionRequest extends Partial<CreateToothConditionRequest> {}

// Odontogram statistics interface
export interface OdontogramStats {
  total_patients: number;
  total_planned_treatments: number;
  total_completed_treatments: number;
  total_in_progress_treatments: number;
  total_pending_treatments: number;
  total_estimated_cost: number;
  completion_rate: number;
}

// Simplified patient summary for odontogram views
export interface OdontogramPatientSummary {
  _id: string;
  full_name: string;
  age: number;
}

// Odontogram history interface
export interface OdontogramHistory {
  patient: OdontogramPatientSummary;
  odontograms: Odontogram[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

// Tooth chart visualization properties
export interface ToothChartProps {
  odontogram?: Odontogram;
  onToothClick?: (toothNumber: number, surface?: ToothSurface) => void;
  editable?: boolean;
  highlightTooth?: number;
  showLabels?: boolean;
  numberingSystem?: ToothNumberingSystem;
}

// Condition color mappings for visualization
export interface ConditionColorMap {
  [key in DentalConditionType]: string;
}

// Treatment priority color mappings
export interface PriorityColorMap {
  [key in TreatmentPriority]: string;
}

// Payment related interfaces
export interface Payment {
  _id: string;
  clinic_id: string;
  invoice_id?: {
    _id: string;
    invoice_number: string;
    total_amount: number;
  };
  patient_id: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  amount: number;
  currency: string;
  method: 'credit_card' | 'cash' | 'bank_transfer' | 'upi' | 'insurance' | 'stripe';
  status: 'completed' | 'pending' | 'processing' | 'failed' | 'refunded';
  transaction_id?: string;
  processing_fee: number;
  net_amount: number;
  payment_date: string;
  failure_reason?: string;
  description: string;
  
  // Stripe-specific fields
  stripe_payment_intent_id?: string;
  stripe_checkout_session_id?: string;
  stripe_customer_id?: string;
  payment_link?: string;
  customer_email?: string;
  
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentData {
  invoice_id?: string;
  patient_id: string;
  amount: number;
  currency?: string;
  method: 'credit_card' | 'cash' | 'bank_transfer' | 'upi' | 'insurance' | 'stripe';
  description: string;
  processing_fee?: number;
  card_last4?: string;
  insurance_provider?: string;
  customer_email?: string;
}

export interface CreateStripePaymentLinkData {
  amount: number;
  currency?: string;
  description: string;
  customer_email: string;
  patient_id: string;
  success_url?: string;
  cancel_url?: string;
  metadata?: Record<string, string>;
}

export interface StripePaymentLinkResponse {
  payment_id: string;
  payment_link: string;
  checkout_session_id: string;
  expires_at: number;
  amount: number;
  currency: string;
  customer_email: string;
  patient: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PaymentStats {
  overview: {
    total_payments: number;
    total_revenue: number;
    completed_payments: number;
    failed_payments: number;
    pending_payments: number;
    processing_payments: number;
    monthly_revenue: number;
    monthly_payments_count: number;
  };
  by_method: Array<{
    _id: string;
    count: number;
    total_amount: number;
  }>;
}

export interface StripeStats {
  total_payments: number;
  successful_payments: number;
  failed_payments: number;
  pending_payments: number;
  total_amount: number;
  total_fees: number;
  net_amount: number;
}
