import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Folder,
  Beaker,
  TestTube2,
  Heart,
  Zap,
  Microscope,
  CheckCircle,
  XCircle,
  Loader2,
  Edit,
  Palette,
  Calendar,
  Users,
  BarChart3,
} from "lucide-react";
import { useTestCategory } from "@/hooks/useApi";
import { TestCategory } from "@/types";

interface ViewCategoryModalProps {
  categoryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (categoryId: string) => void;
}

const ViewCategoryModal: React.FC<ViewCategoryModalProps> = ({
  categoryId,
  open,
  onOpenChange,
  onEdit,
}) => {
  // API hooks
  const {
    data: category,
    isLoading: categoryLoading,
    error: categoryError,
  } = useTestCategory(categoryId);

  const getIconComponent = (iconName: string, color: string) => {
    const iconProps = { className: "h-5 w-5", style: { color } };
    switch (iconName) {
      case "beaker":
        return <Beaker {...iconProps} />;
      case "test-tube":
        return <TestTube2 {...iconProps} />;
      case "heart":
        return <Heart {...iconProps} />;
      case "zap":
        return <Zap {...iconProps} />;
      case "microscope":
        return <Microscope {...iconProps} />;
      default:
        return <Folder {...iconProps} />;
    }
  };

  if (categoryLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading category details...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (categoryError || !category) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              {categoryError instanceof Error 
                ? categoryError.message 
                : "Error loading category details"}
            </p>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getIconComponent(category.icon, category.color)}
              <div>
                <DialogTitle className="text-xl">{category.name}</DialogTitle>
                <DialogDescription>
                  Category Code: {category.code} • Department: {category.department}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={category.isActive ? "default" : "secondary"}>
                {category.isActive ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </>
                )}
              </Badge>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(category._id)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tests</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {category.testCount || 0}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Common Tests</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {category.commonTests?.length || 0}
                    </p>
                  </div>
                  <TestTube2 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Sort Order</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {category.sortOrder || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Category Name</Label>
                  <Input value={category.name} readOnly className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label>Category Code</Label>
                  <Input value={category.code} readOnly className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={category.description}
                    readOnly
                    className="bg-muted min-h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Department</Label>
                  <div className="p-3 border rounded-md bg-muted">
                    <Badge variant="outline">{category.department}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visual Settings & Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Visual Settings & Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Icon & Color</Label>
                  <div className="p-3 border rounded-lg bg-muted">
                    <div className="flex items-center space-x-3">
                      {getIconComponent(category.icon, category.color)}
                      <div>
                        <div className="font-medium capitalize">{category.icon}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Palette className="h-3 w-3 mr-1" />
                          {category.color}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="p-3 border rounded-md bg-muted">
                    <Badge 
                      variant={category.isActive ? "default" : "secondary"}
                      className={category.isActive ? "bg-green-100 text-green-800" : ""}
                    >
                      {category.isActive ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Input 
                      value={category.sortOrder || 0} 
                      readOnly 
                      className="bg-muted" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Test Count</Label>
                    <Input 
                      value={category.testCount || 0} 
                      readOnly 
                      className="bg-muted" 
                    />
                  </div>
                </div>

                {/* Timestamps */}
                {(category.created_at || category.updated_at) && (
                  <div className="space-y-2">
                    <Label>Timestamps</Label>
                    <div className="space-y-2 text-sm text-gray-600">
                      {category.created_at && (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-2" />
                          <span className="font-medium">Created:</span>
                          <span className="ml-2">{formatDate(category.created_at)}</span>
                        </div>
                      )}
                      {category.updated_at && (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-2" />
                          <span className="font-medium">Updated:</span>
                          <span className="ml-2">{formatDate(category.updated_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Common Tests */}
          {category.commonTests && category.commonTests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Common Tests ({category.commonTests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {category.commonTests.map((test, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {test}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            {onEdit && (
              <Button onClick={() => onEdit(category._id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Category
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewCategoryModal; 