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
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import {
  CreditCard,
  Plus,
  MoreVertical,
  Trash2,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Shield
} from 'lucide-react';
import { stripeApiService } from '@/services/api/stripeApi';
import { toast } from '@/hooks/use-toast';
import AddPaymentMethodDialog from './components/AddPaymentMethodDialog';

interface PaymentMethod {
  id: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  } | null;
  created: number;
}

const AdminPaymentMethods: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [adminCustomerId, setAdminCustomerId] = useState<string | null>(null);

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await stripeApiService.getAdminPaymentMethods();
      setPaymentMethods(response.data.data.payment_methods);
      setAdminCustomerId(response.data.data.admin_customer_id);
    } catch (error: any) {
      console.error('Error fetching payment methods:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load payment methods',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  // Delete payment method
  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    try {
      setDeleting(paymentMethodId);
      // We'll need to add this endpoint
      await stripeApiService.deleteAdminPaymentMethod(paymentMethodId);
      
      toast({
        title: 'Success',
        description: 'Payment method removed successfully',
      });
      
      // Refresh the list
      fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove payment method',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  // Handle successful payment method addition
  const handlePaymentMethodAdded = () => {
    fetchPaymentMethods();
    setIsAddDialogOpen(false);
    toast({
      title: 'Success',
      description: 'Payment method added successfully',
    });
  };

  // Format card brand
  const formatCardBrand = (brand: string) => {
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  // Get card brand color
  const getCardBrandColor = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'text-blue-600';
      case 'mastercard':
        return 'text-red-600';
      case 'amex':
        return 'text-green-600';
      case 'discover':
        return 'text-orange-600';
      default:
        return 'text-slate-600';
    }
  };

  // Check if card is expired
  const isCardExpired = (expMonth: number, expYear: number) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    return expYear < currentYear || (expYear === currentYear && expMonth < currentMonth);
  };

  // Check if card expires soon (within 2 months)
  const isCardExpiringSoon = (expMonth: number, expYear: number) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    const monthsUntilExpiry = (expYear - currentYear) * 12 + (expMonth - currentMonth);
    return monthsUntilExpiry <= 2 && monthsUntilExpiry > 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Payment Methods</h1>
          <p className="text-slate-600 mt-1">
            Manage payment methods for paying on behalf of customers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPaymentMethods}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => setIsAddDialogOpen(true)} 
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payment Methods</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentMethods.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Cards</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {paymentMethods.filter(pm => pm.card && isCardExpired(pm.card.exp_month, pm.card.exp_year)).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {paymentMethods.filter(pm => pm.card && isCardExpiringSoon(pm.card.exp_month, pm.card.exp_year)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Manage your admin payment methods for subscription payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <span className="ml-2 text-slate-600">Loading payment methods...</span>
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Payment Methods</h3>
              <p className="text-slate-600 mb-4">
                Add a payment method to start paying on behalf of customers
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Payment Method
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentMethods.map((pm) => {
                    const expired = pm.card ? isCardExpired(pm.card.exp_month, pm.card.exp_year) : false;
                    const expiringSoon = pm.card ? isCardExpiringSoon(pm.card.exp_month, pm.card.exp_year) : false;
                    
                    return (
                      <TableRow key={pm.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <CreditCard className="h-5 w-5 text-slate-400" />
                            <div>
                              <div className="font-medium">
                                <span className={getCardBrandColor(pm.card?.brand || '')}>
                                  {formatCardBrand(pm.card?.brand || 'Card')}
                                </span>
                                <span className="text-slate-600 ml-2">•••• {pm.card?.last4}</span>
                              </div>
                              <div className="text-sm text-slate-500">
                                Expires {pm.card?.exp_month.toString().padStart(2, '0')}/{pm.card?.exp_year}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {expired ? (
                            <Badge variant="destructive" className="bg-red-100 text-red-800">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Expired
                            </Badge>
                          ) : expiringSoon ? (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              <Calendar className="h-3 w-3 mr-1" />
                              Expiring Soon
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(pm.created * 1000).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
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
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeletePaymentMethod(pm.id)}
                                disabled={deleting === pm.id}
                                className="text-red-600"
                              >
                                {deleting === pm.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Removing...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Payment Method Dialog */}
      <AddPaymentMethodDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handlePaymentMethodAdded}
        adminCustomerId={adminCustomerId}
      />
    </div>
  );
};

export default AdminPaymentMethods;

