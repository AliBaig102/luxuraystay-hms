import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import type { User, UserRole } from "@/types/models";
import { Button, Badge } from "@/components/ui";
import { Edit, Trash2 } from "lucide-react";
import { UserSheet } from "@/components/sheets";
import { hasPermission } from "@/lib/permissions";
import { USER_ROLES } from "@/types/models";
import { ConfirmUserDeleteDialog } from "@/components/dialogs";

export const createUserColumns = (
  currentUserRole?: UserRole
): ColumnDef<User>[] => {
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
      accessorKey: "firstName",
      header: "First Name",
      enableSorting: true,
      sortingFn: "text",
    },
    {
      accessorKey: "lastName",
      header: "Last Name",
      enableSorting: true,
      sortingFn: "text",
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
      sortingFn: "text",
    },
    {
      accessorKey: "phone",
      header: "Phone",
      enableSorting: true,
      sortingFn: "text",
    },
    {
      accessorKey: "role",
      header: "Role",
      enableSorting: true,
      sortingFn: "text",
      cell: ({ row }) => {
        const role = row.original.role;
        const roleColors: Record<UserRole, string> = {
          [USER_ROLES.ADMIN]: "bg-destructive/10 text-destructive",
          [USER_ROLES.MANAGER]: "bg-chart-1/10 text-chart-1",
          [USER_ROLES.RECEPTIONIST]: "bg-chart-2/10 text-chart-2",
          [USER_ROLES.HOUSEKEEPING]: "bg-chart-3/10 text-chart-3",
          [USER_ROLES.MAINTENANCE]: "bg-chart-4/10 text-chart-4",
          [USER_ROLES.GUEST]: "bg-muted text-muted-foreground",
        };
        return (
          <Badge
            variant="secondary"
            className={`${roleColors[role]} capitalize`}
          >
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      enableSorting: true,
      sortingFn: "text",
      filterFn: "booleanFilter",
      cell: ({ row }) => (
        <Badge
          variant={row.original.isActive ? "default" : "secondary"}
          className={
            row.original.isActive
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {currentUserRole && hasPermission(currentUserRole, "user.delete") && (
            <ConfirmUserDeleteDialog
              id={row.original._id}
              title="Delete User"
              description={`Are you sure you want to delete ${row.original.firstName} ${row.original.lastName}? This action cannot be undone.`}
            >
              <Button variant="destructive" size="icon">
                <Trash2 />
              </Button>
            </ConfirmUserDeleteDialog>
          )}
          {currentUserRole && hasPermission(currentUserRole, "user.update") && (
            <UserSheet id={row.original._id}>
              <Button variant="outline" size="icon">
                <Edit />
              </Button>
            </UserSheet>
          )}
        </div>
      ),
    },
  ];
};

// Export the columns for backward compatibility (without permissions)
export const userColumns = createUserColumns();
