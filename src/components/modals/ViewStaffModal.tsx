import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Clock,
  DollarSign,
  Shield,
  Stethoscope,
  UserCheck,
  Users,
} from "lucide-react";
import { transformUserToStaff } from "@/hooks/useStaff";

interface ViewStaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: ReturnType<typeof transformUserToStaff> | null;
}

const ViewStaffModal: React.FC<ViewStaffModalProps> = ({
  open,
  onOpenChange,
  staff,
}) => {
  if (!staff) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 text-purple-600" />;
      case "doctor":
        return <Stethoscope className="h-4 w-4 text-blue-600" />;
      case "nurse":
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case "receptionist":
        return <Users className="h-4 w-4 text-orange-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "doctor":
        return "bg-blue-100 text-blue-800";
      case "nurse":
        return "bg-green-100 text-green-800";
      case "receptionist":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getWorkingDays = () => {
    return Object.values(staff.schedule).filter((day: any) => day.isWorking).length;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Staff Profile
          </DialogTitle>
          <DialogDescription>
            Complete profile information for {staff.firstName} {staff.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl font-semibold">
                {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {staff.firstName} {staff.lastName}
              </h2>
              <div className="flex items-center space-x-2 mt-2">
                {getRoleIcon(staff.role)}
                <Badge className={`text-sm ${getRoleColor(staff.role)}`}>
                  {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                </Badge>
                <Badge variant={staff.isActive ? "default" : "secondary"}>
                  {staff.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{staff.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{staff.phone || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{staff.address || "Not provided"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="h-4 w-4 mr-2" />
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{staff.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joining Date</p>
                  <p className="font-medium">{formatDate(staff.joiningDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Employee ID</p>
                  <p className="font-medium">#{staff.id}</p>
                </div>
                {staff.salary > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Annual Salary</p>
                    <p className="font-medium">${staff.salary.toLocaleString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Qualifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {staff.qualifications.length > 0 ? (
                  <div className="space-y-2">
                    {staff.qualifications.map((qualification, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">{qualification}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No qualifications listed</p>
                )}
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="h-4 w-4 mr-2" />
                  Work Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Working Days per Week:</span>
                    <span className="text-blue-600 font-semibold">{getWorkingDays()} days</span>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    {Object.entries(staff.schedule).map(([day, schedule]: [string, any]) => (
                      <div key={day} className="flex items-center justify-between text-sm">
                        <span className="capitalize font-medium">{day}:</span>
                        <span className={schedule.isWorking ? "text-green-600" : "text-gray-400"}>
                          {schedule.isWorking 
                            ? `${schedule.start} - ${schedule.end}`
                            : "Off"
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="h-4 w-4 mr-2" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium">{formatDate(staff.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="font-medium">{formatDate(staff.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <Badge variant={staff.isActive ? "default" : "secondary"} className="w-fit">
                    {staff.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewStaffModal; 