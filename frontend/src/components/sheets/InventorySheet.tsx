import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Package,
  Hash,
  Building2,
  Calendar,
  CalendarIcon,
  MapPin,
  X,
  Save,
  Plus,
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
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui";
import { INVENTORY_ITEM_TYPES, INVENTORY_ITEM_STATUSES } from "@/types/models";
import type { InventoryItem, InventoryItemType, InventoryItemStatus } from "@/types/models";
import { LoadingButton } from "../custom/LoadingButton";
import { createInventoryItemSchema, updateInventoryItemSchema, type CreateInventoryItemFormData, type UpdateInventoryItemFormData } from "@/lib/zodValidation";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

interface InventorySheetProps {
  id?: string;
  children: ReactNode;
}

const inventoryTypeDescriptions: Record<InventoryItemType, string> = {
  [INVENTORY_ITEM_TYPES.FOOD]: "Food items and ingredients",
  [INVENTORY_ITEM_TYPES.BEVERAGE]: "Beverages and drinks",
  [INVENTORY_ITEM_TYPES.CLEANING_SUPPLY]: "Cleaning supplies and chemicals",
  [INVENTORY_ITEM_TYPES.AMENITY]: "Guest amenities and toiletries",
  [INVENTORY_ITEM_TYPES.MAINTENANCE]: "Maintenance tools and supplies",
  [INVENTORY_ITEM_TYPES.OFFICE_SUPPLY]: "Office supplies and stationery",
  [INVENTORY_ITEM_TYPES.OTHER]: "Other miscellaneous items",
};

const inventoryTypeColors: Record<InventoryItemType, string> = {
  [INVENTORY_ITEM_TYPES.FOOD]: "bg-green-100 text-green-800",
  [INVENTORY_ITEM_TYPES.BEVERAGE]: "bg-blue-100 text-blue-800",
  [INVENTORY_ITEM_TYPES.CLEANING_SUPPLY]: "bg-purple-100 text-purple-800",
  [INVENTORY_ITEM_TYPES.AMENITY]: "bg-pink-100 text-pink-800",
  [INVENTORY_ITEM_TYPES.MAINTENANCE]: "bg-orange-100 text-orange-800",
  [INVENTORY_ITEM_TYPES.OFFICE_SUPPLY]: "bg-gray-100 text-gray-800",
  [INVENTORY_ITEM_TYPES.OTHER]: "bg-yellow-100 text-yellow-800",
};

const inventoryStatusDescriptions: Record<InventoryItemStatus, string> = {
  [INVENTORY_ITEM_STATUSES.IN_STOCK]: "Item is available in stock",
  [INVENTORY_ITEM_STATUSES.LOW_STOCK]: "Item is running low on stock",
  [INVENTORY_ITEM_STATUSES.OUT_OF_STOCK]: "Item is out of stock",
  [INVENTORY_ITEM_STATUSES.EXPIRED]: "Item has expired",
  [INVENTORY_ITEM_STATUSES.DISCONTINUED]: "Item is discontinued",
};

const inventoryStatusColors: Record<InventoryItemStatus, string> = {
  [INVENTORY_ITEM_STATUSES.IN_STOCK]: "bg-green-100 text-green-800",
  [INVENTORY_ITEM_STATUSES.LOW_STOCK]: "bg-yellow-100 text-yellow-800",
  [INVENTORY_ITEM_STATUSES.OUT_OF_STOCK]: "bg-red-100 text-red-800",
  [INVENTORY_ITEM_STATUSES.EXPIRED]: "bg-gray-100 text-gray-800",
  [INVENTORY_ITEM_STATUSES.DISCONTINUED]: "bg-slate-100 text-slate-800",
};

