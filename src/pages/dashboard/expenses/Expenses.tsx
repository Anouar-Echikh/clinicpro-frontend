import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  DollarSign,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Receipt,
  TrendingUp,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Package,
  Wrench,
  Zap,
  Users,
  Shield,
  Home,
  Briefcase,
  MoreHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";
import ErrorHandler from "@/components/ErrorHandler";
import AddExpenseModal from "@/components/modals/AddExpenseModal";
import EditExpenseModal from "@/components/modals/EditExpenseModal";
import ViewExpenseModal from "@/components/modals/ViewExpenseModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import { expenseApi, type Expense, type ExpenseStats } from "@/services/api/expenseApi";

const Expenses = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const { formatAmount } = useCurrency();

  // Data state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState<{
    open: boolean;
    expense: Expense | null;
  }>({ open: false, expense: null });
  const [editModal, setEditModal] = useState<{
    open: boolean;
    expense: Expense | null;
  }>({ open: false, expense: null });
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    expense: Expense | null;
  }>({ open: false, expense: null });

  // Load data on component mount and when filters change
  useEffect(() => {
    loadExpenses();
    loadStats();
  }, [currentPage, selectedCategory, selectedStatus, selectedPaymentMethod, searchTerm]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        ...(selectedCategory !== "all" && { category: selectedCategory }),
        ...(selectedStatus !== "all" && { status: selectedStatus }),
        ...(selectedPaymentMethod !== "all" && { payment_method: selectedPaymentMethod }),
        ...(searchTerm && { search: searchTerm }),
      };

      console.log("Loading expenses with params:", params);
      const response = await expenseApi.getExpenses(params);
      console.log("Expenses response:", response.data);
      
      if (response.data.success) {
        setExpenses(response.data.data.items);
        setTotalPages(response.data.data.pagination.pages);
        setTotalItems(response.data.data.pagination.total);
        console.log("Loaded expenses:", response.data.data.items.length);
      }
    } catch (err: any) {
      console.error("Error loading expenses:", err);
      setError(err);
      toast.error(t("Failed to load expenses"));
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log("Loading expense stats...");
      const response = await expenseApi.getExpenseStats();
      console.log("Stats response:", response.data);
      if (response.data.success) {
        setStats(response.data.data);
        console.log("Stats set:", response.data.data);
      } else {
        console.error("Stats API returned success: false", response.data);
      }
    } catch (err: any) {
      console.error("Failed to load expense stats:", err);
    }
  };

  // Action handlers
  const handleViewExpense = (expense: Expense) => {
    setViewModal({ open: true, expense });
  };

  const handleEditExpense = (expense: Expense) => {
    setEditModal({ open: true, expense });
  };

  const handleDeleteExpense = (expense: Expense) => {
    setDeleteModal({ open: true, expense });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.expense) return;

    try {
      await expenseApi.deleteExpense(deleteModal.expense._id);
      toast.success(t("Expense deleted successfully"));
      setDeleteModal({ open: false, expense: null });
      loadExpenses();
      loadStats();
    } catch (err: any) {
      toast.error(t("Failed to delete expense"));
    }
  };

  const handleExpenseCreated = () => {
    loadExpenses();
    loadStats();
    setAddModalOpen(false);
  };

  const handleExpenseUpdated = () => {
    loadExpenses();
    loadStats();
    setEditModal({ open: false, expense: null });
  };

  // Filter counts for display
  const getFilteredCount = () => {
    return totalItems;
  };

  // Category icon mapping
  const getCategoryIcon = (category: string) => {
    const icons = {
      supplies: Package,
      equipment: Wrench,
      utilities: Zap,
      maintenance: Wrench,
      staff: Users,
      marketing: Briefcase,
      insurance: Shield,
      rent: Home,
      other: MoreHorizontal,
    };
    return icons[category as keyof typeof icons] || MoreHorizontal;
  };

  // Status badge colors
  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      paid: "bg-green-100 text-green-800 hover:bg-green-200",
      cancelled: "bg-red-100 text-red-800 hover:bg-red-200",
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  // Payment method icons
  const getPaymentMethodIcon = (method: string) => {
    const icons = {
      cash: DollarSign,
      card: CreditCard,
      bank_transfer: Briefcase,
      check: FileText,
    };
    return icons[method as keyof typeof icons] || DollarSign;
  };

  if (error) {
    return <ErrorHandler error={error} onRetry={() => {
      setError(null);
      loadExpenses();
    }} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('Expenses')}</h1>
          <p className="text-muted-foreground">
            {t('Manage and track clinic expenses and costs')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {/* TODO: Export functionality */}}
          >
            <Download className="mr-2 h-4 w-4" />
            {t('Export')}
          </Button>
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('Add Expense')}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Total Expenses')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatAmount(stats.overview.total_amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.total_expenses} {t('expenses recorded')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('This Month')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatAmount(stats.overview.monthly_total)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.monthly_count} {t('expenses this month')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Pending')}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatAmount(stats.overview.pending_amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.pending_expenses} {t('pending expenses')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Paid')}</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatAmount(stats.overview.paid_amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.paid_expenses} {t('paid expenses')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('Filters')}</CardTitle>
          <CardDescription>
            {t('Filter expenses by category, status, and payment method')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('Search expenses...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t('All Categories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('All Categories')}</SelectItem>
                <SelectItem value="supplies">{t('Supplies')}</SelectItem>
                <SelectItem value="equipment">{t('Equipment')}</SelectItem>
                <SelectItem value="utilities">{t('Utilities')}</SelectItem>
                <SelectItem value="maintenance">{t('Maintenance')}</SelectItem>
                <SelectItem value="staff">{t('Staff')}</SelectItem>
                <SelectItem value="marketing">{t('Marketing')}</SelectItem>
                <SelectItem value="insurance">{t('Insurance')}</SelectItem>
                <SelectItem value="rent">{t('Rent')}</SelectItem>
                <SelectItem value="other">{t('Other')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder={t('All Statuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('All Statuses')}</SelectItem>
                <SelectItem value="pending">{t('Pending')}</SelectItem>
                <SelectItem value="paid">{t('Paid')}</SelectItem>
                <SelectItem value="cancelled">{t('Cancelled')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder={t('All Payment Methods')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('All Payment Methods')}</SelectItem>
                <SelectItem value="cash">{t('Cash')}</SelectItem>
                <SelectItem value="card">{t('Card')}</SelectItem>
                <SelectItem value="bank_transfer">{t('Bank Transfer')}</SelectItem>
                <SelectItem value="check">{t('Check')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {t('Showing')} {expenses.length} {t('of')} {totalItems} {t('expenses')}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedStatus("all");
                setSelectedPaymentMethod("all");
                setCurrentPage(1);
              }}
            >
              {t('Clear Filters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('Expenses List')}</CardTitle>
          <CardDescription>
            {t('View and manage all clinic expenses')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">{t('No expenses found')}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('Get started by creating a new expense.')}
              </p>
              <div className="mt-6">
                <Button onClick={() => setAddModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('Add Expense')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Title')}</TableHead>
                    <TableHead>{t('Category')}</TableHead>
                    <TableHead>{t('Amount')}</TableHead>
                    <TableHead>{t('Payment Method')}</TableHead>
                    <TableHead>{t('Status')}</TableHead>
                    <TableHead>{t('Date')}</TableHead>
                    <TableHead>{t('Vendor')}</TableHead>
                    <TableHead className="w-[100px] text-right">{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense, index) => {
                    const CategoryIcon = getCategoryIcon(expense.category);
                    const PaymentIcon = getPaymentMethodIcon(expense.payment_method);
                    console.log(`Rendering expense ${index}:`, expense);
                    
                    return (
                      <TableRow key={expense._id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{expense.title}</p>
                            {expense.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {expense.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">{expense.category.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatAmount(expense.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <PaymentIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">{expense.payment_method.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("capitalize", getStatusBadge(expense.status))}>
                            {expense.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(expense.date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          {expense.vendor || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8">
                                <MoreVertical className="h-4 w-4 mr-1" />
                                {t('Actions')}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewExpense(expense)}>
                                <Eye className="mr-2 h-4 w-4" />
                                {t('View Details')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditExpense(expense)}>
                                <Edit className="mr-2 h-4 w-4" />
                                {t('Edit Expense')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteExpense(expense)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('Delete Expense')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t('Page')} {currentPage} {t('of')} {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      {t('Previous')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      {t('Next')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddExpenseModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleExpenseCreated}
      />

      <ViewExpenseModal
        open={viewModal.open}
        expense={viewModal.expense}
        onClose={() => setViewModal({ open: false, expense: null })}
      />

      <EditExpenseModal
        open={editModal.open}
        expense={editModal.expense}
        onClose={() => setEditModal({ open: false, expense: null })}
        onSuccess={handleExpenseUpdated}
      />

      <DeleteConfirmModal
        open={deleteModal.open}
        title={t("Delete Expense")}
        description={`${t('Are you sure you want to delete')} "${deleteModal.expense?.title}"? ${t('This action cannot be undone.')}`}
        onClose={() => setDeleteModal({ open: false, expense: null })}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default Expenses;
