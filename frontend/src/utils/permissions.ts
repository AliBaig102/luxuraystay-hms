import { USER_ROLES, type UserRole } from "../types/models";

// Define permissions for each role
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    "users.view",
    "users.create",
    "users.update",
    "users.delete",
    "rooms.view",
    "rooms.create",
    "rooms.update",
    "rooms.delete",
    "reservations.view",
    "reservations.create",
    "reservations.update",
    "reservations.delete",
    "billing.view",
    "billing.create",
    "billing.update",
    "billing.delete",
    "housekeeping.view",
    "housekeeping.assign",
    "maintenance.view",
    "maintenance.assign",
    "inventory.view",
    "inventory.manage",
    "reports.view",
    "reports.generate",
    "notifications.view",
    "notifications.send",
    "settings.view",
    "settings.update",
  ],
  [USER_ROLES.MANAGER]: [
    "users.view",
    "users.create",
    "users.update",
    "rooms.view",
    "rooms.create",
    "rooms.update",
    "reservations.view",
    "reservations.create",
    "reservations.update",
    "billing.view",
    "billing.create",
    "billing.update",
    "housekeeping.view",
    "housekeeping.assign",
    "maintenance.view",
    "maintenance.assign",
    "inventory.view",
    "inventory.manage",
    "reports.view",
    "reports.generate",
    "notifications.view",
  ],
  [USER_ROLES.RECEPTIONIST]: [
    "rooms.view",
    "reservations.view",
    "reservations.create",
    "reservations.update",
    "billing.view",
    "billing.create",
    "billing.update",
    "guests.view",
    "guests.create",
    "guests.update",
    "checkin.perform",
    "checkout.perform",
    "notifications.view",
  ],
  [USER_ROLES.HOUSEKEEPING]: [
    "housekeeping.view",
    "housekeeping.update",
    "rooms.view",
    "rooms.update_status",
    "inventory.view",
    "notifications.view",
  ],
  [USER_ROLES.MAINTENANCE]: [
    "maintenance.view",
    "maintenance.update",
    "rooms.view",
    "rooms.update_status",
    "inventory.view",
    "notifications.view",
  ],
  [USER_ROLES.GUEST]: [
    "profile.view",
    "profile.update",
    "reservations.view_own",
    "billing.view_own",
    "services.request",
    "feedback.create",
  ],
} as const;

