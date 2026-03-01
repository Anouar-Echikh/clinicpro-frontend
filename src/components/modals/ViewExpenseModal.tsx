import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Wrench,
  Zap,
  Users,
  Shield,
  Home,
  Briefcase,
  MoreHorizontal,
  DollarSign,
  CreditCard,
  FileText,
  CalendarIcon,
  UserIcon,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";
import type { Expense } from "@/services/api/expenseApi";

interface ViewExpenseModalProps {
  open: boolean;
  expense: Expense | null;
  onClose: () => void;
}

const ViewExpenseModal: React.FC<ViewExpenseModalProps> = ({
  open,
  expense,
  onClose,
}) => {
  const { formatAmount } = useCurrency();

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

  if (!expense) return null;

  const CategoryIcon = getCategoryIcon(expense.category);
  const PaymentIcon = getPaymentMethodIcon(expense.payment_method);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CategoryIcon className="h-5 w-5 text-muted-foreground" />
            {expense.title}
          </DialogTitle>
          <DialogDescription>
            Expense details and information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Amount</label>
                <p className="text-2xl font-bold text-primary">
                  {formatAmount(expense.amount)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge className={cn("capitalize", getStatusBadge(expense.status))}>
                    {expense.status}
                  </Badge>
                </div>
              </div>
            </div>

            {expense.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1 text-sm">{expense.description}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Details */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <div className="mt-1 flex items-center gap-2">
                  <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{expense.category.replace('_', ' ')}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                <div className="mt-1 flex items-center gap-2">
                  <PaymentIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{expense.payment_method.replace('_', ' ')}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <div className="mt-1 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(expense.date), "MMMM dd, yyyy")}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {expense.vendor && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Vendor/Supplier</label>
                  <p className="mt-1">{expense.vendor}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Created By</label>
                <div className="mt-1 flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{expense.created_by.first_name} {expense.created_by.last_name}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                <p className="mt-1 text-sm">
                  {format(new Date(expense.created_at), "MMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          </div>

          {/* Receipt */}
          {expense.receipt_url && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Receipt</label>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(expense.receipt_url, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Receipt
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {expense.notes && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <p className="mt-1 text-sm bg-muted p-3 rounded-md">
                  {expense.notes}
                </p>
              </div>
            </>
          )}

          {/* Timestamps */}
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Created:</span>{" "}
              {format(new Date(expense.created_at), "MMM dd, yyyy 'at' h:mm a")}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{" "}
              {format(new Date(expense.updated_at), "MMM dd, yyyy 'at' h:mm a")}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewExpenseModal;
