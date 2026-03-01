import React, { useState } from "react";
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
import {
  Plus,
  Package,
  Factory,
  Calendar,
  DollarSign,
  AlertTriangle,
  Truck,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { apiService } from "@/services/api";
import type { InventoryItem } from "@/types";

interface AddItemModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ trigger, onSuccess }) => {
  const { formatCurrency } = useCurrencyFormat();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    manufacturer: "",
    batchNumber: "",
    expiryDate: "",
    quantity: "",
    unitPrice: "",
    supplier: "",
    description: "",
    lowStockAlert: "",
  });

  const predefinedCategories = [
    "medications",
    "medical-devices",
    "consumables",
    "equipment",
    "laboratory",
    "office-supplies",
    "other",
  ];

  const predefinedSuppliers = [
    "MedSupply Co.",
    "PharmaCorp",
    "Specialty Meds",
    "General Supplies",
    "AntiBio Labs",
    "DiabetCare Inc.",
    "MedWrap Ltd.",
    "CleanMed Corp",
    "SurgiTech",
    "LabMax",
    "Other",
  ];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = [
      "name",
      "category",
      "manufacturer",
      "quantity",
      "unitPrice",
    ];
    const missing = required.filter(
      (field) => !formData[field as keyof typeof formData],
    );

    if (missing.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${missing.join(", ")}`,
        variant: "destructive",
      });
      return false;
    }

    const quantity = parseInt(formData.quantity);
    const unitPrice = parseFloat(formData.unitPrice);
    const lowStockAlert = formData.lowStockAlert
      ? parseInt(formData.lowStockAlert)
      : 0;

    if (quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Quantity must be greater than 0",
        variant: "destructive",
      });
      return false;
    }

    if (unitPrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Unit price must be greater than 0",
        variant: "destructive",
      });
      return false;
    }

    if (lowStockAlert < 0) {
      toast({
        title: "Validation Error",
        description: "Low stock alert cannot be negative",
        variant: "destructive",
      });
      return false;
    }

    if (formData.expiryDate) {
      const expiryDate = new Date(formData.expiryDate);
      const today = new Date();
      if (expiryDate <= today) {
        toast({
          title: "Validation Error",
          description: "Expiry date must be in the future",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare inventory item data according to API schema
      const inventoryData = {
        name: formData.name,
        category: formData.category as "medications" | "medical-devices" | "consumables" | "equipment" | "laboratory" | "office-supplies" | "other",
        sku: formData.batchNumber || `SKU-${Date.now()}`, // Generate SKU if not provided
        current_stock: parseInt(formData.quantity),
        minimum_stock: parseInt(formData.lowStockAlert) || 10,
        unit_price: parseFloat(formData.unitPrice),
        supplier: formData.supplier || 'Unknown',
        expiry_date: formData.expiryDate || undefined,
      };

      // Create inventory item via API
      const newItem = await apiService.createInventoryItem(inventoryData);

      const totalValue = newItem.current_stock * newItem.unit_price;

      toast({
        title: "Item added successfully",
        description: `${newItem.name} has been added to inventory with a total value of ${formatCurrency(totalValue)}.`,
      });

      // Reset form
      setFormData({
        name: "",
        category: "",
        manufacturer: "",
        batchNumber: "",
        expiryDate: "",
        quantity: "",
        unitPrice: "",
        supplier: "",
        description: "",
        lowStockAlert: "",
      });

      setOpen(false);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating inventory item:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateBatchNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const manufacturerCode =
      formData.manufacturer.substring(0, 2).toUpperCase() || "XX";
    return `${manufacturerCode}${year}${random}`;
  };

  const handleGenerateBatch = () => {
    if (formData.manufacturer) {
      const batchNumber = generateBatchNumber();
      handleChange("batchNumber", batchNumber);
    } else {
      toast({
        title: "Info",
        description:
          "Please select a manufacturer first to generate batch number",
        variant: "default",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Package className="h-5 w-5 mr-2 text-blue-600" />
            Add New Inventory Item
          </DialogTitle>
          <DialogDescription>
            Add medicines, medical supplies, or equipment to your inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g., Paracetamol 500mg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Brief description of the item..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Manufacturer & Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Factory className="h-4 w-4 mr-2" />
                Manufacturer & Supplier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer *</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) =>
                      handleChange("manufacturer", e.target.value)
                    }
                    placeholder="e.g., PharmaCorp"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Select
                    value={formData.supplier}
                    onValueChange={(value) => handleChange("supplier", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedSuppliers.map((supplier) => (
                        <SelectItem key={supplier} value={supplier}>
                          {supplier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number</Label>
                <div className="flex space-x-2">
                  <Input
                    id="batchNumber"
                    value={formData.batchNumber}
                    onChange={(e) =>
                      handleChange("batchNumber", e.target.value)
                    }
                    placeholder="e.g., PC2024001"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateBatch}
                    className="whitespace-nowrap"
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock & Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Stock & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleChange("quantity", e.target.value)}
                    placeholder="100"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price ($) *</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitPrice}
                    onChange={(e) => handleChange("unitPrice", e.target.value)}
                    placeholder="0.25"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lowStockAlert">Low Stock Alert</Label>
                  <Input
                    id="lowStockAlert"
                    type="number"
                    min="0"
                    value={formData.lowStockAlert}
                    onChange={(e) =>
                      handleChange("lowStockAlert", e.target.value)
                    }
                    placeholder="20"
                  />
                </div>
              </div>

              {formData.quantity && formData.unitPrice && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-blue-700">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span className="font-medium">
                      Total Value: $
                      {(
                        parseInt(formData.quantity || "0") *
                        parseFloat(formData.unitPrice || "0")
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expiry Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Expiry Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleChange("expiryDate", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              {formData.expiryDate && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center text-orange-700">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      Expires on{" "}
                      {new Date(formData.expiryDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
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
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Adding Item...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;
