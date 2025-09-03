import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { Edit, Trash2, User, Home, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { ServiceRequest } from "@/types/models";
import { ServiceRequestSheet } from "@/components/sheets";
import { ConfirmServiceRequestDeleteDialog } from "@/components/dialogs";
import { hasPermission } from "@/lib/permissions";

// Service type colors
const serviceTypeColors: Record<string, string> = {
  room_service: "bg-blue-100 text-blue-800",
  wake_up_call: "bg-yellow-100 text-yellow-800",
  transportation: "bg-green-100 text-green-800",
  laundry: "bg-purple-100 text-purple-800",
  housekeeping: "bg-orange-100 text-orange-800",
  maintenance: "bg-red-100 text-red-800",
  concierge: "bg-indigo-100 text-indigo-800",
};

// Priority colors
const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

// Status colors
const statusColors: Record<string, string> = {
  requested: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

// Status icons
const statusIcons: Record<string, any> = {
  requested: Clock,
  in_progress: Clock,
  completed: Clock,
  cancelled: Clock,
};

export const createServiceRequestColumns = (
  currentUserRole?: string
): ColumnDef<ServiceRequest>[] => {
  return [
    {
      accessorKey: "createdAt",
      header: "Date",
      enableSorting: true,
      cell: ({ row }) => format(new Date(row.original.createdAt), "MM/dd/yyyy"),
    },
    {
      accessorKey: "serviceType",
      header: "Service Type",
      enableSorting: true,
      cell: ({ row }) => {
        const serviceType = row.getValue("serviceType") as string;
        return (
          <Badge variant="secondary" className={serviceTypeColors[serviceType]}>
            {serviceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      enableSorting: true,
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        return (
          <Badge variant="secondary" className={priorityColors[priority]}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const StatusIcon = statusIcons[status];
        return (
          <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4" />
            <Badge variant="secondary" className={statusColors[status]}>
              {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      enableSorting: true,
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-[200px]">
            <p className="text-sm truncate">
              {description}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "roomId",
      header: "Room",
      enableSorting: true,
      cell: ({ row }) => {
        const serviceRequest = row.original;
        const room = serviceRequest.roomId as any;
        
        if (typeof room === 'object' && room?.roomNumber) {
          return (
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium">
                  Room {room.roomNumber}
                </span>
                <span className="text-sm text-muted-foreground">
                  {room.roomType}
                </span>
              </div>
            </div>
          );
        }

        return (
          <span className="text-sm text-muted-foreground">
            {serviceRequest.roomId ? `Room ID: ${serviceRequest.roomId}` : "No room"}
          </span>
        );
      },
    },
    {
      accessorKey: "guestId",
      header: "Guest",
      enableSorting: true,
      cell: ({ row }) => {
        const serviceRequest = row.original;
        const guest = serviceRequest.guestId as any;
        
        if (typeof guest === 'object' && guest?.firstName) {
          return (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium">
                  {guest.firstName} {guest.lastName}
                </span>
                <span className="text-sm text-muted-foreground">
                  {guest.email}
                </span>
              </div>
            </div>
          );
        }

        return (
          <span className="text-sm text-muted-foreground">
            {serviceRequest.guestId ? `Guest ID: ${serviceRequest.guestId}` : "No guest"}
          </span>
        );
      },
    },
    {
      accessorKey: "assignedStaffId",
      header: "Assigned Staff",
      enableSorting: true,
      cell: ({ row }) => {
        const serviceRequest = row.original;
        const staff = serviceRequest.assignedStaffId as any;
        
        if (typeof staff === 'object' && staff?.firstName) {
          return (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium">
                  {staff.firstName} {staff.lastName}
                </span>
                <span className="text-sm text-muted-foreground">
                  {staff.email}
                </span>
              </div>
            </div>
          );
        }

        return (
          <span className="text-sm text-muted-foreground">
            {serviceRequest.assignedStaffId ? `Staff ID: ${serviceRequest.assignedStaffId}` : "Unassigned"}
          </span>
        );
      },
    },
    {
      accessorKey: "requestedDate",
      header: "Requested Date",
      enableSorting: true,
      cell: ({ row }) => {
        const requestedDate = row.getValue("requestedDate") as Date;
        const isOverdue = requestedDate && new Date() > new Date(requestedDate) && row.original.status !== "completed";
        
        return (
          <div className="flex flex-col">
            <span className={cn(
              "text-sm font-medium",
              isOverdue && "text-red-600"
            )}>
              {format(new Date(requestedDate), "MMM dd, yyyy")}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(requestedDate), "HH:mm")}
            </span>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs mt-1">
                Overdue
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "cost",
      header: "Cost",
      enableSorting: true,
      cell: ({ row }) => {
        const cost = row.getValue("cost") as number;
        return (
          <span className="text-sm font-medium">
            {cost ? `$${cost.toFixed(2)}` : "Not set"}
          </span>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {currentUserRole && hasPermission(currentUserRole as any, "service_request.update") && (
            <ServiceRequestSheet id={row.original._id}>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </ServiceRequestSheet>
          )}
          {currentUserRole && hasPermission(currentUserRole as any, "service_request.delete") && (
            <ConfirmServiceRequestDeleteDialog
              id={row.original._id}
              title={`Service Request`}
              description="Are you sure you want to delete this service request? This action cannot be undone."
            >
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </ConfirmServiceRequestDeleteDialog>
          )}
        </div>
      ),
    },
  ];
};

// Backward compatibility export
export const serviceRequestColumns = createServiceRequestColumns();
