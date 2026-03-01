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
import { Separator } from "@/components/ui/separator";
import { X, Eye } from "lucide-react";

interface ViewDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: Record<string, any> | null;
  fields: {
    key: string;
    label: string;
    type?: "text" | "badge" | "date" | "currency" | "array" | "boolean" | "phone" | "email";
    render?: (value: any) => React.ReactNode;
    section?: string;
  }[];
}

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({
  open,
  onOpenChange,
  title,
  data,
  fields,
}) => {
  const formatValue = (value: any, type: string = "text") => {
    if (value === null || value === undefined || value === "") return "Not specified";

    switch (type) {
      case "date":
        try {
          const date = new Date(value);
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        } catch (e) {
          return value.toString();
        }
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value);
      case "boolean":
        return value ? "Yes" : "No";
      case "array":
        return Array.isArray(value) ? value.join(", ") : value;
      case "badge":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
            {value}
          </Badge>
        );
      case "phone":
        return (
          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
            {value}
          </span>
        );
      case "email":
        return (
          <span className="text-blue-600 hover:text-blue-800 font-medium">
            {value}
          </span>
        );
      default:
        return value.toString();
    }
  };

  // Group fields by section
  const groupedFields = fields.reduce((acc, field) => {
    const section = field.section || "General Information";
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(field);
    return acc;
  }, {} as Record<string, typeof fields>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center text-xl font-semibold">
            <Eye className="h-5 w-5 mr-3 text-blue-600" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-1">
            View complete information and details
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)] py-4">
          {data ? (
            <div className="space-y-6">
              {Object.entries(groupedFields).map(([sectionName, sectionFields], sectionIndex) => (
                <div key={sectionName}>
                  {/* Section Header */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {sectionName}
                    </h3>
                  </div>

                  {/* Section Content */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sectionFields.map((field, fieldIndex) => (
                        <div key={field.key} className="space-y-1">
                          <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">
                            {field.label}
                          </h4>
                          <div className="text-sm font-medium text-gray-900">
                            {field.render
                              ? field.render(data?.[field.key])
                              : formatValue(data?.[field.key], field.type)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {sectionIndex < Object.entries(groupedFields).length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <div className="text-6xl mb-4 opacity-50">📄</div>
              <p className="text-lg font-medium">No data available</p>
              <p className="text-sm mt-1">Information could not be loaded at this time.</p>
            </div>
          )}
        </div>

        <div className="border-t pt-4 flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="min-w-[100px]"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDetailsModal;
