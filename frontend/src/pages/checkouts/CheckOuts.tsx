import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui";
import { CheckOutSheet } from "@/components/sheets";
import { PlusIcon } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import type { CheckOut } from "@/types/models";
import { DataTable } from "@/components/custom/DataTable";
import { createCheckOutColumns } from "./columns";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/permissions";
import { PAYMENT_STATUSES } from "@/types/models";

const filters = [
  {
    id: "paymentStatus",
    label: "Payment Status",
    options: [
      { value: PAYMENT_STATUSES.PENDING, label: "Pending" },
      { value: PAYMENT_STATUSES.PARTIAL, label: "Partially Paid" },
      { value: PAYMENT_STATUSES.PAID, label: "Paid" },
      { value: PAYMENT_STATUSES.OVERDUE, label: "Overdue" },
      { value: PAYMENT_STATUSES.CANCELLED, label: "Cancelled" },
    ],
  },
  {
    id: "satisfactionLevel",
    label: "Satisfaction Level",
    options: [
      { value: "high", label: "High" },
      { value: "medium", label: "Medium" },
      { value: "low", label: "Low" },
      { value: "not_rated", label: "Not Rated" },
    ],
  },
];

export const CheckOuts = () => {
  const { data, isLoading } = useApi<CheckOut[]>(ENDPOINT_URLS.CHECKOUTS.ALL, { auth: true });
  const { user: currentUser } = useAuth();
  const checkOutColumns = createCheckOutColumns(currentUser?.role);
  
  return (
    <div>
      <PageHeader
        title="Check-outs"
        description="Manage guest check-outs, billing, and feedback collection"
      >
        {currentUser && hasPermission(currentUser.role, "checkout.create") && (
          <CheckOutSheet>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create New Check-out
            </Button>
          </CheckOutSheet>
        )}
      </PageHeader>
      <DataTable
        columns={checkOutColumns}
        data={data || []}
        filters={filters}
        loading={isLoading}
        exportFileName="checkouts"
        enableGlobalSearch={true}
        enableDateFilter={true}
        dateFilterColumn="checkOutTime"
      />
    </div>
  );
};
