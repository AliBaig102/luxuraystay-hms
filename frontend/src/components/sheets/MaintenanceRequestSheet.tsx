import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wrench, Home, AlertTriangle, X, User, Calendar } from "lucide-react";
import { format } from "date-fns";

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
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Calendar as ShadcnCalendar,
} from "@/components/ui";
import type { MaintenanceRequest, User as UserType, Room } from "@/types/models";
import { LoadingButton } from "../custom/LoadingButton";
import {
  maintenanceRequestCreateSchema,
  maintenanceRequestUpdateSchema,
  type MaintenanceRequestCreateFormData,
  type MaintenanceRequestUpdateFormData,
} from "@/lib/zodValidation";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/lib";
import { useAuth } from "@/hooks/useAuth";

interface MaintenanceRequestSheetProps {
  id?: string;
  children: ReactNode;
}

const categoryDescriptions: Record<string, string> = {
  electrical: "Electrical systems, wiring, outlets, and lighting issues",
  plumbing: "Water systems, pipes, faucets, and drainage problems",
  hvac: "Heating, ventilation, and air conditioning systems",
  appliance: "Room appliances like TVs, refrigerators, and microwaves",
  structural: "Building structure, walls, doors, and windows",
  general: "General maintenance and miscellaneous issues",
};

const categoryColors: Record<string, string> = {
  electrical: "bg-yellow-100 text-yellow-800",
  plumbing: "bg-blue-100 text-blue-800",
  hvac: "bg-green-100 text-green-800",
  appliance: "bg-purple-100 text-purple-800",
  structural: "bg-red-100 text-red-800",
  general: "bg-gray-100 text-gray-800",
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

export function MaintenanceRequestSheet({ id, children }: MaintenanceRequestSheetProps) {
  const [open, setOpen] = useState(false);
  const { user: currentUser } = useAuth();
  const { post, isMutating, put, get, invalidate } = useApi(
    ENDPOINT_URLS.MAINTENANCE_REQUESTS.CREATE,
    {
      immediate: false,
    }
  );
  const { data: staff } = useApi<UserType[]>(ENDPOINT_URLS.USERS.ALL);
  const { data: rooms } = useApi<Room[]>(ENDPOINT_URLS.ROOMS.ALL);

  const form = useForm<MaintenanceRequestCreateFormData | MaintenanceRequestUpdateFormData>({
    resolver: zodResolver(
      id ? maintenanceRequestUpdateSchema : maintenanceRequestCreateSchema
    ) as Resolver<MaintenanceRequestCreateFormData | MaintenanceRequestUpdateFormData>,
    defaultValues: {
      roomId: "",
      reportedBy: currentUser?._id || "",
      maintenanceType: "general",
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      assignedTo: "",
      estimatedCompletionDate: undefined,
      actualCompletionDate: undefined,
      cost: undefined,
      notes: "",
    },
  });

  const getMaintenanceRequest = useCallback(async () => {
    if (id && open) {
      const { data } = await get<MaintenanceRequest>(
        ENDPOINT_URLS.MAINTENANCE_REQUESTS.GET_BY_ID(id),
        {
          silent: true,
        }
      );
      form.reset({
        ...data,
        roomId: typeof data.roomId === 'string' ? data.roomId : (data.roomId as any)?._id || data.roomId,
        reportedBy: typeof data.reportedBy === 'string' ? data.reportedBy : (data.reportedBy as any)?._id || data.reportedBy,
        assignedTo: typeof data.assignedTechnicianId === 'string' ? data.assignedTechnicianId : (data.assignedTechnicianId as any)?._id || data.assignedTechnicianId,
        estimatedCompletionDate: data.estimatedCompletionDate ? new Date(data.estimatedCompletionDate) : undefined,
        actualCompletionDate: data.actualCompletionDate ? new Date(data.actualCompletionDate) : undefined,
        cost: data.cost,
        maintenanceType: data.category,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, open]);

  useEffect(() => {
    getMaintenanceRequest();
  }, [getMaintenanceRequest]);

  const watchedCategory = form.watch("maintenanceType");
  const watchedPriority = form.watch("priority");
  const watchedStatus = form.watch("status");

  const handleSubmit = async (
    data: MaintenanceRequestCreateFormData | MaintenanceRequestUpdateFormData
  ) => {
    try {
      // Transform the data to match backend expectations
      const transformedData = {
        ...data,
        estimatedCompletionDate: data.estimatedCompletionDate ? data.estimatedCompletionDate.toISOString() : undefined,
      };

      if (id) {
        await put(ENDPOINT_URLS.MAINTENANCE_REQUESTS.UPDATE(id), transformedData);
      } else {
        await post(ENDPOINT_URLS.MAINTENANCE_REQUESTS.CREATE, transformedData);
      }
      await invalidate(ENDPOINT_URLS.MAINTENANCE_REQUESTS.ALL);
      setOpen(false);
      form.reset({
        roomId: "",
        reportedBy: currentUser?._id || "",
        maintenanceType: "general",
        title: "",
        description: "",
        priority: "medium",
        status: "pending",
        assignedTo: "",
        estimatedCompletionDate: undefined,
        actualCompletionDate: undefined,
        cost: undefined,
        notes: "",
      });
    } catch (error) {
      handleApiError(error, form.setError);
      console.error("Error submitting maintenance request:", error);
    }
  };

  // Filter staff to only show maintenance staff
  const maintenanceStaff = Array.isArray(staff) 
    ? staff.filter((user: UserType) => user.role === "maintenance")
    : [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col h-full overflow-hidden">
        <SheetHeader className="space-y-3 pb-6 px-6 pt-6">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
              <Wrench className="h-4 w-4" />
            </div>
            {id ? "Edit Maintenance Request" : "Add New Maintenance Request"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {id
              ? "Update maintenance request details and assignments."
              : "Create a new maintenance request with room assignment and priority."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted">
          <Form {...form}>
            <form
              id="maintenance-request-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8 pb-8"
            >
              {/* Room and Reporter Assignment */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Home className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">
                    Room & Reporter Assignment
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
                    name="reportedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reported By</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!!id}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select reporter" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-64">
                            {Array.isArray(staff) &&
                              staff.map((user: UserType) => (
                                <SelectItem key={user._id} value={user._id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {user.firstName} {user.lastName}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {user.email}
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

              {/* Request Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Wrench className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Request Details</h3>
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter maintenance request title..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Brief title describing the maintenance issue
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maintenanceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(categoryDescriptions).map(
                            ([key, description]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "text-xs",
                                      categoryColors[key]
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the maintenance issue in detail..."
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a detailed description of the maintenance issue
                      </FormDescription>
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

              {/* Assignment and Scheduling */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <User className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Assignment & Scheduling</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="assignedTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Technician</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select technician" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-64">
                            {maintenanceStaff.map((staff: UserType) => (
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

                  <FormField
                    control={form.control}
                    name="estimatedCompletionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Completion Date</FormLabel>
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
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <ShadcnCalendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          When is this maintenance scheduled to be completed?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="actualCompletionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Actual Completion Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" className="w-full pl-3 text-left font-normal">
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <ShadcnCalendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date("1900-01-01")} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>When was this maintenance actually completed?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Cost</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter estimated cost"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional estimated cost for this maintenance request
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
                        Optional notes or special instructions for this request
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Preview */}
              {(watchedCategory || watchedPriority || watchedStatus) && (
                <div className="space-y-3">
                  <Separator />
                  <div className="flex flex-wrap gap-2">
                    {watchedCategory && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          categoryColors[watchedCategory]
                        )}
                      >
                        {watchedCategory.charAt(0).toUpperCase() + watchedCategory.slice(1)}
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
                          .replace(/\b\w/g, (l: string) => l.toUpperCase())}
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
              form="maintenance-request-form"
              isLoading={isMutating}
              disabled={isMutating}
              className="flex-1"
            >
              {id ? "Update Request" : "Create Request"}
            </LoadingButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
