import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
} from "@/components/ui";
import { Trash2, AlertTriangle } from "lucide-react";
import { LoadingButton } from "../custom/LoadingButton";
import type { ReactNode } from "react";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { useState } from "react";
import type { Bill } from "@/types/models";
import { cn } from "@/lib/utils";

interface DeleteBillDialogProps {
  id: string;
  bill: Bill;
  children: ReactNode;
}

export function DeleteBillDialog({
  id,
  bill,
  children,
}: DeleteBillDialogProps) {
  const [open, setOpen] = useState(false);
  const { delete: deleteBill, isMutating, invalidate } = useApi(
    ENDPOINT_URLS.BILLS.DELETE(id),
    { immediate: false }
  );

  const handleDelete = async () => {
    try {
      await deleteBill(ENDPOINT_URLS.BILLS.DELETE(id));
      await invalidate(ENDPOINT_URLS.BILLS.ALL);
      setOpen(false);
      console.log("Bill deleted successfully");
    } catch (error) {
      console.error("Failed to delete bill:", error);
    }
  };

  const canDelete = bill.status === "draft" || bill.status === "cancelled";
  const isPaidOrRefunded = bill.status === "paid" || bill.status === "refunded";

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            Delete Bill
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {canDelete
              ? "Are you sure you want to delete this bill? This action cannot be undone."
              : "This bill cannot be deleted due to its current status."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Bill Details */}
        <div className="space-y-3">
          <div className="p-3 bg-muted rounded-md">
            <div className="text-sm font-medium mb-2">Bill Details:</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Bill ID:</span>
                <span className="font-mono">#{bill._id.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-semibold">${bill.totalAmount.toFixed(2)}</span>
              </div>
              {bill.paidAmount && bill.paidAmount > 0 && (
                <div className="flex justify-between">
                  <span>Paid Amount:</span>
                  <span className="text-green-600">${bill.paidAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    bill.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : bill.status === "pending"
                      ? "bg-blue-100 text-blue-800"
                      : bill.status === "overdue"
                      ? "bg-red-100 text-red-800"
                      : bill.status === "draft"
                      ? "bg-gray-100 text-gray-800"
                      : bill.status === "cancelled"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-yellow-100 text-yellow-800"
                  )}
                >
                  {bill.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Due Date:</span>
                <span>{new Date(bill.dueDate).toLocaleDateString()}</span>
              </div>
              {bill.paymentDate && (
                <div className="flex justify-between">
                  <span>Payment Date:</span>
                  <span>{new Date(bill.paymentDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Warning for non-deletable bills */}
          {!canDelete && (
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-md border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Cannot Delete Bill</span>
              </div>
              <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                {isPaidOrRefunded
                  ? "Bills with payments or refunds cannot be deleted for audit purposes. Consider cancelling the bill instead."
                  : bill.status === "pending"
                  ? "Pending bills cannot be deleted. Cancel the bill first if needed."
                  : bill.status === "overdue"
                  ? "Overdue bills cannot be deleted. Process payment or cancel the bill first."
                  : "This bill cannot be deleted in its current state."}
              </div>
            </div>
          )}

          {/* Confirmation for deletable bills */}
          {canDelete && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-md border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Warning</span>
              </div>
              <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                This action will permanently delete the bill and all associated data. This cannot be undone.
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
          {canDelete && (
            <LoadingButton
              isLoading={isMutating}
              onClick={handleDelete}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Bill
            </LoadingButton>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}