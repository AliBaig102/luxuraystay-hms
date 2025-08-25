import mongoose, { Schema, Document } from 'mongoose';
import {
  Bill,
  PaymentStatus,
  PaymentMethod,
  ServiceStatus,
} from '../types/models';

export interface BillDocument extends Bill, Document {}

const additionalServiceSchema = new Schema(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative'],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative'],
    },
    serviceDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ServiceStatus),
      default: ServiceStatus.REQUESTED,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const billSchema = new Schema<BillDocument>(
  {
    reservationId: {
      type: Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true,
    },
    guestId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    checkInId: {
      type: Schema.Types.ObjectId,
      ref: 'CheckIn',
      required: true,
    },
    checkOutId: {
      type: Schema.Types.ObjectId,
      ref: 'CheckOut',
    },
    baseAmount: {
      type: Number,
      required: true,
      min: [0, 'Base amount cannot be negative'],
    },
    taxAmount: {
      type: Number,
      required: true,
      min: [0, 'Tax amount cannot be negative'],
    },
    serviceCharges: {
      type: Number,
      required: true,
      min: [0, 'Service charges cannot be negative'],
    },
    additionalServices: [additionalServiceSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
billSchema.index({ reservationId: 1 });
billSchema.index({ guestId: 1 });
billSchema.index({ roomId: 1 });
billSchema.index({ status: 1 });
billSchema.index({ dueDate: 1 });
billSchema.index({ createdAt: -1 });

// Compound indexes for common queries
billSchema.index({ guestId: 1, status: 1 });
billSchema.index({ status: 1, dueDate: 1 });
billSchema.index({ reservationId: 1, status: 1 });

// Virtual for additional services total
billSchema.virtual('additionalServicesTotal').get(function (
  this: BillDocument
) {
  return this.additionalServices.reduce(
    (total, service) => total + service.totalPrice,
    0
  );
});

// Virtual for subtotal (base + additional services)
billSchema.virtual('subtotal').get(function (this: BillDocument) {
  return this.baseAmount + this.additionalServicesTotal;
});

// Virtual for grand total (subtotal + tax + service charges)
billSchema.virtual('grandTotal').get(function (this: BillDocument) {
  return this.subtotal + this.taxAmount + this.serviceCharges;
});

// Virtual for overdue status
billSchema.virtual('isOverdue').get(function (this: BillDocument) {
  return this.status === PaymentStatus.PENDING && new Date() > this.dueDate;
});

// Ensure virtual fields are serialized
billSchema.set('toJSON', {
  virtuals: true,
});

export const BillModel = mongoose.model<BillDocument>('Bill', billSchema);
