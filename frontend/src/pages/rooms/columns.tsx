"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Room, UserRole } from "@/types/models";
import { ROOM_TYPES } from "@/types/models";
import { RoomSheet } from "@/components/sheets/RoomSheet";
import { ConfirmRoomDeleteDialog } from "@/components/dialogs/ConfirmRoomDeleteDialog";
import { hasPermission } from "@/lib/permissions";
import currency from "currency.js";
import { format } from "date-fns";

// Room type colors mapping
const roomTypeColors = {
  [ROOM_TYPES.STANDARD]: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  [ROOM_TYPES.DELUXE]: "bg-green-100 text-green-800 hover:bg-green-200",
  [ROOM_TYPES.SUITE]: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  [ROOM_TYPES.PRESIDENTIAL]:
    "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
};



export const createRoomColumns = (
  currentUserRole?: UserRole
): ColumnDef<Room>[] => [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <div className="font-medium">
        {format(row.getValue("createdAt"), "MM/dd/yyyy")}
      </div>
    ),
  },
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
        <Badge
          className={roomTypeColors[roomType as keyof typeof roomTypeColors]}
        >
          {roomType.charAt(0).toUpperCase() + roomType.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "floor",
    header: "Floor",
    cell: ({ row }) => <div>{row.getValue("floor")}</div>,
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
    cell: ({ row }) => <div>{row.getValue("capacity")} guests</div>,
  },
  {
    accessorKey: "pricePerNight",
    header: "Price/Night",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("pricePerNight"));
      return <div className="font-medium">{currency(price).format()}</div>;
    },
  },
  {
    accessorKey: "amenities",
    header: "Amenities",
    cell: ({ row }) => {
      const amenities = row.getValue("amenities") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {amenities.map((amenity, index) => (
            <Badge variant={"secondary"} key={index}>
              {amenity}
            </Badge>
          ))}
        </div>
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
