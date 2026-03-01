import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Receipt, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';
import { toast } from '@/hooks/use-toast';
import { paymentApi } from '@/services/api/paymentApi';

const PaymentSuccess: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    // Verify payment status with backend
    verifyPaymentStatus();
  }, [sessionId]);

  const verifyPaymentStatus = async () => {
    try {
      setLoading(true);
      
      // Call backend to verify payment status by session ID
      const paymentDetails = await paymentApi.verifyPaymentBySessionId(sessionId!);
      
      setPaymentDetails(paymentDetails);

      toast({
        title: t('Payment Successful'),
        description: t('Your payment has been processed successfully'),
      });

    } catch (error: any) {
      console.error('Error verifying payment:', error);
      setError(error.message || 'Failed to verify payment status');
      toast({
        title: t('Error'),
        description: error.message || t('Failed to verify payment status'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoToPayments = () => {
    navigate('/dashboard/payments');
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('Verifying Payment')}
              </h2>
              <p className="text-gray-600 text-center">
                {t('Please wait while we confirm your payment...')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('Payment Verification Error')}
              </h2>
              <p className="text-gray-600 text-center">
                {error}
              </p>
              <div className="flex flex-col w-full space-y-2">
                <Button onClick={handleGoToPayments} className="w-full">
                  <Receipt className="h-4 w-4 mr-2" />
                  {t('View Payments')}
                </Button>
                <Button variant="outline" onClick={handleGoHome} className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  {t('Go to Dashboard')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
              className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
            >
              <CheckCircle className="h-8 w-8 text-green-600" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-green-600">
              {t('Payment Successful!')}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {t('Your payment has been processed successfully')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {paymentDetails && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                {/* Payment Amount */}
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">{t('Amount Paid')}</p>
                  <p className="text-3xl font-bold text-green-600">
                    <CurrencyDisplay 
                      amount={paymentDetails.amount} 
                      currency={paymentDetails.currency}
                      variant="large" 
                    />
                  </p>
                </div>

                {/* Payment Details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('Status')}</span>
                    <Badge className="bg-green-100 text-green-800">
                      {t('Completed')}
                    </Badge>
                  </div>
                  
                  {paymentDetails.customer_email && (
                                      <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('Email')}</span>
                    <span className="text-sm font-medium">{paymentDetails.customer_email}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('Date')}</span>
                  <span className="text-sm font-medium">
                    {paymentDetails.payment_date ? new Date(paymentDetails.payment_date).toLocaleString() : 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('Payment ID')}</span>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {paymentDetails.payment_id?.substring(0, 16) || 'N/A'}...
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('Session ID')}</span>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {sessionId?.substring(0, 20)}...
                  </span>
                </div>

                {/* Patient Information */}
                {paymentDetails.patient && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('Patient')}</span>
                    <span className="text-sm font-medium">
                      {typeof paymentDetails.patient === 'object' 
                        ? `${paymentDetails.patient.first_name} ${paymentDetails.patient.last_name}`
                        : paymentDetails.patient
                      }
                    </span>
                  </div>
                )}
                </div>

                {/* Description */}
                {paymentDetails.description && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-1">{t('Description')}</p>
                    <p className="text-sm font-medium">{paymentDetails.description}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-3 pt-4"
            >
              <Button 
                onClick={handleGoToPayments} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Receipt className="h-4 w-4 mr-2" />
                {t('View Payment History')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleGoHome} 
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                {t('Back to Dashboard')}
              </Button>
            </motion.div>

            {/* Additional Information */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center pt-4 border-t"
            >
              <p className="text-xs text-gray-500">
                {t('A confirmation email has been sent to your registered email address.')}
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
