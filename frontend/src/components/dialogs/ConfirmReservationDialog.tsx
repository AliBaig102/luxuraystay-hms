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
import { CheckCircle } from "lucide-react";
import { LoadingButton } from "../custom/LoadingButton";
import type { ReactNode } from "react";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { useState } from "react";
import type { Reservation } from "@/types/models";

interface ConfirmReservationDialogProps {
  id: string;
  reservation: Reservation;
  children: ReactNode;
}

export function ConfirmReservationDialog({
  id,
  reservation,
  children,
}: ConfirmReservationDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    patch,
    isMutating,
    invalidate,
  } = useApi(ENDPOINT_URLS.RESERVATIONS.CONFIRM(id), { immediate: false });

  const handleConfirm = async () => {
    try {
      await patch(ENDPOINT_URLS.RESERVATIONS.CONFIRM(id), {});
      await invalidate(ENDPOINT_URLS.RESERVATIONS.ALL);
      setOpen(false);
      console.log("Reservation confirmed");
    } catch (error) {
      console.error("Failed to confirm reservation:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            Confirm Reservation
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Are you sure you want to confirm this reservation? This will change the reservation status to "confirmed" and the guest will be notified.
            <div className="mt-3 p-3 bg-muted rounded-md">
              <div className="text-sm font-medium">Reservation Details:</div>
              <div className="text-xs text-muted-foreground mt-1">
                Guest: {reservation.guestId}<br />
                Room: {reservation.roomId}<br />
                Check-in: {new Date(reservation.checkInDate).toLocaleDateString()}<br />
                Check-out: {new Date(reservation.checkOutDate).toLocaleDateString()}<br />
                Total Amount: ${reservation.totalAmount}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
          <LoadingButton
            isLoading={isMutating}
            onClick={handleConfirm}
            variant="default"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4" />
            Confirm Reservation
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}