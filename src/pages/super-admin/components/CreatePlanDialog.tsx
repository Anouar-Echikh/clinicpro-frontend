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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  CreditCard, 
  DollarSign,
  Calendar,
  Users,
  Building2,
  Crown,
  Plus,
  X,
  Info
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
}

// Form validation schema
const createPlanSchema = z.object({
  name: z.string()
    .min(2, 'Plan name must be at least 2 characters')
    .max(100, 'Plan name must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  price: z.number()
    .min(0, 'Price must be positive')
    .max(999999, 'Price too high'),
  currency: z.string()
    .min(1, 'Currency is required'),
  interval: z.string()
    .min(1, 'Billing interval is required'),
  interval_count: z.number()
    .min(1, 'Interval count must be at least 1')
    .max(12, 'Interval count too high'),
  trial_period_days: z.number()
    .min(0, 'Trial period cannot be negative')
    .max(365, 'Trial period cannot exceed 365 days'),
  features: z.array(z.string()),
  max_clinics: z.number()
    .min(1, 'Must allow at least 1 clinic'),
  max_users: z.number()
    .min(1, 'Must allow at least 1 user'),
  max_patients: z.number()
    .min(1, 'Must allow at least 1 patient'),
  is_default: z.boolean(),
});

type CreatePlanFormData = z.infer<typeof createPlanSchema>;

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
  { value: 'INR', label: 'INR - Indian Rupee', symbol: '₹' },
  { value: 'CAD', label: 'CAD - Canadian Dollar', symbol: 'C$' },
  { value: 'AUD', label: 'AUD - Australian Dollar', symbol: 'A$' },
  { value: 'TZS', label: 'TZS - Tanzanian Shilling', symbol: 'TSh' },
];

const INTERVALS = [
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
];

const CreatePlanDialog: React.FC<CreatePlanDialogProps> = ({
  open,
  onOpenChange,
  onSubmit
}) => {
  const [loading, setLoading] = useState(false);
  const [featureInput, setFeatureInput] = useState('');

  const form = useForm<CreatePlanFormData>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      currency: 'USD',
      interval: 'month',
      interval_count: 1,
      trial_period_days: 0,
      features: [],
      max_clinics: 1,
      max_users: 5,
      max_patients: 100,
      is_default: false,
    },
  });

  const handleSubmit = async (data: CreatePlanFormData) => {
    try {
      setLoading(true);
      await onSubmit(data);
      
      // Reset form
      form.reset();
      setFeatureInput('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating plan:', error);
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

  const selectedCurrency = CURRENCIES.find(c => c.value === form.watch('currency'));
  const price = form.watch('price');
  const interval = form.watch('interval');
  const intervalCount = form.watch('interval_count');

  const formatPreviewPrice = () => {
    if (!selectedCurrency || !price) return 'Free';
    const symbol = selectedCurrency.symbol;
    const intervalText = interval === 'month' 
      ? (intervalCount === 1 ? '/month' : `/${intervalCount} months`)
      : (intervalCount === 1 ? '/year' : `/${intervalCount} years`);
    return `${symbol}${price.toFixed(2)}${intervalText}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Create Subscription Plan
          </DialogTitle>
          <DialogDescription>
            Create a new subscription plan for tenant organizations. This will also create corresponding products and prices in Stripe.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
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
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              <div className="flex items-center space-x-2">
                                <span>{currency.symbol}</span>
                                <span>{currency.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing & Billing
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ({selectedCurrency?.symbol || '$'})</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="29.99"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Interval</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INTERVALS.map((interval) => (
                            <SelectItem key={interval.value} value={interval.value}>
                              {interval.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interval_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Every X {interval}s</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          max="12"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="trial_period_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trial Period (Days)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0"
                        max="365"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormDescription>
                      Set to 0 for no trial period
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price Preview */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Price Preview</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {formatPreviewPrice()}
                </div>
                {form.watch('trial_period_days') > 0 && (
                  <div className="text-sm text-blue-700 mt-1">
                    with {form.watch('trial_period_days')} days free trial
                  </div>
                )}
              </div>
            </div>

            {/* Plan Limits */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Plan Limits</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="max_clinics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Max Clinics
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_users"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Max Users
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_patients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        Max Patients
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                className="min-w-[120px]"
              >
                {loading ? 'Creating...' : 'Create Plan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePlanDialog;

