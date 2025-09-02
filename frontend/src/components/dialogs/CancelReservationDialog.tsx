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
import { XCircle } from "lucide-react";
import { LoadingButton } from "../custom/LoadingButton";
import type { ReactNode } from "react";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { useState } from "react";
import type { Reservation } from "@/types/models";

interface CancelReservationDialogProps {
  id: string;
  reservation: Reservation;
  children: ReactNode;
}

export function CancelReservationDialog({
  id,
  reservation,
  children,
}: CancelReservationDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    patch,
    isMutating,
    invalidate,
  } = useApi(ENDPOINT_URLS.RESERVATIONS.CANCEL(id), { immediate: false });

  const handleCancel = async () => {
    try {
      await patch(ENDPOINT_URLS.RESERVATIONS.CANCEL(id), {});
      await invalidate(ENDPOINT_URLS.RESERVATIONS.ALL);
      setOpen(false);
      console.log("Reservation cancelled");
    } catch (error) {
      console.error("Failed to cancel reservation:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
              <XCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            Cancel Reservation
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Are you sure you want to cancel this reservation? This action will change the reservation status to "cancelled" and the guest will be notified. This action cannot be undone.
            <div className="mt-3 p-3 bg-muted rounded-md">
              <div className="text-sm font-medium">Reservation Details:</div>
              <div className="text-xs text-muted-foreground mt-1">
                Guest: {typeof reservation.guestId === 'string' ? reservation.guestId : reservation.guestId.firstName} {typeof reservation.guestId === 'string' ? reservation.guestId : reservation.guestId.lastName}<br />
                Room: {typeof reservation.roomId === 'string' ? reservation.roomId : reservation.roomId.roomNumber}<br />
                Check-in: {new Date(reservation.checkInDate).toLocaleDateString()}<br />
                Check-out: {new Date(reservation.checkOutDate).toLocaleDateString()}<br />
                Total Amount: ${reservation.totalAmount}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isMutating}>Keep Reservation</AlertDialogCancel>
          <LoadingButton
            isLoading={isMutating}
            onClick={handleCancel}
            variant="destructive"
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
          >
            <XCircle className="h-4 w-4" />
            Cancel Reservation
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}