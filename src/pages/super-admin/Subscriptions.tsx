import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Users,
  Plus,
  MoreVertical,
  Eye,
  XCircle,
  Building2,
  CreditCard,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Crown,
  Clock,
  Trash2
} from 'lucide-react';
import { stripeApiService, TenantSubscription, SubscriptionPlan } from '@/services/api/stripeApi';
import { tenantApiService, Tenant } from '@/services/api/tenantApi';
import { toast } from '@/hooks/use-toast';
import CreateSubscriptionDialog from './components/CreateSubscriptionDialog';
import CancelSubscriptionDialog from './components/CancelSubscriptionDialog';

const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<TenantSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [adminPaymentMethods, setAdminPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  
  // Dialogs
  const [selectedSubscription, setSelectedSubscription] = useState<TenantSubscription | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isForceDeleteDialogOpen, setIsForceDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [forceDeleteLoading, setForceDeleteLoading] = useState(false);

  // Fetch data
  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const filters = {
        page: pagination.page,
        limit: pagination.limit,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(planFilter !== 'all' && { plan_id: planFilter }),
      };
      
      const response = await stripeApiService.getSubscriptions(filters);
      setSubscriptions(response.data.data.subscriptions);
      setPagination(response.data.data.pagination);
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load subscriptions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin payment methods
  const fetchAdminPaymentMethods = async () => {
    try {
      const response = await stripeApiService.getAdminPaymentMethodsForSubscription();
      setAdminPaymentMethods(response.data.data.payment_methods);
    } catch (error: any) {
      console.error('Error fetching admin payment methods:', error);
      // Don't show error toast here as payment methods are optional
    }
  };

  // Handle view subscription - also refresh payment methods
  const handleViewSubscription = (subscription: TenantSubscription) => {
    setSelectedSubscription(subscription);
    setIsViewDialogOpen(true);
    // Refresh payment methods when opening dialog in case new ones were added
    fetchAdminPaymentMethods();
  };

  const fetchPlansAndTenants = async () => {
    try {
      const [plansResponse, tenantsResponse] = await Promise.all([
        stripeApiService.getPlans(true),
        tenantApiService.getAllTenants(1, 100) // Get up to 100 tenants for dropdown
      ]);
      
      setPlans(plansResponse.data.data);
      setTenants(tenantsResponse.tenants || []);
    } catch (error: any) {
      console.error('Error fetching plans and tenants:', error);
      toast({
        title: 'Error',
        description: 'Failed to load plans and tenants',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [pagination.page, statusFilter, planFilter]);

  useEffect(() => {
    fetchPlansAndTenants();
    fetchAdminPaymentMethods(); // Load admin payment methods
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination(prev => ({ ...prev, page: 1 }));
      } else {
        fetchSubscriptions();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleCreateSubscription = async (subscriptionData: any) => {
    try {
      const response = await stripeApiService.createSubscription(subscriptionData);
      
      toast({
        title: 'Success',
        description: 'Subscription created successfully',
      });
      
      // Refresh subscriptions
      fetchSubscriptions();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create subscription',
        variant: 'destructive',
      });
    }
  };

  const handleForceDeleteSubscription = async () => {
    try {
      if (!selectedSubscription) return;
      setForceDeleteLoading(true);
      await stripeApiService.forceDeleteSubscription(selectedSubscription._id);
      toast({
        title: 'Success',
        description: 'Subscription force deleted successfully',
      });
      fetchSubscriptions();
      setIsForceDeleteDialogOpen(false);
      setSelectedSubscription(null);
    } catch (error: any) {
      console.error('Error force deleting subscription:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to force delete subscription',
        variant: 'destructive',
      });
    } finally {
      setForceDeleteLoading(false);
    }
  };

  const handleCancelSubscription = async (immediately: boolean = false) => {
    try {
      if (!selectedSubscription) return;
      
      const response = await stripeApiService.cancelSubscription(selectedSubscription._id, { immediately });
      
      toast({
        title: 'Success',
        description: immediately ? 'Subscription canceled immediately' : 'Subscription will cancel at period end',
      });
      
      // Refresh subscriptions
      fetchSubscriptions();
      setIsCancelDialogOpen(false);
      setSelectedSubscription(null);
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel subscription',
        variant: 'destructive',
      });
    }
  };

  // Handle payment on behalf
  const handlePayOnBehalf = async (paymentMethodId: string) => {
    try {
      if (!selectedSubscription) return;
      
      setPaymentLoading(true);
      const response = await stripeApiService.paySubscriptionOnBehalf(selectedSubscription._id, paymentMethodId);
      
      toast({
        title: 'Success',
        description: `Payment successful! Subscription is now active.`,
      });
      
      // Refresh subscriptions to show updated status
      fetchSubscriptions();
      setIsViewDialogOpen(false);
      setSelectedSubscription(null);
    } catch (error: any) {
      console.error('Error paying on behalf:', error);
      toast({
        title: 'Payment Failed',
        description: error.response?.data?.message || error.message || 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return stripeApiService.getSubscriptionStatusColor(status);
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      active: CheckCircle,
      trialing: Clock,
      past_due: AlertTriangle,
      canceled: XCircle,
      unpaid: XCircle,
      incomplete: Clock,
      incomplete_expired: XCircle,
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon className="h-3 w-3" />;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilRenewal = (endDate: string) => {
    const diffTime = new Date(endDate).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filter subscriptions by search query
  const filteredSubscriptions = subscriptions.filter(subscription => {
    // Check if required objects exist before accessing their properties
    if (!subscription.tenant_id || !subscription.plan_id) {
      return false;
    }
    
    const tenantName = subscription.tenant_id.name?.toLowerCase() || '';
    const tenantEmail = subscription.tenant_id.email?.toLowerCase() || '';
    const planName = subscription.plan_id.name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return tenantName.includes(query) || 
           tenantEmail.includes(query) || 
           planName.includes(query);
  });

  // Stats
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    trialing: subscriptions.filter(s => s.status === 'trialing').length,
    past_due: subscriptions.filter(s => s.status === 'past_due').length,
    canceled: subscriptions.filter(s => s.status === 'canceled').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          </div>
          <p className="text-slate-600 mt-1">
            Manage tenant subscriptions and billing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSubscriptions}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Subscription
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All subscriptions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trialing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.trialing}</div>
            <p className="text-xs text-muted-foreground">In trial period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past Due</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.past_due}</div>
            <p className="text-xs text-muted-foreground">Payment overdue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canceled</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.canceled}</div>
            <p className="text-xs text-muted-foreground">Canceled subs</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>
                View and manage all tenant subscriptions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by tenant or plan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trialing">Trialing</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan._id} value={plan._id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">Loading subscriptions...</span>
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">
                {searchQuery || statusFilter !== 'all' || planFilter !== 'all' 
                  ? 'No subscriptions found matching your filters'
                  : 'No subscriptions found'
                }
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery || statusFilter !== 'all' || planFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first subscription to get started'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && planFilter === 'all' && (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Subscription
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Next Renewal</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{subscription.tenant_id?.name || 'Unknown Tenant'}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {subscription.tenant_id?.subdomain || subscription.tenant_id?.slug || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{subscription.plan_id?.name || 'Unknown Plan'}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(subscription.price_amount, subscription.currency)}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getStatusColor(subscription.status)}>
                          {getStatusIcon(subscription.status)}
                          <span className="ml-1">{stripeApiService.getReadableStatus(subscription.status)}</span>
                        </Badge>
                        {subscription.cancel_at_period_end && (
                          <div className="text-xs text-orange-600 mt-1">
                            Cancels at period end
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {subscription.plan_id?.interval === 'month' ? 'Monthly' : 'Yearly'}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                          </div>
                          {subscription.trial_end && new Date(subscription.trial_end) > new Date() && (
                            <div className="text-xs text-blue-600">
                              Trial ends {formatDate(subscription.trial_end)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {subscription.status === 'active' && !subscription.cancel_at_period_end ? (
                          <div className="space-y-1">
                            <div className="text-sm">
                              {formatDate(subscription.current_period_end)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {getDaysUntilRenewal(subscription.current_period_end)} days
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
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
                            <DropdownMenuItem
                              onClick={() => handleViewSubscription(subscription)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {(subscription.status === 'active' || subscription.status === 'trialing') && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedSubscription(subscription);
                                    setIsCancelDialogOpen(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancel Subscription
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSubscription(subscription);
                                setIsForceDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Force Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} subscriptions
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateSubscriptionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSubscription}
        plans={plans}
        tenants={tenants}
      />
      
      {selectedSubscription && (
        <>
          <CancelSubscriptionDialog
            open={isCancelDialogOpen}
            onOpenChange={setIsCancelDialogOpen}
            onConfirm={handleCancelSubscription}
            subscription={selectedSubscription}
          />

          {/* Force Delete Subscription Alert */}
          <AlertDialog open={isForceDeleteDialogOpen} onOpenChange={setIsForceDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-600">Force Delete Subscription</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove the subscription record from the database without syncing with Stripe.
                  Use this for orphaned records where the Stripe subscription no longer exists. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={forceDeleteLoading}>Cancel</AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={handleForceDeleteSubscription}
                  disabled={forceDeleteLoading}
                >
                  {forceDeleteLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Force Delete'
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* View Subscription Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription Details
                </DialogTitle>
                <DialogDescription>
                  Complete information about this subscription
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6 py-4">
                {/* Tenant and Plan Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Tenant Information</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Organization</label>
                        <p className="text-sm text-slate-900 mt-1">{selectedSubscription.tenant_id?.name || 'Unknown Tenant'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Email</label>
                        <p className="text-sm text-slate-900 mt-1">{selectedSubscription.tenant_id?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Subdomain</label>
                        <p className="text-sm text-slate-900 mt-1">
                          {selectedSubscription.tenant_id?.subdomain || selectedSubscription.tenant_id?.slug || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Plan Information</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Plan Name</label>
                        <p className="text-sm text-slate-900 mt-1">{selectedSubscription.plan_id?.name || 'Unknown Plan'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Price</label>
                        <p className="text-sm text-slate-900 mt-1">
                          {formatCurrency(selectedSubscription.price_amount, selectedSubscription.currency)} / {selectedSubscription.plan_id?.interval || 'month'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Features</label>
                        <div className="mt-1">
                          {selectedSubscription.plan_id?.features?.map((feature, index) => (
                            <div key={index} className="text-sm text-slate-900 flex items-center">
                              <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscription Status */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm font-medium text-slate-700 mb-1">Status</div>
                    <Badge className={getStatusColor(selectedSubscription.status)}>
                      {getStatusIcon(selectedSubscription.status)}
                      <span className="ml-1">{stripeApiService.getReadableStatus(selectedSubscription.status)}</span>
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-slate-700 mb-1">Current Period</div>
                    <div className="text-sm text-slate-900">
                      {formatDate(selectedSubscription.current_period_start)} - {formatDate(selectedSubscription.current_period_end)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-slate-700 mb-1">Next Renewal</div>
                    <div className="text-sm text-slate-900">
                      {selectedSubscription.status === 'active' && !selectedSubscription.cancel_at_period_end
                        ? formatDate(selectedSubscription.current_period_end)
                        : 'N/A'
                      }
                    </div>
                  </div>
                </div>

                {/* Stripe Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Stripe Subscription ID</label>
                    <p className="text-sm text-slate-900 mt-1 font-mono text-xs break-all">
                      {selectedSubscription.stripe_subscription_id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Stripe Customer ID</label>
                    <p className="text-sm text-slate-900 mt-1 font-mono text-xs break-all">
                      {selectedSubscription.stripe_customer_id}
                    </p>
                  </div>
                </div>

                {/* Trial Information */}
                {selectedSubscription.trial_start && selectedSubscription.trial_end && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Trial Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Trial Start:</span>
                        <span className="ml-2 text-blue-900">{formatDate(selectedSubscription.trial_start)}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Trial End:</span>
                        <span className="ml-2 text-blue-900">{formatDate(selectedSubscription.trial_end)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancellation Info */}
                {selectedSubscription.cancel_at_period_end && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="text-sm font-medium text-orange-900 mb-2">Cancellation Scheduled</h4>
                    <p className="text-sm text-orange-800">
                      This subscription will be canceled at the end of the current billing period ({formatDate(selectedSubscription.current_period_end)}).
                    </p>
                  </div>
                )}

                {/* Payment on Behalf Section */}
                {(selectedSubscription.status === 'incomplete' || selectedSubscription.status === 'past_due') && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-medium text-red-900 mb-1">Payment Required</h4>
                        <p className="text-sm text-red-800">
                          This subscription requires payment to become active.
                        </p>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    
                    {adminPaymentMethods.length > 0 ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-red-900 mb-2 block">
                            Pay on behalf using admin payment method:
                          </label>
                          <div className="space-y-2">
                            {adminPaymentMethods.map((pm) => (
                              <div
                                key={pm.id}
                                className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-md"
                              >
                                <div className="flex items-center space-x-3">
                                  <CreditCard className="h-4 w-4 text-slate-600" />
                                  <div>
                                    <div className="text-sm font-medium text-slate-900">
                                      {pm.card?.brand?.toUpperCase()} •••• {pm.card?.last4}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      Expires {pm.card?.exp_month}/{pm.card?.exp_year}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handlePayOnBehalf(pm.id)}
                                  disabled={paymentLoading}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {paymentLoading ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <DollarSign className="h-4 w-4 mr-2" />
                                      Pay {formatCurrency(selectedSubscription.price_amount, selectedSubscription.currency)}
                                    </>
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 p-3 bg-white border border-red-200 rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-slate-900">No Payment Methods Available</div>
                            <div className="text-xs text-slate-500">
                              Add a payment method to pay on behalf of customers
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              window.open('/admin/payment-methods', '_blank');
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Payment Method
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Created</label>
                    <p className="text-sm text-slate-900 mt-1">
                      {new Date(selectedSubscription.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Last Updated</label>
                    <p className="text-sm text-slate-900 mt-1">
                      {new Date(selectedSubscription.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default Subscriptions;
