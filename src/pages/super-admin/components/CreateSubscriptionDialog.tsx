import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Mail, 
  Building2, 
  CreditCard,
  DollarSign,
  Calendar,
  Crown,
  CheckCircle,
  Info,
  AlertTriangle
} from 'lucide-react';
import { SubscriptionPlan, Tenant } from '@/services/api/stripeApi';

interface CreateSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  plans: SubscriptionPlan[];
  tenants: Tenant[];
}

// Form validation schema
const createSubscriptionSchema = z.object({
  tenant_id: z.string()
    .min(1, 'Please select a tenant'),
  plan_id: z.string()
    .min(1, 'Please select a plan'),
  customer_email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
});

type CreateSubscriptionFormData = z.infer<typeof createSubscriptionSchema>;

const CreateSubscriptionDialog: React.FC<CreateSubscriptionDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  plans,
  tenants
}) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateSubscriptionFormData>({
    resolver: zodResolver(createSubscriptionSchema),
    defaultValues: {
      tenant_id: '',
      plan_id: '',
      customer_email: '',
    },
  });

  const handleSubmit = async (data: CreateSubscriptionFormData) => {
    try {
      setLoading(true);
      await onSubmit(data);
      
      // Reset form
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  // Auto-fill email when tenant is selected
  const handleTenantChange = (tenantId: string) => {
    form.setValue('tenant_id', tenantId);
    const selectedTenant = tenants.find(t => (t._id || t.id) === tenantId);
    if (selectedTenant) {
      form.setValue('customer_email', selectedTenant.email);
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

  const selectedTenant = tenants.find(t => (t._id || t.id) === form.watch('tenant_id'));
  const selectedPlan = plans.find(p => p._id === form.watch('plan_id'));

  // Filter out tenants that might already have active subscriptions
  const availableTenants = tenants.filter(t => t.status === 'active');
  const activePlans = plans.filter(p => p.is_active);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create Subscription
          </DialogTitle>
          <DialogDescription>
            Create a new subscription for a tenant organization. This will create a Stripe subscription and set up billing.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Warning about existing subscriptions */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Note:</strong> This will create a new Stripe subscription. Make sure the tenant doesn't already have an active subscription to avoid billing conflicts.
              </AlertDescription>
            </Alert>

            {/* Tenant Selection */}
            <FormField
              control={form.control}
              name="tenant_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant Organization</FormLabel>
                  <Select 
                    onValueChange={handleTenantChange} 
                    value={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tenant organization" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTenants.map((tenant) => (
                        <SelectItem key={tenant._id || tenant.id} value={tenant._id || tenant.id}>
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4" />
                            <div className="flex flex-col">
                              <span>{tenant.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {tenant.subdomain || tenant.slug} • {tenant.email}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The organization that will be billed for this subscription
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plan Selection */}
            <FormField
              control={form.control}
              name="plan_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscription Plan</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subscription plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activePlans.map((plan) => (
                        <SelectItem key={plan._id} value={plan._id}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                              <CreditCard className="h-4 w-4" />
                              <div className="flex flex-col">
                                <div className="flex items-center space-x-2">
                                  <span>{plan.name}</span>
                                  {plan.is_default && (
                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                                      Default
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatCurrency(plan.price, plan.currency)} / {getIntervalText(plan.interval, plan.interval_count)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The subscription plan that defines pricing and features
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Customer Email */}
            <FormField
              control={form.control}
              name="customer_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="customer@example.com"
                        className="pl-10"
                        {...field} 
                        disabled={loading}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Email address for billing and subscription notifications
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selected Tenant Info */}
            {selectedTenant && (
              <Alert className="border-blue-200 bg-blue-50">
                <Building2 className="h-4 w-4" />
                <AlertDescription className="text-blue-800">
                  <strong>Selected Tenant:</strong> {selectedTenant.name}
                  <br />
                  <span className="text-sm">
                    Subdomain: <code className="bg-blue-100 px-1 rounded">{selectedTenant.subdomain || selectedTenant.slug}</code>
                    {' • '}Status: <span className="capitalize">{selectedTenant.status}</span>
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {/* Selected Plan Info */}
            {selectedPlan && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Selected Plan: {selectedPlan.name}</h4>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Price</div>
                    <div className="flex items-center text-lg font-bold text-gray-900">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatCurrency(selectedPlan.price, selectedPlan.currency)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getIntervalText(selectedPlan.interval, selectedPlan.interval_count)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Trial Period</div>
                    <div className="flex items-center text-gray-900">
                      <Calendar className="h-4 w-4 mr-1" />
                      {selectedPlan.trial_period_days ? `${selectedPlan.trial_period_days} days` : 'No trial'}
                    </div>
                  </div>
                </div>

                {/* Plan limits */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-lg font-bold text-gray-900">{selectedPlan.max_clinics}</div>
                    <div className="text-xs text-gray-600">Max Clinics</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-lg font-bold text-gray-900">{selectedPlan.max_users}</div>
                    <div className="text-xs text-gray-600">Max Users</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-lg font-bold text-gray-900">{selectedPlan.max_patients}</div>
                    <div className="text-xs text-gray-600">Max Patients</div>
                  </div>
                </div>

                {/* Features */}
                {selectedPlan.features && selectedPlan.features.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Included Features</div>
                    <div className="space-y-1">
                      {selectedPlan.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                          {feature}
                        </div>
                      ))}
                      {selectedPlan.features.length > 3 && (
                        <div className="text-xs text-gray-500 ml-5">
                          +{selectedPlan.features.length - 3} more features
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Notice */}
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-orange-800">
                <strong>Payment Setup Required:</strong> After creating the subscription, the tenant will need to complete payment setup through Stripe. 
                They will receive an email with payment instructions.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !form.formState.isValid}
                className="min-w-[140px]"
              >
                {loading ? 'Creating...' : 'Create Subscription'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubscriptionDialog;

