import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  DollarSign,
  Star,
  User as UserIcon,
  X,
  Plus,
  Check,
  CalendarIcon,
  CreditCard,
} from "lucide-react";

import {
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
  Separator,
  Textarea,
  Button,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import type { CheckOut, CheckIn } from "@/types/models";
import { LoadingButton } from "../custom/LoadingButton";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { checkOutCreateSchema, type CheckOutCreateFormData } from "@/lib/zodValidation";
import { PAYMENT_STATUSES } from "@/types/models";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CheckOutSheetProps {
  id?: string;
  children: ReactNode;
}

// Payment status descriptions and colors
const paymentStatusDescriptions = {
  [PAYMENT_STATUSES.PENDING]: "Payment is pending",
  [PAYMENT_STATUSES.PARTIAL]: "Partial payment received",
  [PAYMENT_STATUSES.PAID]: "Payment completed",
  [PAYMENT_STATUSES.OVERDUE]: "Payment is overdue",
  [PAYMENT_STATUSES.CANCELLED]: "Payment cancelled",
};

const paymentStatusColors = {
  [PAYMENT_STATUSES.PENDING]: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  [PAYMENT_STATUSES.PARTIAL]: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  [PAYMENT_STATUSES.PAID]: "bg-green-100 text-green-800 hover:bg-green-200",
  [PAYMENT_STATUSES.OVERDUE]: "bg-red-100 text-red-800 hover:bg-red-200",
  [PAYMENT_STATUSES.CANCELLED]: "bg-gray-100 text-gray-800 hover:bg-gray-200",
};

// Star Rating Component
const StarRating = ({ 
  value, 
  onChange, 
  max = 5 
}: { 
  value?: number; 
  onChange: (value: number) => void; 
  max?: number; 
}) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-sm"
        >
          <Star
            className={cn(
              "h-5 w-5 transition-colors",
              star <= (value || 0)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-300"
            )}
          />
        </button>
      ))}
      {value && (
        <span className="ml-2 text-sm text-muted-foreground">
          {value} star{value !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

export function CheckOutSheet({ id, children }: CheckOutSheetProps) {
  const { post, isMutating, put, get, invalidate } = useApi(
    ENDPOINT_URLS.CHECKOUTS.CREATE,
    {
      immediate: false,
    }
  );
  const [open, setOpen] = useState(false);
  const [checkOutDate, setCheckOutDate] = useState<Date>(new Date());
  const { data: checkIns } = useApi<CheckIn[]>(ENDPOINT_URLS.CHECKINS.ALL);
  


  const form = useForm<CheckOutCreateFormData>({
    resolver: zodResolver(checkOutCreateSchema) as Resolver<CheckOutCreateFormData>,
    defaultValues: {
      checkInId: "",
      reservationId: "",
      roomId: "",
      guestId: "",
      checkOutTime: new Date(),
      finalBillAmount: 0,
      paymentStatus: PAYMENT_STATUSES.PENDING,
      feedback: "",
      rating: undefined,
    },
    mode: "onBlur", // Validate on blur for better UX
  });
  console.log(form.formState.errors);
  const getCheckOut = useCallback(async () => {
    if (id && open) {
      const { data } = await get<CheckOut>(ENDPOINT_URLS.CHECKOUTS.GET_BY_ID(id), {
        silent: true,
      });
      if (data) {
        form.reset({
          ...data,
          guestId: typeof data.guestId === 'string' ? data.guestId : (data.guestId as any)?._id || data.guestId,
          roomId: typeof data.roomId === 'string' ? data.roomId : (data.roomId as any)?._id || data.roomId,
          reservationId: typeof data.reservationId === 'string' ? data.reservationId : (data.reservationId as any)?._id || data.reservationId,
          checkInId: typeof data.checkInId === 'string' ? data.checkInId : (data.checkInId as any)?._id || data.checkInId,
          checkOutTime: new Date(data.checkOutTime),
        });
        setCheckOutDate(new Date(data.checkOutTime));
      }
    }
  }, [id, open]);

  useEffect(() => {
    if (open) {
      getCheckOut();
    }
  }, [open, getCheckOut]);

  const watchedCheckInId = form.watch("checkInId");

  // Auto-fill related data when check-in is selected
  useEffect(() => {
    if (watchedCheckInId) {
      const selectedCheckIn = checkIns?.find(checkIn => checkIn._id === watchedCheckInId);
      if (selectedCheckIn) {
        console.log(selectedCheckIn);
        form.setValue("reservationId", typeof selectedCheckIn.reservationId === 'string' ? selectedCheckIn.reservationId : selectedCheckIn.reservationId._id || "");
        form.setValue("roomId", typeof selectedCheckIn.roomId === 'string' ? selectedCheckIn.roomId : selectedCheckIn.roomId._id || "");
        form.setValue("guestId", typeof selectedCheckIn.guestId === 'string' ? selectedCheckIn.guestId : selectedCheckIn.guestId._id || "");
      }
    }
  }, [watchedCheckInId, checkIns, form]);

  const handleSubmit = async (data: CheckOutCreateFormData) => {
    try {
      // Transform data for API submission
      const submitData = {
        ...data,
        checkOutTime: data.checkOutTime instanceof Date ? data.checkOutTime.toISOString() : data.checkOutTime,
        finalBillAmount: Number(data.finalBillAmount) || 0,
        rating: data.rating ? Number(data.rating) : undefined,
      };
      
      if (id) {
        await put(ENDPOINT_URLS.CHECKOUTS.UPDATE(id), submitData);
      } else {
        await post(ENDPOINT_URLS.CHECKOUTS.CREATE, submitData);
      }
      
      await invalidate(ENDPOINT_URLS.CHECKOUTS.ALL);
      form.reset({
        checkInId: "",
        reservationId: "",
        roomId: "",
        guestId: "",
        checkOutTime: new Date(),
        finalBillAmount: 0,
        paymentStatus: PAYMENT_STATUSES.PENDING,
        feedback: "",
        rating: undefined,
      });
      setCheckOutDate(new Date());
      setOpen(false);
    } catch (error) {
      console.error("Error submitting check-out:", error);
      // You might want to show a toast notification here
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset({
        checkInId: "",
        reservationId: "",
        roomId: "",
        guestId: "",
        checkOutTime: new Date(),
        finalBillAmount: 0,
        paymentStatus: PAYMENT_STATUSES.PENDING,
        feedback: "",
        rating: undefined,
      });
      setCheckOutDate(new Date());
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader className="space-y-3 pb-6 px-6 pt-6">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
              <UserIcon className="h-4 w-4" />
            </div>
            {id ? "Edit Check-out" : "Create New Check-out"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {id
              ? "Update check-out information, billing, and feedback details."
              : "Create a new check-out record for a guest."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 pb-4"
            >
              {/* Check-out Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Calendar className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Check-out Information</h3>
                </div>

                <FormField
                  control={form.control}
                  name="checkInId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in Record</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a check-in record" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {checkIns?.map((checkIn) => (
                            <SelectItem key={checkIn._id} value={checkIn._id}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  Room {checkIn.assignedRoomNumber}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  Check-in: {new Date(checkIn.checkInTime).toLocaleDateString()}
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
                  name="checkOutTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Check-out Time</FormLabel>
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
                                format(new Date(field.value), "PPP p")
                              ) : (
                                <span>Pick check-out date and time</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={checkOutDate}
                            onSelect={(date) => {
                              if (date) {
                                setCheckOutDate(date);
                                // Set time to current time or a default time
                                const now = new Date();
                                const dateWithTime = new Date(date);
                                dateWithTime.setHours(now.getHours(), now.getMinutes());
                                field.onChange(dateWithTime);
                              }
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                          <div className="p-3 border-t">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Time</label>
                              <Input
                                type="time"
                                value={
                                  field.value && field.value instanceof Date
                                    ? field.value.toTimeString().slice(0, 5)
                                    : ""
                                }
                                onChange={(e) => {
                                  if (field.value && e.target.value) {
                                    const [hours, minutes] = e.target.value.split(':');
                                    const newDate = new Date(field.value);
                                    newDate.setHours(parseInt(hours), parseInt(minutes));
                                    field.onChange(newDate);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Billing Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <DollarSign className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Billing Information</h3>
                </div>

                <FormField
                  control={form.control}
                  name="finalBillAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final Bill Amount</FormLabel>
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
                      <FormDescription className="text-xs">
                        The total amount to be charged to the guest
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Payment Status
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(PAYMENT_STATUSES).map(([key, value]) => (
                            <SelectItem key={value} value={value}>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="secondary" 
                                  className={paymentStatusColors[value]}
                                >
                                  {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {paymentStatusDescriptions[value]}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        Current payment status for this check-out
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Guest Feedback */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Star className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Guest Feedback</h3>
                </div>

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Guest Rating
                      </FormLabel>
                      <FormControl>
                        <StarRating
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Click on stars to rate the guest's stay (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guest Feedback</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Guest feedback about their stay..."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Optional feedback from the guest about their stay
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <div className="border-t bg-background p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LoadingButton
              isLoading={isMutating}
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </LoadingButton>

            <LoadingButton
              type="submit"
              isLoading={isMutating}
              onClick={form.handleSubmit(handleSubmit)}
              disabled={isMutating}
              className="w-full flex items-center justify-center gap-2"
            >
              {id ? (
                <Check className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {id ? "Update" : "Create"}
            </LoadingButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}