import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Receipt,
  Search,
  Filter,
  Download,
  Eye,
  CreditCard,
  DollarSign,
  Calendar,
  Building2,
  Mail,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RotateCcw,
  Zap,
  FileText
} from 'lucide-react';
import { stripeApiService, StripeTransaction } from '@/services/api/stripeApi';
import { toast } from '@/hooks/use-toast';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<StripeTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    pages: 0
  });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });
  
  // Dialogs
  const [selectedTransaction, setSelectedTransaction] = useState<StripeTransaction | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const filters = {
        page: pagination.page,
        limit: pagination.limit,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(searchQuery && { customer_email: searchQuery }),
        ...(dateRange.start_date && { start_date: dateRange.start_date }),
        ...(dateRange.end_date && { end_date: dateRange.end_date }),
      };
      
      const response = await stripeApiService.getTransactions(filters);
      setTransactions(response.data.data.transactions);
      setPagination(response.data.data.pagination);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, statusFilter, typeFilter, dateRange]);

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination(prev => ({ ...prev, page: 1 }));
      } else {
        fetchTransactions();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const getStatusColor = (status: string) => {
    return stripeApiService.getTransactionStatusColor(status);
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      succeeded: CheckCircle,
      processing: Clock,
      requires_action: AlertTriangle,
      requires_confirmation: AlertTriangle,
      requires_payment_method: AlertTriangle,
      failed: XCircle,
      canceled: XCircle,
      requires_capture: Clock,
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon className="h-3 w-3" />;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      subscription: Receipt,
      one_time: CreditCard,
      refund: RotateCcw,
      dispute: AlertTriangle,
      payout: DollarSign,
      invoice: FileText,
    };
    const Icon = icons[type as keyof typeof icons] || Receipt;
    return <Icon className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      subscription: 'bg-blue-100 text-blue-800 border-blue-200',
      one_time: 'bg-green-100 text-green-800 border-green-200',
      refund: 'bg-orange-100 text-orange-800 border-orange-200',
      dispute: 'bg-red-100 text-red-800 border-red-200',
      payout: 'bg-purple-100 text-purple-800 border-purple-200',
      invoice: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter transactions by search query
  const filteredTransactions = transactions.filter(transaction =>
    !searchQuery || 
    transaction.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.tenant_id?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const stats = {
    total: transactions.length,
    succeeded: transactions.filter(t => t.status === 'succeeded').length,
    processing: transactions.filter(t => t.status === 'processing').length,
    failed: transactions.filter(t => t.status === 'failed').length,
    total_amount: transactions
      .filter(t => t.status === 'succeeded')
      .reduce((sum, t) => sum + t.amount, 0),
  };

  const handleExport = async () => {
    toast({
      title: 'Export Started',
      description: 'Transaction export will be available soon',
    });
  };

  const handleSyncFromStripe = async () => {
    try {
      setSyncing(true);
      const response = await stripeApiService.syncTransactionsFromStripe();
      const data = response.data.data;
      
      toast({
        title: 'Sync Completed!',
        description: `Successfully synced ${data.synced_count} transactions from Stripe. ${data.total_processed} total processed.`,
      });
      
      // Refresh the transactions list
      await fetchTransactions();
    } catch (error: any) {
      console.error('Error syncing transactions:', error);
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync transactions from Stripe',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Receipt className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
          </div>
          <p className="text-slate-600 mt-1">
            View and analyze all Stripe transactions across all tenants
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransactions}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All transactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Succeeded</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.succeeded}</div>
            <p className="text-xs text-muted-foreground">Successful payments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">Failed payments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.total_amount > 0 ? formatCurrency(stats.total_amount, 'USD') : '$0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Total processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Complete history of all Stripe transactions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by email, description, or tenant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="succeeded">Succeeded</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="requires_action">Requires Action</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="one_time">One-time</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="dispute">Dispute</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="Start Date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-[150px]"
              />

              <Input
                type="date"
                placeholder="End Date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-[150px]"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">Loading transactions...</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || dateRange.start_date || dateRange.end_date
                  ? 'No transactions found matching your filters'
                  : 'No transactions found'
                }
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || dateRange.start_date || dateRange.end_date
                  ? 'Try adjusting your search or filters'
                  : 'Transactions will appear here as they are processed'
                }
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{transaction.description}</div>
                          {transaction.stripe_payment_intent_id && (
                            <div className="text-xs text-muted-foreground font-mono">
                              {transaction.stripe_payment_intent_id}
                            </div>
                          )}
                          {transaction.failure_message && (
                            <div className="text-xs text-red-600">
                              {transaction.failure_message}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          {transaction.customer_email && (
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                              {transaction.customer_email}
                            </div>
                          )}
                          {transaction.tenant_id && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Building2 className="h-3 w-3 mr-1" />
                              {transaction.tenant_id.name}
                            </div>
                          )}
                          {transaction.card_last4 && (
                            <div className="text-xs text-muted-foreground">
                              {stripeApiService.getCardBrandIcon(transaction.card_brand)} •••• {transaction.card_last4}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getTypeColor(transaction.type)}>
                          {getTypeIcon(transaction.type)}
                          <span className="ml-1 capitalize">{transaction.type.replace('_', ' ')}</span>
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </div>
                          {transaction.refunded_amount && transaction.refunded_amount > 0 && (
                            <div className="text-xs text-orange-600">
                              Refunded: {formatCurrency(transaction.refunded_amount, transaction.currency)}
                            </div>
                          )}
                          {transaction.fee_amount && transaction.fee_amount > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Fee: {formatCurrency(transaction.fee_amount, transaction.currency)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getStatusColor(transaction.status)}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1">{stripeApiService.getReadableStatus(transaction.status)}</span>
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {formatDate(transaction.created_at)}
                          </div>
                          {transaction.processed_at && (
                            <div className="text-xs text-muted-foreground">
                              Processed: {formatDate(transaction.processed_at)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Transaction Dialog */}
      {selectedTransaction && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Transaction Details
              </DialogTitle>
              <DialogDescription>
                Complete information about this transaction
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              {/* Transaction Overview */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm font-medium text-slate-700 mb-1">Amount</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-slate-700 mb-1">Status</div>
                  <Badge className={getStatusColor(selectedTransaction.status)}>
                    {getStatusIcon(selectedTransaction.status)}
                    <span className="ml-1">{stripeApiService.getReadableStatus(selectedTransaction.status)}</span>
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-slate-700 mb-1">Type</div>
                  <Badge className={getTypeColor(selectedTransaction.type)}>
                    {getTypeIcon(selectedTransaction.type)}
                    <span className="ml-1 capitalize">{selectedTransaction.type.replace('_', ' ')}</span>
                  </Badge>
                </div>
              </div>

              {/* Customer Information */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    {selectedTransaction.customer_email && (
                      <div>
                        <label className="text-sm font-medium text-slate-700">Email</label>
                        <p className="text-sm text-slate-900 mt-1">{selectedTransaction.customer_email}</p>
                      </div>
                    )}
                    {selectedTransaction.tenant_id && (
                      <div>
                        <label className="text-sm font-medium text-slate-700">Organization</label>
                        <p className="text-sm text-slate-900 mt-1">{selectedTransaction.tenant_id.name}</p>
                      </div>
                    )}
                    {selectedTransaction.card_last4 && (
                      <div>
                        <label className="text-sm font-medium text-slate-700">Payment Method</label>
                        <p className="text-sm text-slate-900 mt-1">
                          {stripeApiService.getCardBrandIcon(selectedTransaction.card_brand)} 
                          {selectedTransaction.card_brand?.toUpperCase()} •••• {selectedTransaction.card_last4}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Transaction Details</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Description</label>
                      <p className="text-sm text-slate-900 mt-1">{selectedTransaction.description}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Currency</label>
                      <p className="text-sm text-slate-900 mt-1">{selectedTransaction.currency}</p>
                    </div>
                    {selectedTransaction.payment_method_type && (
                      <div>
                        <label className="text-sm font-medium text-slate-700">Payment Method Type</label>
                        <p className="text-sm text-slate-900 mt-1 capitalize">{selectedTransaction.payment_method_type}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount Breakdown */}
              {(selectedTransaction.fee_amount || selectedTransaction.refunded_amount || selectedTransaction.net_amount) && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-3">Amount Breakdown</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Gross Amount:</span>
                      <div className="font-medium text-blue-900">
                        {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                      </div>
                    </div>
                    {selectedTransaction.fee_amount && (
                      <div>
                        <span className="text-blue-700">Processing Fee:</span>
                        <div className="font-medium text-blue-900">
                          -{formatCurrency(selectedTransaction.fee_amount, selectedTransaction.currency)}
                        </div>
                      </div>
                    )}
                    {selectedTransaction.net_amount && (
                      <div>
                        <span className="text-blue-700">Net Amount:</span>
                        <div className="font-medium text-blue-900">
                          {formatCurrency(selectedTransaction.net_amount, selectedTransaction.currency)}
                        </div>
                      </div>
                    )}
                    {selectedTransaction.refunded_amount && selectedTransaction.refunded_amount > 0 && (
                      <div>
                        <span className="text-blue-700">Refunded:</span>
                        <div className="font-medium text-orange-600">
                          -{formatCurrency(selectedTransaction.refunded_amount, selectedTransaction.currency)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error Information */}
              {selectedTransaction.failure_message && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="text-sm font-medium text-red-900 mb-2">Failure Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedTransaction.failure_code && (
                      <div>
                        <span className="text-red-700">Error Code:</span>
                        <div className="font-mono text-red-900">{selectedTransaction.failure_code}</div>
                      </div>
                    )}
                    <div>
                      <span className="text-red-700">Error Message:</span>
                      <div className="text-red-900">{selectedTransaction.failure_message}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stripe IDs */}
              <div className="grid grid-cols-2 gap-4">
                {selectedTransaction.stripe_payment_intent_id && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Payment Intent ID</label>
                    <p className="text-sm text-slate-900 mt-1 font-mono text-xs break-all">
                      {selectedTransaction.stripe_payment_intent_id}
                    </p>
                  </div>
                )}
                {selectedTransaction.stripe_invoice_id && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Invoice ID</label>
                    <p className="text-sm text-slate-900 mt-1 font-mono text-xs break-all">
                      {selectedTransaction.stripe_invoice_id}
                    </p>
                  </div>
                )}
                {selectedTransaction.stripe_subscription_id && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Subscription ID</label>
                    <p className="text-sm text-slate-900 mt-1 font-mono text-xs break-all">
                      {selectedTransaction.stripe_subscription_id}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-slate-700">Customer ID</label>
                  <p className="text-sm text-slate-900 mt-1 font-mono text-xs break-all">
                    {selectedTransaction.stripe_customer_id}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Metadata</label>
                  <div className="p-3 bg-gray-50 rounded text-xs font-mono">
                    {JSON.stringify(selectedTransaction.metadata, null, 2)}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-slate-700">Created</label>
                  <p className="text-sm text-slate-900 mt-1">
                    {formatDate(selectedTransaction.created_at)}
                  </p>
                </div>
                {selectedTransaction.processed_at && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Processed</label>
                    <p className="text-sm text-slate-900 mt-1">
                      {formatDate(selectedTransaction.processed_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Transactions;
