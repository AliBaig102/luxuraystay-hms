"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Reservation, UserRole } from "@/types/models";
import { RESERVATION_STATUSES, PAYMENT_STATUSES } from "@/types/models";
import { ReservationSheet } from "@/components/sheets/ReservationSheet";
import { ConfirmReservationDialog } from "@/components/dialogs/ConfirmReservationDialog";
import { CancelReservationDialog } from "@/components/dialogs/CancelReservationDialog";
import { DeleteReservationDialog } from "@/components/dialogs/DeleteReservationDialog";
import { hasPermission } from "@/lib/permissions";
import currency from "currency.js";
import { format } from "date-fns";

// Reservation status colors mapping
const reservationStatusColors = {
  [RESERVATION_STATUSES.PENDING]: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  [RESERVATION_STATUSES.CONFIRMED]: "bg-green-100 text-green-800 hover:bg-green-200",
  [RESERVATION_STATUSES.CHECKED_IN]: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  [RESERVATION_STATUSES.CHECKED_OUT]: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  [RESERVATION_STATUSES.CANCELLED]: "bg-red-100 text-red-800 hover:bg-red-200",
  [RESERVATION_STATUSES.NO_SHOW]: "bg-orange-100 text-orange-800 hover:bg-orange-200",
};

// Payment status colors mapping
const paymentStatusColors = {
  [PAYMENT_STATUSES.PENDING]: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  [PAYMENT_STATUSES.PARTIAL]: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  [PAYMENT_STATUSES.PAID]: "bg-green-100 text-green-800 hover:bg-green-200",
  [PAYMENT_STATUSES.OVERDUE]: "bg-red-100 text-red-800 hover:bg-red-200",
  [PAYMENT_STATUSES.CANCELLED]: "bg-gray-100 text-gray-800 hover:bg-gray-200",
};

export const createReservationColumns = (
  currentUserRole?: UserRole
): ColumnDef<Reservation>[] => [
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <div className="font-medium">
        {format(row.getValue("createdAt"), "MM/dd/yyyy")}
      </div>
    ),
  },
  {
    accessorKey: "guestId",
    header: "Guest",
    cell: ({ row }) => {
      const guest = row.original.guestId as unknown as { firstName: string, lastName: string } | null;
      return (
        <div className="font-medium">
          {guest?.firstName || 'N/A'} {guest?.lastName || 'N/A'}
        </div>
      );
    },
  },
  {
    accessorKey: "roomId",
    header: "Room",
    cell: ({ row }) => {
      const room = row.original.roomId as unknown as { roomNumber: string } | null;
      return (
        <div className="font-medium">
          {room?.roomNumber || 'N/A'}
        </div>
      );
    },
  },
  {
    accessorKey: "checkInDate",
    header: "Check-in",
    cell: ({ row }) => (
      <div>{format(new Date(row.getValue("checkInDate")), "MM/dd/yyyy")}</div>
    ),
  },
  {
    accessorKey: "checkOutDate",
    header: "Check-out",
    cell: ({ row }) => (
      <div>{format(new Date(row.getValue("checkOutDate")), "MM/dd/yyyy")}</div>
    ),
  },
  {
    accessorKey: "numberOfGuests",
    header: "Guests",
    cell: ({ row }) => <div>{row.getValue("numberOfGuests")} guests</div>,
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
    cell: ({ row }) => {
      const amount = currency(row.getValue("totalAmount"));
      return <div className="font-medium">{amount.format()}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant="secondary"
          className={reservationStatusColors[status as keyof typeof reservationStatusColors] || "bg-gray-100 text-gray-800"}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const paymentStatus = row.getValue("paymentStatus") as string;
      return (
        <Badge
          variant="secondary"
          className={paymentStatusColors[paymentStatus as keyof typeof paymentStatusColors] || "bg-gray-100 text-gray-800"}
        >
          {paymentStatus}
        </Badge>
      );
    },
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("source")}</div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const reservation = row.original;
      const canConfirm = reservation.status === RESERVATION_STATUSES.PENDING;
      const canCancel = [RESERVATION_STATUSES.PENDING, RESERVATION_STATUSES.CONFIRMED].includes(reservation.status as "pending" | "confirmed");
      
      return (
        <div className="flex items-center gap-2">
          {/* Confirm Button */}
          {currentUserRole && hasPermission(currentUserRole, "reservation.update") && canConfirm && (
            <ConfirmReservationDialog
              id={row.original._id}
              reservation={reservation}
            >
              <Button variant="default" size="icon" title="Confirm Reservation" className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4" />
              </Button>
            </ConfirmReservationDialog>
          )}
          
          {/* Cancel Button */}
          {currentUserRole && hasPermission(currentUserRole, "reservation.update") && canCancel && (
            <CancelReservationDialog
              id={row.original._id}
              reservation={reservation}
            >
              <Button variant="destructive" size="icon" title="Cancel Reservation" className="bg-orange-600 hover:bg-orange-700">
                <XCircle className="h-4 w-4" />
              </Button>
            </CancelReservationDialog>
          )}
          
          {/* Edit Button */}
          {currentUserRole && hasPermission(currentUserRole, "reservation.update") && (
            <ReservationSheet id={row.original._id}>
              <Button variant="outline" size="icon" title="Edit Reservation">
                <Edit className="h-4 w-4" />
              </Button>
            </ReservationSheet>
          )}
          
          {/* Delete Button */}
          {currentUserRole && hasPermission(currentUserRole, "reservation.delete") && (
            <DeleteReservationDialog
              id={row.original._id}
              reservation={reservation}
            >
              <Button variant="destructive" size="icon" title="Delete Reservation">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DeleteReservationDialog>
          )}
        </div>
      );
    },
  },
];

// Default export for backward compatibility
export const reservationColumns = createReservationColumns();