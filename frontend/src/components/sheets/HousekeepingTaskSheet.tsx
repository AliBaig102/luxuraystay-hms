import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList, Home, Calendar, AlertTriangle, X } from "lucide-react";

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
} from "@/components/ui";
import type { HousekeepingTask, User as UserType, Room } from "@/types/models";
import { LoadingButton } from "../custom/LoadingButton";
import {
  housekeepingTaskCreateSchema,
  housekeepingTaskUpdateSchema,
  type HousekeepingTaskCreateFormData,
  type HousekeepingTaskUpdateFormData,
} from "@/lib/zodValidation";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/lib";

interface HousekeepingTaskSheetProps {
  id?: string;
  children: ReactNode;
}

const taskTypeDescriptions: Record<string, string> = {
  daily_cleaning: "Regular daily cleaning and tidying of guest rooms",
  deep_cleaning:
    "Thorough deep cleaning including carpets, fixtures, and detailed areas",
  linen_change: "Changing bed linens, towels, and other fabric items",
  amenity_restock: "Restocking toiletries, amenities, and supplies",
  inspection: "Quality inspection and maintenance check of room condition",
};

const taskTypeColors: Record<string, string> = {
  daily_cleaning: "bg-blue-100 text-blue-800",
  deep_cleaning: "bg-purple-100 text-purple-800",
  linen_change: "bg-green-100 text-green-800",
  amenity_restock: "bg-orange-100 text-orange-800",
  inspection: "bg-indigo-100 text-indigo-800",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  assigned: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export function HousekeepingTaskSheet({
  id,
  children,
}: HousekeepingTaskSheetProps) {
  const [open, setOpen] = useState(false);
  const { post, isMutating, put, get, invalidate } = useApi(
    ENDPOINT_URLS.HOUSEKEEPING_TASKS.CREATE,
    {
      immediate: false,
    }
  );
  const { data: staff } = useApi<UserType[]>(ENDPOINT_URLS.USERS.ALL);
  const { data: rooms } = useApi<Room[]>(ENDPOINT_URLS.ROOMS.ALL);

  const form = useForm<
    HousekeepingTaskCreateFormData | HousekeepingTaskUpdateFormData
  >({
    resolver: zodResolver(
      id ? housekeepingTaskUpdateSchema : housekeepingTaskCreateSchema
    ) as Resolver<
      HousekeepingTaskCreateFormData | HousekeepingTaskUpdateFormData
    >,
    defaultValues: {
      roomId: "",
      assignedStaffId: "",
      taskType: "daily_cleaning",
      priority: "medium",
      status: "pending",
      scheduledDate: new Date(),
      notes: "",
    },
  });

  const getHousekeepingTask = useCallback(async () => {
    if (id && open) {
      const { data } = await get<HousekeepingTask>(
        ENDPOINT_URLS.HOUSEKEEPING_TASKS.GET_BY_ID(id),
        {
          silent: true,
        }
      );
      form.reset({
        ...data,
        roomId:
          typeof data.roomId === "string"
            ? data.roomId
            : (data.roomId as any)?._id || data.roomId,
        assignedStaffId:
          typeof data.assignedStaffId === "string"
            ? data.assignedStaffId
            : (data.assignedStaffId as any)?._id || data.assignedStaffId,
        scheduledDate: new Date(data.scheduledDate),
      });
    }
  }, [id, open]);

  useEffect(() => {
    getHousekeepingTask();
  }, [getHousekeepingTask]);

  const watchedTaskType = form.watch("taskType");
  const watchedPriority = form.watch("priority");
  const watchedStatus = form.watch("status");

  const handleSubmit = async (
    data: HousekeepingTaskCreateFormData | HousekeepingTaskUpdateFormData
  ) => {
    try {
      if (id) {
        await put(ENDPOINT_URLS.HOUSEKEEPING_TASKS.UPDATE(id), data);
      } else {
        await post(ENDPOINT_URLS.HOUSEKEEPING_TASKS.CREATE, data);
      }
      await invalidate(ENDPOINT_URLS.HOUSEKEEPING_TASKS.ALL);
      form.reset({
        roomId: "",
        assignedStaffId: "",
        taskType: "daily_cleaning",
        priority: "medium",
        status: "pending",
        scheduledDate: new Date(),
        notes: "",
      });
    } catch (error) {
      handleApiError(error, form.setError);
      console.error("Error submitting housekeeping task:", error);
    }
  };

  // Filter staff to only show housekeeping staff
  const housekeepingStaff = Array.isArray(staff)
    ? staff.filter((user: UserType) => user.role === "housekeeping")
    : [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl flex flex-col h-full overflow-hidden">
        <SheetHeader className="space-y-3 pb-6 px-6 pt-6">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
              <ClipboardList className="h-4 w-4" />
            </div>
            {id ? "Edit Housekeeping Task" : "Add New Housekeeping Task"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {id
              ? "Update housekeeping task details and assignments."
              : "Create a new housekeeping task with room assignment and scheduling."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted">
          <Form {...form}>
            <form
              id="housekeeping-task-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8 pb-8"
            >
              {/* Room and Staff Assignment */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Home className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">
                    Room & Staff Assignment
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                            {Array.isArray(rooms) &&
                              rooms.map((room) => (
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

                  <FormField
                    control={form.control}
                    name="assignedStaffId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Staff</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select staff member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-64">
                            {housekeepingStaff.map((staff: UserType) => (
                              <SelectItem key={staff._id} value={staff._id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {staff.firstName} {staff.lastName}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {staff.email}
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

              {/* Task Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <ClipboardList className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Task Details</h3>
                </div>
                <FormField
                  control={form.control}
                  name="taskType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select task type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(taskTypeDescriptions).map(
                            ([key, description]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "text-xs",
                                      taskTypeColors[key]
                                    )}
                                  >
                                    {key.replace("_", " ")}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                      {key.charAt(0).toUpperCase() +
                                        key.slice(1)}
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(statusColors).map(
                            ([key, colorClass]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className={cn("text-xs", colorClass)}
                                  >
                                    {key
                                      .replace("_", " ")
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
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
              </div>

              <Separator />

              {/* Scheduling */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Calendar className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Scheduling</h3>
                </div>

                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheduled Date & Time</FormLabel>
                      <FormControl>
                        <input
                          type="datetime-local"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={
                            field.value
                              ? new Date(
                                  field.value.getTime() -
                                    field.value.getTimezoneOffset() * 60000
                                )
                                  .toISOString()
                                  .slice(0, 16)
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(new Date(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        When should this task be completed?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Notes */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <AlertTriangle className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Additional Notes</h3>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any additional notes or special instructions..."
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional notes or special instructions for this task
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Preview */}
              {(watchedTaskType || watchedPriority || watchedStatus) && (
                <div className="space-y-3">
                  <Separator />
                  <div className="flex flex-wrap gap-2">
                    {watchedTaskType && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          taskTypeColors[watchedTaskType]
                        )}
                      >
                        {watchedTaskType
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
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
                    {watchedStatus && (
                      <Badge
                        variant="secondary"
                        className={cn("text-xs", statusColors[watchedStatus])}
                      >
                        {watchedStatus
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
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
              form="housekeeping-task-form"
              isLoading={isMutating}
              disabled={isMutating}
              className="flex-1"
            >
              {id ? "Update Task" : "Create Task"}
            </LoadingButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
