import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui";
import { Trash2 } from "lucide-react";
import { LoadingButton } from "../custom/LoadingButton";
import type { ReactNode } from "react";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { useState } from "react";

interface ConfirmMaintenanceRequestDeleteDialogProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function ConfirmMaintenanceRequestDeleteDialog({
  id,
  title,
  description,
  children,
}: ConfirmMaintenanceRequestDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    delete: del,
    isMutating,
    invalidate,
  } = useApi(ENDPOINT_URLS.MAINTENANCE_REQUESTS.DELETE(id), { immediate: false });

  const handleConfirm = async () => {
    await del(ENDPOINT_URLS.MAINTENANCE_REQUESTS.DELETE(id));
    await invalidate(ENDPOINT_URLS.MAINTENANCE_REQUESTS.ALL);
    setOpen(false);
    console.log("Delete maintenance request");
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-4 w-4 text-destructive" />
            </div>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
          <LoadingButton
            isLoading={isMutating}
            onClick={handleConfirm}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
