import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  User, 
  Building2,
  Key,
  Shield
} from 'lucide-react';
import { apiService } from '@/services/api';
import { clinicCookies } from '@/utils/cookies';

interface DiagnosticInfo {
  hasClinicId: boolean;
  clinicId: string | null;
  hasToken: boolean;
  currentUser: any;
  clinicAccess: any;
  invoicePermissions: {
    read_invoices: boolean;
    write_invoices: boolean;
    delete_invoices: boolean;
  };
  testResults: {
    getCurrentUser: boolean;
    getCurrentClinic: boolean;
    getInvoices: boolean;
    getInvoiceStats: boolean;
  };
}

const ClinicPermissionDebug = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    
    const results: DiagnosticInfo = {
      hasClinicId: false,
      clinicId: null,
      hasToken: false,
      currentUser: null,
      clinicAccess: null,
      invoicePermissions: {
        read_invoices: false,
        write_invoices: false,
        delete_invoices: false
      },
      testResults: {
        getCurrentUser: false,
        getCurrentClinic: false,
        getInvoices: false,
        getInvoiceStats: false
      }
    };

    try {
      // Check clinic cookies
      results.hasClinicId = !!clinicCookies.getClinicId();
      results.clinicId = clinicCookies.getClinicId();
      results.hasToken = !!clinicCookies.getClinicToken();

      // Test getting current user
      try {
        results.currentUser = await apiService.getCurrentUser();
        results.testResults.getCurrentUser = true;
      } catch (err) {
        console.error('getCurrentUser error:', err);
      }

      // Test getting current clinic
      try {
        results.clinicAccess = await apiService.getCurrentClinic();
        results.testResults.getCurrentClinic = true;
        
        // Extract permissions if available
        if (results.clinicAccess?.data?.permissions) {
          const permissions = results.clinicAccess.data.permissions;
          results.invoicePermissions.read_invoices = permissions.includes('read_invoices');
          results.invoicePermissions.write_invoices = permissions.includes('write_invoices');
          results.invoicePermissions.delete_invoices = permissions.includes('delete_invoices');
        }
      } catch (err) {
        console.error('getCurrentClinic error:', err);
      }

      // Test invoice endpoints
      try {
        await apiService.getInvoices({ page: 1, limit: 1 });
        results.testResults.getInvoices = true;
      } catch (err) {
        console.error('getInvoices error:', err);
      }

      try {
        await apiService.getInvoiceStats();
        results.testResults.getInvoiceStats = true;
      } catch (err) {
        console.error('getInvoiceStats error:', err);
      }

      setDiagnostics(results);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? "default" : "destructive"} className="text-xs">
        {status ? "✓" : "✗"} {label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Running diagnostics...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Diagnostic error: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!diagnostics) {
    return null;
  }

  const hasIssues = !diagnostics.hasClinicId || 
                   !diagnostics.hasToken || 
                   !diagnostics.testResults.getCurrentUser ||
                   !diagnostics.testResults.getCurrentClinic ||
                   !diagnostics.testResults.getInvoices ||
                   !diagnostics.testResults.getInvoiceStats;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Clinic Permission Diagnostics
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runDiagnostics}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Status */}
          <Alert variant={hasIssues ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {hasIssues 
                ? "Issues detected with clinic access or permissions" 
                : "All clinic permissions and access checks passed"
              }
            </AlertDescription>
          </Alert>

          {/* Clinic Context */}
          <div>
            <h3 className="font-medium flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4" />
              Clinic Context
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Clinic ID in cookies:</span>
                {getStatusIcon(diagnostics.hasClinicId)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Auth token in cookies:</span>
                {getStatusIcon(diagnostics.hasToken)}
              </div>
              {diagnostics.clinicId && (
                <div className="col-span-2 text-xs text-gray-600">
                  Clinic ID: {diagnostics.clinicId}
                </div>
              )}
            </div>
          </div>

          {/* User Information */}
          <div>
            <h3 className="font-medium flex items-center gap-2 mb-3">
              <User className="h-4 w-4" />
              User Information
            </h3>
            <div className="space-y-2">
              {diagnostics.currentUser ? (
                <div className="text-sm space-y-1">
                  <div>Name: {diagnostics.currentUser.first_name} {diagnostics.currentUser.last_name}</div>
                  <div>Email: {diagnostics.currentUser.email}</div>
                  <div>Global Role: <Badge variant="outline">{diagnostics.currentUser.role}</Badge></div>
                </div>
              ) : (
                <div className="text-sm text-red-600">Unable to load user information</div>
              )}
            </div>
          </div>

          {/* Clinic Access */}
          <div>
            <h3 className="font-medium flex items-center gap-2 mb-3">
              <Key className="h-4 w-4" />
              Clinic Access & Permissions
            </h3>
            <div className="space-y-2">
              {diagnostics.clinicAccess?.data ? (
                <div className="space-y-2">
                  <div className="text-sm">
                    Clinic Role: <Badge variant="outline">{diagnostics.clinicAccess.data.role || 'Not assigned'}</Badge>
                  </div>
                  <div className="text-sm">
                    Invoice Permissions:
                    <div className="flex gap-2 mt-1">
                      {getStatusBadge(diagnostics.invoicePermissions.read_invoices, "Read")}
                      {getStatusBadge(diagnostics.invoicePermissions.write_invoices, "Write")}
                      {getStatusBadge(diagnostics.invoicePermissions.delete_invoices, "Delete")}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-red-600">Unable to access clinic data</div>
              )}
            </div>
          </div>

          {/* API Tests */}
          <div>
            <h3 className="font-medium mb-3">API Endpoint Tests</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">GET /users/profile:</span>
                {getStatusIcon(diagnostics.testResults.getCurrentUser)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">GET /clinics/current:</span>
                {getStatusIcon(diagnostics.testResults.getCurrentClinic)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">GET /invoices:</span>
                {getStatusIcon(diagnostics.testResults.getInvoices)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">GET /invoices/stats:</span>
                {getStatusIcon(diagnostics.testResults.getInvoiceStats)}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {hasIssues && (
            <div>
              <h3 className="font-medium mb-3 text-red-600">Recommended Actions</h3>
              <div className="space-y-2 text-sm">
                {!diagnostics.hasClinicId && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <strong>Missing Clinic ID:</strong> Please select a clinic from the clinic switcher or contact your administrator.
                    </AlertDescription>
                  </Alert>
                )}
                
                {!diagnostics.hasToken && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <strong>Missing Authentication:</strong> Please log out and log back in.
                    </AlertDescription>
                  </Alert>
                )}

                {diagnostics.hasClinicId && diagnostics.hasToken && !diagnostics.testResults.getCurrentClinic && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <strong>Clinic Access Denied:</strong> You don't have access to the selected clinic. Contact your administrator.
                    </AlertDescription>
                  </Alert>
                )}

                {!diagnostics.invoicePermissions.read_invoices && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <strong>Missing Invoice Permissions:</strong> Your role doesn't have invoice access. Contact your clinic administrator to grant you 'read_invoices' and 'write_invoices' permissions.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicPermissionDebug;
