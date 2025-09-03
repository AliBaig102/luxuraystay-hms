import { useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";

interface ConfirmServiceRequestDeleteDialogProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function ConfirmServiceRequestDeleteDialog({
  id,
  title,
  description,
  children,
}: ConfirmServiceRequestDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const { delete: deleteServiceRequest, isMutating, invalidate } = useApi(
    ENDPOINT_URLS.SERVICE_REQUESTS.DELETE(id),
    {
      immediate: false,
    }
  );

  const handleConfirm = async () => {
    try {
      await deleteServiceRequest(ENDPOINT_URLS.SERVICE_REQUESTS.DELETE(id));
      await invalidate(ENDPOINT_URLS.SERVICE_REQUESTS.ALL);
      setOpen(false);
    } catch (error) {
      console.error("Error deleting service request:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isMutating}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isMutating ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
