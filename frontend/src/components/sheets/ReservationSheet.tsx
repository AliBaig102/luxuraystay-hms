import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  Users,
  DollarSign,
  MapPin,
  FileText,
  X,
  Plus,
  Check,
  CalendarIcon,
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
import { PAYMENT_STATUSES, RESERVATION_SOURCES } from "@/types/models";
import type {
  Reservation,
  PaymentStatus,
  ReservationSource,
  User,
  Room,
} from "@/types/models";
import { LoadingButton } from "../custom/LoadingButton";
import {
  reservationCreateSchema,
  reservationUpdateSchema,
  type ReservationCreateFormData,
  type ReservationUpdateFormData,
} from "@/lib/zodValidation";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/lib";

interface ReservationSheetProps {
  id?: string;
  children: ReactNode;
}

const paymentStatusDescriptions: Record<PaymentStatus, string> = {
  pending: "Payment is pending",
  partial: "Partial payment received",
  paid: "Payment completed",
  overdue: "Payment is overdue",
  cancelled: "Payment cancelled",
};

const sourceDescriptions: Record<ReservationSource, string> = {
  online: "Booked through online platform",
  phone: "Booked via phone call",
  walk_in: "Walk-in reservation",
  travel_agent: "Booked through travel agent",
};

const paymentStatusColors: Record<PaymentStatus, string> = {
  pending: "bg-blue-100 text-blue-800",
  partial: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const sourceColors: Record<ReservationSource, string> = {
  online: "bg-blue-100 text-blue-800",
  phone: "bg-green-100 text-green-800",
  walk_in: "bg-purple-100 text-purple-800",
  travel_agent: "bg-orange-100 text-orange-800",
};

export function ReservationSheet({ id, children }: ReservationSheetProps) {
  const { post, isMutating, put, get, invalidate } = useApi(
    ENDPOINT_URLS.RESERVATIONS.CREATE,
    {
      immediate: false,
    }
  );
  const { data: guests } = useApi<User[]>(ENDPOINT_URLS.GUESTS.ALL);
  const { data: rooms } = useApi<Room[]>(ENDPOINT_URLS.ROOMS.ALL);
  const [open, setOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();

  const form = useForm<ReservationCreateFormData | ReservationUpdateFormData>({
    resolver: zodResolver(
      id ? reservationUpdateSchema : reservationCreateSchema
    ) as Resolver<ReservationCreateFormData | ReservationUpdateFormData>,
    defaultValues: {
      guestId: "",
      roomId: "",
      checkInDate: "",
      checkOutDate: "",
      numberOfGuests: 1,
      totalAmount: 0,
      depositAmount: 0,
      paymentStatus: PAYMENT_STATUSES.PENDING,
      specialRequests: "",
      notes: "",
      source: RESERVATION_SOURCES.ONLINE,
      isActive: true,
    },
  });

  const getReservation = useCallback(async () => {
    if (id && open) {
      const { data } = await get<Reservation>(
        ENDPOINT_URLS.RESERVATIONS.GET_BY_ID(id),
        {
          silent: true,
        }
      );
      form.reset({
        ...data,
        checkInDate: format(new Date(data.checkInDate), "yyyy-MM-dd"),
        checkOutDate: format(new Date(data.checkOutDate), "yyyy-MM-dd"),
      });
      setCheckInDate(new Date(data.checkInDate));
      setCheckOutDate(new Date(data.checkOutDate));
    }
  }, [id, open]);

  useEffect(() => {
    getReservation();
  }, [getReservation]);

  const watchedPaymentStatus = form.watch("paymentStatus");
  const watchedSource = form.watch("source");

  const handleSubmit = async (
    data: ReservationCreateFormData | ReservationUpdateFormData
  ) => {
    try {
      if (id) {
        await put(ENDPOINT_URLS.RESERVATIONS.UPDATE(id), data);
      } else {
        await post(ENDPOINT_URLS.RESERVATIONS.CREATE, data);
      }
      await invalidate();
      setOpen(false);
      form.reset();
      setCheckInDate(undefined);
      setCheckOutDate(undefined);
    } catch (error) {
      handleApiError(error,form.setError)
      console.error("Error submitting reservation:", error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
      setCheckInDate(undefined);
      setCheckOutDate(undefined);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader className="space-y-3 pb-6 px-6 pt-6">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
              <Calendar className="h-4 w-4" />
            </div>
            {id ? "Edit Reservation" : "Create New Reservation"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {id
              ? "Update existing reservation details and preferences."
              : "Create a new reservation with guest, room, and payment details."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 pb-4"
            >
              {/* Guest and Room Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Users className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">
                    Guest & Room Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            {guests?.map((guest: User) => (
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
                            {rooms?.map((room) => (
                              <SelectItem key={room._id} value={room._id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    Room {room.roomNumber}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {room.roomType} - ${room.pricePerNight}
                                    /night
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

                <FormField
                  control={form.control}
                  name="numberOfGuests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Guests</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Check-in/Check-out Dates */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Calendar className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Stay Dates</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="checkInDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-in Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !checkInDate && "text-muted-foreground"
                                )}
                              >
                                {checkInDate ? (
                                  format(checkInDate, "PPP")
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
                              selected={checkInDate}
                              onSelect={(date) => {
                                setCheckInDate(date);
                                field.onChange(
                                  date ? format(date, "yyyy-MM-dd") : ""
                                );
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
                    name="checkOutDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-out Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !checkOutDate && "text-muted-foreground"
                                )}
                              >
                                {checkOutDate ? (
                                  format(checkOutDate, "PPP")
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
                              selected={checkOutDate}
                              onSelect={(date) => {
                                setCheckOutDate(date);
                                field.onChange(
                                  date ? format(date, "yyyy-MM-dd") : ""
                                );
                              }}
                              disabled={(date) =>
                                date <= (checkInDate || new Date())
                              }
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

              {/* Payment Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <DollarSign className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Payment Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="depositAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deposit Amount ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select payment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(PAYMENT_STATUSES).map((status) => (
                            <SelectItem key={status} value={status}>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className={paymentStatusColors[status]}
                                >
                                  {status.charAt(0).toUpperCase() +
                                    status.slice(1).replace("_", " ")}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {watchedPaymentStatus && (
                        <FormDescription className="text-xs">
                          {paymentStatusDescriptions[watchedPaymentStatus]}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Source and Status */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <MapPin className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">
                    Booking Source & Status
                  </h3>
                </div>

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reservation Source</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(RESERVATION_SOURCES).map((source) => (
                            <SelectItem key={source} value={source}>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className={sourceColors[source]}
                                >
                                  {source.charAt(0).toUpperCase() +
                                    source.slice(1).replace("_", " ")}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {watchedSource && (
                        <FormDescription className="text-xs">
                          {sourceDescriptions[watchedSource]}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          Active Status
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Enable or disable reservation
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

              <Separator />

              {/* Additional Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <FileText className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">
                    Additional Information
                  </h3>
                </div>

                <FormField
                  control={form.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requests</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any special requests or preferences..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Guest special requests and preferences
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter internal notes for staff..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Internal notes visible only to staff
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
              disabled={!form.formState.isDirty}
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
