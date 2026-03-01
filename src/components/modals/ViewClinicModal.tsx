import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Settings, 
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar 
} from "lucide-react";

interface ViewClinicModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinic: Clinic;
}

interface Clinic {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

const ViewClinicModal: React.FC<ViewClinicModalProps> = ({
  isOpen,
  onClose,
  clinic,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}:00`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <AlertCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ar: "Arabic",
      hi: "Hindi",
      zh: "Chinese",
      ja: "Japanese",
    };
    return languages[code] || code.toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>{clinic.name}</span>
            </div>
            {getStatusBadge(clinic.is_active)}
          </DialogTitle>
          <DialogDescription>
            Complete clinic information and settings overview
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Clinic Name</label>
                  <p className="text-lg font-semibold">{clinic.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Clinic Code</label>
                  <p className="text-lg font-mono">{clinic.code}</p>
                </div>
              </div>
              
              {clinic.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-700 mt-1">{clinic.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="flex items-center text-gray-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(clinic.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="flex items-center text-gray-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(clinic.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Address Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{clinic.address.street}</p>
                <p className="text-gray-600">
                  {clinic.address.city}, {clinic.address.state} {clinic.address.zipCode}
                </p>
                <p className="text-gray-600">{clinic.address.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="flex items-center text-gray-700">
                    <Phone className="h-4 w-4 mr-2" />
                    {clinic.contact.phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email Address</label>
                  <p className="flex items-center text-gray-700">
                    <Mail className="h-4 w-4 mr-2" />
                    {clinic.contact.email}
                  </p>
                </div>
              </div>
              
              {clinic.contact.website && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Website</label>
                  <p className="flex items-center text-gray-700">
                    <Globe className="h-4 w-4 mr-2" />
                    <a 
                      href={clinic.contact.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {clinic.contact.website}
                    </a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Clinic Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Timezone</label>
                  <p className="text-gray-700">{clinic.settings.timezone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Currency</label>
                  <div className="text-gray-700">
                    <Badge variant="outline">{clinic.settings.currency}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Language</label>
                  <p className="text-gray-700">{getLanguageName(clinic.settings.language)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Working Hours</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(clinic.settings.working_hours).map(([day, schedule]) => (
                  <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium capitalize w-20">{day}</span>
                      {schedule.isWorking ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Open
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Closed
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {schedule.isWorking ? (
                        <span>
                          {formatTime(schedule.start)} - {formatTime(schedule.end)}
                        </span>
                      ) : (
                        <span>Closed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewClinicModal; 