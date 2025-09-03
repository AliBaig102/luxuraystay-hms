import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui";
import { ServiceRequestSheet } from "@/components/sheets";
import { PlusIcon } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import type { ServiceRequest } from "@/types/models";
import { DataTable } from "@/components/custom/DataTable";
import { createServiceRequestColumns } from "./columns";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/permissions";

const filters = [
  {
    id: "serviceType",
    label: "Service Type",
    options: [
      { value: "room_service", label: "Room Service" },
      { value: "wake_up_call", label: "Wake Up Call" },
      { value: "transportation", label: "Transportation" },
      { value: "laundry", label: "Laundry" },
      { value: "housekeeping", label: "Housekeeping" },
      { value: "maintenance", label: "Maintenance" },
      { value: "concierge", label: "Concierge" },
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
      { value: "requested", label: "Requested" },
      { value: "in_progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
];

export function ServiceRequests() {
  const { data, isLoading } = useApi<ServiceRequest[]>(ENDPOINT_URLS.SERVICE_REQUESTS.ALL);
  const { user: currentUser } = useAuth();
  const serviceRequestColumns = createServiceRequestColumns(currentUser?.role);
  
  return (
    <div>
      <PageHeader
        title="Service Requests"
        description="Manage guest service requests, assignments, and completion tracking"
      >
        {currentUser && hasPermission(currentUser.role, "service_request.create") && (
          <ServiceRequestSheet>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create New Request
            </Button>
          </ServiceRequestSheet>
        )}
      </PageHeader>
      <DataTable
        columns={serviceRequestColumns}
        data={data || []}
        filters={filters}
        loading={isLoading}
        exportFileName="service-requests"
      />
    </div>
  );
}
