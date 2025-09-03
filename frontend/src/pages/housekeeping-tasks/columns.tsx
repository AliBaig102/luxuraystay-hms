import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import type { HousekeepingTask, UserRole } from "@/types/models";
import { Button, Badge } from "@/components/ui";
import { Edit, Trash2, Clock, CheckCircle, AlertTriangle, User, Home } from "lucide-react";
import { HousekeepingTaskSheet } from "@/components/sheets";
import { hasPermission } from "@/lib/permissions";
import { ConfirmHousekeepingTaskDeleteDialog } from "@/components/dialogs";
import { cn } from "@/lib/utils";

// Task type colors
const taskTypeColors: Record<string, string> = {
  daily_cleaning: "bg-blue-100 text-blue-800",
  deep_cleaning: "bg-purple-100 text-purple-800",
  linen_change: "bg-green-100 text-green-800",
  amenity_restock: "bg-orange-100 text-orange-800",
  inspection: "bg-indigo-100 text-indigo-800",
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
  in_progress: Clock,
  completed: CheckCircle,
  cancelled: AlertTriangle,
};

export const createHousekeepingTaskColumns = (
  currentUserRole?: UserRole
): ColumnDef<HousekeepingTask>[] => {
  return [
    {
      accessorKey: "createdAt",
      header: "Date",
      enableSorting: true,
      sortingFn: "datetime",
      filterFn: "dateRange",
      cell: ({ row }) => format(new Date(row.original.createdAt), "MM/dd/yyyy"),
    },
    {
      accessorKey: "taskType",
      header: "Task Type",
      enableSorting: true,
      sortingFn: "text",
      cell: ({ row }) => {
        const taskType = row.getValue("taskType") as string;
        return (
          <Badge variant="secondary" className={taskTypeColors[taskType]}>
            {taskType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
      filterFn: "booleanFilter",
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
      accessorKey: "roomId",
      header: "Room",
      enableSorting: true,
      sortingFn: "text",
      cell: ({ row }) => {
        const housekeepingTask = row.original;
        const room = housekeepingTask.roomId as any;
        
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
            Room ID: {housekeepingTask.roomId}
          </span>
        );
      },
    },
    {
      accessorKey: "assignedStaffId",
      header: "Assigned Staff",
      enableSorting: true,
      sortingFn: "text",
      cell: ({ row }) => {
        const housekeepingTask = row.original;
        const staff = housekeepingTask.assignedStaffId as any;
        
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
            Staff ID: {housekeepingTask.assignedStaffId}
          </span>
        );
      },
    },
    {
      accessorKey: "scheduledDate",
      header: "Scheduled Date",
      enableSorting: true,
      sortingFn: "datetime",
      filterFn: "dateRange",
      cell: ({ row }) => {
        const scheduledDate = row.getValue("scheduledDate") as Date;
        const isOverdue = new Date() > new Date(scheduledDate) && row.original.status !== "completed";
        
        return (
          <div className="flex flex-col">
            <span className={cn(
              "text-sm font-medium",
              isOverdue && "text-red-600"
            )}>
              {format(new Date(scheduledDate), "MMM dd, yyyy")}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(scheduledDate), "HH:mm")}
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
      accessorKey: "notes",
      header: "Notes",
      enableSorting: true,
      sortingFn: "text",
      cell: ({ row }) => {
        const notes = row.getValue("notes") as string;
        return (
          <div className="max-w-[200px]">
            {notes ? (
              <p className="text-sm text-muted-foreground truncate">
                {notes}
              </p>
            ) : (
              <span className="text-sm text-muted-foreground italic">
                No notes
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {currentUserRole && hasPermission(currentUserRole, "housekeeping_task.delete") && (
            <ConfirmHousekeepingTaskDeleteDialog
              id={row.original._id}
              title="Delete Housekeeping Task"
              description="Are you sure you want to delete this housekeeping task? This action cannot be undone."
            >
              <Button variant="destructive" size="icon">
                <Trash2 />
              </Button>
            </ConfirmHousekeepingTaskDeleteDialog>
          )}
          {currentUserRole && hasPermission(currentUserRole, "housekeeping_task.update") && (
            <HousekeepingTaskSheet id={row.original._id}>
              <Button variant="outline" size="icon">
                <Edit />
              </Button>
            </HousekeepingTaskSheet>
          )}
        </div>
      ),
    },
  ];
};

// Export the columns for backward compatibility (without permissions)
export const housekeepingTaskColumns = createHousekeepingTaskColumns();
