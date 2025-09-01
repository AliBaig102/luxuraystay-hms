import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Home,
  DollarSign,
  Users,
  Building,
  X,
  Plus,
  Check,
  Trash2,
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
} from "@/components/ui";
import { ROOM_TYPES, ROOM_STATUSES } from "@/types/models";
import type { Room, RoomType, RoomStatus } from "@/types/models";
import { LoadingButton } from "../custom/LoadingButton";
import { createRoomSchema, updateRoomSchema, type CreateRoomFormData, type UpdateRoomFormData } from "@/lib/zodValidation";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { useCallback, useEffect, useState, type ReactNode } from "react";

interface RoomSheetProps {
  id?: string;
  children: ReactNode;
}

const roomTypeDescriptions: Record<RoomType, string> = {
  [ROOM_TYPES.STANDARD]: "Basic room with essential amenities",
  [ROOM_TYPES.DELUXE]: "Enhanced room with premium features",
  [ROOM_TYPES.SUITE]: "Spacious suite with separate living area",
  [ROOM_TYPES.PRESIDENTIAL]: "Luxury suite with exclusive amenities",
};

const roomTypeColors: Record<RoomType, string> = {
  [ROOM_TYPES.STANDARD]: "bg-blue-100 text-blue-800",
  [ROOM_TYPES.DELUXE]: "bg-green-100 text-green-800",
  [ROOM_TYPES.SUITE]: "bg-purple-100 text-purple-800",
  [ROOM_TYPES.PRESIDENTIAL]: "bg-yellow-100 text-yellow-800",
};

const roomStatusDescriptions: Record<RoomStatus, string> = {
  [ROOM_STATUSES.AVAILABLE]: "Room is ready for new guests",
  [ROOM_STATUSES.OCCUPIED]: "Room is currently occupied",
  [ROOM_STATUSES.MAINTENANCE]: "Room is under maintenance",
  [ROOM_STATUSES.OUT_OF_SERVICE]: "Room is not available for guests",
  [ROOM_STATUSES.CLEANING]: "Room is being cleaned",
  [ROOM_STATUSES.RESERVED]: "Room is reserved",
};

const roomStatusColors: Record<RoomStatus, string> = {
  [ROOM_STATUSES.AVAILABLE]: "bg-green-100 text-green-800",
  [ROOM_STATUSES.OCCUPIED]: "bg-red-100 text-red-800",
  [ROOM_STATUSES.MAINTENANCE]: "bg-orange-100 text-orange-800",
  [ROOM_STATUSES.OUT_OF_SERVICE]: "bg-gray-100 text-gray-800",
  [ROOM_STATUSES.CLEANING]: "bg-blue-100 text-blue-800",
  [ROOM_STATUSES.RESERVED]: "bg-purple-100 text-purple-800",
};

export function RoomSheet({ id, children }: RoomSheetProps) {
  const { post, isMutating, put, get, invalidate } = useApi(
    ENDPOINT_URLS.ROOMS.CREATE,
    {
      immediate: false,
    }
  );
  const [open, setOpen] = useState(false);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [newImage, setNewImage] = useState("");

  const form = useForm<CreateRoomFormData | UpdateRoomFormData>({
    resolver: zodResolver(id ? updateRoomSchema : createRoomSchema) as Resolver<CreateRoomFormData | UpdateRoomFormData>,
    defaultValues: {
      roomNumber: "",
      roomType: ROOM_TYPES.STANDARD,
      floor: 1,
      capacity: 2,
      pricePerNight: 100,
      status: ROOM_STATUSES.AVAILABLE,
      amenities: [],
      description: "",
      images: [],
      isActive: true,
    },
  });

  const getRoom = useCallback(async () => {
    if (id && open) {
      const { data } = await get<Room>(ENDPOINT_URLS.ROOMS.GET_BY_ID(id), {
        silent: true,
      });
      form.reset(data);
      setAmenities(data.amenities || []);
      setImages(data.images || []);
    }
  }, [id, open]);

  useEffect(() => {
    getRoom();
  }, [id, open, getRoom]);

  const watchedRoomType = form.watch("roomType");
  const watchedStatus = form.watch("status");

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      const updatedAmenities = [...amenities, newAmenity.trim()];
      setAmenities(updatedAmenities);
      form.setValue("amenities", updatedAmenities);
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    const updatedAmenities = amenities.filter(a => a !== amenity);
    setAmenities(updatedAmenities);
    form.setValue("amenities", updatedAmenities);
  };

  const handleAddImage = () => {
    if (newImage.trim() && !images.includes(newImage.trim())) {
      const updatedImages = [...images, newImage.trim()];
      setImages(updatedImages);
      form.setValue("images", updatedImages);
      setNewImage("");
    }
  };

  const handleRemoveImage = (image: string) => {
    const updatedImages = images.filter(img => img !== image);
    setImages(updatedImages);
    form.setValue("images", updatedImages);
  };

  const handleSubmit = async (data: CreateRoomFormData | UpdateRoomFormData) => {
    try {
      const submitData = {
        ...data,
        amenities,
        images,
      };
      
      if (id) {
        await put(ENDPOINT_URLS.ROOMS.UPDATE(id), submitData);
      } else {
        await post(ENDPOINT_URLS.ROOMS.CREATE, submitData);
      }
      await invalidate(ENDPOINT_URLS.ROOMS.ALL);
      form.reset();
      setAmenities([]);
      setImages([]);
      setOpen(false);
    } catch (error) {
      console.error("Failed to save room:", error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
      setAmenities([]);
      setImages([]);
      setNewAmenity("");
      setNewImage("");
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader className="space-y-3 pb-6 px-6 pt-6">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
              <Home className="h-4 w-4" />
            </div>
            {id ? "Edit Room" : "Create New Room"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {id
              ? "Update existing room details and configuration."
              : "Create a new room with type, pricing, and amenities."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 pb-4"
            >
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Home className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="roomNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Number</FormLabel>
                        <FormControl>
                          <Input placeholder="101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="floor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Floor</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity (Guests)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 2)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricePerNight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Night ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="100.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 100)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Room Type & Status */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Building className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Type & Status</h3>
                </div>

                <FormField
                  control={form.control}
                  name="roomType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select room type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(ROOM_TYPES).map((type) => (
                            <SelectItem key={type} value={type}>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className={roomTypeColors[type]}
                                >
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {watchedRoomType && (
                        <FormDescription className="text-xs">
                          {roomTypeDescriptions[watchedRoomType]}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select room status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(ROOM_STATUSES).map((status) => (
                            <SelectItem key={status} value={status}>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className={roomStatusColors[status]}
                                >
                                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {watchedStatus && (
                        <FormDescription className="text-xs">
                          {roomStatusDescriptions[watchedStatus]}
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
                          Enable or disable room availability
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

              {/* Description */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter room description..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Optional description of the room features and layout
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Amenities */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Users className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Amenities</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add amenity (e.g., WiFi, TV, Mini Bar)"
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddAmenity}
                      disabled={!newAmenity.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((amenity, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {amenity}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => handleRemoveAmenity(amenity)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Images */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <DollarSign className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Images</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add image URL"
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddImage}
                      disabled={!newImage.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {images.length > 0 && (
                    <div className="space-y-2">
                      {images.map((image, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded-md"
                        >
                          <span className="text-sm truncate flex-1">{image}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleRemoveImage(image)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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