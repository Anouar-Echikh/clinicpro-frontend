import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiService, User as ApiUser, LoginRequest, RegisterRequest } from "@/services/api";
import { clinicCookies } from "@/utils/cookies";

export type UserRole =
  | "super_admin"
  | "admin"
  | "doctor"
  | "receptionist"
  | "nurse"
  | "accountant"
  | "staff"
  | "patient";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  bio?: string;
  dateOfBirth?: string;
  specialization?: string;
  licenseNumber?: string;
  department?: string;
  permissions: string[];
  baseCurrency: string;
  timezone?: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  loading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  clinic_id: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    // Super Admin has unrestricted access - all possible permissions
    "view_dashboard",
    "manage_users",
    "manage_staff",
    "manage_patients",
    "manage_appointments",
    "manage_billing",
    "manage_inventory",
    "manage_payroll",
    "view_reports",
    "manage_settings",
    "manage_leads",
    "manage_prescriptions",
    "view_medical_records",
    "update_patient_status",
    "patient_intake",
    "basic_billing",
    "view_assigned_patients",
    "manage_invoices",
    "manage_payments",
    "view_financial_reports",
    "basic_operations",
    // Add any additional permissions as needed
    "unrestricted_access",
  ],
  admin: [
    "view_dashboard",
    "manage_users",
    "manage_staff",
    "manage_patients",
    "manage_appointments",
    "manage_billing",
    "manage_inventory",
    "manage_payroll",
    "view_reports",
    "manage_settings",
    "manage_leads",
  ],
  doctor: [
    "view_dashboard",
    "view_patients",
    "manage_appointments",
    "manage_prescriptions",
    "view_medical_records",
    "update_patient_status",
  ],
  receptionist: [
    "view_dashboard",
    "manage_leads",
    "book_appointments",
    "patient_intake",
    "view_patients",
    "basic_billing",
  ],
  nurse: [
    "view_dashboard",
    "view_assigned_patients",
    "update_patient_status",
    "manage_inventory",
    "view_medical_records",
  ],
  accountant: [
    "view_dashboard",
    "manage_billing",
    "manage_invoices",
    "manage_payments",
    "manage_payroll",
    "view_financial_reports",
  ],
  staff: [
    "view_dashboard",
    "view_patients",
    "basic_operations",
  ],
  patient: [
    "view_own_appointments",
    "view_own_prescriptions",
    "view_own_invoices",
    "view_own_medical_records",
  ],
};

