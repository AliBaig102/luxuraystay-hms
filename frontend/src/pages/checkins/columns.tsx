import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import type { CheckIn, UserRole } from "@/types/models";
import { Button, Badge } from "@/components/ui";
import { Edit, Trash2, CheckCircle, Clock } from "lucide-react";
import { CheckInSheet } from "@/components/sheets";
import { hasPermission } from "@/lib/permissions";
import { ConfirmCheckInDeleteDialog } from "@/components/dialogs";

export const createCheckInColumns = (
  currentUserRole?: UserRole
): ColumnDef<CheckIn>[] => {
  return [
    {
      accessorKey: "createdAt",
      header: "Date",
      enableSorting: true,
      cell: ({ row }) => format(new Date(row.original.createdAt), "MM/dd/yyyy"),
    },
    {
      accessorKey: "assignedRoomNumber",
      header: "Room Number",
      enableSorting: true,

      cell: ({ row }) => (
        <div className="font-medium">{row.original.assignedRoomNumber}</div>
      ),
    },
    {
      accessorKey: "checkInTime",
      header: "Check-in Time",
      enableSorting: true,

      cell: ({ row }) => {
        const checkInTime = row.original.checkInTime;
        return (
          <div className="font-medium">
            {format(new Date(checkInTime), "MM/dd/yyyy HH:mm")}
          </div>
        );
      },
    },
    {
      accessorKey: "checkOutTime",
      header: "Check-out Time",
      enableSorting: true,
      cell: ({ row }) => {
        const checkOutTime = row.original.checkOutTime;
        return checkOutTime ? (
          <div className="font-medium">
            {format(new Date(checkOutTime), "MM/dd/yyyy HH:mm")}
          </div>
        ) : (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      },
    },
    {
      accessorKey: "keyIssued",
      header: "Key Status",
      enableSorting: true,
      cell: ({ row }) => (
        <Badge
          variant={row.original.keyIssued ? "default" : "secondary"}
          className={
            row.original.keyIssued
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-orange-100 text-orange-800 hover:bg-orange-200"
          }
        >
          {row.original.keyIssued ? "Issued" : "Pending"}
        </Badge>
      ),
    },
    {
      accessorKey: "welcomePackDelivered",
      header: "Welcome Pack",
      enableSorting: true,
      cell: ({ row }) => (
        <Badge
          variant={row.original.welcomePackDelivered ? "default" : "secondary"}
          className={
            row.original.welcomePackDelivered
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-orange-100 text-orange-800 hover:bg-orange-200"
          }
        >
          {row.original.welcomePackDelivered ? "Delivered" : "Pending"}
        </Badge>
      ),
    },
    {
      accessorKey: "isActiveStay",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => {
        const isActive = row.original.isActiveStay;
        return (
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={
              isActive
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }
          >
            {isActive ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </>
            ) : (
              "Completed"
            )}
          </Badge>
        );
      },
    },
    {
      accessorKey: "specialInstructions",
      header: "Special Instructions",
      enableSorting: false,
      cell: ({ row }) => {
        const instructions = row.original.specialInstructions;
        return instructions ? (
          <div className="max-w-[200px] truncate" title={instructions}>
            {instructions}
          </div>
        ) : (
          <span className="text-muted-foreground">None</span>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {currentUserRole && hasPermission(currentUserRole, "checkin.delete") && (
            <ConfirmCheckInDeleteDialog
              id={row.original._id}
              roomNumber={row.original.assignedRoomNumber}
            >
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </ConfirmCheckInDeleteDialog>
          )}
          {currentUserRole && hasPermission(currentUserRole, "checkin.update") && (
            <CheckInSheet id={row.original._id}>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </CheckInSheet>
          )}
        </div>
      ),
    },
  ];
};

// Export the columns for backward compatibility (without permissions)
export const checkInColumns = createCheckInColumns();
