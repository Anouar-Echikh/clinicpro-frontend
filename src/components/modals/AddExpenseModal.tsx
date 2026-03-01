import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { expenseApi, type CreateExpenseRequest } from "@/services/api/expenseApi";

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateExpenseRequest>({
    title: "",
    description: "",
    amount: 0,
    category: "",
    vendor: "",
    payment_method: "",
    date: new Date().toISOString().split('T')[0],
    status: "pending",
    receipt_url: "",
    notes: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleInputChange = (field: keyof CreateExpenseRequest, value: string | number) => {
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
    
    if (!formData.title || !formData.category || !formData.payment_method || formData.amount <= 0) {
      toast.error(t("Please fill in all required fields"));
      return;
    }

    try {
      setLoading(true);
      await expenseApi.createExpense(formData);
      toast.success(t("Expense created successfully"));
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("Failed to create expense"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      amount: 0,
      category: "",
      vendor: "",
      payment_method: "",
      date: new Date().toISOString().split('T')[0],
      status: "pending",
      receipt_url: "",
      notes: "",
    });
    setSelectedDate(new Date());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("Add New Expense")}</DialogTitle>
          <DialogDescription>
            {t("Create a new expense record for your clinic.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">{t("Title")} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder={t("e.g., Office supplies")}
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">{t("Description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder={t("Additional details about the expense...")}
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="amount">{t("Amount")} *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount || ""}
                onChange={(e) => handleInputChange("amount", parseFloat(e.target.value) || 0)}
                placeholder={t("0.00")}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">{t("Category")} *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("Select category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplies">{t("Supplies")}</SelectItem>
                  <SelectItem value="equipment">{t("Equipment")}</SelectItem>
                  <SelectItem value="utilities">{t("Utilities")}</SelectItem>
                  <SelectItem value="maintenance">{t("Maintenance")}</SelectItem>
                  <SelectItem value="staff">{t("Staff")}</SelectItem>
                  <SelectItem value="marketing">{t("Marketing")}</SelectItem>
                  <SelectItem value="insurance">{t("Insurance")}</SelectItem>
                  <SelectItem value="rent">{t("Rent")}</SelectItem>
                  <SelectItem value="other">{t("Other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment_method">{t("Payment Method")} *</Label>
              <Select value={formData.payment_method} onValueChange={(value) => handleInputChange("payment_method", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("Select payment method")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{t("Cash")}</SelectItem>
                  <SelectItem value="card">{t("Card")}</SelectItem>
                  <SelectItem value="bank_transfer">{t("Bank Transfer")}</SelectItem>
                  <SelectItem value="check">{t("Check")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">{t("Status")}</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("Select status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{t("Pending")}</SelectItem>
                  <SelectItem value="paid">{t("Paid")}</SelectItem>
                  <SelectItem value="cancelled">{t("Cancelled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t("Date")} *</Label>
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
                    {selectedDate ? format(selectedDate, "PPP") : t("Pick a date")}
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
              <Label htmlFor="vendor">{t("Vendor/Supplier")}</Label>
              <Input
                id="vendor"
                value={formData.vendor}
                onChange={(e) => handleInputChange("vendor", e.target.value)}
                placeholder={t("e.g., ABC Medical Supplies")}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="receipt_url">{t("Receipt URL")}</Label>
              <Input
                id="receipt_url"
                type="url"
                value={formData.receipt_url}
                onChange={(e) => handleInputChange("receipt_url", e.target.value)}
                placeholder="https://example.com/receipt.pdf"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">{t("Notes")}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder={t("Additional notes or remarks...")}
                className="min-h-[60px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {t("Cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("Create Expense")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;
