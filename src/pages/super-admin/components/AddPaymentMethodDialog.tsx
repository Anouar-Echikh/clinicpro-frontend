import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield, AlertTriangle } from 'lucide-react';
import { stripeApiService } from '@/services/api/stripeApi';
import { toast } from '@/hooks/use-toast';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface AddPaymentMethodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  adminCustomerId: string | null;
}

const AddPaymentMethodForm: React.FC<{
  onSuccess: () => void;
  onClose: () => void;
  adminCustomerId: string | null;
}> = ({ onSuccess, onClose, adminCustomerId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get setup intent when component mounts
  useEffect(() => {
    const createSetupIntent = async () => {
      try {
        const response = await stripeApiService.createAdminSetupIntent();
        setClientSecret(response.data.data.client_secret);
      } catch (error: any) {
        console.error('Error creating setup intent:', error);
        setError(error.response?.data?.message || 'Failed to initialize payment method setup');
      }
    };

    if (adminCustomerId) {
      createSetupIntent();
    }
  }, [adminCustomerId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      setLoading(false);
      return;
    }

    try {
      // Confirm the setup intent
      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'ClinicPro Admin',
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'An error occurred while setting up the payment method');
      } else if (setupIntent && setupIntent.status === 'succeeded') {
        // Payment method was successfully attached
        onSuccess();
      } else {
        setError('Failed to setup payment method. Please try again.');
      }
    } catch (error: any) {
      console.error('Error confirming setup intent:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Card element options
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your payment information is securely processed by Stripe. We do not store your card details.
        </AlertDescription>
      </Alert>

      {/* Card Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Payment Method Details
        </label>
        <div className="p-4 border border-slate-300 rounded-md bg-white">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="text-xs text-slate-500">
          This payment method will be used to pay subscription fees on behalf of your customers.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {!clientSecret && !error && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          <span className="ml-2 text-slate-600">Initializing secure payment setup...</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading || !stripe || !clientSecret}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding Payment Method...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Add Payment Method
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

const AddPaymentMethodDialog: React.FC<AddPaymentMethodDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  adminCustomerId,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Add Payment Method
          </DialogTitle>
          <DialogDescription>
            Add a payment method to pay subscription fees on behalf of customers
          </DialogDescription>
        </DialogHeader>
        
        <Elements stripe={stripePromise}>
          <AddPaymentMethodForm
            onSuccess={onSuccess}
            onClose={onClose}
            adminCustomerId={adminCustomerId}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};

export default AddPaymentMethodDialog;

