"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Room, UserRole } from "@/types/models";
import { ROOM_TYPES, ROOM_STATUSES } from "@/types/models";
import { RoomSheet } from "@/components/sheets/RoomSheet";
import { ConfirmRoomDeleteDialog } from "@/components/dialogs/ConfirmRoomDeleteDialog";
import { hasPermission } from "@/lib/permissions";

// Room type colors mapping
const roomTypeColors = {
  [ROOM_TYPES.STANDARD]: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  [ROOM_TYPES.DELUXE]: "bg-green-100 text-green-800 hover:bg-green-200",
  [ROOM_TYPES.SUITE]: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  [ROOM_TYPES.PRESIDENTIAL]: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
};

// Room status colors mapping
const roomStatusColors = {
  [ROOM_STATUSES.AVAILABLE]: "bg-green-100 text-green-800 hover:bg-green-200",
  [ROOM_STATUSES.OCCUPIED]: "bg-red-100 text-red-800 hover:bg-red-200",
  [ROOM_STATUSES.MAINTENANCE]: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  [ROOM_STATUSES.OUT_OF_SERVICE]: "bg-gray-100 text-gray-800 hover:bg-gray-200",
};

export const createRoomColumns = (currentUserRole?: UserRole
): ColumnDef<Room>[] => [
  {
    accessorKey: "roomNumber",
    header: "Room Number",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("roomNumber")}</div>
    ),
  },
  {
    accessorKey: "roomType",
    header: "Type",
    cell: ({ row }) => {
      const roomType = row.getValue("roomType") as string;
      return (
        <Badge className={roomTypeColors[roomType as keyof typeof roomTypeColors]}>
          {roomType.charAt(0).toUpperCase() + roomType.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "floor",
    header: "Floor",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("floor")}</div>
    ),
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("capacity")} guests</div>
    ),
  },
  {
    accessorKey: "pricePerNight",
    header: "Price/Night",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("pricePerNight"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge className={roomStatusColors[status as keyof typeof roomStatusColors]}>
          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge
          className={
            isActive
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {currentUserRole && hasPermission(currentUserRole, "room.delete") && (
          <ConfirmRoomDeleteDialog
            id={row.original._id}
            roomNumber={row.original.roomNumber}
          >
            <Button variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </ConfirmRoomDeleteDialog>
        )}
        {currentUserRole && hasPermission(currentUserRole, "room.update") && (
          <RoomSheet id={row.original._id}>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </RoomSheet>
        )}
      </div>
    ),
  },
];

// Export the columns for backward compatibility (without permissions)
export const roomColumns = createRoomColumns();