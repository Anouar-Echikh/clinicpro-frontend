import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Phone, Mail, Globe, Settings } from "lucide-react";

interface AddClinicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (clinicData: ClinicFormData) => void;
}

interface ClinicFormData {
  name: string;
  code: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  settings: {
    timezone: string;
    currency: string;
    language: string;
    working_hours: {
      monday: { start: string; end: string; isWorking: boolean };
      tuesday: { start: string; end: string; isWorking: boolean };
      wednesday: { start: string; end: string; isWorking: boolean };
      thursday: { start: string; end: string; isWorking: boolean };
      friday: { start: string; end: string; isWorking: boolean };
      saturday: { start: string; end: string; isWorking: boolean };
      sunday: { start: string; end: string; isWorking: boolean };
    };
  };
  is_active: boolean;
}

const timezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver", 
  "America/Los_Angeles",
  "America/Phoenix",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Australia/Sydney",
];

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "CNY", label: "CNY - Chinese Yuan" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "AED", label: "AED - UAE Dirham" },
  { value: "SAR", label: "SAR - Saudi Riyal" },
  { value: "TZS", label: "TZS - Tanzanian Shilling" },
];

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
];

const defaultWorkingHours = {
  monday: { start: "09:00", end: "17:00", isWorking: true },
  tuesday: { start: "09:00", end: "17:00", isWorking: true },
  wednesday: { start: "09:00", end: "17:00", isWorking: true },
  thursday: { start: "09:00", end: "17:00", isWorking: true },
  friday: { start: "09:00", end: "17:00", isWorking: true },
  saturday: { start: "09:00", end: "13:00", isWorking: false },
  sunday: { start: "00:00", end: "00:00", isWorking: false },
};

