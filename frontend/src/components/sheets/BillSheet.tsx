import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Receipt,
  Users,
  DollarSign,
  FileText,
  Calendar as CalendarIcon,
  CreditCard,
} from "lucide-react";

import {
  Badge,
  Button,
  Form,
  FormControl,
  FormDescription,
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Switch,
  Separator,
  Textarea,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { BILL_STATUSES, PAYMENT_METHODS } from "@/types/models";
import type {
  Bill,
  BillStatus,
  PaymentMethod,
  User,
  Room,
  Reservation,
} from "@/types/models";
import { LoadingButton } from "../custom/LoadingButton";
import {
  billCreateSchema,
  billUpdateSchema,
  type BillCreateFormData,
  type BillUpdateFormData,
} from "@/lib/zodValidation";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/lib";

interface BillSheetProps {
  id?: string;
  children: ReactNode;
}

const billStatusDescriptions: Record<BillStatus, string> = {
  draft: "Bill is in draft state",
  pending: "Bill is pending payment",
  paid: "Bill has been paid",
  overdue: "Bill payment is overdue",
  cancelled: "Bill has been cancelled",
  refunded: "Bill has been refunded",
};

const paymentMethodDescriptions: Record<PaymentMethod, string> = {
  cash: "Cash payment",
  credit_card: "Credit card payment",
  debit_card: "Debit card payment",
  bank_transfer: "Bank transfer payment",
  digital_wallet: "Digital wallet payment",
};

const billStatusColors: Record<BillStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
  refunded: "bg-yellow-100 text-yellow-800",
};

const paymentMethodColors: Record<PaymentMethod, string> = {
  cash: "bg-green-100 text-green-800",
  credit_card: "bg-blue-100 text-blue-800",
  debit_card: "bg-purple-100 text-purple-800",
  bank_transfer: "bg-orange-100 text-orange-800",
  digital_wallet: "bg-pink-100 text-pink-800",
};

