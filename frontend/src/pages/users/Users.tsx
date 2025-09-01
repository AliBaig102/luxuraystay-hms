import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui";
import { UserSheet } from "@/components/sheets";
import { PlusIcon } from "lucide-react";
import { UserDataTableExample } from "@/components/custom/DataTableExample";

export const Users = () => {
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
      <UserDataTableExample />
    </div>
  );
};
