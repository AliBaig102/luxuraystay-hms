import { USER_ROLES } from "@/types/models";

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    // User Management
    "user.view",
    "user.create", 
    "user.update",
    "user.delete",
    "user.role.manage",
    
    // Room Management
    "room.view",
    "room.create",
    "room.update",
    "room.delete",
    "room.status.manage",
    
    // Inventory Management
    "inventory.view",
    "inventory.create",
    "inventory.update",
    "inventory.delete",
    "inventory.stock.manage",
    
    // Reservation Management
    "reservation.view",
    "reservation.create",
    "reservation.update",
    "reservation.delete",
    "reservation.cancel",
    
    // Billing & Payments
    "bill.view",
    "bill.create",
    "bill.update",
    "bill.delete",
    "payment.view",
    "payment.process",
    "payment.refund",
    
    // Check-in/Check-out
    "checkin.view",
    "checkin.create",
    "checkin.update",
    "checkin.delete",
    "checkout.view",
    "checkout.create",
    "checkout.update",
    "checkout.delete",
    
    // Guest Services
    "feedback.view",
    "feedback.create",
    "feedback.update",
    "feedback.delete",
    "feedback.response",
    "service_request.view",
    "service_request.create",
    "service_request.update",
    "service_request.delete",
    "service_request.assign",
    
    // Operations
    "housekeeping_task.view",
    "housekeeping_task.create",
    "housekeeping_task.update",
    "housekeeping_task.delete",
    "housekeeping_task.assign",
    "maintenance_request.view",
    "maintenance_request.create",
    "maintenance_request.update",
    "maintenance_request.delete",
    "maintenance_request.assign",
    
    // Notifications
    "notification.view",
    "notification.create",
    "notification.update",
    "notification.delete",
    "notification.broadcast",
    
    // System Management
    "dashboard.view",
    "reports.view",
    "reports.generate",
    "settings.manage",
    "system.manage"
  ],
  [USER_ROLES.MANAGER]: [
    // User Management (Limited)
    "user.view",
    "user.update",
    
    // Room Management
    "room.view",
    "room.update",
    "room.status.manage",
    
    // Inventory Management
    "inventory.view",
    "inventory.update",
    "inventory.stock.manage",
    
    // Reservation Management
    "reservation.view",
    "reservation.create",
    "reservation.update",
    "reservation.cancel",
    
    // Billing & Payments
    "bill.view",
    "bill.create",
    "bill.update",
    "payment.view",
    "payment.process",
    
    // Check-in/Check-out
    "checkin.view",
    "checkin.create",
    "checkin.update",
    "checkout.view",
    "checkout.create",
    "checkout.update",
    
    // Guest Services
    "feedback.view",
    "feedback.create",
    "feedback.update",
    "feedback.response",
    "service_request.view",
    "service_request.create",
    "service_request.update",
    "service_request.assign",
    
    // Operations
    "housekeeping_task.view",
    "housekeeping_task.create",
    "housekeeping_task.update",
    "housekeeping_task.assign",
    "maintenance_request.view",
    "maintenance_request.create",
    "maintenance_request.update",
    "maintenance_request.assign",
    
    // Notifications
    "notification.view",
    "notification.create",
    "notification.update",
    
    // System
    "dashboard.view",
    "reports.view"
  ],
  [USER_ROLES.RECEPTIONIST]: [
    // Guest Services
    "reservation.view",
    "reservation.create",
    "reservation.update",
    "reservation.cancel",
    
    // Room Management
    "room.view",
    "room.status.update",
    
    // Billing & Payments
    "bill.view",
    "bill.create",
    "payment.view",
    "payment.process",
    
    // Check-in/Check-out
    "checkin.view",
    "checkin.create",
    "checkin.update",
    "checkout.view",
    "checkout.create",
    "checkout.update",
    
    // Guest Services
    "feedback.view",
    "feedback.create",
    "feedback.update",
    "service_request.view",
    "service_request.create",
    "service_request.update",
    
    // Notifications
    "notification.view",
    "notification.create",
    "notification.update",
    
    // System
    "dashboard.view"
  ],
  [USER_ROLES.HOUSEKEEPING]: [
    // Room Management
    "room.view",
    "room.status.update",
    
    // Inventory Management
    "inventory.view",
    "inventory.update",
    
    // Housekeeping Tasks
    "housekeeping_task.view",
    "housekeeping_task.create",
    "housekeeping_task.update",
    
    // Service Requests
    "service_request.view",
    "service_request.create",
    "service_request.update",
    
    // Maintenance Requests
    "maintenance_request.view",
    "maintenance_request.create",
    
    // Notifications
    "notification.view",
    "notification.create",
    "notification.update",
    
    // System
    "dashboard.view"
  ],
  [USER_ROLES.MAINTENANCE]: [
    // Room Management
    "room.view",
    "room.status.update",
    
    // Inventory Management
    "inventory.view",
    "inventory.update",
    
    // Maintenance Requests
    "maintenance_request.view",
    "maintenance_request.create",
    "maintenance_request.update",
    
    // Service Requests
    "service_request.view",
    "service_request.create",
    "service_request.update",
    
    // Notifications
    "notification.view",
    "notification.create",
    "notification.update",
    
    // System
    "dashboard.view"
  ],
  [USER_ROLES.GUEST]: [
    // Personal Management
    "profile.view",
    "profile.update",
    
    // Reservations
    "reservation.view.own",
    "reservation.create.own",
    "reservation.update.own",
    "reservation.cancel.own",
    
    // Billing
    "bill.view.own",
    "payment.view.own",
    "payment.process.own",
    
    // Guest Services
    "feedback.create",
    "feedback.view.own",
    "service_request.create",
    "service_request.view.own",
    
    // Notifications
    "notification.view.own",
    
    // System
    "dashboard.view.own"
  ],
}