import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Trash2, 
  CreditCard,
  DollarSign,
  Calendar,
  Users,
  Building2,
  Crown,
  CheckCircle
} from 'lucide-react';
import { SubscriptionPlan } from '@/services/api/stripeApi';

interface DeletePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  plan: SubscriptionPlan;
}

const DeletePlanDialog: React.FC<DeletePlanDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  plan
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Archive Plan
          </DialogTitle>
          <DialogDescription>
            This action will archive the plan and make it unavailable for new subscriptions. 
            Existing subscriptions will continue to work normally.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Alert */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Warning:</strong> This will archive the plan in both your database and Stripe. 
              The plan will no longer be available for new subscriptions, but existing subscriptions will remain active.
            </AlertDescription>
          </Alert>

          {/* Plan Information */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-3">Plan to be archived:</h4>
            
            <div className="space-y-3">
              {/* Plan Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{plan.name}</h3>
                    {plan.is_default && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                </div>
                <CreditCard className="h-5 w-5 text-gray-400" />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Price</div>
                  <div className="flex items-center text-lg font-bold text-gray-900">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {formatCurrency(plan.price, plan.currency)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {getIntervalText(plan.interval, plan.interval_count)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Trial Period</div>
                  <div className="flex items-center text-gray-900">
                    <Calendar className="h-4 w-4 mr-1" />
                    {plan.trial_period_days ? `${plan.trial_period_days} days` : 'No trial'}
                  </div>
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Building2 className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">{plan.max_clinics}</div>
                  <div className="text-xs text-gray-600">Clinics</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">{plan.max_users}</div>
                  <div className="text-xs text-gray-600">Users</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Crown className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">{plan.max_patients}</div>
                  <div className="text-xs text-gray-600">Patients</div>
                </div>
              </div>

              {/* Features */}
              {plan.features && plan.features.length > 0 && (
                <div className="pt-3 border-t">
                  <div className="text-sm font-medium text-gray-700 mb-2">Features</div>
                  <div className="space-y-1">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-3 w-3 text-green-600 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                    {plan.features.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{plan.features.length - 3} more features
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stripe Info */}
              <div className="pt-3 border-t">
                <div className="text-sm font-medium text-gray-700 mb-1">Stripe Information</div>
                <div className="text-xs text-gray-600">
                  <div>Product ID: {plan.stripe_product_id}</div>
                  <div>Price ID: {plan.stripe_price_id}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Consequences */}
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">This action will:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Mark the plan as inactive in your database</li>
              <li>Deactivate the product and price in Stripe</li>
              <li>Hide the plan from new subscription selections</li>
              <li>Preserve all existing subscriptions (they will continue to work)</li>
              <li>Allow you to reactivate the plan later if needed</li>
            </ul>
          </div>

          {/* Default Plan Warning */}
          {plan.is_default && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-orange-800">
                <strong>Note:</strong> This is currently the default plan. After archiving, 
                you should set another plan as the default for new tenant registrations.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? 'Archiving...' : 'Archive Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePlanDialog;

