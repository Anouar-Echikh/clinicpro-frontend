import { Patient, Appointment, Lead, Medicine, Staff, Invoice } from "@/types";

// Demo data generators for the clinic management system
export const generateDemoPatients = (): Patient[] => [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+1234567890",
    dateOfBirth: new Date("1985-06-15"),
    gender: "male",
    address: "123 Main St, City, State 12345",
    emergencyContact: {
      name: "Jane Doe",
      phone: "+1234567891",
      relationship: "Spouse",
    },
    medicalHistory: ["Hypertension", "Diabetes Type 2"],
    allergies: ["Penicillin"],
    bloodGroup: "A+",
    height: 175,
    weight: 70,
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@email.com",
    phone: "+1234567892",
    dateOfBirth: new Date("1990-03-22"),
    gender: "female",
    address: "456 Oak Ave, City, State 12345",
    emergencyContact: {
      name: "Mike Johnson",
      phone: "+1234567893",
      relationship: "Husband",
    },
    medicalHistory: ["Asthma"],
    allergies: ["Peanuts", "Shellfish"],
    bloodGroup: "O-",
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2024-01-10"),
  },
];

export const generateDemoAppointments = (): Appointment[] => [
  {
    id: "1",
    patientId: "1",
    doctorId: "1",
    serviceId: "1",
    date: new Date("2024-01-15T10:30:00"),
    duration: 30,
    status: "scheduled",
    notes: "Regular checkup",
    symptoms: "General fatigue",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "2",
    patientId: "2",
    doctorId: "2",
    serviceId: "2",
    date: new Date("2024-01-15T11:00:00"),
    duration: 45,
    status: "completed",
    notes: "Follow-up visit",
    symptoms: "Chest pain",
    diagnosis: "Muscle strain",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-15"),
  },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`;
};
