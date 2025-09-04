"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2, CreditCard, RefreshCw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Bill, UserRole } from "@/types/models";
import { BILL_STATUSES, PAYMENT_METHODS } from "@/types/models";
import { BillSheet } from "@/components/sheets/BillSheet";
import { ProcessPaymentDialog } from "@/components/dialogs/ProcessPaymentDialog";
import { ProcessRefundDialog } from "@/components/dialogs/ProcessRefundDialog";
import { DeleteBillDialog } from "@/components/dialogs/DeleteBillDialog";
import { hasPermission } from "@/lib/permissions";
import currency from "currency.js";
import { format } from "date-fns";

// Bill status colors mapping
const billStatusColors = {
  [BILL_STATUSES.DRAFT]: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  [BILL_STATUSES.PENDING]: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  [BILL_STATUSES.PAID]: "bg-green-100 text-green-800 hover:bg-green-200",
  [BILL_STATUSES.OVERDUE]: "bg-red-100 text-red-800 hover:bg-red-200",
  [BILL_STATUSES.CANCELLED]: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  [BILL_STATUSES.REFUNDED]: "bg-purple-100 text-purple-800 hover:bg-purple-200",
};

// Payment method colors mapping
const paymentMethodColors = {
  [PAYMENT_METHODS.CASH]: "bg-green-100 text-green-800 hover:bg-green-200",
  [PAYMENT_METHODS.CREDIT_CARD]: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  [PAYMENT_METHODS.DEBIT_CARD]: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  [PAYMENT_METHODS.BANK_TRANSFER]: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
  [PAYMENT_METHODS.DIGITAL_WALLET]: "bg-orange-100 text-orange-800 hover:bg-orange-200",
};

export const createBillColumns = (
  currentUserRole?: UserRole
): ColumnDef<Bill>[] => [
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <div className="font-medium">
        {format(new Date(row.getValue("createdAt")), "MM/dd/yyyy")}
      </div>
    ),
  },
  {
    accessorKey: "reservationId",
    header: "Reservation",
    cell: ({ row }) => {
      const reservation = row.original.reservationId as unknown as { _id: string } | null;
      return (
        <div className="font-medium">
          {reservation?._id ? `#${reservation._id.slice(-6)}` : 'N/A'}
        </div>
      );
    },
  },
  {
    accessorKey: "guestId",
    header: "Guest",
    cell: ({ row }) => {
      const guest = row.original.guestId as unknown as { firstName: string, lastName: string } | null;
      return (
        <div className="font-medium">
          {guest?.firstName || 'N/A'} {guest?.lastName || 'N/A'}
        </div>
      );
    },
  },
  {
    accessorKey: "roomId",
    header: "Room",
    cell: ({ row }) => {
      const room = row.original.roomId as unknown as { roomNumber: string } | null;
      return (
        <div className="font-medium">
          {room?.roomNumber || 'N/A'}
        </div>
      );
    },
  },
  {
    accessorKey: "baseAmount",
    header: "Base Amount",
    cell: ({ row }) => {
      const amount = currency(row.getValue("baseAmount"));
      return <div className="font-medium">{amount.format()}</div>;
    },
  },
  {
    accessorKey: "taxAmount",
    header: "Tax",
    cell: ({ row }) => {
      const amount = currency(row.getValue("taxAmount"));
      return <div>{amount.format()}</div>;
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
    cell: ({ row }) => {
      const amount = currency(row.getValue("totalAmount"));
      return <div className="font-bold text-lg">{amount.format()}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof billStatusColors;
      return (
        <Badge className={billStatusColors[status] || "bg-gray-100 text-gray-800"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
    cell: ({ row }) => {
      const method = row.getValue("paymentMethod") as keyof typeof paymentMethodColors;
      if (!method) return <div className="text-gray-500">-</div>;
      return (
        <Badge className={paymentMethodColors[method] || "bg-gray-100 text-gray-800"}>
          {typeof method === 'string' ? method.replace('_', ' ') : method}
        </Badge>
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => {
      const dueDate = row.getValue("dueDate");
      if (!dueDate || typeof dueDate !== 'string' && typeof dueDate !== 'number' && !(dueDate instanceof Date)) return <div className="text-gray-500">-</div>;
      return (
        <div>{format(new Date(dueDate), "MM/dd/yyyy")}</div>
      );
    },
  },
  {
    accessorKey: "paymentDate",
    header: "Payment Date",
    cell: ({ row }) => {
      const paymentDate = row.getValue("paymentDate");
      if (!paymentDate || typeof paymentDate !== 'string' && typeof paymentDate !== 'number' && !(paymentDate instanceof Date)) return <div className="text-gray-500">-</div>;
      return (
        <div>{format(new Date(paymentDate), "MM/dd/yyyy")}</div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const bill = row.original;
      const canPay = bill.status === BILL_STATUSES.PENDING || bill.status === BILL_STATUSES.OVERDUE;
      const canRefund = bill.status === BILL_STATUSES.PAID;
      const canEdit = [BILL_STATUSES.DRAFT, BILL_STATUSES.PENDING].includes(bill.status as "draft" | "pending");
      const canDelete = [BILL_STATUSES.DRAFT, BILL_STATUSES.CANCELLED].includes(bill.status as "draft" | "cancelled");
      
      return (
        <div className="flex items-center gap-2">
          {/* View Button */}
          {currentUserRole && hasPermission(currentUserRole, "bill.view") && (
            <BillSheet id={row.original._id}>
              <Button variant="outline" size="icon" title="View Bill">
                <Eye className="h-4 w-4" />
              </Button>
            </BillSheet>
          )}
          
          {/* Pay Button */}
          {currentUserRole && hasPermission(currentUserRole, "bill.update") && canPay && (
            <ProcessPaymentDialog
              id={row.original._id}
              bill={bill}
            >
              <Button variant="default" size="icon" title="Process Payment" className="bg-green-600 hover:bg-green-700">
                <CreditCard className="h-4 w-4" />
              </Button>
            </ProcessPaymentDialog>
          )}
          
          {/* Refund Button */}
          {currentUserRole && hasPermission(currentUserRole, "bill.update") && canRefund && (
            <ProcessRefundDialog
              id={row.original._id}
              bill={bill}
            >
              <Button variant="destructive" size="icon" title="Process Refund" className="bg-purple-600 hover:bg-purple-700">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </ProcessRefundDialog>
          )}
          
          {/* Edit Button */}
          {currentUserRole && hasPermission(currentUserRole, "bill.update") && canEdit && (
            <BillSheet id={row.original._id}>
              <Button variant="outline" size="icon" title="Edit Bill">
                <Edit className="h-4 w-4" />
              </Button>
            </BillSheet>
          )}
          
          {/* Delete Button */}
          {currentUserRole && hasPermission(currentUserRole, "bill.delete") && canDelete && (
            <DeleteBillDialog
              id={row.original._id}
              bill={bill}
            >
              <Button variant="destructive" size="icon" title="Delete Bill">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DeleteBillDialog>
          )}
        </div>
      );
    },
  },
];

// Default export for backward compatibility
export const billColumns = createBillColumns();