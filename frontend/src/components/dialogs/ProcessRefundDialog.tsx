import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Separator,
} from "@/components/ui";
import { RotateCcw, DollarSign, AlertTriangle } from "lucide-react";
import { LoadingButton } from "../custom/LoadingButton";
import type { ReactNode } from "react";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { useState } from "react";
import type { Bill, PaymentMethod } from "@/types/models";

import {
  billRefundSchema,
  type BillRefundFormData,
} from "@/lib/zodValidation";
import { handleApiError } from "@/lib";
import { cn } from "@/lib/utils";

interface ProcessRefundDialogProps {
  id: string;
  bill: Bill;
  children: ReactNode;
}

const paymentMethodColors: Record<PaymentMethod, string> = {
  cash: "bg-green-100 text-green-800",
  credit_card: "bg-blue-100 text-blue-800",
  debit_card: "bg-purple-100 text-purple-800",
  bank_transfer: "bg-orange-100 text-orange-800",
  digital_wallet: "bg-pink-100 text-pink-800",
};

export function ProcessRefundDialog({
  id,
  bill,
  children,
}: ProcessRefundDialogProps) {
  const [open, setOpen] = useState(false);
  const { post, isMutating, invalidate } = useApi(
    ENDPOINT_URLS.BILLS.PROCESS_REFUND(id),
    { immediate: false }
  );

  const form = useForm<BillRefundFormData>({
    resolver: zodResolver(billRefundSchema),
    defaultValues: {
      billId: bill._id,
      refundAmount: 0,
      refundReason: '',
      notes: '',
    },
  });

  // Remove paymentMethod watch as it's not part of the schema
  const watchedAmount = form.watch("refundAmount");
  const watchedReason = form.watch("refundReason");

  const handleRefund = async (data: BillRefundFormData) => {
    try {
      await post(ENDPOINT_URLS.BILLS.PROCESS_REFUND(id), data);
      await invalidate(ENDPOINT_URLS.BILLS.ALL);
      setOpen(false);
      form.reset();
      console.log("Refund processed successfully");
    } catch (error) {
      handleApiError(error, form.setError);
      console.error("Failed to process refund:", error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset({
        refundAmount: bill.totalAmount || 0,
        refundReason: "",
        notes: "",
      });
    }
  };

  const maxRefundAmount = bill.totalAmount || 0;
  const isPartialRefund = watchedAmount < maxRefundAmount;
  const canProcessRefund = bill.status === "paid" && maxRefundAmount > 0;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
              <RotateCcw className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            Process Refund
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Process a refund for this bill. Enter the refund details below.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Refund Eligibility Check */}
        {!canProcessRefund && (
          <div className="p-3 bg-red-50 dark:bg-red-950 rounded-md border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Refund Not Available</span>
            </div>
            <div className="text-xs text-red-700 dark:text-red-300 mt-1">
              {bill.status !== "paid" 
                ? "Only paid bills can be refunded."
                : "No payment amount available for refund."}
            </div>
          </div>
        )}

        {/* Bill Summary */}
        <div className="space-y-3">
          <div className="p-3 bg-muted rounded-md">
            <div className="text-sm font-medium mb-2">Bill Summary:</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Bill ID:</span>
                <span className="font-mono">#{bill._id.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-semibold">${bill.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Paid Amount:</span>
                <span className="text-green-600">
                  ${(bill.totalAmount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Available for Refund:</span>
                <span className="font-semibold text-orange-600">
                  ${maxRefundAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Current Status:</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    bill.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : bill.status === "refunded"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  )}
                >
                  {bill.status}
                </Badge>
              </div>
              {bill.paymentMethod && (
                <div className="flex justify-between">
                  <span>Original Payment Method:</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      paymentMethodColors[bill.paymentMethod as PaymentMethod]
                    )}
                  >
                    {bill.paymentMethod.replace('_', ' ')}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Refund Form */}
          {canProcessRefund && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleRefund)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="refundAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Refund Amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              max={maxRefundAmount}
                              placeholder="0.00"
                              className="pl-8"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">
                      Cash Refund
                    </span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="refundReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Refund Reason</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select refund reason" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="customer_request">Customer Request</SelectItem>
                          <SelectItem value="service_issue">Service Issue</SelectItem>
                          <SelectItem value="billing_error">Billing Error</SelectItem>
                          <SelectItem value="cancellation">Cancellation</SelectItem>
                          <SelectItem value="duplicate_payment">Duplicate Payment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Additional Notes</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Refund notes or comments"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Refund Summary */}
                {(watchedAmount as unknown as number) > 0 && watchedReason && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-md border">
                    <div className="text-sm font-medium mb-2 text-orange-800 dark:text-orange-200">
                      Refund Summary:
                    </div>
                    <div className="text-xs space-y-1 text-orange-700 dark:text-orange-300">
                      <div className="flex justify-between">
                        <span>Refund Amount:</span>
                        <span className="font-semibold">${(watchedAmount as unknown as number).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Refund Method:</span>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-100 text-green-800"
                        >
                          Cash Refund
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Reason:</span>
                        <span className="font-medium">
                          {(watchedReason as unknown as string).replace('_', ' ')}
                        </span>
                      </div>
                      {isPartialRefund && (
                        <div className="flex justify-between text-blue-600 dark:text-blue-400">
                          <span>Remaining Paid Amount:</span>
                          <span className="font-semibold">
                            ${(maxRefundAmount - (watchedAmount as unknown as number)).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>New Status:</span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            isPartialRefund
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          )}
                        >
                          {isPartialRefund ? "Partially Refunded" : "Refunded"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
          <LoadingButton
            isLoading={isMutating}
            onClick={form.handleSubmit(handleRefund as any)}
            variant="destructive"
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
            disabled={
              !canProcessRefund ||
              isMutating ||
              !watchedAmount ||
              (watchedAmount as unknown as number) <= 0 ||
              !watchedReason
            }
          >
            <RotateCcw className="h-4 w-4" />
            Process Refund
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}