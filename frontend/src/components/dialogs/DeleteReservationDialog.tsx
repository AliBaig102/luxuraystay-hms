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
import type { Reservation } from "@/types/models";

interface DeleteReservationDialogProps {
  id: string;
  reservation: Reservation;
  children: ReactNode;
}

export function DeleteReservationDialog({
  id,
  reservation,
  children,
}: DeleteReservationDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    delete: del,
    isMutating,
    invalidate,
  } = useApi(ENDPOINT_URLS.RESERVATIONS.DELETE(id), { immediate: false });

  const handleConfirm = async () => {
    try {
      await del(ENDPOINT_URLS.RESERVATIONS.DELETE(id));
      await invalidate(ENDPOINT_URLS.RESERVATIONS.ALL);
      setOpen(false);
      console.log("Reservation deleted");
    } catch (error) {
      console.error("Failed to delete reservation:", error);
    }
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
            Delete Reservation
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Are you sure you want to delete this reservation? This action cannot be undone and will permanently remove the reservation from the system.
            <div className="mt-3 p-3 bg-muted rounded-md">
              <div className="text-sm font-medium">Reservation Details:</div>
              <div className="text-xs text-muted-foreground mt-1">
                Guest: {reservation.guestId}<br />
                Room: {reservation.roomId}<br />
                Check-in: {new Date(reservation.checkInDate).toLocaleDateString()}<br />
                Check-out: {new Date(reservation.checkOutDate).toLocaleDateString()}<br />
                Total Amount: ${reservation.totalAmount}<br />
                Status: {reservation.status}
              </div>
            </div>
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