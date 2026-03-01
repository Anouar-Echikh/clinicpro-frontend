import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertCircle, 
  RefreshCw, 
  LogOut, 
  User, 
  Shield,
  Settings
} from 'lucide-react';

interface ErrorHandlerProps {
  error?: Error | null;
  errorCode?: string;
  onRetry?: () => void;
  showDebug?: boolean;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({ 
  error, 
  errorCode, 
  onRetry,
  showDebug = false 
}) => {
  const handleLogout = () => {
    localStorage.clear();
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    window.location.href = '/login';
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Permission-specific error handling
  if (error?.message?.includes('403') || errorCode === '403') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Shield className="h-5 w-5" />
            Access Permission Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Insufficient Permissions</AlertTitle>
            <AlertDescription>
              You don't have the necessary permissions to access this feature. This could be due to:
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm">
            <div className="bg-white p-3 rounded border">
              <h4 className="font-medium mb-2">Possible Issues:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Your user role doesn't have invoice/billing permissions</li>
                <li>You're not assigned to the selected clinic</li>
                <li>Your clinic access has been deactivated</li>
                <li>The clinic you're trying to access is inactive</li>
              </ul>
            </div>

            <div className="bg-white p-3 rounded border">
              <h4 className="font-medium mb-2">Required Permissions for Billing:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li><code className="bg-gray-100 px-1 rounded">read_invoices</code> - View invoices</li>
                <li><code className="bg-gray-100 px-1 rounded">write_invoices</code> - Create/edit invoices</li>
                <li><code className="bg-gray-100 px-1 rounded">read_payments</code> - View payments</li>
                <li><code className="bg-gray-100 px-1 rounded">write_payments</code> - Process payments</li>
              </ul>
            </div>

            <div className="bg-white p-3 rounded border">
              <h4 className="font-medium mb-2">Roles with Billing Access:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li><strong>Admin</strong> - Full access to all billing features</li>
                <li><strong>Accountant</strong> - Full access to invoices and payments</li>
                <li><strong>Receptionist</strong> - Can view and create invoices/payments</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </Button>

            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Re-login
            </Button>
          </div>

          <Alert>
            <User className="h-4 w-4" />
            <AlertTitle>Need Help?</AlertTitle>
            <AlertDescription>
              Contact your clinic administrator to:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Grant you the necessary billing permissions</li>
                <li>Verify your clinic access is active</li>
                <li>Update your role if needed (e.g., to Receptionist or Accountant)</li>
              </ul>
            </AlertDescription>
          </Alert>

          {showDebug && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium">Debug Information</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify({
                  error: error?.message,
                  errorCode,
                  timestamp: new Date().toISOString(),
                  userAgent: navigator.userAgent,
                  url: window.location.href
                }, null, 2)}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    );
  }

  // Clinic context missing error
  if (error?.message?.includes('Clinic context') || errorCode === 'CLINIC_CONTEXT_MISSING') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Clinic Not Selected</AlertTitle>
        <AlertDescription>
          Please select a clinic from the clinic switcher in the top navigation.
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Refresh Page
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Generic error fallback
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          {error.message || 'An unexpected error occurred'}
          <div className="mt-3 space-x-2">
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Try Again
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default ErrorHandler;
