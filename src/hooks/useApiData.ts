import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import type { Patient, User, Appointment, InventoryItem } from '@/services/api';
import { toast } from '@/hooks/use-toast';

// Custom hook for loading patients
export const usePatients = (shouldLoad: boolean = false) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shouldLoad) {
      loadPatients();
    }
  }, [shouldLoad]);

  const loadPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getPatients({ limit: 100 });
      setPatients(response.data.items);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load patients';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { patients, loading, error, refetch: loadPatients };
};

// Custom hook for loading doctors (users with doctor role)
export const useDoctors = (shouldLoad: boolean = false) => {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shouldLoad) {
      loadDoctors();
    }
  }, [shouldLoad]);

  const loadDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getDoctors({ limit: 100 });
      setDoctors(response.data.items);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load doctors';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { doctors, loading, error, refetch: loadDoctors };
};

// Custom hook for loading appointments
export const useAppointments = (shouldLoad: boolean = false, patientId?: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shouldLoad) {
      loadAppointments();
    }
  }, [shouldLoad, patientId]);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAppointments({ 
        limit: 100,
        ...(patientId && { patient_id: patientId })
      });
      setAppointments(response.data.items);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load appointments';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { appointments, loading, error, refetch: loadAppointments };
};

// Custom hook for loading staff/users
export const useStaff = (shouldLoad: boolean = false) => {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shouldLoad) {
      loadStaff();
    }
  }, [shouldLoad]);

  const loadStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getUsers({ limit: 100 });
      setStaff(response.data.users);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load staff';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { staff, loading, error, refetch: loadStaff };
};

// Custom hook for loading inventory items
export const useInventory = (shouldLoad: boolean = false, category?: string) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shouldLoad) {
      loadInventory();
    }
  }, [shouldLoad, category]);

  const loadInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getInventory({ 
        limit: 100,
        ...(category && { category })
      });
      setInventory(response.data.items);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load inventory';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { inventory, loading, error, refetch: loadInventory };
};

// Combined hook for modal data loading
export const useModalData = (open: boolean, dataTypes: string[] = []) => {
  const patients = usePatients(open && dataTypes.includes('patients'));
  const doctors = useDoctors(open && dataTypes.includes('doctors'));
  const appointments = useAppointments(open && dataTypes.includes('appointments'));
  const staff = useStaff(open && dataTypes.includes('staff'));
  const inventory = useInventory(open && dataTypes.includes('inventory'));

  const loading = patients.loading || doctors.loading || appointments.loading || 
                  staff.loading || inventory.loading;

  const refetchAll = () => {
    if (dataTypes.includes('patients')) patients.refetch();
    if (dataTypes.includes('doctors')) doctors.refetch();
    if (dataTypes.includes('appointments')) appointments.refetch();
    if (dataTypes.includes('staff')) staff.refetch();
    if (dataTypes.includes('inventory')) inventory.refetch();
  };

  return {
    patients: patients.patients,
    doctors: doctors.doctors,
    appointments: appointments.appointments,
    staff: staff.staff,
    inventory: inventory.inventory,
    loading,
    refetch: refetchAll
  };
}; 