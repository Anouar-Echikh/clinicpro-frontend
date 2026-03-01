import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Plus,
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
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { labVendorApi } from "@/services/api/labVendorApi";
import { CreateLabVendorRequest } from "@/types";

interface AddLabVendorModalProps {
  onVendorAdded?: () => void;
}

const AddLabVendorModal: React.FC<AddLabVendorModalProps> = ({ onVendorAdded }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);

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
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ];

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

  const generateVendorCode = () => {
    const nameCode = vendorData.name
      .split(" ")
      .map((word) => word.substring(0, 2).toUpperCase())
      .join("")
      .substring(0, 4);
    const timestamp = Date.now().toString().slice(-3);
    return `${nameCode}${timestamp}`;
  };

  const resetForm = () => {
    setVendorData({
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
      accreditation: [],
      specialties: [],
      rating: "",
      pricing: "",
      contractStart: "",
      contractEnd: "",
      notes: "",
    });
    setActiveTab("basic");
  };

  const validateForm = () => {
    const required = [
      "name",
      "type",
      "contactPerson",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "zipCode",
      "license",
    ];
    for (const field of required) {
      if (!vendorData[field as keyof typeof vendorData]) {
        toast({
          title: "Validation Error",
          description: `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`,
          variant: "destructive",
        });
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(vendorData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(vendorData.phone.replace(/[\s\-\(\)]/g, ""))) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return false;
    }

    // Website validation (if provided)
    if (vendorData.website && !vendorData.website.match(/^https?:\/\/.+/)) {
      toast({
        title: "Validation Error",
        description: "Website URL must start with http:// or https://",
        variant: "destructive",
      });
      return false;
    }

    // Date validation
    if (vendorData.contractStart && vendorData.contractEnd) {
      const startDate = new Date(vendorData.contractStart);
      const endDate = new Date(vendorData.contractEnd);
      if (endDate <= startDate) {
        toast({
          title: "Validation Error",
          description: "Contract end date must be after start date.",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const vendorCode = vendorData.code || generateVendorCode();

      const createData: CreateLabVendorRequest = {
        name: vendorData.name,
        code: vendorCode,
        type: vendorData.type as any,
        contactPerson: vendorData.contactPerson,
        email: vendorData.email,
        phone: vendorData.phone,
        address: vendorData.address,
        city: vendorData.city,
        state: vendorData.state,
        zipCode: vendorData.zipCode,
        website: vendorData.website || undefined,
        license: vendorData.license,
        accreditation: vendorData.accreditation,
        specialties: vendorData.specialties,
        rating: vendorData.rating ? parseFloat(vendorData.rating) : 0,
        totalTests: 0,
        averageTurnaround: "2-3 days",
        pricing: vendorData.pricing as any,
        contractStart: vendorData.contractStart,
        contractEnd: vendorData.contractEnd,
        notes: vendorData.notes || undefined,
        status: "active",
      };

      await labVendorApi.createLabVendor(createData);

      toast({
        title: "Lab Vendor Added",
        description: `${vendorData.name} has been added successfully with code: ${vendorCode}`,
      });

      setOpen(false);
      resetForm();
      
      // Call the callback to refresh the parent component
      if (onVendorAdded) {
        onVendorAdded();
      }
    } catch (error: any) {
      console.error("Error creating lab vendor:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      
      // Parse API error response
      let errorMessage = "Failed to add lab vendor. Please try again.";
      let errorTitle = "Error";
      
      // Check if this is an axios error with response
      if (error.response?.data) {
        const errorData = error.response.data;
        console.log("Parsed error data:", errorData);
        
        // Check if it's our API error format
        if (errorData.success === false && errorData.errors && Array.isArray(errorData.errors)) {
          errorTitle = errorData.message || "Validation Error";
          
          // Extract all error messages
          const errorMessages = errorData.errors.map((err: any) => {
            const fieldName = err.path ? formatFieldName(err.path) : 'Field';
            return `• ${fieldName}: ${err.msg}`;
          });
          
          console.log("Formatted error messages:", errorMessages);
          
          if (errorMessages.length === 1) {
            errorMessage = errorMessages[0].replace('• ', '');
          } else {
            errorMessage = `Please fix the following issues:\n${errorMessages.join('\n')}`;
          }
        }
        // Handle other error formats
        else if (errorData.message && errorData.errors && Array.isArray(errorData.errors)) {
          errorTitle = errorData.message;
          
          // Extract all error messages
          const errorMessages = errorData.errors.map((err: any) => {
            const fieldName = err.path ? formatFieldName(err.path) : 'Field';
            return `• ${fieldName}: ${err.msg}`;
          });
          
          if (errorMessages.length === 1) {
            errorMessage = errorMessages[0].replace('• ', '');
          } else {
            errorMessage = `Please fix the following issues:\n${errorMessages.join('\n')}`;
          }
        } 
        else if (errorData.message) {
          errorTitle = "Error";
          errorMessage = errorData.message;
        } 
        else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } 
      // Handle network errors or other error types
      else if (error.message) {
        errorMessage = error.message;
      }
      
      console.log("Final error message:", { errorTitle, errorMessage });
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatFieldName = (field: string) => {
    return field
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lab Vendor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Add New Lab Vendor</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="contract">Contract</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Lab Vendor Name *</Label>
                <Input
                  id="name"
                  value={vendorData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter vendor name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Vendor Code</Label>
                <Input
                  id="code"
                  value={vendorData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  placeholder="Auto-generated if empty"
                />
                <p className="text-xs text-gray-500">
                  Leave empty to auto-generate based on vendor name
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Vendor Type *</Label>
              <Select
                value={vendorData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="contactPerson"
                    value={vendorData.contactPerson}
                    onChange={(e) =>
                      handleInputChange("contactPerson", e.target.value)
                    }
                    placeholder="Contact person name"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">License Number *</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="license"
                    value={vendorData.license}
                    onChange={(e) =>
                      handleInputChange("license", e.target.value)
                    }
                    placeholder="License number"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={vendorData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="vendor@example.com"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={vendorData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1-555-123-4567"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="website"
                  value={vendorData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://vendor-website.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="address"
                  value={vendorData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Street address"
                  className="pl-10"
                  rows={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={vendorData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select
                  value={vendorData.state}
                  onValueChange={(value) => handleInputChange("state", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="State" />
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
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={vendorData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  placeholder="12345"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="credentials" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium flex items-center mb-3">
                  <Award className="h-4 w-4 mr-2" />
                  Accreditations
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {accreditationOptions.map((accreditation) => (
                    <div
                      key={accreditation}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`accreditation-${accreditation}`}
                        checked={vendorData.accreditation.includes(
                          accreditation,
                        )}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            "accreditation",
                            accreditation,
                            checked as boolean,
                          )
                        }
                      />
                      <Label
                        htmlFor={`accreditation-${accreditation}`}
                        className="text-sm"
                      >
                        {accreditation}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium flex items-center mb-3">
                  <TestTube2 className="h-4 w-4 mr-2" />
                  Specialties
                </Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {specialtyOptions.map((specialty) => (
                    <div
                      key={specialty}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`specialty-${specialty}`}
                        checked={vendorData.specialties.includes(specialty)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            "specialties",
                            specialty,
                            checked as boolean,
                          )
                        }
                      />
                      <Label
                        htmlFor={`specialty-${specialty}`}
                        className="text-sm"
                      >
                        {specialty}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Initial Rating</Label>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={vendorData.rating}
                    onChange={(e) =>
                      handleInputChange("rating", e.target.value)
                    }
                    placeholder="4.5"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">Rating out of 5 stars</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricing">Pricing Tier</Label>
                <Select
                  value={vendorData.pricing}
                  onValueChange={(value) => handleInputChange("pricing", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pricing tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {pricingOptions.map((pricing) => (
                      <SelectItem key={pricing.value} value={pricing.value}>
                        {pricing.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={vendorData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any additional information about the vendor..."
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="contract" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractStart">Contract Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="contractStart"
                    type="date"
                    value={vendorData.contractStart}
                    onChange={(e) =>
                      handleInputChange("contractStart", e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractEnd">Contract End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="contractEnd"
                    type="date"
                    value={vendorData.contractEnd}
                    onChange={(e) =>
                      handleInputChange("contractEnd", e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">
                  Vendor Summary
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Name:</strong> {vendorData.name || "Not specified"}
                </p>
                <p>
                  <strong>Type:</strong>{" "}
                  {vendorTypes.find((t) => t.value === vendorData.type)
                    ?.label || "Not specified"}
                </p>
                <p>
                  <strong>Contact:</strong>{" "}
                  {vendorData.contactPerson || "Not specified"}
                </p>
                <p>
                  <strong>Email:</strong> {vendorData.email || "Not specified"}
                </p>
                <p>
                  <strong>Phone:</strong> {vendorData.phone || "Not specified"}
                </p>
                <p>
                  <strong>Location:</strong>{" "}
                  {vendorData.city && vendorData.state
                    ? `${vendorData.city}, ${vendorData.state}`
                    : "Not specified"}
                </p>
                <p>
                  <strong>Accreditations:</strong>{" "}
                  {vendorData.accreditation.length > 0
                    ? vendorData.accreditation.join(", ")
                    : "None selected"}
                </p>
                <p>
                  <strong>Specialties:</strong>{" "}
                  {vendorData.specialties.length > 0
                    ? vendorData.specialties.slice(0, 3).join(", ") +
                      (vendorData.specialties.length > 3 ? "..." : "")
                    : "None selected"}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="flex justify-between space-x-2 pt-4">
          <Button variant="outline" onClick={resetForm}>
            Reset Form
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
                          <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Vendor"}
              </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddLabVendorModal;
