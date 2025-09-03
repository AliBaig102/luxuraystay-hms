import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui";
import { CheckInSheet } from "@/components/sheets";
import { PlusIcon } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import type { CheckIn } from "@/types/models";
import { DataTable } from "@/components/custom/DataTable";
import { createCheckInColumns } from "./columns";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/permissions";

const filters = [
  {
    id: "keyIssued",
    label: "Key Status",
    options: [
      { value: "true", label: "Issued" },
      { value: "false", label: "Pending" },
    ],
  },
  {
    id: "welcomePackDelivered",
    label: "Welcome Pack",
    options: [
      { value: "true", label: "Delivered" },
      { value: "false", label: "Pending" },
    ],
  },
  {
    id: "isActiveStay",
    label: "Status",
    options: [
      { value: "true", label: "Active" },
      { value: "false", label: "Completed" },
    ],
  },
];

export const CheckIns = () => {
  const { data, isLoading } = useApi<CheckIn[]>(ENDPOINT_URLS.CHECKINS.ALL, { auth: true });
  const { user: currentUser } = useAuth();
  const checkInColumns = createCheckInColumns(currentUser?.role);
  
  return (
    <div>
      <PageHeader
        title="Check-ins"
        description="Manage guest check-ins, room assignments, and key distribution"
      >
        {currentUser && hasPermission(currentUser.role, "checkin.create") && (
          <CheckInSheet>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create New Check-in
            </Button>
          </CheckInSheet>
        )}
      </PageHeader>
      <DataTable
        columns={checkInColumns}
        data={data || []}
        filters={filters}
        loading={isLoading}
        exportFileName="checkins"
        enableGlobalSearch={true}
        enableDateFilter={true}
        dateFilterColumn="checkInTime"
      />
    </div>
  );
};
