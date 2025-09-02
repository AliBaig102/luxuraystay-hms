import { USER_ROLES } from "@/types/models";

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    "user.view",
    "user.create", 
    "user.update",
    "user.delete",
    "room.create",
    "room.update",
    "room.delete",
    "room.view",
    "inventory.create",
    "inventory.update",
    "inventory.delete",
    "inventory.view",
    "booking.manage",
    "payment.manage",
    "report.view",
    "settings.manage",
    "staff.manage"
  ],
  [USER_ROLES.MANAGER]: [
    "user.view",
    "booking.manage",
    "room.manage", 
    "payment.view",
    "report.view",
    "staff.view",
    "staff.update"
  ],
  [USER_ROLES.RECEPTIONIST]: [
    "booking.create",
    "booking.view",
    "booking.update",
    "room.view",
    "payment.create",
    "payment.view",
    "guest.manage"
  ],
  [USER_ROLES.HOUSEKEEPING]: [
    "room.view",
    "room.status.update",
    "maintenance.request",
    "inventory.manage"
  ],
  [USER_ROLES.MAINTENANCE]: [
    "maintenance.view",
    "maintenance.update",
    "room.maintenance",
    "inventory.view"
  ],
  [USER_ROLES.GUEST]: [
    "booking.view.own",
    "booking.create.own",
    "profile.manage",
    "review.create",
    "service.request"
  ],
}