import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, User, X } from "lucide-react";

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
  Separator,
  Textarea,
  Input,
  Switch,
} from "@/components/ui";
import type { Notification, User as UserType } from "@/types/models";
import { LoadingButton } from "../custom/LoadingButton";
import {
  notificationCreateSchema,
  notificationUpdateSchema,
  type NotificationCreateFormData,
  type NotificationUpdateFormData,
} from "@/lib/zodValidation";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/lib";

interface NotificationSheetProps {
  id?: string;
  children: ReactNode;
}

const notificationTypeDescriptions: Record<string, string> = {
  booking: "Booking-related notifications and updates",
  maintenance: "Maintenance request notifications and alerts",
  housekeeping: "Housekeeping task notifications and updates",
  billing: "Billing and payment notifications",
  system: "System-wide notifications and announcements",
  reminder: "Reminder notifications and alerts",
};

const notificationTypeColors: Record<string, string> = {
  booking: "bg-blue-100 text-blue-800",
  maintenance: "bg-red-100 text-red-800",
  housekeeping: "bg-orange-100 text-orange-800",
  billing: "bg-green-100 text-green-800",
  system: "bg-purple-100 text-purple-800",
  reminder: "bg-yellow-100 text-yellow-800",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const recipientTypeColors: Record<string, string> = {
  user: "bg-blue-100 text-blue-800",
  guest: "bg-green-100 text-green-800",
};

export function NotificationSheet({ id, children }: NotificationSheetProps) {
  const [open, setOpen] = useState(false);
  const { post, isMutating, put, get, invalidate } = useApi(
    ENDPOINT_URLS.NOTIFICATIONS.CREATE,
    {
      immediate: false,
    }
  );
  const { data: users } = useApi<UserType[]>(ENDPOINT_URLS.USERS.ALL);

  const form = useForm<NotificationCreateFormData | NotificationUpdateFormData>({
    resolver: zodResolver(
      id ? notificationUpdateSchema : notificationCreateSchema
    ) as Resolver<NotificationCreateFormData | NotificationUpdateFormData>,
    defaultValues: {
      recipientId: "",
      recipientType: "user",
      title: "",
      message: "",
      type: "system",
      priority: "medium",
      actionUrl: "https://example.com",
      isRead: false,
      readDate: undefined,
    },
  });

  const getNotification = useCallback(async () => {
    if (id && open) {
      const { data } = await get<Notification>(
        ENDPOINT_URLS.NOTIFICATIONS.GET_BY_ID(id),
        {
          silent: true,
        }
      );
      form.reset({
        ...data,
        recipientId: typeof data.recipientId === 'string' ? data.recipientId : (data.recipientId as any)?._id || data.recipientId,
        readDate: data.readDate ? new Date(data.readDate) : undefined,
      });
    }
  }, [id, open]);

  useEffect(() => {
    getNotification();
  }, [getNotification]);

  // Auto-set readDate when isRead is toggled
  const watchedIsRead = form.watch("isRead");
  useEffect(() => {
    if (watchedIsRead && !form.getValues("readDate")) {
      form.setValue("readDate", new Date());
    } else if (!watchedIsRead) {
      form.setValue("readDate", undefined);
    }
  }, [watchedIsRead, form]);

  const watchedType = form.watch("type");
  const watchedPriority = form.watch("priority");
  const watchedRecipientType = form.watch("recipientType");

  const handleSubmit = async (
    data: NotificationCreateFormData | NotificationUpdateFormData
  ) => {
    try {
      // Transform the data to match backend expectations
      const transformedData = {
        ...data,
        // Only include readDate if isRead is true, otherwise omit it
        ...(data.isRead && 'readDate' in data && data.readDate ? { readDate: data.readDate } : {}),
      };

      // Remove readDate from the payload if isRead is false
      if (!data.isRead) {
        delete transformedData.readDate;
      }

      if (id) {
        await put(ENDPOINT_URLS.NOTIFICATIONS.UPDATE(id), transformedData);
      } else {
        await post(ENDPOINT_URLS.NOTIFICATIONS.CREATE, transformedData);
      }
      await invalidate(ENDPOINT_URLS.NOTIFICATIONS.ALL);
      setOpen(false);
      form.reset({
        recipientId: "",
        recipientType: "user",
        title: "",
        message: "",
        type: "system",
        priority: "medium",
        actionUrl: "",
        isRead: false,
        readDate: undefined,
      });
    } catch (error) {
      handleApiError(error, form.setError);
      console.error("Error submitting notification:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col h-full overflow-hidden">
        <SheetHeader className="space-y-3 pb-6 px-6 pt-6">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
              <Bell className="h-4 w-4" />
            </div>
            {id ? "Edit Notification" : "Add New Notification"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {id
              ? "Update notification details and settings."
              : "Create a new notification with recipient and content."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted">
          <Form {...form}>
            <form
              id="notification-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8 pb-8"
            >
              {/* Recipient Selection */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <User className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">
                    Recipient Selection
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="recipientType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select recipient type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(recipientTypeColors).map(
                              ([key, colorClass]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="secondary"
                                      className={cn("text-xs", colorClass)}
                                    >
                                      {key.charAt(0).toUpperCase() + key.slice(1)}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recipientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select recipient" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-64">
                            {Array.isArray(users) &&
                              users
                                .filter((user: UserType) => 
                                  watchedRecipientType === "guest" ? user.role === "guest" : user.role !== "guest"
                                )
                                .map((user: UserType) => (
                                  <SelectItem key={user._id} value={user._id}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {user.firstName} {user.lastName}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        {user.email} - {user.role}
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
              </div>

              <Separator />

              {/* Notification Content */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Bell className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Notification Content</h3>
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter notification title..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Brief title for the notification
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter notification message..."
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Detailed message content for the notification
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="actionUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Action URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/action"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional URL for action button in notification
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Notification Settings */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Bell className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Notification Settings</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select notification type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(notificationTypeDescriptions).map(
                              ([key, description]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="secondary"
                                      className={cn(
                                        "text-xs",
                                        notificationTypeColors[key]
                                      )}
                                    >
                                      {key.charAt(0).toUpperCase() + key.slice(1)}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      {description}
                                    </span>
                                  </div>
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(priorityColors).map(
                              ([key, colorClass]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="secondary"
                                      className={cn("text-xs", colorClass)}
                                    >
                                      {key.charAt(0).toUpperCase() + key.slice(1)}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isRead"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Mark as Read
                        </FormLabel>
                        <FormDescription>
                          Whether this notification should be marked as read
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
              {(watchedType || watchedPriority || watchedRecipientType) && (
                <div className="space-y-3">
                  <Separator />
                  <div className="flex flex-wrap gap-2">
                    {watchedType && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          notificationTypeColors[watchedType]
                        )}
                      >
                        {watchedType.charAt(0).toUpperCase() + watchedType.slice(1)}
                      </Badge>
                    )}
                    {watchedPriority && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          priorityColors[watchedPriority]
                        )}
                      >
                        {watchedPriority.charAt(0).toUpperCase() +
                          watchedPriority.slice(1)}{" "}
                        Priority
                      </Badge>
                    )}
                    {watchedRecipientType && (
                      <Badge
                        variant="secondary"
                        className={cn("text-xs", recipientTypeColors[watchedRecipientType])}
                      >
                        {watchedRecipientType.charAt(0).toUpperCase() + watchedRecipientType.slice(1)} Recipient
                      </Badge>
                    )}
                    {watchedIsRead && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-green-100 text-green-800"
                      >
                        Read
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>

        {/* Footer with action buttons */}
        <div className="border-t bg-background px-6 py-4 mt-auto">
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
              form="notification-form"
              isLoading={isMutating}
              disabled={isMutating}
              className="flex-1"
            >
              {id ? "Update Notification" : "Create Notification"}
            </LoadingButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
