import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui";
import { InventorySheet } from "@/components/sheets/InventorySheet";
import { PlusIcon } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import type { InventoryItem } from "@/types/models";
import { DataTable } from "@/components/custom/DataTable";
import { createInventoryColumns } from "./columns";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/permissions";
import { INVENTORY_ITEM_TYPES, INVENTORY_ITEM_STATUSES } from "@/types/models";

const filters = [
  {
    id: "type",
    label: "Item Type",
    options: [
      { value: INVENTORY_ITEM_TYPES.FOOD, label: "Food" },
      { value: INVENTORY_ITEM_TYPES.BEVERAGE, label: "Beverage" },
      { value: INVENTORY_ITEM_TYPES.CLEANING_SUPPLY, label: "Cleaning Supply" },
      { value: INVENTORY_ITEM_TYPES.AMENITY, label: "Amenity" },
      { value: INVENTORY_ITEM_TYPES.MAINTENANCE, label: "Maintenance" },
      { value: INVENTORY_ITEM_TYPES.OFFICE_SUPPLY, label: "Office Supply" },
      { value: INVENTORY_ITEM_TYPES.OTHER, label: "Other" },
    ],
  },
  {
    id: "status",
    label: "Status",
    options: [
      { value: INVENTORY_ITEM_STATUSES.IN_STOCK, label: "In Stock" },
      { value: INVENTORY_ITEM_STATUSES.LOW_STOCK, label: "Low Stock" },
      { value: INVENTORY_ITEM_STATUSES.OUT_OF_STOCK, label: "Out of Stock" },
      { value: INVENTORY_ITEM_STATUSES.EXPIRED, label: "Expired" },
      { value: INVENTORY_ITEM_STATUSES.DISCONTINUED, label: "Discontinued" },
    ],
  },
  {
    id: "isActive",
    label: "Active Status",
    options: [
      { value: "true", label: "Active" },
      { value: "false", label: "Inactive" },
    ],
  },
  {
    id: "category",
    label: "Category",
    options: [
      { value: "Kitchen", label: "Kitchen" },
      { value: "Housekeeping", label: "Housekeeping" },
      { value: "Front Desk", label: "Front Desk" },
      { value: "Maintenance", label: "Maintenance" },
      { value: "Guest Amenities", label: "Guest Amenities" },
      { value: "Office", label: "Office" },
      { value: "Restaurant", label: "Restaurant" },
      { value: "Bar", label: "Bar" },
      { value: "Spa", label: "Spa" },
      { value: "Laundry", label: "Laundry" },
    ],
  },
];

export const Inventory = () => {
  const { data, isLoading } = useApi<InventoryItem[]>(ENDPOINT_URLS.INVENTORY.ALL);
  const { user: currentUser } = useAuth();
  const inventoryColumns = createInventoryColumns(currentUser?.role);
  
  return (
    <div>
      <PageHeader
        title="Inventory Management"
        description="Manage hotel inventory items, stock levels, and suppliers"
      >
        {currentUser && hasPermission(currentUser.role, "inventory.create") && (
          <InventorySheet>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Item
            </Button>
          </InventorySheet>
        )}
      </PageHeader>
      <DataTable
        columns={inventoryColumns}
        data={data || []}
        filters={filters}
        loading={isLoading}
        exportFileName="inventory"
      />
    </div>
  );
};