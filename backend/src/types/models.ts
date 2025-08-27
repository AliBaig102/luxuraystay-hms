// Base interface for all models
export interface BaseModel {
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

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  RECEPTIONIST = 'receptionist',
  HOUSEKEEPING = 'housekeeping',
  MAINTENANCE = 'maintenance',
  GUEST = 'guest',
}

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

export enum RoomType {
  STANDARD = 'standard',
  DELUXE = 'deluxe',
  SUITE = 'suite',
  PRESIDENTIAL = 'presidential',
}

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  CLEANING = 'cleaning',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved',
  OUT_OF_SERVICE = 'out_of_service',
}

// Reservation and Booking Types
export interface Reservation extends BaseModel {
  guestId: string;
  roomId: string;
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

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum ReservationSource {
  ONLINE = 'online',
  PHONE = 'phone',
  WALK_IN = 'walk_in',
  TRAVEL_AGENT = 'travel_agent',
}

export interface CheckIn extends BaseModel {
  reservationId: string;
  roomId: string;
  guestId: string;
  checkInTime: Date;
  checkOutTime?: Date;
  assignedRoomNumber: string;
  keyIssued: boolean;
  welcomePackDelivered: boolean;
  specialInstructions?: string;
}

export interface CheckOut extends BaseModel {
  checkInId: string;
  reservationId: string;
  roomId: string;
  guestId: string;
  checkOutTime: Date;
  finalBillAmount: number;
  paymentStatus: PaymentStatus;
  feedback?: string;
  rating?: number;
}

// Billing and Invoicing Types
export interface Bill extends BaseModel {
  reservationId: string;
  guestId: string;
  roomId: string;
  checkInId: string;
  checkOutId?: string;
  baseAmount: number;
  taxAmount: number;
  serviceCharges: number;
  additionalServices: AdditionalService[];
  totalAmount: number;
  status: PaymentStatus;
  dueDate: Date;
  paidDate?: Date;
  paymentMethod?: PaymentMethod;
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

export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  DIGITAL_WALLET = 'digital_wallet',
}

export enum ServiceStatus {
  REQUESTED = 'requested',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

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

export enum HousekeepingTaskType {
  DAILY_CLEANING = 'daily_cleaning',
  DEEP_CLEANING = 'deep_cleaning',
  LINEN_CHANGE = 'linen_change',
  AMENITY_RESTOCK = 'amenity_restock',
  INSPECTION = 'inspection',
}

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

export enum MaintenanceCategory {
  ELECTRICAL = 'electrical',
  PLUMBING = 'plumbing',
  HVAC = 'hvac',
  APPLIANCE = 'appliance',
  STRUCTURAL = 'structural',
  GENERAL = 'general',
}

export enum TaskStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

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

export enum FeedbackCategory {
  ROOM_QUALITY = 'room_quality',
  SERVICE = 'service',
  CLEANLINESS = 'cleanliness',
  FOOD = 'food',
  STAFF = 'staff',
  FACILITIES = 'facilities',
  VALUE = 'value',
  OVERALL = 'overall',
}

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

export enum ServiceType {
  ROOM_SERVICE = 'room_service',
  WAKE_UP_CALL = 'wake_up_call',
  TRANSPORTATION = 'transportation',
  LAUNDRY = 'laundry',
  HOUSEKEEPING = 'housekeeping',
  MAINTENANCE = 'maintenance',
  CONCIERGE = 'concierge',
}

// System Administration Types
export interface SystemSettings extends BaseModel {
  settingKey: string;
  settingValue: string;
  description?: string;
  category: SettingCategory;
  isEditable: boolean;
}

export enum SettingCategory {
  ROOM_RATES = 'room_rates',
  TAXES = 'taxes',
  POLICIES = 'policies',
  NOTIFICATIONS = 'notifications',
  SYSTEM = 'system',
}

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

export enum NotificationType {
  BOOKING = 'booking',
  MAINTENANCE = 'maintenance',
  HOUSEKEEPING = 'housekeeping',
  BILLING = 'billing',
  SYSTEM = 'system',
  REMINDER = 'reminder',
}

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

export enum ReportType {
  OCCUPANCY = 'occupancy',
  REVENUE = 'revenue',
  GUEST_FEEDBACK = 'guest_feedback',
  MAINTENANCE = 'maintenance',
  HOUSEKEEPING = 'housekeeping',
  STAFF_PERFORMANCE = 'staff_performance',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
}

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

export enum InventoryItemType {
  FOOD = 'food',
  BEVERAGE = 'beverage',
  CLEANING_SUPPLY = 'cleaning_supply',
  AMENITY = 'amenity',
  MAINTENANCE = 'maintenance',
  OFFICE_SUPPLY = 'office_supply',
  OTHER = 'other',
}

export enum InventoryItemStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  EXPIRED = 'expired',
  DISCONTINUED = 'discontinued',
}

export enum InventoryUnit {
  PIECE = 'piece',
  KILOGRAM = 'kilogram',
  LITER = 'liter',
  METER = 'meter',
  BOX = 'box',
  PACK = 'pack',
  ROLL = 'roll',
}

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

export enum InventoryTransactionType {
  IN = 'in',
  OUT = 'out',
  RETURN = 'return',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
  DAMAGED = 'damaged',
  EXPIRED = 'expired',
}
