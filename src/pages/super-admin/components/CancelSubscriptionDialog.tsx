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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  AlertTriangle, 
  XCircle, 
  Users,
  Building2,
  CreditCard,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react';
import { TenantSubscription } from '@/services/api/stripeApi';

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (immediately: boolean) => Promise<void>;
  subscription: TenantSubscription;
}

const CancelSubscriptionDialog: React.FC<CancelSubscriptionDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  subscription
}) => {
  const [loading, setLoading] = useState(false);
  const [cancelationType, setCancelationType] = useState<'end_of_period' | 'immediately'>('end_of_period');

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm(cancelationType === 'immediately');
      onOpenChange(false);
    } catch (error) {
      console.error('Error canceling subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCancelationType('end_of_period');
    onOpenChange(false);
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
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilPeriodEnd = () => {
    const diffTime = new Date(subscription.current_period_end).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = getDaysUntilPeriodEnd();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Cancel Subscription
          </DialogTitle>
          <DialogDescription>
            Choose how you want to cancel this subscription. This action cannot be easily undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subscription Information */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-3">Subscription to be canceled:</h4>
            
            <div className="space-y-3">
              {/* Tenant and Plan */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Tenant</div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{subscription.tenant_id.name}</span>
                  </div>
                  <div className="text-sm text-gray-600 ml-6">
                    {subscription.tenant_id.subdomain || subscription.tenant_id.slug}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Plan</div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{subscription.plan_id.name}</span>
                  </div>
                  <div className="text-sm text-gray-600 ml-6">
                    {formatCurrency(subscription.price_amount, subscription.currency)} / {subscription.plan_id.interval}
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Current Status</div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {subscription.status === 'active' ? 'Active' : 'Trialing'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700 mb-1">Current Period</div>
                    <div className="text-sm text-gray-600">
                      Ends {formatDate(subscription.current_period_end)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {daysRemaining} days remaining
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Options */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Cancellation Options</h4>
            
            <RadioGroup 
              value={cancelationType} 
              onValueChange={(value) => setCancelationType(value as 'end_of_period' | 'immediately')}
            >
              {/* Cancel at end of period */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <RadioGroupItem value="end_of_period" id="end_of_period" className="mt-1" />
                <div className="flex-1">
                  <Label 
                    htmlFor="end_of_period" 
                    className="text-base font-medium cursor-pointer flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Cancel at end of billing period
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    The subscription will remain active until {formatDate(subscription.current_period_end)}. 
                    The tenant will continue to have access to all features until then.
                  </p>
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Clock className="h-3 w-3" />
                      <strong>Access until:</strong> {formatDate(subscription.current_period_end)} ({daysRemaining} days)
                    </div>
                    <div className="text-blue-700 mt-1">
                      <strong>Final charge:</strong> No additional charges will be made
                    </div>
                  </div>
                </div>
              </div>

              {/* Cancel immediately */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <RadioGroupItem value="immediately" id="immediately" className="mt-1" />
                <div className="flex-1">
                  <Label 
                    htmlFor="immediately" 
                    className="text-base font-medium cursor-pointer flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4 text-red-600" />
                    Cancel immediately
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    The subscription will be canceled right now and the tenant will immediately lose access to all features.
                  </p>
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="h-3 w-3" />
                      <strong>Immediate effect:</strong> Access will be revoked now
                    </div>
                    <div className="text-red-700 mt-1">
                      <strong>Refund:</strong> No automatic refund (contact Stripe for partial refunds)
                    </div>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Warning based on selection */}
          {cancelationType === 'end_of_period' ? (
            <Alert className="border-blue-200 bg-blue-50">
              <Calendar className="h-4 w-4" />
              <AlertDescription className="text-blue-800">
                <strong>Recommended:</strong> This option ensures the tenant gets the full value of their current billing period. 
                They'll continue to have access until {formatDate(subscription.current_period_end)}.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                <strong>Warning:</strong> Immediate cancellation will cut off the tenant's access right away. 
                This may cause service disruption and customer dissatisfaction. Consider using end-of-period cancellation instead.
              </AlertDescription>
            </Alert>
          )}

          {/* Consequences */}
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">This action will:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Cancel the subscription in Stripe</li>
              <li>Stop future billing cycles</li>
              <li>
                {cancelationType === 'immediately' 
                  ? 'Immediately revoke tenant access to subscription features'
                  : `Allow continued access until ${formatDate(subscription.current_period_end)}`
                }
              </li>
              <li>Send cancellation notifications to the customer</li>
              <li>Update the subscription status in your dashboard</li>
            </ul>
          </div>

          {/* Stripe Information */}
          <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
            <strong>Stripe Subscription ID:</strong> {subscription.stripe_subscription_id}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={loading}
          >
            Keep Subscription
          </Button>
          <Button 
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
            className="min-w-[140px]"
          >
            {loading ? (
              'Canceling...'
            ) : (
              cancelationType === 'immediately' 
                ? 'Cancel Now' 
                : 'Schedule Cancellation'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelSubscriptionDialog;

