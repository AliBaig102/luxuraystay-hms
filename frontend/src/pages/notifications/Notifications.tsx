import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui";
import { NotificationSheet } from "@/components/sheets";
import { PlusIcon } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import type { Notification } from "@/types/models";
import { DataTable } from "@/components/custom/DataTable";
import { createNotificationColumns } from "./columns";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/permissions";

const filters = [
  {
    id: "type",
    label: "Type",
    options: [
      { value: "booking", label: "Booking" },
      { value: "maintenance", label: "Maintenance" },
      { value: "housekeeping", label: "Housekeeping" },
      { value: "billing", label: "Billing" },
      { value: "system", label: "System" },
      { value: "reminder", label: "Reminder" },
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
    id: "recipientType",
    label: "Recipient Type",
    options: [
      { value: "user", label: "User" },
      { value: "guest", label: "Guest" },
    ],
  },
  {
    id: "isRead",
    label: "Status",
    options: [
      { value: "true", label: "Read" },
      { value: "false", label: "Unread" },
    ],
  },
];

export function Notifications() {
  const { data, isLoading } = useApi<{notifications: Notification[]}>(ENDPOINT_URLS.NOTIFICATIONS.ALL);
  const { user: currentUser } = useAuth();
  const notificationColumns = createNotificationColumns(currentUser?.role);
  
  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Manage system notifications, alerts, and communication messages"
      >
        {currentUser && hasPermission(currentUser.role, "notification.create") && (
          <NotificationSheet>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create New Notification
            </Button>
          </NotificationSheet>
        )}
      </PageHeader>
      <DataTable
        columns={notificationColumns}
        data={data?.notifications || []}
        filters={filters}
        loading={isLoading}
        exportFileName="notifications"
      />
    </div>
  );
}