// Helper function to convert API user to context user
const convertApiUserToContextUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser._id,
    email: apiUser.email,
    firstName: apiUser.first_name,
    lastName: apiUser.last_name,
    role: apiUser.role,
    phone: apiUser.phone,
    avatar: apiUser.avatar,
    address: apiUser.address,
    bio: apiUser.bio,
    dateOfBirth: apiUser.date_of_birth,
    specialization: apiUser.specialization,
    licenseNumber: apiUser.license_number,
    department: apiUser.department,
    // Use permissions provided by backend if available; fallback to role map
    permissions: (apiUser as any).permissions || ROLE_PERMISSIONS[apiUser.role] || [],
    baseCurrency: apiUser.base_currency || 'USD',
    timezone: apiUser.timezone || 'America/New_York',
    createdAt: new Date(apiUser.created_at),
    updatedAt: new Date(apiUser.updated_at),
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Debug user state changes
  useEffect(() => {
    console.log('🔐 AuthContext - User state changed:', { 
      user: !!user, 
      userEmail: user?.email,
      isAuthenticated: !!user,
      loading
    });
  }, [user, loading]);

  const refreshUser = async () => {
    try {
      const apiUser = await apiService.getCurrentUser();
      const contextUser = convertApiUserToContextUser(apiUser);
      setUser(contextUser);
      // Update stored user data
      localStorage.setItem("clinic_user", JSON.stringify(contextUser));
    } catch (error: any) {
      console.error("Error refreshing user data:", error);
      
      // Only clear session for genuine auth errors (401, 403)
      // Don't clear for network issues, server errors, etc.
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.log("🔐 AuthContext - Auth error, clearing session");
            clinicCookies.clearClinicData();
    localStorage.removeItem("clinic_user"); // Keep this for backward compatibility
        setUser(null);
      } else {
        console.warn("🔐 AuthContext - Non-auth error during refresh, keeping session");
        // For non-auth errors, try to use stored user data
        const storedUser = localStorage.getItem("clinic_user");
        if (storedUser) {
          try {
            const contextUser = JSON.parse(storedUser);
            setUser(contextUser);
          } catch (parseError) {
            console.error("Error parsing stored user:", parseError);
            setUser(null);
          }
        }
      }
    }
  };

  useEffect(() => {
    // Check for existing session on mount
    const initializeAuth = async () => {
      const token = clinicCookies.getClinicToken();
      const storedUser = localStorage.getItem("clinic_user");
      
      console.log('🔐 AuthContext - Initializing auth:', { hasToken: !!token, hasStoredUser: !!storedUser });
      
      if (token) {
        // If we have a token, try to restore/refresh user data
        try {
          if (storedUser) {
            // First try to use stored user data
            console.log('🔐 AuthContext - Restoring user from stored data');
            const contextUser = JSON.parse(storedUser);
            setUser(contextUser);
          }
          
          // Always try to refresh user data from API when we have a token
          console.log('🔐 AuthContext - Refreshing user data from API');
          await refreshUser();
        } catch (error: any) {
          console.warn("🔐 AuthContext - Error during initialization:", error);
          
          // Only clear session for genuine auth errors
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            console.log("🔐 AuthContext - Auth error during init, clearing session");
            clinicCookies.clearClinicData();
            localStorage.removeItem("clinic_user");
            setUser(null);
          } else if (storedUser) {
            // For other errors, try to use stored user data
            try {
              const contextUser = JSON.parse(storedUser);
              setUser(contextUser);
              console.log("🔐 AuthContext - Using stored user data after API error");
            } catch (parseError) {
              console.error("🔐 AuthContext - Error parsing stored user:", parseError);
              // If we have a token but can't parse stored user, try to fetch fresh user data
              console.log("🔐 AuthContext - Attempting to fetch fresh user data");
              try {
                await refreshUser();
              } catch (refreshError) {
                console.error("🔐 AuthContext - Failed to fetch fresh user data:", refreshError);
                setUser(null);
              }
            }
          } else {
            // No stored user but we have a token - try to fetch user data
            console.log("🔐 AuthContext - No stored user, fetching from API");
            try {
              await refreshUser();
            } catch (refreshError) {
              console.error("🔐 AuthContext - Failed to fetch user data:", refreshError);
              setUser(null);
            }
          }
        }
      } else {
        console.log('🔐 AuthContext - No token found, user not authenticated');
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const credentials: LoginRequest = { email, password };
      const response = await apiService.login(credentials);
      
      console.log('🔐 AuthContext - Login response:', { 
        hasToken: !!response.token, 
        hasUser: !!response.user,
        tokenPreview: response.token ? `${response.token.substring(0, 20)}...` : 'none'
      });
      
      // Store the initial authentication token (without clinic context)
      // This token allows access to user/clinics endpoint
      if (response.token) {
        console.log('🔐 AuthContext - Storing initial auth token');
        clinicCookies.setAuthToken(response.token);
        
        // Verify token was stored
        const storedToken = clinicCookies.getClinicToken();
        console.log('🔐 AuthContext - Token stored successfully:', !!storedToken);
      } else {
        console.error('🔐 AuthContext - No token in login response!');
      }
      
      const contextUser = convertApiUserToContextUser(response.user);
      setUser(contextUser);
      localStorage.setItem("clinic_user", JSON.stringify(contextUser));
      
      return true;
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Check if this is a subscription-related error
      if (error?.response?.data?.code === 'SUBSCRIPTION_REQUIRED' || 
          error?.response?.data?.code === 'NO_TENANT_CONTEXT' ||
          error?.response?.data?.code === 'SUBSCRIPTION_CHANGED') {
        // For subscription errors, throw the error to be handled by the UI
        throw error;
      }
      
      // For other errors (invalid credentials, etc.), return false
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setLoading(true);
    try {
      const registerData: RegisterRequest = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        phone: userData.phone,
        clinic_id: userData.clinic_id,
      };
      
      // Just call the register API without storing token or setting user
      // User will need to login after registration
      await apiService.register(registerData);
      
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
          clinicCookies.clearClinicData();
      localStorage.removeItem("clinic_user"); // Keep this for backward compatibility
  };

  const hasPermission = (permission: string): boolean => {
    // Super Admin has unrestricted access - bypass all permission checks
    if (user?.role === 'super_admin') {
      return true;
    }
    
    return user?.permissions.includes(permission) || false;
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    // Super Admin has unrestricted access - bypass all role checks
    if (user.role === 'super_admin') {
      return true;
    }
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("clinic_user", JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
    loading,
    isAuthenticated: !!user,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
