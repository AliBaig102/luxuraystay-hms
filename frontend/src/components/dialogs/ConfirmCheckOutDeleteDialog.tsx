import { useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { LoadingButton } from "../custom/LoadingButton";
import currency from "currency.js";

interface ConfirmCheckOutDeleteDialogProps {
  id: string;
  amount: number;
  children: ReactNode;
}

export function ConfirmCheckOutDeleteDialog({
  id,
  amount,
  children,
}: ConfirmCheckOutDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const { delete: del, isMutating, invalidate } = useApi(ENDPOINT_URLS.CHECKOUTS.DELETE(id), {
    immediate: false,
  });

  const handleDelete = async () => {
    try {
      await del(ENDPOINT_URLS.CHECKOUTS.DELETE(id));
      await invalidate(ENDPOINT_URLS.CHECKOUTS.ALL);
      setOpen(false);
    } catch (error) {
      console.error("Error deleting check-out:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Check-out Record</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this check-out record with a final bill of {currency(amount).format()}? 
            This action cannot be undone and will permanently remove all check-out data 
            including billing information, payment status, guest feedback, and ratings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
          <LoadingButton
            onClick={handleDelete}
            isLoading={isMutating}
            disabled={isMutating}
            variant="destructive"
          >
            Delete Check-out
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
