import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertCircle, ArrowLeft } from "lucide-react";

interface RequirePermissionProps {
  children: React.ReactNode;
  permissions: string | string[];
  operator?: "AND" | "OR";
  fallback?: React.ReactNode;
}

const RequirePermission: React.FC<RequirePermissionProps> = ({
  children,
  permissions,
  operator = "AND",
  fallback,
}) => {
  const { user } = useAuth();
  const { hasPermission, currentUserClinic } = useClinic();

  // Super Admin has unrestricted access - bypass all permission checks
  if (user?.role === 'super_admin') {
    return <>{children}</>;
  }

  const required = Array.isArray(permissions) ? permissions : [permissions];
  const granted = required.map((p) => hasPermission(p));
  const isAllowed = operator === "AND" ? granted.every(Boolean) : granted.some(Boolean);

  if (isAllowed) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-orange-600">Permission Required</CardTitle>
          <CardDescription>You need additional permissions to access this feature</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center text-sm text-gray-600 mb-2">
              <AlertCircle className="h-4 w-4 mr-2" />
              Required {operator === "AND" ? "Permissions" : "Permission(s)"}
            </div>
            <div className="font-semibold text-gray-900 break-words">
              {required.join(", ")}
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Current clinic role: <span className="font-medium capitalize">{currentUserClinic?.role || "unknown"}</span>
          </div>
          <Button variant="outline" onClick={() => window.history.back()} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequirePermission;