// Navigation items for each role
export const ROLE_NAVIGATION = {
  [USER_ROLES.ADMIN]: [
    { path: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { path: "/dashboard/users", label: "User Management", icon: "Users" },
    { path: "/dashboard/rooms", label: "Room Management", icon: "Building" },
    {
      path: "/dashboard/reservations",
      label: "Reservations",
      icon: "Calendar",
    },
    {
      path: "/dashboard/billing",
      label: "Billing & Invoicing",
      icon: "CreditCard",
    },
    {
      path: "/dashboard/housekeeping-tasks",
      label: "Housekeeping Tasks",
      icon: "Sparkles",
    },
    { path: "/dashboard/maintenance", label: "Maintenance", icon: "Wrench" },
    { path: "/dashboard/inventory", label: "Inventory", icon: "Package" },
    {
      path: "/dashboard/reports",
      label: "Reports & Analytics",
      icon: "BarChart3",
    },
    { path: "/dashboard/notifications", label: "Notifications", icon: "Bell" },
    { path: "/dashboard/settings", label: "Settings", icon: "Settings" },
  ],
  [USER_ROLES.MANAGER]: [
    { path: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { path: "/dashboard/users", label: "Staff Management", icon: "Users" },
    { path: "/dashboard/rooms", label: "Room Management", icon: "Building" },
    {
      path: "/dashboard/reservations",
      label: "Reservations",
      icon: "Calendar",
    },
    {
      path: "/dashboard/billing",
      label: "Billing & Invoicing",
      icon: "CreditCard",
    },
    {
      path: "/dashboard/housekeeping-tasks",
      label: "Housekeeping Tasks",
      icon: "Sparkles",
    },
    { path: "/dashboard/maintenance", label: "Maintenance", icon: "Wrench" },
    { path: "/dashboard/inventory", label: "Inventory", icon: "Package" },
    {
      path: "/dashboard/reports",
      label: "Reports & Analytics",
      icon: "BarChart3",
    },
    { path: "/dashboard/notifications", label: "Notifications", icon: "Bell" },
  ],
  [USER_ROLES.RECEPTIONIST]: [
    { path: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { path: "/dashboard/rooms", label: "Room Status", icon: "Building" },
    {
      path: "/dashboard/reservations",
      label: "Reservations",
      icon: "Calendar",
    },
    { path: "/dashboard/checkin", label: "Check-in", icon: "LogIn" },
    { path: "/dashboard/checkout", label: "Check-out", icon: "LogOut" },
    { path: "/dashboard/billing", label: "Billing", icon: "CreditCard" },
    { path: "/dashboard/guests", label: "Guest Services", icon: "UserCheck" },
    { path: "/dashboard/notifications", label: "Notifications", icon: "Bell" },
  ],
  [USER_ROLES.HOUSEKEEPING]: [
    { path: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    {
      path: "/dashboard/housekeeping-tasks",
      label: "My Tasks",
      icon: "CheckSquare",
    },
    { path: "/dashboard/rooms", label: "Room Status", icon: "Building" },
    { path: "/dashboard/inventory", label: "Supplies", icon: "Package" },
    { path: "/dashboard/notifications", label: "Notifications", icon: "Bell" },
  ],
  [USER_ROLES.MAINTENANCE]: [
    { path: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    {
      path: "/dashboard/requests",
      label: "Maintenance Requests",
      icon: "Wrench",
    },
    { path: "/dashboard/rooms", label: "Room Status", icon: "Building" },
    { path: "/dashboard/inventory", label: "Equipment", icon: "Package" },
    { path: "/dashboard/notifications", label: "Notifications", icon: "Bell" },
  ],
  [USER_ROLES.GUEST]: [
    { path: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { path: "/dashboard/profile", label: "My Profile", icon: "User" },
    {
      path: "/dashboard/reservations",
      label: "My Reservations",
      icon: "Calendar",
    },
    { path: "/dashboard/billing", label: "My Bills", icon: "CreditCard" },
    {
      path: "/dashboard/services",
      label: "Request Services",
      icon: "Concierge",
    },
    { path: "/dashboard/feedback", label: "Feedback", icon: "MessageSquare" },
  ],
} as const;

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (
  userRole: UserRole,
  permission: string
): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return (rolePermissions as readonly string[]).includes(permission);
};

/**
 * Check if a user has any of the specified permissions
 */
export const hasAnyPermission = (
  userRole: UserRole,
  permissions: string[]
): boolean => {
  return permissions.some((permission) => hasPermission(userRole, permission));
};

/**
 * Check if a user has all of the specified permissions
 */
export const hasAllPermissions = (
  userRole: UserRole,
  permissions: string[]
): boolean => {
  return permissions.every((permission) => hasPermission(userRole, permission));
};

/**
 * Get navigation items for a specific role
 */
export const getNavigationForRole = (userRole: UserRole) => {
  return ROLE_NAVIGATION[userRole] || [];
};

/**
 * Check if a user can access a specific route
 */
export const canAccessRoute = (userRole: UserRole, route: string): boolean => {
  const navigation = getNavigationForRole(userRole);
  return navigation.some((item) => item.path === route);
};

/**
 * Get all permissions for a role
 */
export const getPermissionsForRole = (
  userRole: UserRole
): readonly string[] => {
  return ROLE_PERMISSIONS[userRole] || [];
};

/**
 * Check if user is admin or manager (high-level roles)
 */
export const isHighLevelRole = (userRole: UserRole): boolean => {
  return userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.MANAGER;
};

/**
 * Check if user is staff (not guest)
 */
export const isStaffRole = (userRole: UserRole): boolean => {
  return userRole !== USER_ROLES.GUEST;
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (userRole: UserRole): string => {
  const roleNames = {
    [USER_ROLES.ADMIN]: "Administrator",
    [USER_ROLES.MANAGER]: "Manager",
    [USER_ROLES.RECEPTIONIST]: "Receptionist",
    [USER_ROLES.HOUSEKEEPING]: "Housekeeping Staff",
    [USER_ROLES.MAINTENANCE]: "Maintenance Staff",
    [USER_ROLES.GUEST]: "Guest",
  };
  return roleNames[userRole] || "Unknown";
};
