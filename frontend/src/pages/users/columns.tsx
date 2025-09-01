import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "@/types/models";
import { ConfirmDeleteDialog } from "@/components/dialogs/ConfirmUserDeleteDialog";
import { Button } from "@/components/ui";
import { Edit, Trash2 } from "lucide-react";
import { UserSheet } from "@/components/sheets";

export const userColumns: ColumnDef<User>[] = [
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
  },
  {
    accessorKey: "isActive",
    header: "Status",
    enableSorting: true,
    sortingFn: "text",
    filterFn: "booleanFilter",
    cell: ({ row }) => (row.original.isActive ? "Active" : "Inactive"),
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <ConfirmDeleteDialog
          id={row.original._id}
          title="Delete User"
          description={`Are you sure you want to delete ${row.original.firstName} ${row.original.lastName}? This action cannot be undone.`}
        >
          <Button variant="destructive" size="icon">
            <Trash2 />
          </Button>
        </ConfirmDeleteDialog>
        <UserSheet id={row.original._id}>
          <Button variant="outline" size="icon">
            <Edit />
          </Button>
        </UserSheet>
      </div>
    ),
  },
];
