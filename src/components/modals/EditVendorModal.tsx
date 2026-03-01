import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Award,
  TestTube2,
  Star,
  DollarSign,
  Calendar,
  X,
  Save,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { labVendorApi } from "@/services/api/labVendorApi";
import { LabVendor, CreateLabVendorRequest } from "@/types";

interface EditVendorModalProps {
  vendorId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onVendorUpdated?: () => void;
}

const EditVendorModal: React.FC<EditVendorModalProps> = ({
  vendorId,
  isOpen,
  onClose,
  onVendorUpdated,
}) => {
  const [vendor, setVendor] = useState<LabVendor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Form state
  const [vendorData, setVendorData] = useState({
    name: "",
    code: "",
    type: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    website: "",
    license: "",
    accreditation: [] as string[],
    specialties: [] as string[],
    rating: "",
    pricing: "",
    contractStart: "",
    contractEnd: "",
    notes: "",
  });

  // Predefined options
  const vendorTypes = [
    { value: "diagnostic_lab", label: "Diagnostic Laboratory" },
    { value: "pathology_lab", label: "Pathology Laboratory" },
    { value: "imaging_center", label: "Imaging Center" },
    { value: "reference_lab", label: "Reference Laboratory" },
    { value: "specialty_lab", label: "Specialty Laboratory" },
  ];

  const accreditationOptions = [
    "CLIA",
    "CAP",
    "AABB",
    "NABL",
    "ISO 15189",
    "JCAHO",
    "COLA",
    "TJC",
  ];

  const specialtyOptions = [
    "Hematology",
    "Clinical Chemistry",
    "Microbiology",
    "Immunology",
    "Molecular Diagnostics",
    "Cytopathology",
    "Histopathology",
    "Toxicology",
    "Genetics",
    "Blood Banking",
    "Serology",
    "Coagulation",
    "Endocrinology",
    "Cardiology",
    "Oncology",
    "Infectious Disease",
    "Allergy Testing",
  ];

  const pricingOptions = [
    { value: "budget", label: "Budget-Friendly" },
    { value: "moderate", label: "Moderate Pricing" },
    { value: "premium", label: "Premium Services" },
  ];

  const usStates = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  ];

  useEffect(() => {
    if (vendorId && isOpen) {
      fetchVendorDetails();
    }
  }, [vendorId, isOpen]);

  const fetchVendorDetails = async () => {
    if (!vendorId) return;
    
    try {
      setIsLoading(true);
      const vendorDetails = await labVendorApi.getLabVendorById(vendorId);
      setVendor(vendorDetails);
      
      // Populate form with vendor data
      setVendorData({
        name: vendorDetails.name,
        code: vendorDetails.code,
        type: vendorDetails.type,
        contactPerson: vendorDetails.contactPerson,
        email: vendorDetails.email,
        phone: vendorDetails.phone,
        address: vendorDetails.address,
        city: vendorDetails.city,
        state: vendorDetails.state,
        zipCode: vendorDetails.zipCode,
        website: vendorDetails.website || "",
        license: vendorDetails.license,
        accreditation: vendorDetails.accreditation,
        specialties: vendorDetails.specialties,
        rating: vendorDetails.rating.toString(),
        pricing: vendorDetails.pricing,
        contractStart: vendorDetails.contractStart.toISOString().split('T')[0],
        contractEnd: vendorDetails.contractEnd.toISOString().split('T')[0],
        notes: vendorDetails.notes || "",
      });
    } catch (error) {
      console.error("Error fetching vendor details:", error);
      toast({
        title: "Error",
        description: "Failed to load vendor details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setVendorData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckboxChange = (
    field: "accreditation" | "specialties",
    value: string,
    checked: boolean,
  ) => {
    setVendorData((prev) => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value),
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    // Required fields validation
    if (!vendorData.name.trim()) errors.push("Vendor name is required");
    if (!vendorData.code.trim()) errors.push("Vendor code is required");
    if (!vendorData.type) errors.push("Vendor type is required");
    if (!vendorData.contactPerson.trim()) errors.push("Contact person is required");
    if (!vendorData.email.trim()) errors.push("Email is required");
    if (!vendorData.phone.trim()) errors.push("Phone is required");
    if (!vendorData.address.trim()) errors.push("Address is required");
    if (!vendorData.city.trim()) errors.push("City is required");
    if (!vendorData.state) errors.push("State is required");
    if (!vendorData.zipCode.trim()) errors.push("ZIP code is required");
    if (!vendorData.license.trim()) errors.push("License is required");
    if (!vendorData.pricing) errors.push("Pricing tier is required");
    if (!vendorData.contractStart) errors.push("Contract start date is required");
    if (!vendorData.contractEnd) errors.push("Contract end date is required");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (vendorData.email && !emailRegex.test(vendorData.email)) {
      errors.push("Please enter a valid email address");
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (vendorData.phone && !phoneRegex.test(vendorData.phone.replace(/[-\s\(\)]/g, ""))) {
      errors.push("Please enter a valid phone number");
    }

    // ZIP code validation
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (vendorData.zipCode && !zipRegex.test(vendorData.zipCode)) {
      errors.push("Please enter a valid ZIP code (e.g., 12345 or 12345-6789)");
    }

    // Date validation
    if (vendorData.contractStart && vendorData.contractEnd) {
      const startDate = new Date(vendorData.contractStart);
      const endDate = new Date(vendorData.contractEnd);
      
      if (endDate <= startDate) {
        errors.push("Contract end date must be after start date");
      }
    }

    // Rating validation
    if (vendorData.rating) {
      const rating = parseFloat(vendorData.rating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        errors.push("Rating must be between 0 and 5");
      }
    }

    // Arrays validation
    if (vendorData.accreditation.length === 0) {
      errors.push("At least one accreditation is required");
    }

    if (vendorData.specialties.length === 0) {
      errors.push("At least one specialty is required");
    }

    return errors;
  };

  const handleSave = async () => {
    if (!vendorId) return;

    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      const updateData: Partial<CreateLabVendorRequest> = {
        name: vendorData.name.trim(),
        code: vendorData.code.trim().toUpperCase(),
        type: vendorData.type as any,
        contactPerson: vendorData.contactPerson.trim(),
        email: vendorData.email.trim().toLowerCase(),
        phone: vendorData.phone.trim(),
        address: vendorData.address.trim(),
        city: vendorData.city.trim(),
        state: vendorData.state,
        zipCode: vendorData.zipCode.trim(),
        website: vendorData.website.trim() || undefined,
        license: vendorData.license.trim(),
        accreditation: vendorData.accreditation,
        specialties: vendorData.specialties,
        rating: vendorData.rating ? parseFloat(vendorData.rating) : undefined,
        pricing: vendorData.pricing as any,
        contractStart: vendorData.contractStart,
        contractEnd: vendorData.contractEnd,
        notes: vendorData.notes.trim() || undefined,
      };

      await labVendorApi.updateLabVendor(vendorId, updateData);

      toast({
        title: "Success",
        description: "Vendor updated successfully!",
      });

      onVendorUpdated?.();
      onClose();
    } catch (error: any) {
      console.error("Error updating vendor:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update vendor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setActiveTab("basic");
    onClose();
  };

  if (!vendor && !isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {isLoading ? "Loading..." : `Edit ${vendor?.name}`}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading vendor details...</p>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="contract">Contract</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Vendor Name *</Label>
                    <Input
                      id="name"
                      value={vendorData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter vendor name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="code">Vendor Code *</Label>
                    <Input
                      id="code"
                      value={vendorData.code}
                      onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                      placeholder="Enter vendor code"
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Vendor Type *</Label>
                    <Select value={vendorData.type} onValueChange={(value) => handleInputChange("type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vendor type" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendorTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="license">License Number *</Label>
                    <Input
                      id="license"
                      value={vendorData.license}
                      onChange={(e) => handleInputChange("license", e.target.value)}
                      placeholder="Enter license number"
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating (0-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={vendorData.rating}
                      onChange={(e) => handleInputChange("rating", e.target.value)}
                      placeholder="Enter rating"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricing">Pricing Tier *</Label>
                    <Select value={vendorData.pricing} onValueChange={(value) => handleInputChange("pricing", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing tier" />
                      </SelectTrigger>
                      <SelectContent>
                        {pricingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      value={vendorData.contactPerson}
                      onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                      placeholder="Enter contact person name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={vendorData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={vendorData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={vendorData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="Enter website URL"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={vendorData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Enter street address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={vendorData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Select value={vendorData.state} onValueChange={(value) => handleInputChange("state", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {usStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={vendorData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      placeholder="Enter ZIP code"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-semibold">Accreditations *</Label>
                  <p className="text-sm text-gray-600 mb-4">
                    Select all applicable accreditations
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {accreditationOptions.map((accreditation) => (
                      <div key={accreditation} className="flex items-center space-x-2">
                        <Checkbox
                          id={`accreditation-${accreditation}`}
                          checked={vendorData.accreditation.includes(accreditation)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("accreditation", accreditation, !!checked)
                          }
                        />
                        <Label
                          htmlFor={`accreditation-${accreditation}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {accreditation}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-base font-semibold">Specialties *</Label>
                  <p className="text-sm text-gray-600 mb-4">
                    Select all applicable specialties
                  </p>
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                    {specialtyOptions.map((specialty) => (
                      <div key={specialty} className="flex items-center space-x-2">
                        <Checkbox
                          id={`specialty-${specialty}`}
                          checked={vendorData.specialties.includes(specialty)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("specialties", specialty, !!checked)
                          }
                        />
                        <Label
                          htmlFor={`specialty-${specialty}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {specialty}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contract" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contractStart">Contract Start Date *</Label>
                    <Input
                      id="contractStart"
                      type="date"
                      value={vendorData.contractStart}
                      onChange={(e) => handleInputChange("contractStart", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contractEnd">Contract End Date *</Label>
                    <Input
                      id="contractEnd"
                      type="date"
                      value={vendorData.contractEnd}
                      onChange={(e) => handleInputChange("contractEnd", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={vendorData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Enter any additional notes or comments"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditVendorModal; 