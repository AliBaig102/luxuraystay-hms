// Base interface for all models
export interface BaseModel {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Test Model
export interface Test extends BaseModel {
  firstName: string;
  lastName: string;
}

// User Management Types
export interface User extends BaseModel {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  profileImage?: string;
}

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  RECEPTIONIST: 'receptionist',
  HOUSEKEEPING: 'housekeeping',
  MAINTENANCE: 'maintenance',
  GUEST: 'guest',
} as const;

export interface UserProfile {
  userId: string;
  address?: string;
  dateOfBirth?: Date;
  nationality?: string;
  idProof?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  preferences?: {
    roomType?: string;
    floor?: string;
    amenities?: string[];
    specialRequests?: string;
  };
}

// Room Management Types
export interface Room extends BaseModel {
  roomNumber: string;
  roomType: RoomType;
  floor: number;
  capacity: number;
  pricePerNight: number;
  status: RoomStatus;
  amenities: string[];
  description?: string;
  images?: string[];
  isActive: boolean;
}

export type RoomType = 'standard' | 'deluxe' | 'suite' | 'presidential';

export const ROOM_TYPES = {
  STANDARD: 'standard',
  DELUXE: 'deluxe',
  SUITE: 'suite',
  PRESIDENTIAL: 'presidential',
} as const;

export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'reserved' | 'out_of_service';

export const ROOM_STATUSES = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
  RESERVED: 'reserved',
  OUT_OF_SERVICE: 'out_of_service',
} as const;

// Reservation and Booking Types
export interface Reservation extends BaseModel {
  guestId: string | User;
  roomId: string | Room;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  status: ReservationStatus;
  totalAmount: number;
  depositAmount?: number;
  specialRequests?: string;
  source: ReservationSource;
  assignedRoomId?: string;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';

export const RESERVATION_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const;

export type ReservationSource = 'online' | 'phone' | 'walk_in' | 'travel_agent';

export const RESERVATION_SOURCES = {
  ONLINE: 'online',
  PHONE: 'phone',
  WALK_IN: 'walk_in',
  TRAVEL_AGENT: 'travel_agent',
} as const;

export interface CheckIn extends BaseModel {
  reservationId: string | Reservation;
  roomId: string | Room;
  guestId: string | User;
  checkInTime: Date;
  checkOutTime?: Date;
  assignedRoomNumber: string;
  keyIssued: boolean;
  welcomePackDelivered: boolean;
  specialInstructions?: string;
  // Virtual properties from backend
  stayDuration?: number;
  isCheckedOut?: boolean;
  isActiveStay?: boolean;
}

export interface CheckOut extends BaseModel {
  checkInId: string | CheckIn;
  reservationId: string | Reservation;
  roomId: string;
  guestId: string | User;
  checkOutTime: Date;
  finalBillAmount: number;
  paymentStatus: PaymentStatus;
  feedback?: string;
  rating?: number;
  // Virtual properties from backend
  checkoutEfficiency?: string;
  satisfactionLevel?: string;
}

// Check-in status types
export type CheckInStatus = 'active' | 'completed';

export const CHECKIN_STATUSES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const;

// Checkout efficiency types
export type CheckoutEfficiency = 'fast' | 'standard' | 'slow';

export const CHECKOUT_EFFICIENCIES = {
  FAST: 'fast',
  STANDARD: 'standard',
  SLOW: 'slow',
} as const;

// Satisfaction level types
export type SatisfactionLevel = 'high' | 'medium' | 'low' | 'not_rated';

export const SATISFACTION_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  NOT_RATED: 'not_rated',
} as const;

// Billing and Invoicing Types
export interface Bill extends BaseModel {
  reservationId: string;
  guestId: string;
  roomId: string;
  checkInId: string;
  checkOutId?: string;
  baseAmount: number;
  taxAmount: number;
  discountAmount?: number;
  serviceCharges?: number;
  additionalServices?: AdditionalService[];
  totalAmount: number;
  status: BillStatus;
  dueDate: Date;
  paymentDate?: Date;
  paymentMethod?: PaymentMethod;
  notes?: string;
  isActive: boolean;
}

