import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import type { CheckOut, UserRole } from "@/types/models";
import { Button, Badge } from "@/components/ui";
import { Edit, Trash2, Star, DollarSign } from "lucide-react";
import { CheckOutSheet } from "@/components/sheets";
import { hasPermission } from "@/lib/permissions";
import { ConfirmCheckOutDeleteDialog } from "@/components/dialogs";
import { PAYMENT_STATUSES } from "@/types/models";
import currency from "currency.js";

// Payment status colors mapping
const paymentStatusColors = {
  [PAYMENT_STATUSES.PENDING]: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  [PAYMENT_STATUSES.PARTIAL]: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  [PAYMENT_STATUSES.PAID]: "bg-green-100 text-green-800 hover:bg-green-200",
  [PAYMENT_STATUSES.OVERDUE]: "bg-red-100 text-red-800 hover:bg-red-200",
  [PAYMENT_STATUSES.CANCELLED]: "bg-gray-100 text-gray-800 hover:bg-gray-200",
};

export const createCheckOutColumns = (
  currentUserRole?: UserRole
): ColumnDef<CheckOut>[] => {
  return [
    {
      accessorKey: "createdAt",
      header: "Date",
      enableSorting: true,
      cell: ({ row }) => format(new Date(row.original.createdAt), "MM/dd/yyyy"),
    },
    {
      accessorKey: "checkOutTime",
      header: "Check-out Time",
      enableSorting: true,

      cell: ({ row }) => {
        const checkOutTime = row.original.checkOutTime;
        return (
          <div className="font-medium">
            {format(new Date(checkOutTime), "MM/dd/yyyy HH:mm")}
          </div>
        );
      },
    },
    {
      accessorKey: "finalBillAmount",
      header: "Final Bill",
      enableSorting: true,

      cell: ({ row }) => {
        const amount = row.original.finalBillAmount;
        return (
          <div className="font-medium flex items-center">
            <DollarSign className="h-3 w-3 mr-1" />
            {currency(amount).format()}
          </div>
        );
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment Status",
      enableSorting: true,

      cell: ({ row }) => {
        const status = row.original.paymentStatus;
        return (
          <Badge
            variant="secondary"
            className={paymentStatusColors[status as keyof typeof paymentStatusColors]}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      accessorKey: "rating",
      header: "Rating",
      enableSorting: true,
      cell: ({ row }) => {
        const rating = row.original.rating;
        return rating ? (
          <div className="flex items-center">
            <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{rating}/5</span>
          </div>
        ) : (
          <span className="text-muted-foreground">No rating</span>
        );
      },
    },
    {
      accessorKey: "satisfactionLevel",
      header: "Satisfaction",
      enableSorting: true,
      cell: ({ row }) => {
        const level = row.original.satisfactionLevel;
        if (!level || level === 'not_rated') {
          return <span className="text-muted-foreground">Not rated</span>;
        }
        
        const levelColors = {
          high: "bg-green-100 text-green-800 hover:bg-green-200",
          medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
          low: "bg-red-100 text-red-800 hover:bg-red-200",
        };
        
        return (
          <Badge
            variant="secondary"
            className={levelColors[level as keyof typeof levelColors]}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "feedback",
      header: "Feedback",
      enableSorting: false,
      cell: ({ row }) => {
        const feedback = row.original.feedback;
        return feedback ? (
          <div className="max-w-[200px] truncate" title={feedback}>
            {feedback}
          </div>
        ) : (
          <span className="text-muted-foreground">No feedback</span>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {currentUserRole && hasPermission(currentUserRole, "checkout.delete") && (
            <ConfirmCheckOutDeleteDialog
              id={row.original._id}
              amount={row.original.finalBillAmount}
            >
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </ConfirmCheckOutDeleteDialog>
          )}
          {currentUserRole && hasPermission(currentUserRole, "checkout.update") && (
            <CheckOutSheet id={row.original._id}>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </CheckOutSheet>
          )}
        </div>
      ),
    },
  ];
};

// Export the columns for backward compatibility (without permissions)
export const checkOutColumns = createCheckOutColumns();
