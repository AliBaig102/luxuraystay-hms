import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui";
import { BillSheet } from "@/components/sheets/BillSheet";
import { PlusIcon } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import type { Bill } from "@/types/models";
import { DataTable } from "@/components/custom/DataTable";
import { createBillColumns } from "./columns";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/permissions";
import { BILL_STATUSES, PAYMENT_METHODS } from "@/types/models";

const filters = [
  {
    id: "status",
    label: "Bill Status",
    options: [
      { value: BILL_STATUSES.DRAFT, label: "Draft" },
      { value: BILL_STATUSES.PENDING, label: "Pending" },
      { value: BILL_STATUSES.PAID, label: "Paid" },
      { value: BILL_STATUSES.OVERDUE, label: "Overdue" },
      { value: BILL_STATUSES.CANCELLED, label: "Cancelled" },
      { value: BILL_STATUSES.REFUNDED, label: "Refunded" },
    ],
  },
  {
    id: "paymentMethod",
    label: "Payment Method",
    options: [
      { value: PAYMENT_METHODS.CASH, label: "Cash" },
      { value: PAYMENT_METHODS.CREDIT_CARD, label: "Credit Card" },
      { value: PAYMENT_METHODS.DEBIT_CARD, label: "Debit Card" },
      { value: PAYMENT_METHODS.BANK_TRANSFER, label: "Bank Transfer" },
      { value: PAYMENT_METHODS.DIGITAL_WALLET, label: "Digital Wallet" },
      { value: PAYMENT_METHODS.CHECK, label: "Check" },
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
];

export const Bills = () => {
  const { data, isLoading } = useApi<{bills: Bill[]}>(
    ENDPOINT_URLS.BILLS.ALL, 
    { auth: true }
  );
  const { user: currentUser } = useAuth();
  const billColumns = createBillColumns(currentUser?.role);
  
  return (
    <div>
      <PageHeader
        title="Bills"
        description="Manage guest bills, payments, and financial transactions"
      >
        {currentUser && hasPermission(currentUser.role, "bill.create") && (
          <BillSheet>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create New Bill
            </Button>
          </BillSheet>
        )}
      </PageHeader>
      <DataTable
        columns={billColumns}
        data={data?.bills || []}
        filters={filters}
        loading={isLoading}
        exportFileName="bills"
        enableGlobalSearch={true}
        enableDateFilter={true}
        dateFilterColumn="dueDate"
      />
    </div>
  );
};