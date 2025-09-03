import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { Edit, Trash2, User, Bell, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/models";
import { NotificationSheet } from "@/components/sheets";
import { ConfirmNotificationDeleteDialog } from "@/components/dialogs";
import { hasPermission } from "@/lib/permissions";

// Notification type colors
const notificationTypeColors: Record<string, string> = {
  booking: "bg-blue-100 text-blue-800",
  maintenance: "bg-red-100 text-red-800",
  housekeeping: "bg-orange-100 text-orange-800",
  billing: "bg-green-100 text-green-800",
  system: "bg-purple-100 text-purple-800",
  reminder: "bg-yellow-100 text-yellow-800",
};

// Priority colors
const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

// Recipient type colors
const recipientTypeColors: Record<string, string> = {
  user: "bg-blue-100 text-blue-800",
  guest: "bg-green-100 text-green-800",
};

export const createNotificationColumns = (
  currentUserRole?: string
): ColumnDef<Notification>[] => {
  return [
    {
      accessorKey: "createdAt",
      header: "Date",
      enableSorting: true,
      cell: ({ row }) => format(new Date(row.original.createdAt), "MM/dd/yyyy HH:mm"),
    },
    {
      accessorKey: "type",
      header: "Type",
      enableSorting: true,
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <Badge variant="secondary" className={notificationTypeColors[type]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
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
      accessorKey: "title",
      header: "Title",
      enableSorting: true,
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        const isRead = row.original.isRead;
        return (
          <div className="max-w-[200px]">
            <p className={cn(
              "text-sm font-medium truncate",
              !isRead && "font-semibold"
            )}>
              {title}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "message",
      header: "Message",
      enableSorting: true,
      cell: ({ row }) => {
        const message = row.getValue("message") as string;
        const isRead = row.original.isRead;
        return (
          <div className="max-w-[300px]">
            <p className={cn(
              "text-sm truncate",
              !isRead && "font-medium"
            )}>
              {message}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "recipientType",
      header: "Recipient Type",
      enableSorting: true,
      cell: ({ row }) => {
        const recipientType = row.getValue("recipientType") as string;
        return (
          <Badge variant="secondary" className={recipientTypeColors[recipientType]}>
            {recipientType.charAt(0).toUpperCase() + recipientType.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "recipientId",
      header: "Recipient",
      enableSorting: true,
      cell: ({ row }) => {
        const notification = row.original;
        const recipient = notification.recipientId as any;
        
        if (typeof recipient === 'object' && recipient?.firstName) {
          return (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium">
                  {recipient.firstName} {recipient.lastName}
                </span>
                <span className="text-sm text-muted-foreground">
                  {recipient.email}
                </span>
              </div>
            </div>
          );
        }

        return (
          <span className="text-sm text-muted-foreground">
            {notification.recipientId ? `ID: ${notification.recipientId}` : "No recipient"}
          </span>
        );
      },
    },
    {
      accessorKey: "isRead",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => {
        const isRead = row.getValue("isRead") as boolean;
        return (
          <div className="flex items-center gap-2">
            {isRead ? (
              <Eye className="h-4 w-4 text-green-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-red-600" />
            )}
            <Badge variant="secondary" className={cn(
              "text-xs",
              isRead ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            )}>
              {isRead ? "Read" : "Unread"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "readDate",
      header: "Read Date",
      enableSorting: true,
      cell: ({ row }) => {
        const readDate = row.getValue("readDate") as Date;
        return (
          <span className="text-sm text-muted-foreground">
            {readDate ? format(new Date(readDate), "MM/dd/yyyy HH:mm") : "Not read"}
          </span>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {currentUserRole && hasPermission(currentUserRole as any, "notification.update") && (
            <NotificationSheet id={row.original._id}>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </NotificationSheet>
          )}
          {currentUserRole && hasPermission(currentUserRole as any, "notification.delete") && (
            <ConfirmNotificationDeleteDialog
              id={row.original._id}
              title={`Notification`}
              description="Are you sure you want to delete this notification? This action cannot be undone."
            >
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </ConfirmNotificationDeleteDialog>
          )}
        </div>
      ),
    },
  ];
};

// Backward compatibility export
export const notificationColumns = createNotificationColumns();
