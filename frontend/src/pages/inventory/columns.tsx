"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { InventoryItem, UserRole } from "@/types/models";
import { INVENTORY_ITEM_TYPES, INVENTORY_ITEM_STATUSES } from "@/types/models";
import { InventorySheet } from "@/components/sheets/InventorySheet";
import { ConfirmInventoryDeleteDialog } from "@/components/dialogs/ConfirmInventoryDeleteDialog";
import { hasPermission } from "@/lib/permissions";
import currency from "currency.js";
import { format } from "date-fns";

// Inventory type colors mapping
const inventoryTypeColors = {
  [INVENTORY_ITEM_TYPES.FOOD]: "bg-green-100 text-green-800 hover:bg-green-200",
  [INVENTORY_ITEM_TYPES.BEVERAGE]: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  [INVENTORY_ITEM_TYPES.CLEANING_SUPPLY]: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  [INVENTORY_ITEM_TYPES.AMENITY]: "bg-pink-100 text-pink-800 hover:bg-pink-200",
  [INVENTORY_ITEM_TYPES.MAINTENANCE]: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  [INVENTORY_ITEM_TYPES.OFFICE_SUPPLY]: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  [INVENTORY_ITEM_TYPES.OTHER]: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
};

// Inventory status colors mapping
const inventoryStatusColors = {
  [INVENTORY_ITEM_STATUSES.IN_STOCK]: "bg-green-100 text-green-800 hover:bg-green-200",
  [INVENTORY_ITEM_STATUSES.LOW_STOCK]: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  [INVENTORY_ITEM_STATUSES.OUT_OF_STOCK]: "bg-red-100 text-red-800 hover:bg-red-200",
  [INVENTORY_ITEM_STATUSES.EXPIRED]: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  [INVENTORY_ITEM_STATUSES.DISCONTINUED]: "bg-slate-100 text-slate-800 hover:bg-slate-200",
};

export const createInventoryColumns = (
  currentUserRole?: UserRole
): ColumnDef<InventoryItem>[] => [
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
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue("sku")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Item Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("category")}</div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge
          className={inventoryTypeColors[type as keyof typeof inventoryTypeColors]}
        >
          {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          className={inventoryStatusColors[status as keyof typeof inventoryStatusColors]}
        >
          {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const quantity = row.getValue("quantity") as number;
      const minQuantity = row.original.minQuantity;
      const isLowStock = quantity <= minQuantity;
      
      return (
        <div className={`font-medium ${isLowStock ? 'text-orange-600' : ''}`}>
          {quantity.toLocaleString()}
          {isLowStock && (
            <span className="ml-1 text-xs text-orange-500">⚠️</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "unitPrice",
    header: "Unit Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("unitPrice"));
      return <div className="font-medium">{currency(price).format()}</div>;
    },
  },
  {
    accessorKey: "totalValue",
    header: "Total Value",
    cell: ({ row }) => {
      const totalValue = parseFloat(row.getValue("totalValue"));
      return <div className="font-medium">{currency(totalValue).format()}</div>;
    },
  },
  {
    accessorKey: "supplier",
    header: "Supplier",
    cell: ({ row }) => {
      const supplier = row.getValue("supplier") as string;
      return (
        <div className="text-sm">
          {supplier || <span className="text-muted-foreground">-</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      const location = row.getValue("location") as string;
      return (
        <div className="text-sm">
          {location || <span className="text-muted-foreground">-</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry Date",
    cell: ({ row }) => {
      const expiryDate = row.getValue("expiryDate") as string;
      if (!expiryDate) {
        return <span className="text-muted-foreground text-sm">-</span>;
      }
      
      const expiry = new Date(expiryDate);
      const now = new Date();
      const isExpired = expiry < now;
      const isExpiringSoon = expiry.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000; // 30 days
      
      return (
        <div className={`text-sm ${
          isExpired ? 'text-red-600 font-medium' : 
          isExpiringSoon ? 'text-orange-600' : ''
        }`}>
          {format(expiry, "MM/dd/yyyy")}
          {isExpired && <span className="ml-1">🚫</span>}
          {isExpiringSoon && !isExpired && <span className="ml-1">⚠️</span>}
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
        <Badge variant={isActive ? "default" : "secondary"}>
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
        {currentUserRole && hasPermission(currentUserRole, "inventory.delete") && (
          <ConfirmInventoryDeleteDialog
            id={row.original._id}
            itemName={row.original.name}
            sku={row.original.sku}
          >
            <Button variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </ConfirmInventoryDeleteDialog>
        )}
        {currentUserRole && hasPermission(currentUserRole, "inventory.update") && (
          <InventorySheet id={row.original._id}>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </InventorySheet>
        )}
      </div>
    ),
  },
];

// Default export for backward compatibility
export const inventoryColumns = createInventoryColumns();