export function BillSheet({ id, children }: BillSheetProps) {
  const { post, isMutating, put, get, invalidate } = useApi(
    ENDPOINT_URLS.BILLS.CREATE,
    {
      immediate: false,
    }
  );
  const { data: guests } = useApi<User[]>(ENDPOINT_URLS.GUESTS.ALL);
  const { data: rooms } = useApi<Room[]>(ENDPOINT_URLS.ROOMS.ALL);
  const { data: reservations } = useApi<Reservation[]>(ENDPOINT_URLS.RESERVATIONS.ALL);
  const [open, setOpen] = useState(false);
  const [dueDate, setDueDate] = useState<Date>();
  const [paymentDate, setPaymentDate] = useState<Date>();

  const form = useForm<BillCreateFormData | BillUpdateFormData>({
    resolver: zodResolver(
      id ? billUpdateSchema : billCreateSchema
    ) as Resolver<BillCreateFormData | BillUpdateFormData>,
    defaultValues: {
      reservationId: "",
      guestId: "",
      roomId: "",
      checkInId: "",
      checkOutId: "",
      baseAmount: 0,
      taxAmount: 0,
      discountAmount: 0,
      serviceCharges: 0,
      totalAmount: 0,
      status: BILL_STATUSES.DRAFT,
      dueDate: "",
      paymentDate: "",
      paymentMethod: undefined,
      notes: "",
      isActive: true,
    },
  });

  const getBill = useCallback(async () => {
    if (id && open) {
      const { data } = await get<Bill>(
        ENDPOINT_URLS.BILLS.GET_BY_ID(id),
        {
          silent: true,
        }
      );
      form.reset({
        ...data,
        dueDate: format(new Date(data.dueDate), "yyyy-MM-dd"),
        paymentDate: data.paymentDate ? format(new Date(data.paymentDate), "yyyy-MM-dd") : "",
      });
      setDueDate(new Date(data.dueDate));
      if (data.paymentDate) {
        setPaymentDate(new Date(data.paymentDate));
      }
    }
  }, [id, open]);

  useEffect(() => {
    getBill();
  }, [getBill]);

  const watchedStatus = form.watch("status");
  const watchedPaymentMethod = form.watch("paymentMethod");
  const watchedBaseAmount = form.watch("baseAmount");
  const watchedTaxAmount = form.watch("taxAmount");
  const watchedDiscountAmount = form.watch("discountAmount");
  const watchedServiceCharges = form.watch("serviceCharges");

  // Auto-calculate total amount
  useEffect(() => {
    const baseAmount = watchedBaseAmount || 0;
    const taxAmount = watchedTaxAmount || 0;
    const discountAmount = watchedDiscountAmount || 0;
    const serviceCharges = watchedServiceCharges || 0;
    const totalAmount = baseAmount + taxAmount + serviceCharges - discountAmount;
    form.setValue("totalAmount", Math.max(0, totalAmount));
  }, [watchedBaseAmount, watchedTaxAmount, watchedDiscountAmount, watchedServiceCharges, form]);

  const handleSubmit = async (
    data: BillCreateFormData | BillUpdateFormData
  ) => {
    try {
      if (id) {
        await put(ENDPOINT_URLS.BILLS.UPDATE(id), data);
      } else {
        await post(ENDPOINT_URLS.BILLS.CREATE, data);
      }
      await invalidate();
      setOpen(false);
      form.reset();
      setDueDate(undefined);
      setPaymentDate(undefined);
    } catch (error) {
      handleApiError(error, form.setError);
      console.error("Error submitting bill:", error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
      setDueDate(undefined);
      setPaymentDate(undefined);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader className="space-y-3 pb-6 px-6 pt-6">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
              <Receipt className="h-4 w-4" />
            </div>
            {id ? "Edit Bill" : "Create New Bill"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {id
              ? "Update existing bill details and payment information."
              : "Create a new bill with reservation, guest, and payment details."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 pb-4"
            >
              {/* Reservation and Guest Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Users className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">
                    Reservation & Guest Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="reservationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reservation</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!!id}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select reservation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-64">
                            {Array.isArray(reservations) && reservations.map((reservation) => (
                              <SelectItem key={reservation._id} value={reservation._id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    Reservation #{reservation._id.slice(-6)}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    ${reservation.totalAmount} - {reservation.status}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guestId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!!id}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select guest" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-64">
                            {Array.isArray(guests) && guests.map((guest: User) => (
                              <SelectItem key={guest._id} value={guest._id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {guest.firstName} {guest.lastName}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {guest.email}
                                  </span>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="roomId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!!id}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select room" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-64">
                            {Array.isArray(rooms) && rooms.map((room) => (
                              <SelectItem key={room._id} value={room._id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    Room {room.roomNumber}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {room.roomType} - ${room.pricePerNight}/night
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="checkInId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-in ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter check-in ID"
                            {...field}
                            disabled={!!id}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="checkOutId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-out ID (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter check-out ID"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Amount Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <DollarSign className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Amount Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="baseAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="discountAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceCharges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Charges</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          disabled
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormDescription>
                        Automatically calculated: Base + Tax + Service Charges - Discount
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Status and Payment Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <CreditCard className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Status & Payment</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(BILL_STATUSES).map(([key, value]) => (
                              <SelectItem key={value} value={value}>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "text-xs",
                                      billStatusColors[value as BillStatus]
                                    )}
                                  >
                                    {key.replace('_', ' ')}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {billStatusDescriptions[value as BillStatus]}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
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
                                  <span className="text-sm text-muted-foreground">
                                    {paymentMethodDescriptions[value as PaymentMethod]}
                                  </span>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={dueDate}
                              onSelect={(date) => {
                                setDueDate(date);
                                field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                              }}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Payment Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={paymentDate}
                              onSelect={(date) => {
                                setPaymentDate(date);
                                field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Additional Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <FileText className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Additional Information</h3>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional notes or comments..."
                          className="min-h-[80px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Enable or disable this bill record
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Status and Payment Method Display */}
              {(watchedStatus || watchedPaymentMethod) && (
                <div className="space-y-3">
                  <Separator />
                  <div className="flex flex-wrap gap-2">
                    {watchedStatus && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          billStatusColors[watchedStatus as BillStatus]
                        )}
                      >
                        Status: {watchedStatus.replace('_', ' ')}
                      </Badge>
                    )}
                    {watchedPaymentMethod && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          paymentMethodColors[watchedPaymentMethod as PaymentMethod]
                        )}
                      >
                        Payment: {watchedPaymentMethod.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>

        {/* Footer with action buttons */}
        <div className="border-t bg-background px-6 py-4">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              loading={isMutating}
              onClick={form.handleSubmit(handleSubmit)}
              className="flex-1"
            >
              {id ? "Update Bill" : "Create Bill"}
            </LoadingButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}