import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui";
import { ReservationSheet } from "@/components/sheets/ReservationSheet";
import { PlusIcon } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import type { Reservation } from "@/types/models";
import { DataTable } from "@/components/custom/DataTable";
import { createReservationColumns } from "./columns";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/permissions";
import { RESERVATION_STATUSES, PAYMENT_STATUSES, RESERVATION_SOURCES } from "@/types/models";

const filters = [
  {
    id: "status",
    label: "Reservation Status",
    options: [
      { value: RESERVATION_STATUSES.PENDING, label: "Pending" },
      { value: RESERVATION_STATUSES.CONFIRMED, label: "Confirmed" },
      { value: RESERVATION_STATUSES.CHECKED_IN, label: "Checked In" },
      { value: RESERVATION_STATUSES.CHECKED_OUT, label: "Checked Out" },
      { value: RESERVATION_STATUSES.CANCELLED, label: "Cancelled" },
      { value: RESERVATION_STATUSES.NO_SHOW, label: "No Show" },
    ],
  },
  {
    id: "paymentStatus",
    label: "Payment Status",
    options: [
      { value: PAYMENT_STATUSES.PENDING, label: "Pending" },
      { value: PAYMENT_STATUSES.PARTIAL, label: "Partially Paid" },
      { value: PAYMENT_STATUSES.PAID, label: "Paid" },
      { value: PAYMENT_STATUSES.OVERDUE, label: "Overdue" },
      { value: PAYMENT_STATUSES.CANCELLED, label: "Cancelled" },
    ],
  },
  {
    id: "source",
    label: "Booking Source",
    options: [
      { value: RESERVATION_SOURCES.ONLINE, label: "Online" },
      { value: RESERVATION_SOURCES.PHONE, label: "Phone" },
      { value: RESERVATION_SOURCES.WALK_IN, label: "Walk-in" },
      { value: RESERVATION_SOURCES.TRAVEL_AGENT, label: "Travel Agent" },
    ],
  },
  {
    id: "isActive",
    label: "Active Status",
    options: [
      { value: "true", label: "Active" },
      { value: "false", label: "Inactive" },
    ],
  },
];

export const Reservations = () => {
  const { data, isLoading } = useApi<{reservations:Reservation[]}>(ENDPOINT_URLS.RESERVATIONS.ALL, { auth: true });
  const { user: currentUser } = useAuth();
  const reservationColumns = createReservationColumns(currentUser?.role);
  
  return (
    <div>
      <PageHeader
        title="Reservations"
        description="Manage hotel reservations, bookings, and guest check-ins"
      >
        {currentUser && hasPermission(currentUser.role, "reservation.create") && (
          <ReservationSheet>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create New Reservation
            </Button>
          </ReservationSheet>
        )}
      </PageHeader>
      <DataTable
        columns={reservationColumns}
        data={data?.reservations || []}
        filters={filters}
        loading={isLoading}
        exportFileName="reservations"
        enableGlobalSearch={true}
        enableDateFilter={true}
        dateFilterColumn="checkInDate"
      />
    </div>
  );
};