export interface AdditionalService extends BaseModel {
  serviceName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  serviceDate: Date;
  status: ServiceStatus;
}

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;

// Bill Status (extends PaymentStatus with additional states)
export type BillStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';

export const BILL_STATUSES = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet';

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer',
  DIGITAL_WALLET: 'digital_wallet',
} as const;

export type ServiceStatus = 'requested' | 'in_progress' | 'completed' | 'cancelled';

export const SERVICE_STATUSES = {
  REQUESTED: 'requested',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Housekeeping and Maintenance Types
export interface HousekeepingTask extends BaseModel {
  roomId: string;
  assignedStaffId: string;
  taskType: HousekeepingTaskType;
  status: TaskStatus;
  scheduledDate: Date;
  completedDate?: Date;
  notes?: string;
  priority: Priority;
}

export type HousekeepingTaskType = 'daily_cleaning' | 'deep_cleaning' | 'linen_change' | 'amenity_restock' | 'inspection';

export const HOUSEKEEPING_TASK_TYPES = {
  DAILY_CLEANING: 'daily_cleaning',
  DEEP_CLEANING: 'deep_cleaning',
  LINEN_CHANGE: 'linen_change',
  AMENITY_RESTOCK: 'amenity_restock',
  INSPECTION: 'inspection',
} as const;

export interface MaintenanceRequest extends BaseModel {
  roomId?: string;
  reportedBy: string;
  category: MaintenanceCategory;
  description: string;
  priority: Priority;
  status: TaskStatus;
  assignedTechnicianId?: string;
  estimatedCompletionDate?: Date;
  actualCompletionDate?: Date;
  cost?: number;
  notes?: string;
}

export type MaintenanceCategory = 'electrical' | 'plumbing' | 'hvac' | 'appliance' | 'structural' | 'general';

export const MAINTENANCE_CATEGORIES = {
  ELECTRICAL: 'electrical',
  PLUMBING: 'plumbing',
  HVAC: 'hvac',
  APPLIANCE: 'appliance',
  STRUCTURAL: 'structural',
  GENERAL: 'general',
} as const;

export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export const TASK_STATUSES = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export const PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Feedback and Guest Services Types
export interface Feedback extends BaseModel {
  guestId: string;
  reservationId: string;
  roomId: string;
  rating: number;
  comment?: string;
  category: FeedbackCategory;
  isAnonymous: boolean;
  response?: string;
  respondedBy?: string;
  responseDate?: Date;
}

export type FeedbackCategory = 'room_quality' | 'service' | 'cleanliness' | 'food' | 'staff' | 'facilities' | 'value' | 'overall';

export const FEEDBACK_CATEGORIES = {
  ROOM_QUALITY: 'room_quality',
  SERVICE: 'service',
  CLEANLINESS: 'cleanliness',
  FOOD: 'food',
  STAFF: 'staff',
  FACILITIES: 'facilities',
  VALUE: 'value',
  OVERALL: 'overall',
} as const;

export interface ServiceRequest extends BaseModel {
  guestId: string;
  roomId: string;
  serviceType: ServiceType;
  description: string;
  priority: Priority;
  status: ServiceStatus;
  assignedStaffId?: string;
  requestedDate: Date;
  completedDate?: Date;
  cost?: number;
}

export type ServiceType = 'room_service' | 'wake_up_call' | 'transportation' | 'laundry' | 'housekeeping' | 'maintenance' | 'concierge';

export const SERVICE_TYPES = {
  ROOM_SERVICE: 'room_service',
  WAKE_UP_CALL: 'wake_up_call',
  TRANSPORTATION: 'transportation',
  LAUNDRY: 'laundry',
  HOUSEKEEPING: 'housekeeping',
  MAINTENANCE: 'maintenance',
  CONCIERGE: 'concierge',
} as const;

// System Administration Types
export interface SystemSettings extends BaseModel {
  settingKey: string;
  settingValue: string;
  description?: string;
  category: SettingCategory;
  isEditable: boolean;
}

export type SettingCategory = 'room_rates' | 'taxes' | 'policies' | 'notifications' | 'system';

export const SETTING_CATEGORIES = {
  ROOM_RATES: 'room_rates',
  TAXES: 'taxes',
  POLICIES: 'policies',
  NOTIFICATIONS: 'notifications',
  SYSTEM: 'system',
} as const;

export interface Notification extends BaseModel {
  recipientId: string;
  recipientType: 'user' | 'guest';
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readDate?: Date;
  actionUrl?: string;
  priority: Priority;
}

export type NotificationType = 'booking' | 'maintenance' | 'housekeeping' | 'billing' | 'system' | 'reminder';

export const NOTIFICATION_TYPES = {
  BOOKING: 'booking',
  MAINTENANCE: 'maintenance',
  HOUSEKEEPING: 'housekeeping',
  BILLING: 'billing',
  SYSTEM: 'system',
  REMINDER: 'reminder',
} as const;

// Reporting and Analytics Types
export interface Report extends BaseModel {
  reportType: ReportType;
  generatedBy: string;
  parameters: Record<string, any>;
  data: any;
  format: ReportFormat;
  generatedDate: Date;
  expiresAt?: Date;
}

export type ReportType = 'occupancy' | 'revenue' | 'guest_feedback' | 'maintenance' | 'housekeeping' | 'staff_performance';

export const REPORT_TYPES = {
  OCCUPANCY: 'occupancy',
  REVENUE: 'revenue',
  GUEST_FEEDBACK: 'guest_feedback',
  MAINTENANCE: 'maintenance',
  HOUSEKEEPING: 'housekeeping',
  STAFF_PERFORMANCE: 'staff_performance',
} as const;

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export const REPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  JSON: 'json',
} as const;

