import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Globe,
  Mail,
  Phone,
  Calendar,
  Filter,
  Download,
  Loader2,
  CreditCard,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import TenantForm from "@/components/super-admin/TenantForm";
import { tenantApiService, Tenant } from "@/services/api/tenantApi";
import { stripeApiService, TenantSubscription } from "@/services/api/stripeApi";
import { toast } from "@/hooks/use-toast";

const Tenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [subscriptions, setSubscriptions] = useState<Record<string, TenantSubscription>>({});
  const [loading, setLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    inactive: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Load tenants data
  const loadTenants = async () => {
    try {
      setLoading(true);
      const response = await tenantApiService.getAllTenants(
        pagination.page,
        pagination.limit,
        searchQuery,
        statusFilter
      );
      
      const tenantsData = response.tenants.map(tenant => ({
        ...tenant,
        id: tenant._id || tenant.id,
        _id: tenant._id
      }));
      
      setTenants(tenantsData);
      setPagination(response.pagination);
      setStats(response.stats);
      
      // Load subscription data for active tenants
      if (tenantsData.length > 0) {
        loadSubscriptions(tenantsData);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
      toast({
        title: "Error",
        description: "Failed to load tenants. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load subscription data for tenants
  const loadSubscriptions = async (tenantsData: Tenant[]) => {
    try {
      setSubscriptionLoading(true);
      const subscriptionData: Record<string, TenantSubscription> = {};
      
      // Get all subscriptions (we'll filter by tenant on the backend)
      const response = await stripeApiService.getSubscriptions({ limit: 100 });
      
      // Map subscriptions by tenant ID
      response.data.data.subscriptions.forEach(subscription => {
        const tenantId = typeof subscription.tenant_id === 'object' 
          ? subscription.tenant_id._id 
          : subscription.tenant_id;
        subscriptionData[tenantId] = subscription;
      });
      
      setSubscriptions(subscriptionData);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      // Don't show error toast for subscriptions as it's not critical
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // Load tenants on component mount and when filters change
  useEffect(() => {
    loadTenants();
  }, [pagination.page, searchQuery, statusFilter]);

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Handle status filter change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [statusFilter]);

  const handleCreateTenant = () => {
    setSelectedTenant(null);
    setIsFormOpen(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsFormOpen(true);
  };

  const handleViewTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsViewDialogOpen(true);
  };

  const handleDeleteTenant = async (tenant: Tenant) => {
    try {
      await tenantApiService.deleteTenant(tenant.id);
      toast({
        title: "Success",
        description: `Tenant "${tenant.name}" has been deleted.`,
      });
      loadTenants(); // Reload the list
    } catch (error: any) {
      console.error('Error deleting tenant:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete tenant. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveTenant = async (tenantData: any) => {
    try {
      if (selectedTenant) {
        // Update existing tenant
        await tenantApiService.updateTenant(selectedTenant.id, tenantData);
        toast({
          title: "Success",
          description: `Tenant "${tenantData.name}" has been updated.`,
        });
      } else {
        // Create new tenant
        await tenantApiService.createTenant(tenantData);
        toast({
          title: "Success",
          description: `Tenant "${tenantData.name}" has been created.`,
        });
      }
      
      setIsFormOpen(false);
      setSelectedTenant(null);
      loadTenants(); // Reload the list
    } catch (error: any) {
      console.error('Error saving tenant:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save tenant. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to handle in form
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper functions for subscription display
  const getSubscriptionStatus = (tenantId: string) => {
    const subscription = subscriptions[tenantId];
    return subscription?.status || null;
  };

  const getSubscriptionStatusBadge = (tenantId: string) => {
    const status = getSubscriptionStatus(tenantId);
    
    if (!status) {
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">
          <XCircle className="h-3 w-3 mr-1" />
          No Subscription
        </Badge>
      );
    }

    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      trialing: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
      past_due: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle },
      canceled: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
      unpaid: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
      incomplete: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock },
      incomplete_expired: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.incomplete;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-xs`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getSubscriptionPlan = (tenantId: string) => {
    const subscription = subscriptions[tenantId];
    return subscription ? 
      typeof subscription.plan_id === 'object' ? subscription.plan_id.name : 'Unknown Plan'
      : null;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold tracking-tight">Tenant Management</h1>
          </div>
          <p className="text-slate-600 mt-1">
            Create, manage, and monitor all tenant organizations
          </p>
        </div>
        <Button onClick={handleCreateTenant} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Tenant
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tenants Overview</CardTitle>
          <CardDescription>
            Manage all tenant organizations and their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by name, email, or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Status: {statusFilter === 'all' ? 'All' : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('suspended')}>
                  Suspended
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                  Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
              <div className="text-sm text-blue-600">Total Tenants</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{stats.active}</div>
              <div className="text-sm text-green-600">Active</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
              <div className="text-sm text-yellow-600">Pending</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{stats.suspended}</div>
              <div className="text-sm text-red-600">Suspended</div>
            </div>
          </div>

          {/* Tenants Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Sub Domain</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
                        <p className="text-slate-600">Loading tenants...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : tenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Building2 className="h-8 w-8 text-slate-400" />
                        <p className="text-slate-600">No tenants found</p>
                        <p className="text-sm text-slate-400">
                          {searchQuery || statusFilter !== 'all' 
                            ? 'Try adjusting your search or filters'
                            : 'Create your first tenant to get started'
                          }
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                            {tenant.logo_url ? (
                              <img
                                src={tenant.logo_url}
                                alt={tenant.name}
                                className="h-8 w-8 rounded object-cover"
                              />
                            ) : (
                              <Building2 className="h-5 w-5 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{tenant.name}</div>
                            <div className="text-sm text-slate-500">/{tenant.slug}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1 text-slate-400" />
                            {tenant.email}
                          </div>
                          {tenant.phone && (
                            <div className="flex items-center text-sm text-slate-500">
                              <Phone className="h-3 w-3 mr-1" />
                              {tenant.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {tenant.subdomain ? (
                          <div className="flex items-center text-sm">
                            <Globe className="h-3 w-3 mr-1 text-slate-400" />
                            {tenant.subdomain}.clinicpro.com
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">No subdomain</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          {getSubscriptionStatusBadge(tenant.id)}
                          {subscriptionLoading ? (
                            <div className="flex items-center text-xs text-slate-400">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Loading...
                            </div>
                          ) : getSubscriptionPlan(tenant.id) ? (
                            <div className="text-xs text-slate-600">
                              {getSubscriptionPlan(tenant.id)}
                            </div>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(tenant.status)}>
                          {tenant.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-slate-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(tenant.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 px-3 text-xs">
                              <MoreVertical className="h-4 w-4 mr-1" />
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewTenant(tenant)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditTenant(tenant)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!getSubscriptionStatus(tenant.id) ? (
                              <DropdownMenuItem 
                                onClick={() => window.open(`/admin/subscriptions?create=true&tenant_id=${tenant.id}`, '_blank')}
                                className="text-blue-600"
                              >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Create Subscription
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => window.open(`/admin/subscriptions?tenant_id=${tenant.id}`, '_blank')}
                                className="text-blue-600"
                              >
                                <Receipt className="h-4 w-4 mr-2" />
                                View Subscription
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteTenant(tenant)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Tenant Form Dialog */}
      <TenantForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedTenant(null);
        }}
        onSave={handleSaveTenant}
        tenant={selectedTenant}
      />

      {/* View Tenant Dialog */}
      {selectedTenant && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tenant Details</DialogTitle>
              <DialogDescription>
                Complete information about {selectedTenant.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Organization Name</label>
                  <p className="text-sm text-slate-900 mt-1">{selectedTenant.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Slug</label>
                  <p className="text-sm text-slate-900 mt-1">/{selectedTenant.slug}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <p className="text-sm text-slate-900 mt-1">{selectedTenant.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Phone</label>
                  <p className="text-sm text-slate-900 mt-1">{selectedTenant.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Sub Domain</label>
                  <p className="text-sm text-slate-900 mt-1">
                    {selectedTenant.subdomain ? `${selectedTenant.subdomain}.clinicpro.com` : 'No subdomain'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedTenant.status)}>
                      {selectedTenant.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Created</label>
                  <p className="text-sm text-slate-900 mt-1">{formatDate(selectedTenant.created_at)}</p>
                </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Last Updated</label>
                    <p className="text-sm text-slate-900 mt-1">{formatDate(selectedTenant.updated_at)}</p>
                  </div>
                </div>

                {/* Subscription Information */}
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Subscription Information</h4>
                  {getSubscriptionStatus(selectedTenant.id) ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700">Status</label>
                          <div className="mt-1">
                            {getSubscriptionStatusBadge(selectedTenant.id)}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700">Plan</label>
                          <p className="text-sm text-slate-900 mt-1">{getSubscriptionPlan(selectedTenant.id)}</p>
                        </div>
                      </div>
                      
                      {subscriptions[selectedTenant.id] && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Current Period</label>
                            <p className="text-sm text-slate-900 mt-1">
                              {formatDate(subscriptions[selectedTenant.id].current_period_start)} - {formatDate(subscriptions[selectedTenant.id].current_period_end)}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-700">Amount</label>
                            <p className="text-sm text-slate-900 mt-1">
                              {formatCurrency(subscriptions[selectedTenant.id].price_amount, subscriptions[selectedTenant.id].currency)}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Receipt className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Subscription Active</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/admin/subscriptions?tenant_id=${selectedTenant.id}`, '_blank')}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-900">No Active Subscription</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/admin/subscriptions?create=true&tenant_id=${selectedTenant.id}`, '_blank')}
                      >
                        Create Subscription
                      </Button>
                    </div>
                  )}
                </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Tenants;
