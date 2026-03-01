import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Stethoscope,
  Users,
  Calculator,
  UserCheck,
  Building2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import PublicHeader from "@/components/layout/PublicHeader";
import apiService from "@/services/api";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "" as UserRole | "",
    phone: "",
    clinicId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [clinics, setClinics] = useState<Array<{ _id: string; name: string; code: string; address: any }>>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Fetch available clinics on component mount
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoadingClinics(true);
        
        // Extract subdomain from URL
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        
        // Only include subdomain if it's not localhost or the root domain
        const isLocalhost = hostname === 'localhost' || hostname.startsWith('localhost:');
        const queryParams = !isLocalhost && subdomain ? `?subdomain=${subdomain}` : '';
        
        console.log('🏥 Fetching clinics for subdomain:', subdomain, 'Query:', queryParams);
        
        const response = await apiService.get(`/public/clinics${queryParams}`);
        if (response.success && response.data) {
          setClinics(response.data);
          console.log(`✅ Loaded ${response.data.length} clinics for subdomain: ${subdomain}`);
        }
      } catch (err) {
        console.error('Error fetching clinics:', err);
        toast({
          title: "Error",
          description: "Failed to load clinics. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setLoadingClinics(false);
      }
    };

    fetchClinics();
  }, []);

  const roleOptions = [
    {
      value: "admin" as UserRole,
      label: "Administrator",
      description: "Full system access and management",
      icon: Shield,
      color: "text-purple-600",
    },
    {
      value: "doctor" as UserRole,
      label: "Doctor",
      description: "Patient care and medical records",
      icon: Stethoscope,
      color: "text-primary",
    },
    {
      value: "receptionist" as UserRole,
      label: "Receptionist",
      description: "Appointment and lead management",
      icon: Users,
      color: "text-green-600",
    },
    {
      value: "nurse" as UserRole,
      label: "Nurse",
      description: "Patient care and inventory management",
      icon: UserCheck,
      color: "text-orange-600",
    },
    {
      value: "staff" as UserRole,
      label: "Staff",
      description: "Financial management and reports",
      icon: Calculator,
      color: "text-pink-600",
    },
    {
      value: "patient" as UserRole,
      label: "Patient",
      description: "View appointments, prescriptions & invoices",
      icon: UserCheck,
      color: "text-teal-600",
    },
  ];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (!formData.role) {
      setError("Please select a role");
      setIsLoading(false);
      return;
    }

    if (!formData.clinicId) {
      setError("Please select a clinic");
      setIsLoading(false);
      return;
    }

    try {
      const success = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        clinic_id: formData.clinicId,
      });

      if (success) {
        toast({
          title: "Account created successfully",
          description: "Please log in with your new account to continue.",
        });
        navigate("/login");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRole = roleOptions.find((role) => role.value === formData.role);

  return (
    <div className="w-full bg-background min-h-screen">
      <PublicHeader variant="auth" />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">ClinicPro</span>
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              Create your account
            </CardTitle>
            <CardDescription>
              Join ClinicPro and start managing your clinic today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinic">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Select Clinic
                  </div>
                </Label>
                <Select
                  value={formData.clinicId}
                  onValueChange={(value) => handleChange("clinicId", value)}
                  disabled={isLoading || loadingClinics}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={loadingClinics ? "Loading clinics..." : "Choose a clinic to join"} />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map((clinic) => (
                      <SelectItem
                        key={clinic._id}
                        value={clinic._id}
                        className="py-3"
                      >
                        <div className="flex flex-col">
                          <div className="font-medium">{clinic.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {clinic.address?.city && clinic.address?.state
                              ? `${clinic.address.city}, ${clinic.address.state}`
                              : clinic.code}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {clinics.length === 0 && !loadingClinics && (
                  <p className="text-sm text-destructive">
                    No clinics available. Please contact support.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role & Responsibilities</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleChange("role", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your role in the clinic" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem
                        key={role.value}
                        value={role.value}
                        className="py-3"
                      >
                        <div className="flex items-center space-x-3">
                          <role.icon className={`h-5 w-5 ${role.color}`} />
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {role.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedRole && (
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <selectedRole.icon
                        className={`h-4 w-4 ${selectedRole.color}`}
                      />
                      <span className="text-sm font-medium">
                        {selectedRole.label}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {selectedRole.value}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedRole.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      required
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleChange("confirmPassword", e.target.value)
                      }
                      required
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            ← Back to homepage
          </Link>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default Register;
