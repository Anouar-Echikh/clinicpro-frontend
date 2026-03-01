import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CreditCard,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Star,
  Crown,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Loader2,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { stripeApiService, SubscriptionPlan } from '@/services/api/stripeApi';
import { toast } from '@/hooks/use-toast';
import CreatePlanDialog from './components/CreatePlanDialog';
import EditPlanDialog from './components/EditPlanDialog';
import DeletePlanDialog from './components/DeletePlanDialog';

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);

  // Fetch plans data
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await stripeApiService.getPlans(!showInactiveOnly);
      setPlans(response.data.data);
    } catch (error: any) {
      console.error('Error fetching plans:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load plans',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Sync plans from Stripe
  const handleSyncFromStripe = async () => {
    try {
      setSyncing(true);
      const response = await stripeApiService.syncPlansFromStripe();
      
      toast({
        title: 'Success',
        description: `Synced ${response.data.data.synced_count} plans from Stripe`,
      });
      
      // Refresh plans after sync
      fetchPlans();
    } catch (error: any) {
      console.error('Error syncing plans:', error);
      toast({
        title: 'Error', 
        description: error.message || 'Failed to sync plans from Stripe',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [showInactiveOnly]);

  const handleCreatePlan = async (planData: any) => {
    try {
      const response = await stripeApiService.createPlan(planData);
      
      toast({
        title: 'Success',
        description: 'Plan created successfully',
      });
      
      // Refresh plans
      fetchPlans();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating plan:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create plan',
        variant: 'destructive',
      });
    }
  };

  const handleEditPlan = async (planData: any) => {
    try {
      if (!selectedPlan) return;
      
      const response = await stripeApiService.updatePlan(selectedPlan._id, planData);
      
      toast({
        title: 'Success',
        description: 'Plan updated successfully',
      });
      
      // Refresh plans
      fetchPlans();
      setIsEditDialogOpen(false);
      setSelectedPlan(null);
    } catch (error: any) {
      console.error('Error updating plan:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update plan',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePlan = async () => {
    try {
      if (!selectedPlan) return;
      
      const response = await stripeApiService.deletePlan(selectedPlan._id);
      
      toast({
        title: 'Success',
        description: 'Plan archived successfully',
      });
      
      // Refresh plans
      fetchPlans();
      setIsDeleteDialogOpen(false);
      setSelectedPlan(null);
    } catch (error: any) {
      console.error('Error deleting plan:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to archive plan',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  const getIntervalText = (interval: string, count: number) => {
    const intervalMap = {
      month: count === 1 ? 'Monthly' : `Every ${count} months`,
      year: count === 1 ? 'Yearly' : `Every ${count} years`,
    };
    return intervalMap[interval as keyof typeof intervalMap] || interval;
  };

  const activePlans = plans.filter(plan => plan.is_active);
  const inactivePlans = plans.filter(plan => !plan.is_active);
  const displayPlans = showInactiveOnly ? inactivePlans : activePlans;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <CreditCard className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
          </div>
          <p className="text-slate-600 mt-1">
            Manage subscription plans and pricing for tenant organizations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPlans}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncFromStripe}
            disabled={syncing}
            className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync from Stripe'}
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
            <p className="text-xs text-muted-foreground">
              All subscription plans
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePlans.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently available
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Default Plan</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.filter(p => p.is_default).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Default selection
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Range</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.length > 0 ? 
                `${formatCurrency(Math.min(...plans.map(p => p.price)), plans[0]?.currency || 'USD')} - ${formatCurrency(Math.max(...plans.map(p => p.price)), plans[0]?.currency || 'USD')}` 
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly pricing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Plans Management</CardTitle>
              <CardDescription>
                Create and manage subscription plans for tenant organizations
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showInactiveOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowInactiveOnly(!showInactiveOnly)}
              >
                {showInactiveOnly ? 'Show Active' : 'Show Archived'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">Loading plans...</span>
            </div>
          ) : displayPlans.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">
                {showInactiveOnly ? 'No archived plans found' : 'No active plans found'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {showInactiveOnly ? 'All plans are currently active' : 'Get started by creating your first subscription plan'}
              </p>
              {!showInactiveOnly && (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Details</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>Limits</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayPlans.map((plan) => (
                    <TableRow key={plan._id}>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="font-medium">{plan.name}</div>
                            {plan.is_default && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {plan.description}
                          </div>
                          {plan.trial_period_days && plan.trial_period_days > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {plan.trial_period_days} days trial
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatCurrency(plan.price, plan.currency)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {getIntervalText(plan.interval, plan.interval_count)}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Building2 className="h-3 w-3 mr-1" />
                            {plan.max_clinics} clinics
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Users className="h-3 w-3 mr-1" />
                            {plan.max_users} users
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Crown className="h-3 w-3 mr-1" />
                            {plan.max_patients} patients
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          className={plan.is_active 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                          }
                        >
                          {plan.is_active ? 'Active' : 'Archived'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(plan.created_at).toLocaleDateString()}
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
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPlan(plan);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPlan(plan);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPlan(plan);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Archive
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
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreatePlanDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreatePlan}
      />
      
      {selectedPlan && (
        <>
          <EditPlanDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSubmit={handleEditPlan}
            plan={selectedPlan}
          />
          
          <DeletePlanDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleDeletePlan}
            plan={selectedPlan}
          />

          {/* View Plan Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Plan Details: {selectedPlan.name}
                </DialogTitle>
                <DialogDescription>
                  Complete information about this subscription plan
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6 py-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Plan Name</label>
                    <p className="text-sm text-slate-900 mt-1">{selectedPlan.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Stripe Product ID</label>
                    <p className="text-sm text-slate-900 mt-1 font-mono text-xs break-all">
                      {selectedPlan.stripe_product_id}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <p className="text-sm text-slate-900 mt-1">{selectedPlan.description}</p>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Price</label>
                    <p className="text-sm text-slate-900 mt-1 font-medium">
                      {formatCurrency(selectedPlan.price, selectedPlan.currency)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Billing</label>
                    <p className="text-sm text-slate-900 mt-1">
                      {getIntervalText(selectedPlan.interval, selectedPlan.interval_count)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Trial Period</label>
                    <p className="text-sm text-slate-900 mt-1">
                      {selectedPlan.trial_period_days ? `${selectedPlan.trial_period_days} days` : 'No trial'}
                    </p>
                  </div>
                </div>

                {/* Limits */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Max Clinics</label>
                    <p className="text-sm text-slate-900 mt-1">{selectedPlan.max_clinics}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Max Users</label>
                    <p className="text-sm text-slate-900 mt-1">{selectedPlan.max_users}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Max Patients</label>
                    <p className="text-sm text-slate-900 mt-1">{selectedPlan.max_patients}</p>
                  </div>
                </div>

                {/* Features */}
                {selectedPlan.features && selectedPlan.features.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Features</label>
                    <div className="mt-2 space-y-1">
                      {selectedPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-slate-900">
                          <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status & Dates */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Status</label>
                    <div className="mt-1 flex gap-2">
                      <Badge 
                        className={selectedPlan.is_active 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                        }
                      >
                        {selectedPlan.is_active ? 'Active' : 'Archived'}
                      </Badge>
                      {selectedPlan.is_default && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Created</label>
                    <p className="text-sm text-slate-900 mt-1">
                      {new Date(selectedPlan.created_at).toLocaleDateString('en-US', {
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

export default Plans;