export function InventorySheet({ id, children }: InventorySheetProps) {
  const { post, isMutating, put, get, invalidate } = useApi(
    ENDPOINT_URLS.INVENTORY.CREATE,
    {
      immediate: false,
      auth: true,
    }
  );
  const [open, setOpen] = useState(false);

  const form = useForm<CreateInventoryItemFormData | UpdateInventoryItemFormData>({
    resolver: zodResolver(id ? updateInventoryItemSchema : createInventoryItemSchema) as Resolver<CreateInventoryItemFormData | UpdateInventoryItemFormData>,
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      category: "",
      type: INVENTORY_ITEM_TYPES.OTHER,
      status: INVENTORY_ITEM_STATUSES.IN_STOCK,
      quantity: 0,
      unitPrice: 0,
      minQuantity: 0,
      maxQuantity: undefined,
      supplier: "",
      location: "",
      barcode: "",
      expiryDate: undefined,
      lastRestocked: undefined,
      isActive: true,
    },
  });

  const getInventoryItem = useCallback(async () => {
    if (id && open) {
      const { data } = await get<{item: InventoryItem}>(ENDPOINT_URLS.INVENTORY.GET_BY_ID(id), {
        silent: true,
      });
      form.reset({
        ...data.item,
        expiryDate: data.item.expiryDate ? new Date(data.item.expiryDate) : undefined,
        lastRestocked: data.item.lastRestocked ? new Date(data.item.lastRestocked) : undefined,
      });
    }
  }, [id, open]);

  useEffect(() => {
    getInventoryItem();
  }, [id, open, getInventoryItem]);

  const watchedType = form.watch("type");
  const watchedStatus = form.watch("status");

  const handleSubmit = async (data: CreateInventoryItemFormData | UpdateInventoryItemFormData) => {
    try {
      const submitData = {
        ...data,
        expiryDate: data.expiryDate ? data.expiryDate.toISOString() : undefined,
        lastRestocked: data.lastRestocked ? data.lastRestocked.toISOString() : undefined,
      };
      
      if (id) {
        await put(ENDPOINT_URLS.INVENTORY.UPDATE(id), submitData);
      } else {
        await post(ENDPOINT_URLS.INVENTORY.CREATE, submitData);
      }
      await invalidate(ENDPOINT_URLS.INVENTORY.ALL);
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Failed to save inventory item:", error);
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
              <Package className="h-4 w-4" />
            </div>
            {id ? "Edit Inventory Item" : "Create New Inventory Item"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {id
              ? "Update existing inventory item details and stock information."
              : "Create a new inventory item with type, pricing, and stock details."}
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
                    <Package className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="ITEM-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Item name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Item description..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="Category" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Barcode</FormLabel>
                        <FormControl>
                          <Input placeholder="Barcode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Type and Status */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Building2 className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Type & Status</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(INVENTORY_ITEM_TYPES).map(([key, value]) => (
                              <SelectItem key={value} value={value}>
                                <div className="flex items-center gap-2">
                                  <Badge className={inventoryTypeColors[value as InventoryItemType]}>
                                    {key.replace('_', ' ')}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {watchedType && (
                          <FormDescription>
                            {inventoryTypeDescriptions[watchedType as InventoryItemType]}
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
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(INVENTORY_ITEM_STATUSES).map(([key, value]) => (
                              <SelectItem key={value} value={value}>
                                <div className="flex items-center gap-2">
                                  <Badge className={inventoryStatusColors[value as InventoryItemStatus]}>
                                    {key.replace('_', ' ')}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {watchedStatus && (
                          <FormDescription>
                            {inventoryStatusDescriptions[watchedStatus as InventoryItemStatus]}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Stock Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Hash className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Stock Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unitPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                    name="minQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Alert when stock falls below this level
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Quantity (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Location and Supplier */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <MapPin className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Location & Supplier</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Storage Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Warehouse A, Shelf 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="supplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier</FormLabel>
                        <FormControl>
                          <Input placeholder="Supplier name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Dates */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Calendar className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Important Dates</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastRestocked"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Restocked (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
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

              {/* Status */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Inactive items won't appear in regular inventory lists
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
            </form>
          </Form>
        </div>

        <div className="border-t px-6 py-4">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              isLoading={isMutating}
              onClick={form.handleSubmit(handleSubmit)}
              className="flex-1"
            >
              {id ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Item
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Item
                </>
              )}
            </LoadingButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}