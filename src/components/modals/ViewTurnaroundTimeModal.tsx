import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Info,
  Timer,
  Users,
} from "lucide-react";
import { TurnaroundTime } from "@/types";
import { useTurnaroundTime } from "@/hooks/useApi";

interface ViewTurnaroundTimeModalProps {
  turnaroundTimeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ViewTurnaroundTimeModal: React.FC<ViewTurnaroundTimeModalProps> = ({
  turnaroundTimeId,
  open,
  onOpenChange,
}) => {
  const { data: turnaroundTime, isLoading } = useTurnaroundTime(turnaroundTimeId || "");

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "stat":
        return <Zap className="h-4 w-4 text-red-600" />;
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "routine":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "extended":
        return <Clock className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "stat":
        return "bg-red-100 text-red-800 border-red-200";
      case "urgent":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "routine":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "extended":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} hrs`;
    return `${Math.round(minutes / 1440)} days`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!turnaroundTime && !isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Info className="h-5 w-5 mr-2 text-blue-600" />
            Turnaround Time Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading details...</span>
          </div>
        ) : turnaroundTime ? (
          <div className="space-y-6">
            {/* Header Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getPriorityIcon(turnaroundTime.priority)}
                    <div>
                      <CardTitle className="text-2xl">{turnaroundTime.name}</CardTitle>
                      <CardDescription className="text-lg">
                        Code: <span className="font-mono font-medium">{turnaroundTime.code}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={turnaroundTime.isActive ? "default" : "secondary"}
                    className={`text-sm px-3 py-1 ${
                      turnaroundTime.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {turnaroundTime.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {turnaroundTime.description}
                </p>
              </CardContent>
            </Card>

            {/* Duration & Priority Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Timer className="h-4 w-4 mr-2 text-blue-600" />
                    Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-blue-600">
                      {turnaroundTime.duration}
                    </div>
                    <div className="text-sm text-gray-500">
                      ({formatDuration(turnaroundTime.durationMinutes)})
                    </div>
                    <div className="text-xs text-gray-400">
                      {turnaroundTime.durationMinutes} minutes
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                    Priority
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(turnaroundTime.priority)}
                      <Badge
                        variant="outline"
                        className={`text-sm ${getPriorityColor(turnaroundTime.priority)}`}
                      >
                        {turnaroundTime.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {turnaroundTime.category}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      turnaroundTime.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        turnaroundTime.isActive ? "bg-green-600" : "bg-gray-600"
                      }`}></div>
                      {turnaroundTime.isActive ? "Active" : "Inactive"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {turnaroundTime.isActive ? "Available for use" : "Not available"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Test Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-4 w-4 mr-2 text-purple-600" />
                  Test Examples
                </CardTitle>
                <CardDescription>
                  Tests that typically use this turnaround time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {turnaroundTime.examples && turnaroundTime.examples.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {turnaroundTime.examples.map((example, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-sm px-3 py-1"
                      >
                        {example}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No test examples specified</p>
                )}
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                  Timeline Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-600">Created</div>
                    <div className="text-sm text-gray-900">
                      {formatDate(turnaroundTime.created_at)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-600">Last Updated</div>
                    <div className="text-sm text-gray-900">
                      {formatDate(turnaroundTime.updated_at)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Turnaround Time Not Found
            </h3>
            <p className="text-gray-500">
              The requested turnaround time could not be loaded.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewTurnaroundTimeModal; 