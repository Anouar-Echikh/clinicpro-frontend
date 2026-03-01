import React, { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Edit,
  Plus,
  X,
  Info,
  AlertTriangle
} from 'lucide-react';
import { SubscriptionPlan } from '@/services/api/stripeApi';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  plan: SubscriptionPlan;
}

// Form validation schema
const editPlanSchema = z.object({
  name: z.string()
    .min(2, 'Plan name must be at least 2 characters')
    .max(100, 'Plan name must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  features: z.array(z.string()),
  is_active: z.boolean(),
  is_default: z.boolean(),
});

type EditPlanFormData = z.infer<typeof editPlanSchema>;

const EditPlanDialog: React.FC<EditPlanDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  plan
}) => {
  const [loading, setLoading] = useState(false);
  const [featureInput, setFeatureInput] = useState('');

  const form = useForm<EditPlanFormData>({
    resolver: zodResolver(editPlanSchema),
    defaultValues: {
      name: plan.name,
      description: plan.description,
      features: plan.features || [],
      is_active: plan.is_active,
      is_default: plan.is_default,
    },
  });

  // Update form values when plan prop changes
  useEffect(() => {
    if (plan) {
      form.reset({
        name: plan.name,
        description: plan.description,
        features: plan.features || [],
        is_active: plan.is_active,
        is_default: plan.is_default,
      });
    }
  }, [plan, form]);

  const handleSubmit = async (data: EditPlanFormData) => {
    try {
      setLoading(true);
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setFeatureInput('');
    onOpenChange(false);
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      const currentFeatures = form.getValues('features');
      form.setValue('features', [...currentFeatures, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues('features');
    form.setValue('features', currentFeatures.filter((_, i) => i !== index));
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  const hasChanges = form.formState.isDirty;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Plan: {plan.name}
          </DialogTitle>
          <DialogDescription>
            Update plan information. Note that pricing and billing settings cannot be changed after creation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Plan Info Alert */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Plan ID:</strong> {plan._id}
                <br />
                <strong>Stripe Product ID:</strong> {plan.stripe_product_id}
                <br />
                <strong>Current Price:</strong> {formatCurrency(plan.price, plan.currency)} / {plan.interval}
              </AlertDescription>
            </Alert>

            {/* Pricing Info (Read-only) */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Current Pricing (Read-only)</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Price:</span>
                  <span className="ml-2 font-medium">{formatCurrency(plan.price, plan.currency)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Billing:</span>
                  <span className="ml-2 font-medium">
                    {plan.interval_count === 1 ? 
                      (plan.interval === 'month' ? 'Monthly' : 'Yearly') :
                      `Every ${plan.interval_count} ${plan.interval}s`
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Currency:</span>
                  <span className="ml-2 font-medium">{plan.currency}</span>
                </div>
                <div>
                  <span className="text-gray-600">Trial Period:</span>
                  <span className="ml-2 font-medium">
                    {plan.trial_period_days ? `${plan.trial_period_days} days` : 'No trial'}
                  </span>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Professional Plan" 
                        {...field} 
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what this plan includes..."
                        className="min-h-[80px]"
                        {...field} 
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Plan Limits (Read-only) */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Plan Limits (Read-only)</h3>
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{plan.max_clinics}</div>
                  <div className="text-sm text-gray-600">Max Clinics</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{plan.max_users}</div>
                  <div className="text-sm text-gray-600">Max Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{plan.max_patients}</div>
                  <div className="text-sm text-gray-600">Max Patients</div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Plan Features</h3>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a feature..."
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFeature}
                    disabled={!featureInput.trim() || loading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {form.watch('features').length > 0 && (
                  <div className="space-y-2">
                    {form.watch('features').map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{feature}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeature(index)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Plan Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Plan Settings</h3>
              
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        When disabled, this plan will not be available for new subscriptions
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_default"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Default Plan</FormLabel>
                      <FormDescription>
                        Make this the default plan selection for new tenants
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Pricing Change Warning */}
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-orange-800">
                <strong>Note:</strong> Pricing, billing intervals, limits, and trial periods cannot be changed after plan creation. 
                To modify these settings, you'll need to create a new plan and migrate existing subscriptions.
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
                disabled={loading || !hasChanges || !form.formState.isValid}
                className="min-w-[120px]"
              >
                {loading ? 'Updating...' : 'Update Plan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPlanDialog;

