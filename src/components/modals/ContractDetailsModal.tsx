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
import {
  Calendar,
  FileText,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  Bell,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { labVendorApi, ContractDetails } from "@/services/api/labVendorApi";

interface ContractDetailsModalProps {
  vendorId: string | null;
  vendorName?: string;
  isOpen: boolean;
  onClose: () => void;
}

const ContractDetailsModal: React.FC<ContractDetailsModalProps> = ({
  vendorId,
  vendorName,
  isOpen,
  onClose,
}) => {
  const [contract, setContract] = useState<ContractDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock contract data for demonstration
  const mockContract: ContractDetails = {
    id: "CON-001",
    vendorId: vendorId || "",
    contractNumber: "LAB-CON-2024-001",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    renewalDate: new Date("2024-11-01"),
    status: "active",
    terms: "Standard laboratory services contract with guaranteed turnaround times and quality metrics. Vendor agrees to maintain CLIA and CAP accreditations throughout the contract period.",
    paymentTerms: "Net 30 days from invoice date. Early payment discount of 2% available for payments within 10 days.",
    serviceLevels: {
      turnaroundTime: "24-48 hours for routine tests",
      accuracyGuarantee: 99.5,
      availabilityHours: "24/7 emergency services, business hours for routine",
    },
    pricing: {
      baseRate: 100.00,
      discountPercentage: 15,
      minimumVolume: 50,
      penalties: "Late delivery penalty: $50 per day for tests exceeding turnaround time",
    },
    autoRenewal: true,
    notificationDays: 60,
    createdAt: new Date("2023-11-01"),
    updatedAt: new Date("2024-01-15"),
  };

  useEffect(() => {
    if (vendorId && isOpen) {
      fetchContractDetails();
    }
  }, [vendorId, isOpen]);

  const fetchContractDetails = async () => {
    if (!vendorId) return;
    
    try {
      setIsLoading(true);
      const contractData = await labVendorApi.getContractDetails(vendorId);
      setContract(contractData);
    } catch (error) {
      console.error("Error fetching contract details:", error);
      toast({
        title: "Error",
        description: "Failed to load contract details. Showing sample data.",
        variant: "destructive",
      });
      // Fallback to mock data
      setContract(mockContract);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "pending_renewal":
        return "bg-orange-100 text-orange-800";
      case "terminated":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const daysUntilExpiry = contract ? Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry <= 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Contract Details - {vendorName || "Vendor"}
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
              <p className="text-gray-600">Loading contract details...</p>
            </div>
          </div>
        ) : contract ? (
          <div className="space-y-6">
            {/* Status Alert */}
            {isExpired && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Contract Expired</h3>
                    <p className="text-sm text-red-700">
                      This contract expired {Math.abs(daysUntilExpiry)} days ago. Please renew or terminate.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isExpiringSoon && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-orange-600 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-orange-800">Contract Expiring Soon</h3>
                    <p className="text-sm text-orange-700">
                      This contract expires in {daysUntilExpiry} days. Consider renewal.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Contract Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contract Number</label>
                    <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {contract.contractNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(contract.status)}>
                        {contract.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Auto Renewal</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <CheckCircle className={`h-4 w-4 ${contract.autoRenewal ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-sm">
                        {contract.autoRenewal ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contract Period */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Contract Period
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Start Date</label>
                    <p className="text-sm">{formatDate(contract.startDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">End Date</label>
                    <p className="text-sm">{formatDate(contract.endDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Days Remaining</label>
                    <p className={`text-sm ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-gray-900'}`}>
                      {isExpired ? `Expired ${Math.abs(daysUntilExpiry)} days ago` : `${daysUntilExpiry} days`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pricing Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Pricing Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Base Rate</label>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(contract.pricing.baseRate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Volume Discount</label>
                    <p className="text-lg font-semibold text-blue-600">
                      {contract.pricing.discountPercentage}%
                    </p>
                  </div>
                  {contract.pricing.minimumVolume && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Minimum Volume</label>
                      <p className="text-sm">{contract.pricing.minimumVolume} tests/month</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Service Levels
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Turnaround Time</label>
                    <p className="text-sm">{contract.serviceLevels.turnaroundTime}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Accuracy Guarantee</label>
                    <p className="text-lg font-semibold text-green-600">
                      {contract.serviceLevels.accuracyGuarantee}%
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Availability</label>
                    <p className="text-sm">{contract.serviceLevels.availabilityHours}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contract Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {contract.terms}
                </p>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {contract.paymentTerms}
                </p>
              </CardContent>
            </Card>

            {/* Penalties */}
            {contract.pricing.penalties && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Penalties & SLA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {contract.pricing.penalties}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default ContractDetailsModal; 