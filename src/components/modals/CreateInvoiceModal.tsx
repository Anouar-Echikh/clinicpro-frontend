import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import {
  Receipt,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { parseApiError } from "@/utils/errorHandler";
import { apiService } from "@/services/api";
import type { Patient, Appointment, Invoice } from "@/services/api";

interface CreateInvoiceModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: "service" | "medicine" | "test";
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ trigger, onSuccess }) => {
  const { formatCurrency } = useCurrencyFormat();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    appointmentId: "",
    dueDate: "",
    notes: "",
    discount: 0,
    tax: 10,
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
      type: "service",
    },
  ]);

  // State for API data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Load patients and appointments when modal opens
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [patientsResponse, appointmentsResponse] = await Promise.all([
        apiService.getPatients({ limit: 100 }),
        apiService.getAppointments({ limit: 100 })
      ]);

      // Safely handle the response data with fallbacks
      setPatients(patientsResponse?.data?.patients || []);
      setAppointments(appointmentsResponse?.data?.items || appointmentsResponse?.data?.appointments || []);
    } catch (error) {
      console.error('Error loading data:', error);
      // Set empty arrays as fallbacks on error
      setPatients([]);
      setAppointments([]);
      toast({
        title: "Error",
        description: parseApiError(error),
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const predefinedServices = [
    { name: "General Consultation", price: 100, type: "service" },
    { name: "Follow-up Visit", price: 75, type: "service" },
    { name: "Blood Test", price: 50, type: "test" },
    { name: "X-Ray", price: 120, type: "test" },
    { name: "Paracetamol 500mg", price: 5, type: "medicine" },
    { name: "Amoxicillin 250mg", price: 15, type: "medicine" },
  ];

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
      type: "service",
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Recalculate total when quantity or unit price changes
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }

          return updatedItem;
        }
        return item;
      }),
    );
  };

  const selectPredefinedService = (itemId: string, serviceName: string) => {
    const service = predefinedServices.find((s) => s.name === serviceName);
    if (service) {
      updateItem(itemId, "description", service.name);
      updateItem(itemId, "unitPrice", service.price);
      updateItem(itemId, "type", service.type);
      updateItem(
        itemId,
        "total",
        service.price * (items.find((i) => i.id === itemId)?.quantity || 1),
      );
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * formData.tax) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - formData.discount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare invoice data according to API schema
      const invoiceData: Omit<Invoice, '_id' | 'invoice_number' | 'created_at' | 'updated_at'> = {
        patient_id: formData.patientId,
        services: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total: item.total
        })),
        subtotal: calculateSubtotal(),
        tax_amount: calculateTax(),
        total_amount: calculateTotal(),
        status: 'pending',
        due_date: formData.dueDate,
        notes: formData.notes || undefined,
      };

      // Create invoice via API
      const newInvoice = await apiService.createInvoice(invoiceData);

      const selectedPatient = patients.find((p) => p._id === formData.patientId);

      toast({
        title: "Invoice created successfully",
        description: `Invoice ${newInvoice.invoice_number} for ${selectedPatient?.first_name} ${selectedPatient?.last_name} has been created. Total: ${formatCurrency(calculateTotal())}`,
      });

      // Reset form
      setFormData({
        patientId: "",
        appointmentId: "",
        dueDate: "",
        notes: "",
        discount: 0,
        tax: 10,
      });

      setItems([
        {
          id: "1",
          description: "",
          quantity: 1,
          unitPrice: 0,
          total: 0,
          type: "service",
        },
      ]);

      setOpen(false);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: parseApiError(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Receipt className="h-5 w-5 mr-2 text-green-600" />
            Create New Invoice
          </DialogTitle>
          <DialogDescription>
            Generate an invoice for services, medicines, or tests provided to a
            patient.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient and Appointment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-4 w-4 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientId">Select Patient *</Label>
                  <Select
                    value={formData.patientId}
                    onValueChange={(value) => handleChange("patientId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingData ? (
                        <SelectItem value="loading" disabled>
                          Loading patients...
                        </SelectItem>
                      ) : (patients || []).length === 0 ? (
                        <SelectItem value="no-patients" disabled>
                          No patients available
                        </SelectItem>
                      ) : (
                        (patients || []).map((patient) => (
                          <SelectItem key={patient._id} value={patient._id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {patient.first_name} {patient.last_name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {patient.phone}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointmentId">
                    Related Appointment (Optional)
                  </Label>
                  <Select
                    value={formData.appointmentId}
                    onValueChange={(value) =>
                      handleChange("appointmentId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Link to appointment" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingData ? (
                        <SelectItem value="loading" disabled>
                          Loading appointments...
                        </SelectItem>
                      ) : (appointments || []).length === 0 ? (
                        <SelectItem value="no-appointments" disabled>
                          No appointments available
                        </SelectItem>
                      ) : (
                        (appointments || []).map((appointment) => (
                          <SelectItem key={appointment._id} value={appointment._id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {appointment.type}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(appointment.appointment_date).toLocaleDateString()}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange("dueDate", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Invoice Items
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label>Description *</Label>
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          updateItem(item.id, "description", e.target.value)
                        }
                        placeholder="Service or item description"
                        required
                      />
                      <Select
                        onValueChange={(value) =>
                          selectPredefinedService(item.id, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Or select from list" />
                        </SelectTrigger>
                        <SelectContent>
                          {predefinedServices.map((service) => (
                            <SelectItem key={service.name} value={service.name}>
                              <div className="flex justify-between w-full">
                                <span>{service.name}</span>
                                <Badge variant="outline" className="ml-2">
                                  {service.type}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={item.type}
                        onValueChange={(value) =>
                          updateItem(item.id, "type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="medicine">Medicine</SelectItem>
                          <SelectItem value="test">Test</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "quantity",
                            parseInt(e.target.value) || 1,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Unit Price ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "unitPrice",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-semibold">
                      Total: <CurrencyDisplay amount={item.total} />
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount ($)</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount}
                    onChange={(e) =>
                      handleChange("discount", parseFloat(e.target.value) || 0)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax">Tax (%)</Label>
                  <Input
                    id="tax"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.tax}
                    onChange={(e) =>
                      handleChange("tax", parseFloat(e.target.value) || 0)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total Amount</Label>
                  <div className="text-2xl font-bold text-green-600">
                    <CurrencyDisplay amount={calculateTotal()} variant="large" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span><CurrencyDisplay amount={calculateSubtotal()} /></span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({formData.tax}%):</span>
                  <span><CurrencyDisplay amount={calculateTax()} /></span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-<CurrencyDisplay amount={formData.discount} /></span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span><CurrencyDisplay amount={calculateTotal()} /></span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Additional notes or payment terms..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Invoice...
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4 mr-2" />
                  Create Invoice
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceModal;
