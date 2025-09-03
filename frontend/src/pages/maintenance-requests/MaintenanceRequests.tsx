import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui";
import { MaintenanceRequestSheet } from "@/components/sheets";
import { PlusIcon } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import type { MaintenanceRequest } from "@/types/models";
import { DataTable } from "@/components/custom/DataTable";
import { createMaintenanceRequestColumns } from "./columns";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/permissions";

const filters = [
  {
    id: "maintenanceType",
    label: "Category",
    options: [
      { value: "electrical", label: "Electrical" },
      { value: "plumbing", label: "Plumbing" },
      { value: "hvac", label: "HVAC" },
      { value: "appliance", label: "Appliance" },
      { value: "structural", label: "Structural" },
      { value: "general", label: "General" },
    ],
  },
  {
    id: "priority",
    label: "Priority",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" },
    ],
  },
  {
    id: "status",
    label: "Status",
    options: [
      { value: "pending", label: "Pending" },
      { value: "assigned", label: "Assigned" },
      { value: "in_progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
];

export function MaintenanceRequests() {
  const { data, isLoading } = useApi<{requests: MaintenanceRequest[]}>(ENDPOINT_URLS.MAINTENANCE_REQUESTS.ALL);
  const { user: currentUser } = useAuth();
  const maintenanceRequestColumns = createMaintenanceRequestColumns(currentUser?.role);
  
  return (
    <div>
      <PageHeader
        title="Maintenance Requests"
        description="Manage maintenance requests, assignments, and completion tracking"
      >
        {currentUser && hasPermission(currentUser.role, "maintenance_request.create") && (
          <MaintenanceRequestSheet>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create New Request
            </Button>
          </MaintenanceRequestSheet>
        )}
      </PageHeader>
      <DataTable
        columns={maintenanceRequestColumns}
        data={data?.requests || []}
        filters={filters}
        loading={isLoading}
        exportFileName="maintenance-requests"
      />
    </div>
  );
}
