import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Filter, CalendarIcon, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FilterField {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "dateRange" | "checkbox" | "number";
  options?: string[] | { value: string; label: string }[];
  placeholder?: string;
}

interface AdvancedFiltersModalProps {
  filterFields: FilterField[];
  onApplyFilters: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
  initialFilters?: Record<string, any>;
}

const AdvancedFiltersModal: React.FC<AdvancedFiltersModalProps> = ({
  filterFields,
  onApplyFilters,
  onClearFilters,
  initialFilters = {},
}) => {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyFilters = () => {
    const finalFilters = { ...filters };

    // Handle date range
    if (dateFrom) {
      finalFilters.dateFrom = dateFrom;
    }
    if (dateTo) {
      finalFilters.dateTo = dateTo;
    }

    onApplyFilters(finalFilters);
    setOpen(false);

    toast({
      title: "Filters Applied",
      description: "Your advanced filters have been applied successfully.",
    });
  };

  const handleClearFilters = () => {
    setFilters({});
    setDateFrom(undefined);
    setDateTo(undefined);
    onClearFilters();

    toast({
      title: "Filters Cleared",
      description: "All filters have been cleared.",
    });
  };

  const getActiveFiltersCount = () => {
    let count = Object.keys(filters).filter(
      (key) => filters[key] && filters[key] !== "" && filters[key] !== "all",
    ).length;
    if (dateFrom) count++;
    if (dateTo) count++;
    return count;
  };

  const renderFilterField = (field: FilterField) => {
    switch (field.type) {
      case "text":
      case "number":
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              id={field.key}
              type={field.type}
              placeholder={field.placeholder}
              value={filters[field.key] || ""}
              onChange={(e) => handleFilterChange(field.key, e.target.value)}
            />
          </div>
        );

      case "select":
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Select
              value={filters[field.key] || "all"}
              onValueChange={(value) =>
                handleFilterChange(field.key, value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={field.placeholder || `Select ${field.label}`}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {field.options?.map((option) => {
                  const value =
                    typeof option === "string" ? option : option.value;
                  const label =
                    typeof option === "string" ? option : option.label;
                  return (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        );

      case "date":
        return (
          <div key={field.key} className="space-y-2">
            <Label>{field.label}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters[field.key] && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters[field.key] ? (
                    format(filters[field.key], "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters[field.key]}
                  onSelect={(date) => handleFilterChange(field.key, date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case "checkbox":
        return (
          <div key={field.key} className="space-y-3">
            <Label>{field.label}</Label>
            <div className="space-y-2">
              {field.options?.map((option) => {
                const value =
                  typeof option === "string" ? option : option.value;
                const label =
                  typeof option === "string" ? option : option.label;
                const isChecked = filters[field.key]?.includes(value) || false;

                return (
                  <div key={value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${field.key}-${value}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const currentValues = filters[field.key] || [];
                        if (checked) {
                          handleFilterChange(field.key, [
                            ...currentValues,
                            value,
                          ]);
                        } else {
                          handleFilterChange(
                            field.key,
                            currentValues.filter((v: string) => v !== value),
                          );
                        }
                      }}
                    />
                    <Label
                      htmlFor={`${field.key}-${value}`}
                      className="text-sm"
                    >
                      {label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return null;
};

export default AdvancedFiltersModal;
