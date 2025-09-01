import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "@/types/models";

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
];
