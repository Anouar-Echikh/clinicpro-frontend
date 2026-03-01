// Utility functions for Department management

export interface DepartmentOption {
  code: string;
  name: string;
}

// Default departments that match the Departments module
export const defaultDepartments: DepartmentOption[] = [
  { code: "CARD", name: "Cardiology" },
  { code: "NEUR", name: "Neurology" },
  { code: "PEDS", name: "Pediatrics" },
  { code: "ORTHO", name: "Orthopedics" },
  { code: "EMRG", name: "Emergency Medicine" },
  { code: "RAD", name: "Radiology" },
  { code: "GMED", name: "General Medicine" },
  { code: "SURG", name: "Surgery" },
  { code: "ONCO", name: "Oncology" },
  { code: "PSYC", name: "Psychiatry" },
  { code: "LAB", name: "Laboratory" },
  { code: "PHARM", name: "Pharmacy" },
  { code: "ADMIN", name: "Administration" },
  { code: "RECEP", name: "Reception" },
  { code: "NURS", name: "Nursing" },
];

// Function to get departments for dropdowns
export const getDepartmentOptions = (): DepartmentOption[] => {
  return defaultDepartments;
};

// Function to get department name by code
export const getDepartmentName = (code: string): string => {
  const department = defaultDepartments.find((dept) => dept.code === code);
  return department?.name || code;
};

// Function to get department code by name
export const getDepartmentCode = (name: string): string => {
  const department = defaultDepartments.find((dept) => dept.name === name);
  return department?.code || name;
};

// Function to validate department
export const isValidDepartment = (code: string): boolean => {
  return defaultDepartments.some((dept) => dept.code === code);
};

// Function to format department for display
export const formatDepartmentDisplay = (code: string): string => {
  const department = defaultDepartments.find((dept) => dept.code === code);
  return department ? `${department.code} - ${department.name}` : code;
};
