import { USER_ROLES } from "@/types/models";

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    "user.view",
    "user.create",
    "user.update",
    "user.delete",
  ],
  [USER_ROLES.MANAGER]: [
    "user.view",
    "user.create",
    "user.update",
  ],
  [USER_ROLES.RECEPTIONIST]: [
    "user.view",
    "user.create",
    "user.update",
  ],
  [USER_ROLES.HOUSEKEEPING]: [
    "user.view",
    "user.create",
    "user.update",
  ],
  [USER_ROLES.MAINTENANCE]: [
    "user.view",
    "user.create",
    "user.update",
  ],
  [USER_ROLES.GUEST]: [
    "user.view",
  ],
}