import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PaymentCancelled: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: Log the cancellation for analytics
    console.log('Payment was cancelled by user');
  }, []);

  const handleTryAgain = () => {
    navigate('/dashboard/payments');
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
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
              className="mx-auto h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-4"
            >
              <XCircle className="h-8 w-8 text-orange-600" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-orange-600">
              {t('Payment Cancelled')}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {t('Your payment was cancelled and no charges were made')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Information */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center py-6 bg-gray-50 rounded-lg"
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                {t("What happened?")}
              </h3>
              <p className="text-sm text-gray-600">
                {t('You closed the payment window or clicked the back button during checkout. No payment was processed.')}
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <Button 
                onClick={handleTryAgain} 
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('Try Payment Again')}
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

            {/* Help Information */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center pt-4 border-t"
            >
              <p className="text-xs text-gray-500 mb-2">
                {t('Need help with your payment?')}
              </p>
              <p className="text-xs text-gray-400">
                {t('Contact our support team for assistance with payment issues.')}
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentCancelled;
