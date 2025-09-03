import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MessageSquare,
  Star,
  User,
  MessageCircle,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

import {
  Badge,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { FEEDBACK_CATEGORIES } from "@/types/models";
import type {
  Feedback,
  User as UserType,
  Room,
  Reservation,
} from "@/types/models";
import { LoadingButton } from "../custom/LoadingButton";
import {
  feedbackCreateSchema,
  feedbackUpdateSchema,
  type FeedbackCreateFormData,
  type FeedbackUpdateFormData,
} from "@/lib/zodValidation";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/lib";

interface FeedbackSheetProps {
  id?: string;
  children: ReactNode;
}

const categoryDescriptions: Record<string, string> = {
  [FEEDBACK_CATEGORIES.ROOM_QUALITY]: "Feedback about room condition, amenities, and comfort",
  [FEEDBACK_CATEGORIES.SERVICE]: "Feedback about hotel services and staff assistance",
  [FEEDBACK_CATEGORIES.CLEANLINESS]: "Feedback about room and facility cleanliness",
  [FEEDBACK_CATEGORIES.FOOD]: "Feedback about dining and food quality",
  [FEEDBACK_CATEGORIES.STAFF]: "Feedback about staff behavior and professionalism",
  [FEEDBACK_CATEGORIES.FACILITIES]: "Feedback about hotel facilities and amenities",
  [FEEDBACK_CATEGORIES.VALUE]: "Feedback about value for money and pricing",
  [FEEDBACK_CATEGORIES.OVERALL]: "General overall experience feedback",
};

const categoryColors: Record<string, string> = {
  [FEEDBACK_CATEGORIES.ROOM_QUALITY]: "bg-blue-100 text-blue-800",
  [FEEDBACK_CATEGORIES.SERVICE]: "bg-green-100 text-green-800",
  [FEEDBACK_CATEGORIES.CLEANLINESS]: "bg-purple-100 text-purple-800",
  [FEEDBACK_CATEGORIES.FOOD]: "bg-orange-100 text-orange-800",
  [FEEDBACK_CATEGORIES.STAFF]: "bg-pink-100 text-pink-800",
  [FEEDBACK_CATEGORIES.FACILITIES]: "bg-indigo-100 text-indigo-800",
  [FEEDBACK_CATEGORIES.VALUE]: "bg-yellow-100 text-yellow-800",
  [FEEDBACK_CATEGORIES.OVERALL]: "bg-gray-100 text-gray-800",
};

const ratingLabels: Record<number, string> = {
  1: "Poor",
  2: "Fair", 
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

const ratingColors: Record<number, string> = {
  1: "bg-red-100 text-red-800",
  2: "bg-orange-100 text-orange-800",
  3: "bg-yellow-100 text-yellow-800",
  4: "bg-blue-100 text-blue-800",
  5: "bg-green-100 text-green-800",
};

// Star Rating Component
const StarRating = ({ 
  rating, 
  onRatingChange, 
  readonly = false 
}: { 
  rating: number; 
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
}) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRatingChange?.(star)}
          className={cn(
            "transition-colors",
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            className={cn(
              "h-6 w-6",
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-sm font-medium">
        {rating}/5 - {ratingLabels[rating]}
      </span>
    </div>
  );
};

export function FeedbackSheet({ id, children }: FeedbackSheetProps) {
  const [open, setOpen] = useState(false);
  const { post, isMutating, put, get, invalidate } = useApi(
    ENDPOINT_URLS.FEEDBACK.CREATE,
    {
      immediate: false,
    }
  );
  const { data: guests } = useApi<UserType[]>(ENDPOINT_URLS.GUESTS.ALL);
  const { data: rooms } = useApi<Room[]>(ENDPOINT_URLS.ROOMS.ALL);
  const { data: reservationsRes } = useApi<{reservations: Reservation[]}>(ENDPOINT_URLS.RESERVATIONS.ALL);

  const form = useForm<FeedbackCreateFormData | FeedbackUpdateFormData>({
    resolver: zodResolver(
      id ? feedbackUpdateSchema : feedbackCreateSchema
    ) as Resolver<FeedbackCreateFormData | FeedbackUpdateFormData>,
    defaultValues: {
      guestId: "",
      reservationId: "",
      roomId: "",
      rating: 5,
      category: FEEDBACK_CATEGORIES.OVERALL,
      comment: "",
      isAnonymous: false,
    },
  });

  const getFeedback = useCallback(async () => {
    if (id) {
      const { data } = await get<Feedback>(
        ENDPOINT_URLS.FEEDBACK.GET_BY_ID(id),
        {
          silent: true,
        }
      );
      form.reset({
        ...data,
        guestId: typeof data.guestId === 'string' ? data.guestId : (data.guestId as any)?._id || data.guestId,
        reservationId: typeof data.reservationId === 'string' ? data.reservationId : (data.reservationId as any)?._id || data.reservationId,
        roomId: typeof data.roomId === 'string' ? data.roomId : (data.roomId as any)?._id || data.roomId,
      });
    }
  }, [id,]);

  useEffect(() => {
    getFeedback();
  }, [getFeedback]);

  const watchedRating = form.watch("rating");
  const watchedCategory = form.watch("category");
  const watchedGuestId = form.watch("guestId");
  const watchedReservationId = form.watch("reservationId");

  // Auto-fill related data when guest is selected
  useEffect(() => {
    if (watchedGuestId && reservationsRes?.reservations) {
      const guestReservations = reservationsRes.reservations.filter(
        (reservation: any) => reservation.guestId === watchedGuestId
      );
      if (guestReservations.length > 0) {
        const latestReservation = guestReservations[0];
        form.setValue("reservationId", latestReservation._id);
        form.setValue("roomId", typeof latestReservation.roomId === 'string' ? latestReservation.roomId : (latestReservation.roomId as any)?._id || latestReservation.roomId);
      }
    }
  }, [watchedGuestId, reservationsRes, form]);

  // Auto-fill room when reservation is selected
  useEffect(() => {
    if (watchedReservationId && reservationsRes?.reservations) {
      const reservation = reservationsRes.reservations.find(
        (res: any) => res._id === watchedReservationId
      );
      if (reservation) {
        form.setValue("roomId", typeof reservation.roomId === 'string' ? reservation.roomId : (reservation.roomId as any)?._id || reservation.roomId);
        form.setValue("guestId", typeof reservation.guestId === 'string' ? reservation.guestId : (reservation.guestId as any)?._id || reservation.guestId);
      }
    }
  }, [watchedReservationId, reservationsRes, form]);

  const handleSubmit = async (
    data: FeedbackCreateFormData | FeedbackUpdateFormData
  ) => {
    try {
      if (id) {
        await put(ENDPOINT_URLS.FEEDBACK.UPDATE(id), data);
      } else {
        await post(ENDPOINT_URLS.FEEDBACK.CREATE, data);
      }
      await invalidate();
      form.reset({
        guestId: "",
        reservationId: "",
        roomId: "",
        rating: 5,
        category: FEEDBACK_CATEGORIES.OVERALL,
        comment: "",
        isAnonymous: false,
      });
    } catch (error) {
      handleApiError(error, form.setError);
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col h-full">
        <SheetHeader className="space-y-3 pb-6 px-6 pt-6">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
              <MessageSquare className="h-4 w-4" />
            </div>
            {id ? "Edit Feedback" : "Add New Feedback"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {id
              ? "Update feedback details and responses."
              : "Add new guest feedback with rating and comments."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8 pb-6"
            >
              {/* Guest and Reservation Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <User className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">
                    Guest & Reservation Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="guestId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select guest" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-64">
                            {Array.isArray(guests) && guests.map((guest: UserType) => (
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
                    name="reservationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reservation</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select reservation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-64">
                            {Array.isArray(reservationsRes?.reservations) && reservationsRes.reservations.map((reservation: any) => (
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
                </div>

                <FormField
                  control={form.control}
                  name="roomId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
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
              </div>

              <Separator />

              {/* Rating and Category */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Star className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Rating & Category</h3>
                </div>

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <StarRating
                          rating={field.value || 5}
                          onRatingChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Click on the stars to set the rating
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(FEEDBACK_CATEGORIES).map(([key, value]) => (
                            <SelectItem key={value} value={value}>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "text-xs",
                                    categoryColors[value]
                                  )}
                                >
                                  {key.replace('_', ' ')}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {categoryDescriptions[value]}
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

              <Separator />

              {/* Comment and Settings */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <MessageCircle className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Comment & Settings</h3>
                </div>

                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comment</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter feedback comment (optional)..."
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional detailed feedback comment (max 2000 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAnonymous"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          {field.value ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          Anonymous Feedback
                        </FormLabel>
                        <FormDescription>
                          Hide guest identity in this feedback
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

              {/* Preview */}
              {(watchedRating || watchedCategory) && (
                <div className="space-y-3">
                  <Separator />
                  <div className="flex flex-wrap gap-2">
                    {watchedRating && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          ratingColors[watchedRating]
                        )}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        {watchedRating}/5 - {ratingLabels[watchedRating]}
                      </Badge>
                    )}
                    {watchedCategory && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          categoryColors[watchedCategory]
                        )}
                      >
                        {watchedCategory.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>

        {/* Footer with action buttons */}
        <div className="border-t bg-background px-6 py-6">
          <div className="flex gap-4">
            <LoadingButton
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isMutating}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </LoadingButton>
            <LoadingButton
              type="submit"
              isLoading={isMutating}
              disabled={isMutating}
              onClick={form.handleSubmit(handleSubmit)}
              className="flex-1"
            >
              {id ? "Update Feedback" : "Add Feedback"}
            </LoadingButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
