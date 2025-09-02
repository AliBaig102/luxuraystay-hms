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

interface ConfirmInventoryDeleteDialogProps {
  id: string;
  itemName: string;
  sku: string;
  children: ReactNode;
}

export function ConfirmInventoryDeleteDialog({
  id,
  itemName,
  sku,
  children,
}: ConfirmInventoryDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    delete: del,
    isMutating,
    invalidate,
  } = useApi(ENDPOINT_URLS.INVENTORY.DELETE(id), { immediate: false });

  const handleConfirm = async () => {
    await del(ENDPOINT_URLS.INVENTORY.DELETE(id));
    await invalidate(ENDPOINT_URLS.INVENTORY.ALL);
    setOpen(false);
    console.log("Delete inventory item");
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
            Delete Inventory Item
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{itemName}</strong> (SKU: {sku})? This action cannot be undone and will permanently remove the inventory item from the system.
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