import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  DollarSign,
  CreditCard,
  Star,
  MessageSquare,
  User as UserIcon,
} from "lucide-react";

import {
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
  Separator,
  Textarea,
} from "@/components/ui";
import type { CheckOut, CheckIn } from "@/types/models";
import { LoadingButton } from "../custom/LoadingButton";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { checkOutCreateSchema, type CheckOutCreateFormData } from "@/lib/zodValidation";
import { PAYMENT_STATUSES } from "@/types/models";

interface CheckOutSheetProps {
  id?: string;
  children: ReactNode;
}

export function CheckOutSheet({ id, children }: CheckOutSheetProps) {
  const { post, isMutating, put, get, invalidate } = useApi(
    ENDPOINT_URLS.CHECKOUTS.CREATE,
    {
      immediate: false,
    }
  );
  const [open, setOpen] = useState(false);
  const [checkIns] = useState<CheckIn[]>([]);
//   const [reservations, setReservations] = useState<Reservation[]>([]);
//   const [rooms, setRooms] = useState<Room[]>([]);
//   const [guests, setGuests] = useState<User[]>([]);

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
  });

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
      }
    }
  }, [id, open]);

  useEffect(() => {
    if (open) {
    //   fetchData();
      getCheckOut();
    }
  }, [open, getCheckOut]);

  const watchedCheckInId = form.watch("checkInId");

  // Auto-fill related data when check-in is selected
  useEffect(() => {
    if (watchedCheckInId) {
      const selectedCheckIn = checkIns.find(checkIn => checkIn._id === watchedCheckInId);
      if (selectedCheckIn) {
        form.setValue("reservationId", selectedCheckIn.reservationId as string || "");
        form.setValue("roomId", selectedCheckIn.roomId as string || "");
        form.setValue("guestId", selectedCheckIn.guestId as string || "");
      }
    }
  }, [watchedCheckInId, checkIns, form]);

  const handleSubmit = async (data: CheckOutCreateFormData) => {
    try {
      if (id) {
        await put(ENDPOINT_URLS.CHECKOUTS.UPDATE(id), data);
      } else {
        await post(ENDPOINT_URLS.CHECKOUTS.CREATE, data);
      }
      await invalidate(ENDPOINT_URLS.CHECKOUTS.ALL);
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error submitting check-out:", error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {id ? "Edit Check-out" : "Create New Check-out"}
          </SheetTitle>
          <SheetDescription>
            {id
              ? "Update check-out information, billing, and feedback details."
              : "Create a new check-out record for a guest."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
            {/* Check-in Selection */}
            <FormField
              control={form.control}
              name="checkInId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Check-in Record
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a check-in record" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {checkIns.map((checkIn) => (
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

            {/* Check-out Time */}
            <FormField
              control={form.control}
              name="checkOutTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Check-out Time</FormLabel>
                  <FormControl>
                                         <Input
                       type="datetime-local"
                       value={field.value && field.value instanceof Date ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                       onChange={(e) => field.onChange(new Date(e.target.value))}
                     />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Final Bill Amount */}
            <FormField
              control={form.control}
              name="finalBillAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Final Bill Amount
                  </FormLabel>
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
                  <FormDescription>
                    The total amount to be charged to the guest
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Status */}
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
                      <SelectItem value={PAYMENT_STATUSES.PENDING}>Pending</SelectItem>
                      <SelectItem value={PAYMENT_STATUSES.PARTIAL}>Partially Paid</SelectItem>
                      <SelectItem value={PAYMENT_STATUSES.PAID}>Paid</SelectItem>
                      <SelectItem value={PAYMENT_STATUSES.OVERDUE}>Overdue</SelectItem>
                      <SelectItem value={PAYMENT_STATUSES.CANCELLED}>Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Rating */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Guest Rating
                  </FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                    value={field.value?.toString() || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a rating (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 Star - Poor</SelectItem>
                      <SelectItem value="2">2 Stars - Fair</SelectItem>
                      <SelectItem value="3">3 Stars - Good</SelectItem>
                      <SelectItem value="4">4 Stars - Very Good</SelectItem>
                      <SelectItem value="5">5 Stars - Excellent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Optional guest rating for their stay
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Feedback */}
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Guest Feedback
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Guest feedback about their stay..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional feedback from the guest about their stay
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <LoadingButton
                type="submit"
                isLoading={isMutating}
                disabled={isMutating}
              >
                {id ? "Update Check-out" : "Create Check-out"}
              </LoadingButton>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
