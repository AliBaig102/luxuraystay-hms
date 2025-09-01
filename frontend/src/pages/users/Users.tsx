import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui";
import { UserSheet } from "@/components/sheets";
import { PlusIcon } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import type { User } from "@/types/models";
import { DataTable } from "@/components/custom/DataTable";
import { createUserColumns } from "./columns";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/permissions";

const filters = [
  {
    id: "role",
    label: "Role",
    options: [
      { value: "admin", label: "Admin" },
      { value: "manager", label: "Manager" },
      { value: "receptionist", label: "Receptionist" },
      { value: "housekeeping", label: "Housekeeping" },
      { value: "maintenance", label: "Maintenance" },
      { value: "guest", label: "Guest" },
      
    ],
  },
  {
    id: "isActive",
    label: "Status",
    options: [
      { value: "true", label: "Active" },
      { value: "false", label: "Inactive" },
    ],
  },
];

export const Users = () => {
  const { data, isLoading } = useApi<User[]>(ENDPOINT_URLS.USERS.ALL);
  const { user: currentUser } = useAuth();
  const userColumns = createUserColumns(currentUser?.role);
  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage user accounts, roles, and permissions"
      >
        {currentUser && hasPermission(currentUser.role, "user.create") && (
          <UserSheet>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create New User
            </Button>
          </UserSheet>
        )}
      </PageHeader>
      <DataTable
        columns={userColumns}
        data={data || []}
        filters={filters}
        loading={isLoading}
        exportFileName="users"
      />
    </div>
  );
};
