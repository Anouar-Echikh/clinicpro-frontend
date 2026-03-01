import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { parseApiError } from "@/utils/errorHandler";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  itemName: string;
  onConfirm: () => Promise<void>;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  itemName,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      toast({
        title: t("Deleted successfully"),
        description: `${itemName} ${t("has been permanently deleted.")}`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: t("Error"),
        description: parseApiError(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto p-0">
        <div className="p-4 sm:p-6">
          <DialogHeader className="text-center sm:text-left mb-4">
            <DialogTitle className="flex items-center justify-center sm:justify-start text-lg sm:text-xl text-red-600">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              <span className="truncate">{title}</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-red-800 text-sm sm:text-base">
                  {t("You are about to delete:")}{" "}<strong className="break-words">{itemName}</strong>
                </p>
                <p className="text-xs sm:text-sm text-red-600 mt-1">
                  {t("This action cannot be undone.")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="w-full sm:w-auto h-9 sm:h-10"
            >
              <X className="h-4 w-4 mr-2" />
              {t("Cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full sm:w-auto h-9 sm:h-10"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {t("Delete Permanently")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmModal;
