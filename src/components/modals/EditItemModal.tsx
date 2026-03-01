import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { toast } from "@/hooks/use-toast";
import { Edit, Save, X } from "lucide-react";

interface FormField {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "date" | "switch" | "password";
  required?: boolean;
  options?: (string | { value: string; label: string })[];
  placeholder?: string;
  description?: string;
}

interface EditItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: Record<string, any>;
  fields: FormField[];
  onSave: (updatedData: Record<string, any>) => Promise<void>;
}

const EditItemModal: React.FC<EditItemModalProps> = ({
  open,
  onOpenChange,
  title,
  data,
  fields,
  onSave,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData(data);
    }
  }, [open, data]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave(formData);
      toast({
        title: t("Success"),
        description: t("Item updated successfully"),
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: t("Error"),
        description: t("Failed to update item. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.key] || "";

    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            required={field.required}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) =>
              handleChange(field.key, parseFloat(e.target.value) || "")
            }
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      case "password":
        return (
          <Input
            type="password"
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            autoComplete="new-password"
          />
        );
      case "select":
        return (
          <Select
            value={value}
            onValueChange={(selectedValue) =>
              handleChange(field.key, selectedValue)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => {
                const value =
                  typeof option === "string" ? option : option.value;
                const label =
                  typeof option === "string" ? option : option.label;
                return (
                  <SelectItem
                    key={`${field.key}-${value}-${index}`}
                    value={value}
                  >
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );
      case "date":
        return (
          <Input
            type="date"
            value={value ? new Date(value).toISOString().split("T")[0] : ""}
            onChange={(e) => handleChange(field.key, e.target.value)}
            required={field.required}
          />
        );
      case "switch":
        return (
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(checked) => handleChange(field.key, checked)}
          />
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Edit className="h-5 w-5 mr-2 text-blue-600" />
            {title}
          </DialogTitle>
          <DialogDescription>Update the information below</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderField(field)}
              {field.description && (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              )}
            </div>
          ))}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              {t("Cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t("Save Changes")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemModal;
