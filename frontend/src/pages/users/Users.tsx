import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui";
import { UserSheet } from "@/components/sheets";
import { PlusIcon } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import type { User } from "@/types/models";
import { DataTable } from "@/components/custom/DataTable";
import { userColumns } from "./columns";

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
  console.log(isLoading);
  console.log(data);

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage user accounts, roles, and permissions"
      >
        <UserSheet>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create New User
          </Button>
        </UserSheet>
      </PageHeader>
      {/* <UserDataTableExample /> */}
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
