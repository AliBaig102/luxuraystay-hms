import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  User as UserIcon,
  Home,
  FileText,
  X,
  Plus,
  Check,
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
  Switch,
  Separator,
  Textarea,
} from "@/components/ui";
import type { CheckIn, User, Room, Reservation } from "@/types/models";
import { LoadingButton } from "../custom/LoadingButton";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { checkInCreateSchema, type CheckInCreateFormData } from "@/lib/zodValidation";

interface CheckInSheetProps {
  id?: string;
  children: ReactNode;
}

export function CheckInSheet({ id, children }: CheckInSheetProps) {
  const { post, isMutating, put, get, invalidate } = useApi(
    ENDPOINT_URLS.CHECKINS.CREATE,
    {
      immediate: false,
    }
  );
  const [open, setOpen] = useState(false);
  const { data: reservationsRes } = useApi<{ reservations: Reservation[] }>(
    ENDPOINT_URLS.RESERVATIONS.ALL
  );
  const { data: rooms } = useApi<Room[]>(ENDPOINT_URLS.ROOMS.ALL);
  const { data: guests } = useApi<User[]>(ENDPOINT_URLS.GUESTS.ALL);

  const form = useForm<CheckInCreateFormData>({
    resolver: zodResolver(checkInCreateSchema) as Resolver<CheckInCreateFormData>,
    defaultValues: {
      reservationId: "",
      roomId: "",
      guestId: "",
      assignedRoomNumber: "",
      checkInTime: new Date(),
      keyIssued: false,
      welcomePackDelivered: false,
      specialInstructions: "",
    },
  });

  const watchedRoomId = form.watch("roomId");

  // Auto-fill room number when room is selected
  useEffect(() => {
    if (watchedRoomId) {
      const selectedRoom = rooms?.find((room) => room._id === watchedRoomId);
      if (selectedRoom) {
        form.setValue("assignedRoomNumber", selectedRoom.roomNumber);
      }
    }
  }, [watchedRoomId, rooms, form]);

  const getCheckIn = useCallback(async () => {
    if (id && open) {
      const { data } = await get<CheckIn>(ENDPOINT_URLS.CHECKINS.GET_BY_ID(id), {
        silent: true,
      });
      if (data) {
        console.log(data);
        
        form.reset({
          ...data,
          guestId: typeof data.guestId === 'string' ? data.guestId : data.guestId._id,
          roomId: typeof data.roomId === 'string' ? data.roomId : data.roomId._id,
          reservationId: typeof data.reservationId === 'string' ? data.reservationId : data.reservationId._id,
          checkInTime: new Date(data.checkInTime),
        });
      }
    }
  }, [id, open]);

  useEffect(() => {
    getCheckIn();
  }, [getCheckIn]);

  const handleSubmit = async (data: CheckInCreateFormData) => {
    try {
      if (id) {
        await put(ENDPOINT_URLS.CHECKINS.UPDATE(id), data);
      } else {
        await post(ENDPOINT_URLS.CHECKINS.CREATE, data);
      }
      await invalidate(ENDPOINT_URLS.CHECKINS.ALL);
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error submitting check-in:", error);
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
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader className="space-y-3 pb-6 px-6 pt-6">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
              <UserIcon className="h-4 w-4" />
            </div>
            {id ? "Edit Check-in" : "Create New Check-in"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {id
              ? "Update check-in information and room assignment details."
              : "Create a new check-in record for a guest reservation."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 pb-4"
            >
              {/* Reservation Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Calendar className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Reservation Information</h3>
                </div>

                <FormField
                  control={form.control}
                  name="reservationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reservation</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a reservation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {reservationsRes?.reservations.map((reservation) => (
                            <SelectItem key={reservation._id} value={reservation._id}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {typeof reservation.guestId === "object"
                                    ? `${reservation.guestId.firstName} ${reservation.guestId.lastName}`
                                    : "Guest"}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(reservation.checkInDate).toLocaleDateString()} -{" "}
                                  {new Date(reservation.checkOutDate).toLocaleDateString()}
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a guest" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {guests?.map((guest) => (
                            <SelectItem key={guest._id} value={guest._id}>
                              {guest.firstName} {guest.lastName} ({guest.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Room Assignment */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Home className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Room Assignment</h3>
                </div>

                <FormField
                  control={form.control}
                  name="roomId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a room" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {rooms?.map((room) => (
                            <SelectItem key={room._id} value={room._id}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  Room {room.roomNumber} - {room.roomType}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  Floor {room.floor} • {room.capacity} guests
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
                  name="assignedRoomNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Room Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 101" {...field} />
                      </FormControl>
                      <FormDescription>
                        The actual room number assigned to the guest
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Check-in Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Calendar className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Check-in Details</h3>
                </div>

                <FormField
                  control={form.control}
                  name="checkInTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in Time</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          value={
                            field.value && field.value instanceof Date
                              ? new Date(
                                  field.value.getTime() - field.value.getTimezoneOffset() * 60000
                                )
                                  .toISOString()
                                  .slice(0, 16)
                              : ""
                          }
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keyIssued"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          Key Issued
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Mark if room key has been issued to the guest
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

                <FormField
                  control={form.control}
                  name="welcomePackDelivered"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          Welcome Pack Delivered
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Mark if welcome pack has been delivered to the room
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
                  <h3 className="text-sm font-medium">Additional Information</h3>
                </div>

                <FormField
                  control={form.control}
                  name="specialInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Instructions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any special instructions or requests..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Optional special instructions for this check-in
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