const AddClinicModal: React.FC<AddClinicModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  console.log('🎭 AddClinicModal rendered with props:', { isOpen });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ClinicFormData>({
    name: "",
    code: "",
    description: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
    },
    contact: {
      phone: "",
      email: "",
      website: undefined,
    },
    settings: {
      timezone: "America/New_York",
      currency: "USD",
      language: "en",
      working_hours: defaultWorkingHours,
    },
    is_active: true,
  });

  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const keys = name.split(".");
    
    // Auto-uppercase clinic code
    const finalValue = name === 'code' ? value.toUpperCase() : value;

    if (keys.length === 1) {
      setFormData({ ...formData, [name]: finalValue });
    } else if (keys.length === 2) {
      const [parentKey, childKey] = keys;
      setFormData({
        ...formData,
        [parentKey]: { ...(formData as any)[parentKey], [childKey]: finalValue },
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    const keys = name.split(".");
    
    if (keys.length === 1) {
      setFormData({ ...formData, [name]: value });
    } else if (keys.length === 2) {
      const [parentKey, childKey] = keys;
      setFormData({
        ...formData,
        [parentKey]: { ...(formData as any)[parentKey], [childKey]: value },
      });
    }
  };

  const handleWorkingHoursChange = (day: string, field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        working_hours: {
          ...formData.settings.working_hours,
          [day]: {
            ...formData.settings.working_hours[day as keyof typeof formData.settings.working_hours],
            [field]: value,
          },
        },
      },
    });
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = t("Clinic name is required");
    if (!formData.code.trim()) {
      newErrors.code = t("Clinic code is required");
    } else {
      // Clinic code validation - must contain only uppercase letters and numbers
      const codeRegex = /^[A-Z0-9]+$/;
      if (!codeRegex.test(formData.code)) {
        newErrors.code = t("Clinic code must contain only uppercase letters and numbers");
      }
    }
    if (!formData.address.street.trim()) newErrors["address.street"] = t("Street address is required");
    if (!formData.address.city.trim()) newErrors["address.city"] = t("City is required");
    if (!formData.address.state.trim()) newErrors["address.state"] = t("State is required");
    if (!formData.address.zipCode.trim()) newErrors["address.zipCode"] = t("Zip code is required");
    if (!formData.contact.phone.trim()) newErrors["contact.phone"] = t("Phone number is required");
    if (!formData.contact.email.trim()) newErrors["contact.email"] = t("Email is required");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.contact.email && !emailRegex.test(formData.contact.email)) {
      newErrors["contact.email"] = t("Please enter a valid email address");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
      },
      contact: {
        phone: "",
        email: "",
        website: undefined,
      },
      settings: {
        timezone: "America/New_York",
        currency: "USD",
        language: "en",
        working_hours: defaultWorkingHours,
      },
      is_active: true,
    });
    setErrors({});
    onClose();
  };

  const handleCancel = () => {
    navigate('/login');
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        console.log('🎭 Dialog onOpenChange called with:', open);
        if (!open) handleClose();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>{t("Add New Clinic")}</span>
          </DialogTitle>
          <DialogDescription>
            {t("Create a new clinic location with its contact information and settings.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("Basic Information")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("Clinic Name")} *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder={t("Enter clinic name")}
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">{t("Clinic Code")} *</Label>
                  <Input
                    id="code"
                    name="code"
                    placeholder={t("Enter clinic code (e.g., CLN001)")}
                    value={formData.code}
                    onChange={handleInputChange}
                    className={errors.code ? "border-red-500" : ""}
                    style={{ textTransform: 'uppercase' }}
                  />
                  <p className="text-xs text-gray-500">{t("Only uppercase letters and numbers allowed (automatically converted)")}</p>
                  {errors.code && (
                    <p className="text-sm text-red-500">{errors.code}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("Description")}</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder={t("Enter clinic description (optional)")}
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">{t("Active")}</Label>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{t("Address Information")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address.street">{t("Street Address")} *</Label>
                <Input
                  id="address.street"
                  name="address.street"
                  placeholder={t("Enter street address")}
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className={errors["address.street"] ? "border-red-500" : ""}
                />
                {errors["address.street"] && (
                  <p className="text-sm text-red-500">{errors["address.street"]}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address.city">{t("City")} *</Label>
                  <Input
                    id="address.city"
                    name="address.city"
                    placeholder={t("City")}
                    value={formData.address.city}
                    onChange={handleInputChange}
                    className={errors["address.city"] ? "border-red-500" : ""}
                  />
                  {errors["address.city"] && (
                    <p className="text-sm text-red-500">{errors["address.city"]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.state">{t("State")} *</Label>
                  <Input
                    id="address.state"
                    name="address.state"
                    placeholder={t("State")}
                    value={formData.address.state}
                    onChange={handleInputChange}
                    className={errors["address.state"] ? "border-red-500" : ""}
                  />
                  {errors["address.state"] && (
                    <p className="text-sm text-red-500">{errors["address.state"]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.zipCode">{t("Zip Code")} *</Label>
                  <Input
                    id="address.zipCode"
                    name="address.zipCode"
                    placeholder={t("Zip Code")}
                    value={formData.address.zipCode}
                    onChange={handleInputChange}
                    className={errors["address.zipCode"] ? "border-red-500" : ""}
                  />
                  {errors["address.zipCode"] && (
                    <p className="text-sm text-red-500">{errors["address.zipCode"]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.country">{t("Country")}</Label>
                  <Input
                    id="address.country"
                    name="address.country"
                    placeholder={t("Country")}
                    value={formData.address.country}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{t("Contact Information")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact.phone">{t("Phone Number")} *</Label>
                  <Input
                    id="contact.phone"
                    name="contact.phone"
                    placeholder={t("Enter phone number")}
                    value={formData.contact.phone}
                    onChange={handleInputChange}
                    className={errors["contact.phone"] ? "border-red-500" : ""}
                  />
                  {errors["contact.phone"] && (
                    <p className="text-sm text-red-500">{errors["contact.phone"]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact.email">{t("Email Address")} *</Label>
                  <Input
                    id="contact.email"
                    name="contact.email"
                    type="email"
                    placeholder={t("Enter email address")}
                    value={formData.contact.email}
                    onChange={handleInputChange}
                    className={errors["contact.email"] ? "border-red-500" : ""}
                  />
                  {errors["contact.email"] && (
                    <p className="text-sm text-red-500">{errors["contact.email"]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact.website">{t("Website (Optional)")}</Label>
                <Input
                  id="contact.website"
                  name="contact.website"
                  placeholder="https://www.example.com"
                                      value={formData.contact.website || ""}
                    onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>{t("Clinic Settings")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="settings.timezone">{t("Timezone")}</Label>
                  <Select
                    value={formData.settings.timezone}
                    onValueChange={(value) => handleSelectChange("settings.timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select timezone")} />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((timezone) => (
                        <SelectItem key={timezone} value={timezone}>
                          {timezone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings.currency">{t("Currency")}</Label>
                  <Select
                    value={formData.settings.currency}
                    onValueChange={(value) => handleSelectChange("settings.currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select currency")} />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings.language">{t("Language")}</Label>
                  <Select
                    value={formData.settings.language}
                    onValueChange={(value) => handleSelectChange("settings.language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select language")} />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.value} value={language.value}>
                          {language.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Working Hours */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">{t("Working Hours")}</Label>
                <div className="space-y-3">
                  {Object.entries(formData.settings.working_hours).map(([day, schedule]) => (
                    <div key={day} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="w-20">
                        <span className="text-sm font-medium capitalize">{day}</span>
                      </div>
                      <Switch
                        checked={schedule.isWorking}
                        onCheckedChange={(checked) =>
                          handleWorkingHoursChange(day, "isWorking", checked)
                        }
                      />
                      {schedule.isWorking && (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="time"
                            value={schedule.start}
                            onChange={(e) =>
                              handleWorkingHoursChange(day, "start", e.target.value)
                            }
                            className="w-24"
                          />
                          <span className="text-sm text-gray-500">{t("to")}</span>
                          <Input
                            type="time"
                            value={schedule.end}
                            onChange={(e) =>
                              handleWorkingHoursChange(day, "end", e.target.value)
                            }
                            className="w-24"
                          />
                        </div>
                      )}
                      {!schedule.isWorking && (
                        <span className="text-sm text-gray-500">{t("Closed")}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t("Cancel")}
            </Button>
            <Button type="submit">{t("Add Clinic")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddClinicModal; 