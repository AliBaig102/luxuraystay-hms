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
import { CreditCard, DollarSign } from "lucide-react";
import { LoadingButton } from "../custom/LoadingButton";
import type { ReactNode } from "react";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { useState } from "react";
import type { Bill, PaymentMethod } from "@/types/models";
import { PAYMENT_METHODS } from "@/types/models";
import {
  billPaymentSchema,
  type BillPaymentFormData,
} from "@/lib/zodValidation";
import { handleApiError } from "@/lib";
import { cn } from "@/lib/utils";

interface ProcessPaymentDialogProps {
  id: string;
  bill: Bill;
  children: ReactNode;
}

const paymentMethodDescriptions: Record<PaymentMethod, string> = {
  cash: "Cash payment",
  credit_card: "Credit card payment",
  debit_card: "Debit card payment",
  bank_transfer: "Bank transfer payment",
  digital_wallet: "Digital wallet payment",
};

const paymentMethodColors: Record<PaymentMethod, string> = {
  cash: "bg-green-100 text-green-800",
  credit_card: "bg-blue-100 text-blue-800",
  debit_card: "bg-purple-100 text-purple-800",
  bank_transfer: "bg-orange-100 text-orange-800",
  digital_wallet: "bg-pink-100 text-pink-800",
};

export function ProcessPaymentDialog({
  id,
  bill,
  children,
}: ProcessPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const { post, isMutating, invalidate } = useApi(
    ENDPOINT_URLS.BILLS.PROCESS_PAYMENT(id),
    { immediate: false }
  );

  const form = useForm<BillPaymentFormData>({
    resolver: zodResolver(billPaymentSchema),
    defaultValues: {
      amount: bill.totalAmount,
      paymentMethod: undefined,
      transactionId: "",
      notes: "",
    },
  });

  const watchedPaymentMethod = form.watch("paymentMethod");
  const watchedAmount = form.watch("amount");

  const handlePayment = async (data: BillPaymentFormData) => {
    try {
      await post(ENDPOINT_URLS.BILLS.PROCESS_PAYMENT(id), data);
      await invalidate(ENDPOINT_URLS.BILLS.ALL);
      setOpen(false);
      form.reset();
      console.log("Payment processed successfully");
    } catch (error) {
      handleApiError(error, form.setError);
      console.error("Failed to process payment:", error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset({
        amount: bill.totalAmount,
        paymentMethod: undefined,
        transactionId: "",
        notes: "",
      });
    }
  };

  const remainingAmount = bill.totalAmount - (bill.paidAmount || 0);
  const isPartialPayment = watchedAmount < remainingAmount;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            Process Payment
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Process payment for this bill. Enter the payment details below.
          </AlertDialogDescription>
        </AlertDialogHeader>

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
              {bill.paidAmount && bill.paidAmount > 0 && (
                <div className="flex justify-between">
                  <span>Paid Amount:</span>
                  <span className="text-green-600">${bill.paidAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Remaining:</span>
                <span className="font-semibold text-red-600">
                  ${remainingAmount.toFixed(2)}
                </span>
              </div>
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
                      : "bg-gray-100 text-gray-800"
                  )}
                >
                  {bill.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handlePayment)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Payment Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={remainingAmount}
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

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(PAYMENT_METHODS).map(([key, value]) => (
                            <SelectItem key={value} value={value}>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "text-xs",
                                    paymentMethodColors[value as PaymentMethod]
                                  )}
                                >
                                  {key.replace('_', ' ')}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Transaction ID (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter transaction reference"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Payment notes or comments"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Summary */}
              {watchedPaymentMethod && watchedAmount > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md border">
                  <div className="text-sm font-medium mb-2 text-blue-800 dark:text-blue-200">
                    Payment Summary:
                  </div>
                  <div className="text-xs space-y-1 text-blue-700 dark:text-blue-300">
                    <div className="flex justify-between">
                      <span>Payment Amount:</span>
                      <span className="font-semibold">${watchedAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          paymentMethodColors[watchedPaymentMethod as PaymentMethod]
                        )}
                      >
                        {watchedPaymentMethod.replace('_', ' ')}
                      </Badge>
                    </div>
                    {isPartialPayment && (
                      <div className="flex justify-between text-orange-600 dark:text-orange-400">
                        <span>Remaining After Payment:</span>
                        <span className="font-semibold">
                          ${(remainingAmount - watchedAmount).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>New Status:</span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          isPartialPayment
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        )}
                      >
                        {isPartialPayment ? "Partially Paid" : "Paid"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
          <LoadingButton
            isLoading={isMutating}
            onClick={form.handleSubmit(handlePayment)}
            variant="default"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            disabled={!watchedPaymentMethod || !watchedAmount || watchedAmount <= 0}
          >
            <CreditCard className="h-4 w-4" />
            Process Payment
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}