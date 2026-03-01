import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  ExternalLink, 
  Loader2, 
  RefreshCw,
  Crown,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Shield,
  ArrowRight
} from 'lucide-react';
import { TenantInfo, formatTenantName, getTenantDisplayUrl, redirectToTenant } from '@/utils/tenantUtils';

interface TenantSelectorProps {
  tenants: TenantInfo[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const TenantSelector: React.FC<TenantSelectorProps> = ({
  tenants,
  loading,
  error,
  onRefresh
}) => {
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'suspended':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      suspended: 'bg-orange-100 text-orange-800 border-orange-200',
      inactive: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants]} text-xs`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleTenantSelect = (tenant: TenantInfo) => {
    if (tenant.status !== 'active') {
      return;
    }

    if (!tenant.subdomain) {
      console.error('Tenant missing subdomain:', tenant);
      return;
    }

    setSelectedTenant(tenant.id);
    
    // Small delay for visual feedback
    setTimeout(() => {
      redirectToTenant(tenant.subdomain!, '/login');
    }, 300);
  };

  const activeTenants = (tenants || []).filter(tenant => tenant.status === 'active');
  const inactiveTenants = (tenants || []).filter(tenant => tenant.status !== 'active');

  return (
    <Card className="shadow-xl border-0 h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <CardTitle className="text-xl lg:text-2xl flex items-center justify-center gap-2">
              <Crown className="h-6 w-6 text-purple-600" />
              Select Your Organization
            </CardTitle>
            <CardDescription className="text-sm mt-2">
              Choose your organization to access your ClinicPro workspace
            </CardDescription>
          </div>
          {!loading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="ml-2 h-8 w-8 p-0"
              title="Refresh organizations"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading organizations...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        ) : (tenants || []).length === 0 ? (
          <>
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No organizations found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please contact your administrator to set up your organization.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>

            {/* Super Admin Access - Show even when no tenants */}
            <div className="pt-4 border-t">
              <div className="text-center">
                <h3 className="font-medium text-muted-foreground text-sm mb-3">
                  System Administration
                </h3>
                <Link to="/admin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-colors"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Access Super Admin Panel
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-2">
                  For administrators to manage all organizations and system settings
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Active Tenants */}
            {activeTenants.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-foreground text-sm">
                  Available Organizations ({activeTenants.length})
                </h3>
                <div className="space-y-2">
                  {activeTenants.map((tenant) => (
                    <motion.div
                      key={tenant.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        p-4 border rounded-lg cursor-pointer transition-all
                        hover:border-primary hover:bg-muted/50
                        ${selectedTenant === tenant.id ? 'border-primary bg-primary/5' : 'border-border'}
                      `}
                      onClick={() => handleTenantSelect(tenant)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {tenant.logo_url ? (
                              <img
                                src={tenant.logo_url}
                                alt={`${tenant.name} logo`}
                                className="h-10 w-10 rounded object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-foreground text-base truncate">
                                {formatTenantName(tenant)}
                              </h4>
                              {getStatusBadge(tenant.status)}
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              {getStatusIcon(tenant.status)}
                              <span>{getTenantDisplayUrl(tenant)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedTenant === tenant.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Tenants (if any) */}
            {inactiveTenants.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-medium text-muted-foreground text-sm">
                  Unavailable Organizations ({inactiveTenants.length})
                </h3>
                <div className="space-y-2">
                  {inactiveTenants.map((tenant) => (
                    <div
                      key={tenant.id}
                      className="p-3 border border-dashed rounded-lg opacity-60"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {tenant.logo_url ? (
                            <img
                              src={tenant.logo_url}
                              alt={`${tenant.name} logo`}
                              className="h-8 w-8 rounded object-cover grayscale"
                            />
                          ) : (
                            <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-muted-foreground text-sm truncate">
                              {formatTenantName(tenant)}
                            </h4>
                            {getStatusBadge(tenant.status)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Contact administrator for access
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Message */}
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800 text-sm">
                <strong>Note:</strong> Selecting an organization will redirect you to their dedicated workspace.
                Each organization has its own secure environment with isolated data.
              </AlertDescription>
            </Alert>

            {/* Super Admin Access */}
            <div className="pt-4 border-t">
              <div className="text-center">
                <h3 className="font-medium text-muted-foreground text-sm mb-3">
                  System Administration
                </h3>
                <Link to="/admin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-colors"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Access Super Admin Panel
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-2">
                  For administrators to manage all organizations and system settings
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TenantSelector;
