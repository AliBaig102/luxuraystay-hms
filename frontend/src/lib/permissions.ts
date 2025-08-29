import { DASHBOARD_MENU_ITEMS } from "@/constants/navigation";
import { ROLE_PERMISSIONS } from "@/constants/permisions";
import { USER_ROLES, type UserRole } from "@/types/models";

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
  return DASHBOARD_MENU_ITEMS[userRole] || [];
};

/**
 * Check if a user can access a specific route
 */
export const canAccessRoute = (userRole: UserRole, route: string): boolean => {
  const navigation = getNavigationForRole(userRole);
  return navigation.some((item) => item.href === route);
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
