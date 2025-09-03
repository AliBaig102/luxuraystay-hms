import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import type { MaintenanceRequest, UserRole } from "@/types/models";
import { Button, Badge } from "@/components/ui";
import { Edit, Trash2, Clock, CheckCircle, AlertTriangle, User, Home, Wrench } from "lucide-react";
import { MaintenanceRequestSheet } from "@/components/sheets";
import { hasPermission } from "@/lib/permissions";
import { ConfirmMaintenanceRequestDeleteDialog } from "@/components/dialogs";
import { cn } from "@/lib/utils";

// Category colors
const categoryColors: Record<string, string> = {
  electrical: "bg-yellow-100 text-yellow-800",
  plumbing: "bg-blue-100 text-blue-800",
  hvac: "bg-green-100 text-green-800",
  appliance: "bg-purple-100 text-purple-800",
  structural: "bg-red-100 text-red-800",
  general: "bg-gray-100 text-gray-800",
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
  pending: "bg-gray-100 text-gray-800",
  assigned: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

// Status icons
const statusIcons: Record<string, any> = {
  pending: Clock,
  assigned: User,
  in_progress: Wrench,
  completed: CheckCircle,
  cancelled: AlertTriangle,
};

export const createMaintenanceRequestColumns = (
  currentUserRole?: UserRole
): ColumnDef<MaintenanceRequest>[] => {
  return [
    {
      accessorKey: "createdAt",
      header: "Date",
      enableSorting: true,
      cell: ({ row }) => format(new Date(row.original.createdAt), "MM/dd/yyyy"),
    },
    {
      accessorKey: "title",
      header: "Title",
      enableSorting: true,
      sortingFn: "text",
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        return (
          <div className="max-w-[200px]">
            <p className="font-medium text-sm truncate">
              {title}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      enableSorting: true,
      sortingFn: "text",
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        return (
          <Badge variant="secondary" className={categoryColors[category]}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      enableSorting: true,
      sortingFn: "text",
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
      sortingFn: "text",
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
      sortingFn: "text",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-[200px]">
            <p className="text-sm text-muted-foreground truncate">
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
      sortingFn: "text",
      cell: ({ row }) => {
        const maintenanceRequest = row.original;
        const room = maintenanceRequest.roomId as any;
        
        if (typeof room === 'object' && room?.roomNumber) {
          return (
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium">Room {room.roomNumber}</span>
                <span className="text-sm text-muted-foreground">
                  {room.roomType}
                </span>
              </div>
            </div>
          );
        }

        return (
          <span className="text-sm text-muted-foreground">
            {maintenanceRequest.roomId ? `Room ID: ${maintenanceRequest.roomId}` : "No Room"}
          </span>
        );
      },
    },
    {
      accessorKey: "reportedBy",
      header: "Reported By",
      enableSorting: true,
      sortingFn: "text",
      cell: ({ row }) => {
        const maintenanceRequest = row.original;
        const reporter = maintenanceRequest.reportedBy as any;
        
        if (typeof reporter === 'object' && reporter?.firstName) {
          return (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium">
                  {reporter.firstName} {reporter.lastName}
                </span>
                <span className="text-sm text-muted-foreground">
                  {reporter.email}
                </span>
              </div>
            </div>
          );
        }

        return (
          <span className="text-sm text-muted-foreground">
            Reporter ID: {maintenanceRequest.reportedBy}
          </span>
        );
      },
    },
    {
      accessorKey: "assignedTechnicianId",
      header: "Assigned Technician",
      enableSorting: true,
      sortingFn: "text",
      cell: ({ row }) => {
        const maintenanceRequest = row.original;
        const technician = maintenanceRequest.assignedTechnicianId as any;
        
        if (typeof technician === 'object' && technician?.firstName) {
          return (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium">
                  {technician.firstName} {technician.lastName}
                </span>
                <span className="text-sm text-muted-foreground">
                  {technician.email}
                </span>
              </div>
            </div>
          );
        }

        return (
          <span className="text-sm text-muted-foreground">
            {maintenanceRequest.assignedTechnicianId ? `Technician ID: ${maintenanceRequest.assignedTechnicianId}` : "Unassigned"}
          </span>
        );
      },
    },
    {
      accessorKey: "estimatedCompletionDate",
      header: "Scheduled Date",
      enableSorting: true,
      cell: ({ row }) => {
        const estimatedDate = row.getValue("estimatedCompletionDate") as Date;
        const isOverdue = estimatedDate && new Date() > new Date(estimatedDate) && row.original.status !== "completed";
        
        if (!estimatedDate) {
          return (
            <span className="text-sm text-muted-foreground italic">
              Not set
            </span>
          );
        }
        
        return (
          <div className="flex flex-col">
            <span className={cn(
              "text-sm font-medium",
              isOverdue && "text-red-600"
            )}>
              {format(new Date(estimatedDate), "MMM dd, yyyy")}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(estimatedDate), "HH:mm")}
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
      header: "Estimated Cost",
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
          {currentUserRole && hasPermission(currentUserRole, "maintenance_request.delete") && (
            <ConfirmMaintenanceRequestDeleteDialog
              id={row.original._id}
              title="Delete Maintenance Request"
              description="Are you sure you want to delete this maintenance request? This action cannot be undone."
            >
              <Button variant="destructive" size="icon">
                <Trash2 />
              </Button>
            </ConfirmMaintenanceRequestDeleteDialog>
          )}
          {currentUserRole && hasPermission(currentUserRole, "maintenance_request.update") && (
            <MaintenanceRequestSheet id={row.original._id}>
              <Button variant="outline" size="icon">
                <Edit />
              </Button>
            </MaintenanceRequestSheet>
          )}
        </div>
      ),
    },
  ];
};

// Export the columns for backward compatibility (without permissions)
export const maintenanceRequestColumns = createMaintenanceRequestColumns();
