import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { expenseApi, type Expense, type UpdateExpenseRequest } from "@/services/api/expenseApi";

interface EditExpenseModalProps {
  open: boolean;
  expense: Expense | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  open,
  expense,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateExpenseRequest>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // Initialize form data when expense changes
  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title,
        description: expense.description || "",
        amount: expense.amount,
        category: expense.category,
        vendor: expense.vendor || "",
        payment_method: expense.payment_method,
        date: expense.date,
        status: expense.status,
        receipt_url: expense.receipt_url || "",
        notes: expense.notes || "",
      });
      setSelectedDate(new Date(expense.date));
    }
  }, [expense]);

  const handleInputChange = (field: keyof UpdateExpenseRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({
        ...prev,
        date: date.toISOString().split('T')[0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expense || !formData.title || !formData.category || !formData.payment_method || !formData.amount || formData.amount <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await expenseApi.updateExpense(expense._id, formData);
      toast.success("Expense updated successfully");
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update expense");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    setSelectedDate(undefined);
    onClose();
  };

  if (!expense) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>
            Update the expense details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Office supplies"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Additional details about the expense..."
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount || ""}
                onChange={(e) => handleInputChange("amount", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select value={formData.payment_method} onValueChange={(value) => handleInputChange("payment_method", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="vendor">Vendor/Supplier</Label>
              <Input
                id="vendor"
                value={formData.vendor || ""}
                onChange={(e) => handleInputChange("vendor", e.target.value)}
                placeholder="e.g., ABC Medical Supplies"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="receipt_url">Receipt URL</Label>
              <Input
                id="receipt_url"
                type="url"
                value={formData.receipt_url || ""}
                onChange={(e) => handleInputChange("receipt_url", e.target.value)}
                placeholder="https://example.com/receipt.pdf"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes or remarks..."
                className="min-h-[60px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditExpenseModal;
