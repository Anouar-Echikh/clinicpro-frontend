import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertCircle, ArrowLeft } from "lucide-react";

interface RequireRoleProps {
  children: React.ReactNode;
  roles?: UserRole | UserRole[];
  permission?: string;
  fallback?: React.ReactNode;
}

const RequireRole: React.FC<RequireRoleProps> = ({
  children,
  roles,
  permission,
  fallback,
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const { hasRole, hasPermission, getClinicRole } = useClinic();
  const location = useLocation();

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Super Admin has unrestricted access - bypass all role and permission checks
  if (user?.role === 'super_admin') {
    return <>{children}</>;
  }

  // Check role-based access (clinic-scoped)
  if (roles && !hasRole(roles)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="w-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center text-sm text-gray-600 mb-2">
                <AlertCircle className="h-4 w-4 mr-2" />
                Current Role
              </div>
              <div className="font-semibold text-gray-900 capitalize">
                {getClinicRole() || user?.role}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Required Role(s):{" "}
              <span className="font-medium">
                {Array.isArray(roles) ? roles.join(", ") : roles}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check permission-based access (clinic-scoped)
  if (permission && !hasPermission(permission)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="w-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-orange-600">
              Permission Required
            </CardTitle>
            <CardDescription>
              You need additional permissions to access this feature
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">
                Required Permission:
              </div>
              <div className="font-semibold text-gray-900">{permission}</div>
            </div>
            <div className="text-xs text-gray-500">
              If you believe this is an error, contact your clinic administrator.
            </div>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireRole;
