import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import {
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  Users,
  Activity,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";

interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  head: string;
  location: string;
  phone: string;
  email: string;
  staffCount: number;
  budget: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface ViewDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department;
}

const ViewDepartmentModal: React.FC<ViewDepartmentModalProps> = ({
  isOpen,
  onClose,
  department,
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

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Building2 className="h-6 w-6 mr-3 text-blue-600" />
            Department Details: {department.name}
          </DialogTitle>
          <DialogDescription>
            Comprehensive information about the {department.name} department.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contact">Contact & Location</TabsTrigger>
            <TabsTrigger value="management">Management & Stats</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {department.code}
                      </Badge>
                      <span className="text-xl font-medium">
                        {department.name}
                      </span>
                      {getStatusBadge(department.status)}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Description
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {department.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-800">
                      {department.staffCount}
                    </p>
                    <p className="text-sm text-blue-600">Staff Members</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-green-800">
                      <CurrencyDisplay amount={department.budget} />
                    </p>
                    <p className="text-sm text-green-600">Annual Budget</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Contact & Location Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-700">
                        Department Location
                      </p>
                      <p className="text-gray-600">{department.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-700">Phone</p>
                      <p className="text-gray-600">{department.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-700">Email</p>
                      <p className="text-gray-600">{department.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Management & Stats Tab */}
          <TabsContent value="management" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Management</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800">
                        Department Head
                      </p>
                      <p className="text-blue-700 text-lg">{department.head}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">
                      Department Status
                    </h4>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(department.status)}
                      <span className="text-gray-600">
                        {department.status === "active"
                          ? "Department is currently operational"
                          : "Department is currently inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Financial & Statistics
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <h4 className="font-medium text-green-800">
                        Annual Budget
                      </h4>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      <CurrencyDisplay amount={department.budget} />
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      <h4 className="font-medium text-purple-800">
                        Staff Information
                      </h4>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">
                      {department.staffCount} members
                    </p>
                    <p className="text-sm text-purple-600 mt-1">
                      Currently assigned to this department
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Timestamps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Record Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-700">Created</p>
                    <p className="text-gray-600">
                      {formatDate(department.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Activity className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-700">Last Updated</p>
                    <p className="text-gray-600">
                      {formatDate(department.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDepartmentModal;
