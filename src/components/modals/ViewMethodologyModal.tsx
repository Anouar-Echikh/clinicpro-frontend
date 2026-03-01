import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  Settings,
  Beaker,
  TestTube2,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Activity,
} from "lucide-react";
import { TestMethodology } from "@/types";
import api from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface ViewMethodologyModalProps {
  methodologyId?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ViewMethodologyModal: React.FC<ViewMethodologyModalProps> = ({
  methodologyId,
  trigger,
  open,
  onOpenChange,
}) => {
  const [methodology, setMethodology] = useState<TestMethodology | null>(null);
  const [loading, setLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const fetchMethodology = async () => {
    if (!methodologyId) return;
    
    try {
      setLoading(true);
      const data = await api.getTestMethodology(methodologyId);
      setMethodology(data);
    } catch (error) {
      console.error("Error fetching methodology:", error);
      toast({
        title: "Error",
        description: "Failed to load methodology details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && methodologyId) {
      fetchMethodology();
    }
  }, [isOpen, methodologyId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Eye className="h-5 w-5 mr-2 text-blue-600" />
            Methodology Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive information about the laboratory methodology
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
            Loading methodology details...
          </div>
        ) : methodology ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Beaker className="h-4 w-4 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Name</h3>
                    <p className="text-lg font-semibold">{methodology.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Code</h3>
                    <p className="text-lg font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                      {methodology.code}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Category</h3>
                    <Badge variant="outline" className="mt-1">
                      {methodology.category}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Status</h3>
                    <Badge
                      variant={methodology.isActive ? "default" : "secondary"}
                      className={`mt-1 ${
                        methodology.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <Activity className="h-3 w-3 mr-1" />
                      {methodology.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700">Description</h3>
                  <p className="text-gray-600 mt-1">{methodology.description || "No description available"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Technical Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Technical Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700">Equipment Required</h3>
                  <p className="text-gray-600 mt-1">{methodology.equipment || "No equipment information available"}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium text-gray-700">Scientific Principles</h3>
                  <p className="text-gray-600 mt-1">{methodology.principles || "No principles information available"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TestTube2 className="h-4 w-4 mr-2" />
                  Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(methodology.applications || []).map((application, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {application}
                    </Badge>
                  ))}
                </div>
                {(!methodology.applications || methodology.applications.length === 0) && (
                  <p className="text-gray-500 italic">No applications specified</p>
                )}
              </CardContent>
            </Card>

            {/* Advantages & Limitations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Advantages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{methodology.advantages || "No advantages specified"}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center text-orange-600">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Limitations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{methodology.limitations || "No limitations specified"}</p>
                </CardContent>
              </Card>
            </div>

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Record Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-600">
                      {methodology.created_at ? formatDate(methodology.created_at) : "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Last Updated:</span>
                    <span className="ml-2 text-gray-600">
                      {methodology.updated_at ? formatDate(methodology.updated_at) : "Unknown"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No methodology data available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewMethodologyModal; 