import { useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { LoadingButton } from "../custom/LoadingButton";

interface ConfirmCheckInDeleteDialogProps {
  id: string;
  roomNumber: string;
  children: ReactNode;
}

export function ConfirmCheckInDeleteDialog({
  id,
  roomNumber,
  children,
}: ConfirmCheckInDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const { delete: del, isMutating, invalidate } = useApi(ENDPOINT_URLS.CHECKINS.DELETE(id), {
    immediate: false,
  });

  const handleDelete = async () => {
    try {
      await del(ENDPOINT_URLS.CHECKINS.DELETE(id));
      await invalidate(ENDPOINT_URLS.CHECKINS.ALL);
      setOpen(false);
    } catch (error) {
      console.error("Error deleting check-in:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Check-in Record</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the check-in record for room {roomNumber}? 
            This action cannot be undone and will permanently remove all check-in data 
            including room assignments, key status, and special instructions.
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
            Delete Check-in
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
