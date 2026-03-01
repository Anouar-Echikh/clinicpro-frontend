import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { labVendorApi } from "@/services/api/labVendorApi";
import { LabVendor } from "@/types";

interface ViewVendorDetailsModalProps {
  vendorId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewVendorDetailsModal: React.FC<ViewVendorDetailsModalProps> = ({
  vendorId,
  isOpen,
  onClose,
}) => {
  const [vendor, setVendor] = useState<LabVendor | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (vendorId && isOpen) {
      fetchVendorDetails();
    }
  }, [vendorId, isOpen]);

  const fetchVendorDetails = async () => {
    if (!vendorId) return;
    
    try {
      setIsLoading(true);
      const vendorData = await labVendorApi.getLabVendorById(vendorId);
      setVendor(vendorData);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case "budget":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-blue-100 text-blue-800";
      case "premium":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "diagnostic_lab":
        return "Diagnostic Lab";
      case "pathology_lab":
        return "Pathology Lab";
      case "imaging_center":
        return "Imaging Center";
      case "reference_lab":
        return "Reference Lab";
      case "specialty_lab":
        return "Specialty Lab";
      default:
        return type;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-2">({rating})</span>
      </div>
    );
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!vendor && !isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {isLoading ? "Loading..." : vendor?.name}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
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
        ) : vendor ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="contract">Contract</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Vendor Code
                        </label>
                        <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {vendor.code}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Type
                        </label>
                        <p className="text-sm">{getTypeLabel(vendor.type)}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Status
                      </label>
                      <div className="mt-1">
                        <Badge className={getStatusColor(vendor.status)}>
                          {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        License Number
                      </label>
                      <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {vendor.license}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TestTube2 className="h-5 w-5 mr-2" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Rating
                      </label>
                      <div className="mt-1">
                        {renderStars(vendor.rating)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Total Tests
                        </label>
                        <p className="text-2xl font-bold text-blue-600">
                          {vendor.totalTests.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Avg. Turnaround
                        </label>
                        <p className="text-sm flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {vendor.averageTurnaround}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Pricing Tier
                      </label>
                      <div className="mt-1">
                        <Badge className={getPricingColor(vendor.pricing)}>
                          {vendor.pricing.charAt(0).toUpperCase() + vendor.pricing.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Accreditations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Accreditations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {vendor.accreditation.map((acc) => (
                      <Badge key={acc} variant="outline" className="bg-green-50">
                        {acc}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {vendor.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {vendor.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Person */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Contact Person
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Name
                      </label>
                      <p className="text-lg font-semibold">{vendor.contactPerson}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <a href={`mailto:${vendor.email}`} className="text-blue-600 hover:underline">
                          {vendor.email}
                        </a>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <a href={`tel:${vendor.phone}`} className="text-blue-600 hover:underline">
                          {vendor.phone}
                        </a>
                      </div>
                      {vendor.website && (
                        <div className="flex items-center text-sm">
                          <Globe className="h-4 w-4 mr-2 text-gray-400" />
                          <a
                            href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {vendor.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">{vendor.address}</p>
                      <p className="text-sm">
                        {vendor.city}, {vendor.state} {vendor.zipCode}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TestTube2 className="h-5 w-5 mr-2" />
                    Specialties & Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {vendor.specialties.map((specialty) => (
                      <div
                        key={specialty}
                        className="flex items-center p-3 bg-blue-50 rounded-lg"
                      >
                        <TestTube2 className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium">{specialty}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contract" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Contract Period
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Start Date
                      </label>
                      <p className="text-sm">{formatDate(vendor.contractStart)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        End Date
                      </label>
                      <p className="text-sm">{formatDate(vendor.contractEnd)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Days Remaining
                      </label>
                      <p className="text-sm">
                        {Math.ceil((new Date(vendor.contractEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Last Test Date
                      </label>
                      <p className="text-sm">
                        {vendor.lastTestDate
                          ? formatDate(vendor.lastTestDate)
                          : "No tests yet"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Account Created
                      </label>
                      <p className="text-sm">{formatDate(vendor.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Last Updated
                      </label>
                      <p className="text-sm">{formatDate(vendor.updatedAt)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default ViewVendorDetailsModal; 