import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { superAdminApiService } from "@/services/api/superAdminApi";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Crown,
  Lock,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SuperAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleQuickLogin = async () => {
    const defaultEmail = "superadmin@clinicpro.com";
    const defaultPassword = "SuperAdmin123!";
    
    setEmail(defaultEmail);
    setPassword(defaultPassword);
    setIsLoading(true);
    setError("");

    try {
      const response = await superAdminApiService.login({
        email: defaultEmail,
        password: defaultPassword
      });
      
      toast({
        title: "Super Admin Login Successful",
        description: `Welcome back, ${response.super_admin.first_name}!`,
      });
      
      navigate("/admin/dashboard");
    } catch (err: any) {
      console.error("Super Admin quick login error:", err);
      
      // Handle specific error cases
      if (err.message?.includes('locked')) {
        setError("Account is temporarily locked due to multiple failed login attempts. Please try again later.");
      } else if (err.message?.includes('credentials') || err.message?.includes('Invalid')) {
        setError("Invalid email or password. Please check your credentials and try again.");
      } else if (err.message?.includes('deactivated')) {
        setError("Super Admin account is deactivated. Please contact support.");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("An error occurred during login. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await superAdminApiService.login({
        email: email.trim(),
        password: password.trim()
      });
      
      toast({
        title: "Super Admin Login Successful",
        description: `Welcome back, ${response.super_admin.first_name}!`,
      });
      
      // Navigate to super admin dashboard (we'll create this later)
      navigate("/admin/dashboard");
    } catch (err: any) {
      console.error("Super Admin login error:", err);
      
      // Handle specific error cases
      if (err.message?.includes('locked')) {
        setError("Account is temporarily locked due to multiple failed login attempts. Please try again later.");
      } else if (err.message?.includes('credentials') || err.message?.includes('Invalid')) {
        setError("Invalid email or password. Please check your credentials and try again.");
      } else if (err.message?.includes('deactivated')) {
        setError("Super Admin account is deactivated. Please contact support.");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("An error occurred during login. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 to-blue-100/20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.1) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl relative z-10"
      >
        <div className={`grid grid-cols-1 ${import.meta.env.VITE_DEV_ENV !== 'false' ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-8 items-center`}>
          {/* Left Column - Main Login Form */}
          <div className={`w-full max-w-md mx-auto ${import.meta.env.VITE_DEV_ENV === 'false' ? 'max-w-lg' : ''}`}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4 shadow-lg">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin</h1>
              <p className="text-gray-600">ClinicPro Administration Portal</p>
            </div>

            {/* Login Card */}
            <Card className="backdrop-blur-sm bg-white/90 border-gray-200 shadow-xl">
              <CardHeader className="space-y-1 text-center pb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Secure Access
                  </CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  Enter your super admin credentials to continue
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="border-red-300 bg-red-50">
                    <Lock className="h-4 w-4" />
                    <AlertDescription className="text-red-700 font-medium">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-gray-700 font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@clinicpro.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      required
                      disabled={isLoading}
                      className="h-11 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="text-gray-700 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError("");
                        }}
                        required
                        disabled={isLoading}
                        className="h-11 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold transition-all duration-200 shadow-md"
                    disabled={isLoading || !email.trim() || !password.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Access Admin Panel
                      </>
                    )}
                  </Button>
                </form>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Lock className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-yellow-800 text-sm">
                      <p className="font-medium mb-1">Security Notice</p>
                      <p className="text-xs opacity-90">
                        This is a restricted area. All access attempts are logged and monitored.
                        Only authorized super administrators should proceed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Links */}
                <div className="text-center space-y-2 pt-4 border-t border-gray-200">
                  <Link
                    to="/login"
                    className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    ← Regular User Login
                  </Link>
                  <br />
                  <Link
                    to="/"
                    className="text-xs text-purple-500 hover:text-purple-700 transition-colors"
                  >
                    Back to Homepage
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Access - Only show if DEV_ENV is not false */}
          {import.meta.env.VITE_DEV_ENV !== 'false' && (
          <div className="w-full max-w-md mx-auto">
            <Card className="backdrop-blur-sm bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Crown className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-xl font-bold text-blue-900">
                    Quick Access
                  </CardTitle>
                </div>
                <CardDescription className="text-blue-700">
                  Development credentials for testing
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-100/50 border border-blue-200 rounded-lg">
                  <div className="text-center mb-3">
                    <h3 className="text-blue-800 font-semibold text-sm mb-2">
                      🚀 Default Credentials
                    </h3>
                    <p className="text-blue-600 text-xs mb-3">
                      Use these credentials for quick access during development
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="p-3 bg-white border border-blue-200 rounded-lg">
                      <div className="text-left">
                        <p className="text-blue-700 text-xs font-medium mb-1">Email Address:</p>
                        <p className="text-gray-900 text-sm font-mono bg-gray-50 p-2 rounded border">
                          superadmin@clinicpro.com
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-white border border-blue-200 rounded-lg">
                      <div className="text-left">
                        <p className="text-blue-700 text-xs font-medium mb-1">Password:</p>
                        <p className="text-gray-900 text-sm font-mono bg-gray-50 p-2 rounded border">
                          SuperAdmin123!
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleQuickLogin}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-md"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4 mr-2" />
                        Try Quick Login
                      </>
                    )}
                  </Button>
                  
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-center">
                    <p className="text-yellow-700 text-xs">
                      ⚠️ Change password after first login
                    </p>
                  </div>
                </div>

                {/* Development Note */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Shield className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="text-gray-700 text-sm">
                      <p className="font-medium mb-1">Development Mode</p>
                      <p className="text-xs">
                        These credentials are for development and testing purposes only. 
                        In production, use your assigned super admin credentials.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          )}
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 lg:col-span-2">
          <p className="text-xs text-gray-500">
            © 2024 ClinicPro. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SuperAdminLogin;