// Inventory Management Types
export interface InventoryItem extends BaseModel {
  sku: string;
  name: string;
  description?: string;
  category: string;
  type: InventoryItemType;
  status: InventoryItemStatus;
  quantity: number;
  unitPrice: number;
  minQuantity: number;
  maxQuantity?: number;
  supplier?: string;
  location?: string;
  barcode?: string;
  expiryDate?: Date;
  lastRestocked?: Date;
  totalValue: number;
  isActive: boolean;
}

export type InventoryItemType = 'food' | 'beverage' | 'cleaning_supply' | 'amenity' | 'maintenance' | 'office_supply' | 'other';

export const INVENTORY_ITEM_TYPES = {
  FOOD: 'food',
  BEVERAGE: 'beverage',
  CLEANING_SUPPLY: 'cleaning_supply',
  AMENITY: 'amenity',
  MAINTENANCE: 'maintenance',
  OFFICE_SUPPLY: 'office_supply',
  OTHER: 'other',
} as const;

export type InventoryItemStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired' | 'discontinued';

export const INVENTORY_ITEM_STATUSES = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  EXPIRED: 'expired',
  DISCONTINUED: 'discontinued',
} as const;

export type InventoryUnit = 'piece' | 'kilogram' | 'liter' | 'meter' | 'box' | 'pack' | 'roll';

export const INVENTORY_UNITS = {
  PIECE: 'piece',
  KILOGRAM: 'kilogram',
  LITER: 'liter',
  METER: 'meter',
  BOX: 'box',
  PACK: 'pack',
  ROLL: 'roll',
} as const;

export interface InventoryTransaction extends BaseModel {
  itemId: string;
  transactionType: InventoryTransactionType;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  reference?: string;
  notes?: string;
  performedBy: string;
  previousQuantity: number;
  newQuantity: number;
}

export type InventoryTransactionType = 'in' | 'out' | 'return' | 'adjustment' | 'transfer' | 'damaged' | 'expired';

export const INVENTORY_TRANSACTION_TYPES = {
  IN: 'in',
  OUT: 'out',
  RETURN: 'return',
  ADJUSTMENT: 'adjustment',
  TRANSFER: 'transfer',
  DAMAGED: 'damaged',
  EXPIRED: 'expired',
} as const;
  