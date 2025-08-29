"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  User,
  Mail,
  Shield,
  X,
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
} from "@/components/ui";
import { generatePassword } from "@/lib/utils";
import { USER_ROLES, type UserRole } from "@/types/models";
import { LoadingButton } from "../custom/LoadingButton";
import { createUserSchema, type CreateUserFormData } from "@/lib/zodValidation";

interface UserSheetProps {
  children: React.ReactNode;
}

const roleDescriptions: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: "Full system access and user management",
  [USER_ROLES.MANAGER]: "Hotel operations and staff management",
  [USER_ROLES.RECEPTIONIST]: "Guest check-in/out and reservations",
  [USER_ROLES.HOUSEKEEPING]: "Room cleaning and maintenance tasks",
  [USER_ROLES.MAINTENANCE]: "Facility repairs and maintenance",
  [USER_ROLES.GUEST]: "Basic guest access and services",
};

const roleColors: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: "bg-destructive/10 text-destructive",
  [USER_ROLES.MANAGER]: "bg-chart-1/10 text-chart-1",
  [USER_ROLES.RECEPTIONIST]: "bg-chart-2/10 text-chart-2",
  [USER_ROLES.HOUSEKEEPING]: "bg-chart-3/10 text-chart-3",
  [USER_ROLES.MAINTENANCE]: "bg-chart-4/10 text-chart-4",
  [USER_ROLES.GUEST]: "bg-muted text-muted-foreground",
};

export function UserSheet({
  children,
}: UserSheetProps) {
  const [open, setOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [passwordCopied, setPasswordCopied] = React.useState(false);
  const [isGeneratingPassword, setIsGeneratingPassword] = React.useState(false);

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema) as Resolver<CreateUserFormData>,
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      role: USER_ROLES.GUEST,
      password: "",
      isActive: true,
    },
  });

  const watchedRole = form.watch("role");
  const watchedPassword = form.watch("password");

  const handleGeneratePassword = async () => {
    setIsGeneratingPassword(true);
    setPasswordCopied(false);

    // Simulate loading for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newPassword = generatePassword(12, true);
    form.setValue("password", newPassword);
    setIsGeneratingPassword(false);
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(watchedPassword);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy password:", error);
    }
  };

  const handleSubmit = async (data: CreateUserFormData) => {
    try {
      console.log(data);
      form.reset();
      setOpen(false);
      setShowPassword(false);
      setPasswordCopied(false);
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
      setShowPassword(false);
      setPasswordCopied(false);
    }
  };

  // Generate initial password when sheet opens
  React.useEffect(() => {
    if (open && !form.getValues("password")) {
      handleGeneratePassword();
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader className="space-y-3 pb-6 px-6 pt-6">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
              <User className="h-4 w-4" />
            </div>
            Create New User
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Create a new user account with role-based permissions.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 pb-4"
            >
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <User className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Mail className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Contact Information</h3>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john.doe@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Role & Permissions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Shield className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Role & Permissions</h3>
                </div>

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(USER_ROLES).map((role) => (
                            <SelectItem key={role} value={role}>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className={roleColors[role]}
                                >
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {watchedRole && (
                        <FormDescription className="text-xs">
                          {roleDescriptions[watchedRole]}
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
                          Enable or disable user account access
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

              {/* Password Generation */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
                    <Shield className="h-3 w-3" />
                  </div>
                  <h3 className="text-sm font-medium">Security</h3>
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password or generate one"
                            {...field}
                            className="pr-20 font-mono text-sm"
                            disabled={isGeneratingPassword}
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-muted"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-muted"
                              onClick={handleCopyPassword}
                              disabled={!watchedPassword}
                            >
                              <Copy
                                className={`h-3.5 w-3.5 ${
                                  passwordCopied ? "text-green-600" : ""
                                }`}
                              />
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <div className="flex items-center justify-between pt-2">
                        <FormDescription
                          className={`text-xs transition-colors ${
                            passwordCopied
                              ? "text-green-600 font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {passwordCopied
                            ? "✓ Password copied to clipboard!"
                            : "You can type your own password or generate one"}
                        </FormDescription>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleGeneratePassword}
                          disabled={isGeneratingPassword}
                          className="h-8 text-xs px-3 gap-1.5"
                        >
                          <RefreshCw
                            className={`h-3 w-3 ${
                              isGeneratingPassword ? "animate-spin" : ""
                            }`}
                          />
                          {isGeneratingPassword ? "Generating..." : "Generate"}
                        </Button>
                      </div>
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
              isLoading={false}
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </LoadingButton>
            <LoadingButton
              type="submit"
              isLoading={false}
              onClick={form.handleSubmit(handleSubmit)}
              className="w-full flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create
            </LoadingButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
