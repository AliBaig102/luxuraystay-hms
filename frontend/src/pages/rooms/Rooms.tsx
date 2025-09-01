import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui";
import { RoomSheet } from "@/components/sheets/RoomSheet";
import { PlusIcon } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import type { Room } from "@/types/models";
import { DataTable } from "@/components/custom/DataTable";
import { createRoomColumns } from "./columns";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/permissions";
import { ROOM_TYPES, ROOM_STATUSES } from "@/types/models";

const filters = [
  {
    id: "roomType",
    label: "Room Type",
    options: [
      { value: ROOM_TYPES.STANDARD, label: "Standard" },
      { value: ROOM_TYPES.DELUXE, label: "Deluxe" },
      { value: ROOM_TYPES.SUITE, label: "Suite" },
      { value: ROOM_TYPES.PRESIDENTIAL, label: "Presidential" },
    ],
  },
  {
    id: "status",
    label: "Status",
    options: [
      { value: ROOM_STATUSES.AVAILABLE, label: "Available" },
      { value: ROOM_STATUSES.OCCUPIED, label: "Occupied" },
      { value: ROOM_STATUSES.MAINTENANCE, label: "Maintenance" },
      { value: ROOM_STATUSES.OUT_OF_SERVICE, label: "Out of service" },
      { value: ROOM_STATUSES.RESERVED, label: "Reserved" },
      { value: ROOM_STATUSES.CLEANING, label: "Cleaning" },
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

export const Rooms = () => {
  const { data, isLoading } = useApi<Room[]>(ENDPOINT_URLS.ROOMS.ALL);
  const { user: currentUser } = useAuth();
  const roomColumns = createRoomColumns(currentUser?.role);
  
  return (
    <div>
      <PageHeader
        title="Rooms"
        description="Manage hotel rooms, types, pricing, and availability"
      >
        {currentUser && hasPermission(currentUser.role, "room.create") && (
          <RoomSheet>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create New Room
            </Button>
          </RoomSheet>
        )}
      </PageHeader>
      <DataTable
        columns={roomColumns}
        data={data || []}
        filters={filters}
        loading={isLoading}
        exportFileName="rooms"
      />
    </div>
  );
};