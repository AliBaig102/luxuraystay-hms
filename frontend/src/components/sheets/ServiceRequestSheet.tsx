import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Headphones, User, X, Calendar } from "lucide-react";
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
import type { ServiceRequest, User as UserType, Room } from "@/types/models";
import { LoadingButton } from "../custom/LoadingButton";
import {
  serviceRequestCreateSchema,
  serviceRequestUpdateSchema,
  type ServiceRequestCreateFormData,
  type ServiceRequestUpdateFormData,
} from "@/lib/zodValidation";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/lib";

interface ServiceRequestSheetProps {
  id?: string;
  children: ReactNode;
}

const serviceTypeDescriptions: Record<string, string> = {
  room_service: "Food and beverage service to guest rooms",
  wake_up_call: "Scheduled wake-up calls for guests",
  transportation: "Airport transfers, taxi bookings, and transportation services",
  laundry: "Laundry and dry cleaning services",
  housekeeping: "Additional housekeeping services and room amenities",
  maintenance: "Room maintenance and repair requests",
  concierge: "Concierge services, bookings, and recommendations",
};

const serviceTypeColors: Record<string, string> = {
  room_service: "bg-blue-100 text-blue-800",
  wake_up_call: "bg-yellow-100 text-yellow-800",
  transportation: "bg-green-100 text-green-800",
  laundry: "bg-purple-100 text-purple-800",
  housekeeping: "bg-orange-100 text-orange-800",
  maintenance: "bg-red-100 text-red-800",
  concierge: "bg-indigo-100 text-indigo-800",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const statusColors: Record<string, string> = {
  requested: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export function ServiceRequestSheet({ id, children }: ServiceRequestSheetProps) {
  const [open, setOpen] = useState(false);
  const { post, isMutating, put, get, invalidate } = useApi(
    ENDPOINT_URLS.SERVICE_REQUESTS.CREATE,
    {
      immediate: false,
    }
  );
  const { data: staff } = useApi<UserType[]>(ENDPOINT_URLS.USERS.ALL);
  const { data: rooms } = useApi<Room[]>(ENDPOINT_URLS.ROOMS.ALL);

  const form = useForm<ServiceRequestCreateFormData | ServiceRequestUpdateFormData>({
    resolver: zodResolver(
      id ? serviceRequestUpdateSchema : serviceRequestCreateSchema
    ) as Resolver<ServiceRequestCreateFormData | ServiceRequestUpdateFormData>,
    defaultValues: {
      guestId: "",
      roomId: "",
      serviceType: "room_service",
      description: "",
      priority: "medium",
      status: "requested",
      assignedStaffId: "",
      requestedDate: new Date(),
      completedDate: undefined,
      cost: undefined,
    },
  });

  const getServiceRequest = useCallback(async () => {
    if (id && open) {
      const { data } = await get<ServiceRequest>(
        ENDPOINT_URLS.SERVICE_REQUESTS.GET_BY_ID(id),
        {
          silent: true,
        }
      );
      form.reset({
        ...data,
        guestId: typeof data.guestId === 'string' ? data.guestId : (data.guestId as any)?._id || data.guestId,
        roomId: typeof data.roomId === 'string' ? data.roomId : (data.roomId as any)?._id || data.roomId,
        assignedStaffId: typeof data.assignedStaffId === 'string' ? data.assignedStaffId : (data.assignedStaffId as any)?._id || data.assignedStaffId,
        requestedDate: data.requestedDate ? new Date(data.requestedDate) : new Date(),
        completedDate: data.completedDate ? new Date(data.completedDate) : undefined,
      });
    }
  }, [id, open]);

  useEffect(() => {
    getServiceRequest();
  }, [getServiceRequest]);

  const watchedServiceType = form.watch("serviceType");
  const watchedPriority = form.watch("priority");
  const watchedStatus = form.watch("status");

  const handleSubmit = async (
    data: ServiceRequestCreateFormData | ServiceRequestUpdateFormData
  ) => {
    try {
      // Transform the data to match backend expectations
      const transformedData = {
        ...data,
        requestedDate: data.requestedDate ? data.requestedDate.toISOString() : new Date().toISOString(),
        completedDate: data.completedDate ? data.completedDate.toISOString() : undefined,
      };

      if (id) {
        await put(ENDPOINT_URLS.SERVICE_REQUESTS.UPDATE(id), transformedData);
      } else {
        await post(ENDPOINT_URLS.SERVICE_REQUESTS.CREATE, transformedData);
      }
      await invalidate(ENDPOINT_URLS.SERVICE_REQUESTS.ALL);
      setOpen(false);
      form.reset({
        guestId: "",
        roomId: "",
        serviceType: "room_service",
        description: "",
        priority: "medium",
        status: "requested",
        assignedStaffId: "",
        requestedDate: new Date(),
        completedDate: undefined,
        cost: undefined,
      });
    } catch (error) {
      handleApiError(error, form.setError);
      console.error("Error submitting service request:", error);
    }
  };

  // Filter staff to only show relevant staff (not guests)
  const availableStaff = Array.isArray(staff) 
    ? staff.filter((user: UserType) => user.role !== "guest" && user.role !== "admin" && user.role !== "manager")
    : [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col h-full overflow-hidden">
        <SheetHeader className="space-y-3 pb-6 px-6 pt-6">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
              <Headphones className="h-4 w-4" />
            </div>
            {id ? "Edit Service Request" : "Add New Service Request"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {id
              ? "Update service request details and assignments."
              : "Create a new service request with guest and room assignment."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted">
          <Form {...form}>
            <form
              id="service-request-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8 pb-8"
            >
              {/* Guest and Room Assignment */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <User className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">
                    Guest & Room Assignment
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
                            {Array.isArray(staff) &&
                              staff
                                .filter((user: UserType) => user.role === "guest")
                                .map((user: UserType) => (
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
                </div>
              </div>

              <Separator />

              {/* Service Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Headphones className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Service Details</h3>
                </div>

                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(serviceTypeDescriptions).map(
                            ([key, description]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "text-xs",
                                      serviceTypeColors[key]
                                    )}
                                  >
                                    {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                          placeholder="Describe the service request in detail..."
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a detailed description of the service request
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
                                        .replace(/\b\w/g, (l: string) => l.toUpperCase())}
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
                            {availableStaff.map((staff: UserType) => (
                              <SelectItem key={staff._id} value={staff._id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {staff.firstName} {staff.lastName}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {staff.email} - {staff.role}
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
                    name="requestedDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requested Date</FormLabel>
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
                          When was this service requested?
                        </FormDescription>
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
                      <FormLabel>Cost</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter service cost"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional cost for this service request
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Preview */}
              {(watchedServiceType || watchedPriority || watchedStatus) && (
                <div className="space-y-3">
                  <Separator />
                  <div className="flex flex-wrap gap-2">
                    {watchedServiceType && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          serviceTypeColors[watchedServiceType]
                        )}
                      >
                        {watchedServiceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
              form="service-request-form"
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
