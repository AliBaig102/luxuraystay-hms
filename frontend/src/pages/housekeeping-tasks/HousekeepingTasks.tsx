import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui";
import { HousekeepingTaskSheet } from "@/components/sheets";
import { PlusIcon } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import type { HousekeepingTask } from "@/types/models";
import { DataTable } from "@/components/custom/DataTable";
import { createHousekeepingTaskColumns } from "./columns";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/permissions";

const filters = [
  {
    id: "taskType",
    label: "Task Type",
    options: [
      { value: "daily_cleaning", label: "Daily Cleaning" },
      { value: "deep_cleaning", label: "Deep Cleaning" },
      { value: "linen_change", label: "Linen Change" },
      { value: "amenity_restock", label: "Amenity Restock" },
      { value: "inspection", label: "Inspection" },
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

export function HousekeepingTasks() {
  const { data, isLoading } = useApi<HousekeepingTask[]>(ENDPOINT_URLS.HOUSEKEEPING_TASKS.ALL);
  const { user: currentUser } = useAuth();
  const housekeepingTaskColumns = createHousekeepingTaskColumns(currentUser?.role);
  
  return (
    <div>
      <PageHeader
        title="Housekeeping Tasks"
        description="Manage housekeeping tasks, assignments, and completion tracking"
      >
        {currentUser && hasPermission(currentUser.role, "housekeeping_task.create") && (
          <HousekeepingTaskSheet>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create New Task
            </Button>
          </HousekeepingTaskSheet>
        )}
      </PageHeader>
      <DataTable
        columns={housekeepingTaskColumns}
        data={data || []}
        filters={filters}
        loading={isLoading}
        exportFileName="housekeeping-tasks"
      />
    </div>
  );
}
