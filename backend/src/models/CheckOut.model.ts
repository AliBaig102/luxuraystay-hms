import mongoose, { Schema, Document } from 'mongoose';
import { CheckOut, PaymentStatus } from '../types/models';

export interface CheckOutDocument extends CheckOut, Document {
  checkoutEfficiency: string;
  satisfactionLevel: string;
}

const checkOutSchema = new Schema(
  {
    checkInId: {
      type: Schema.Types.ObjectId,
      ref: 'CheckIn',
      required: true,
    },
    reservationId: {
      type: Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    guestId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    checkOutTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    finalBillAmount: {
      type: Number,
      required: true,
      min: [0, 'Final bill amount cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      required: true,
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [2000, 'Feedback cannot exceed 2000 characters'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
checkOutSchema.index({ checkInId: 1 });
checkOutSchema.index({ reservationId: 1 });
checkOutSchema.index({ roomId: 1 });
checkOutSchema.index({ guestId: 1 });
checkOutSchema.index({ checkOutTime: 1 });
checkOutSchema.index({ paymentStatus: 1 });
checkOutSchema.index({ createdAt: -1 });

// Compound indexes for common queries
checkOutSchema.index({ guestId: 1, checkOutTime: 1 });
checkOutSchema.index({ roomId: 1, checkOutTime: 1 });
checkOutSchema.index({ paymentStatus: 1, checkOutTime: 1 });

// Virtual for checkout efficiency
checkOutSchema.virtual('checkoutEfficiency').get(function () {
  // This would need to be calculated based on business rules
  // For now, return a placeholder
  return 'standard';
});

// Virtual for guest satisfaction
checkOutSchema.virtual('satisfactionLevel').get(function () {
  if (!(this as any).rating) return 'not_rated';

  if ((this as any).rating >= 4) return 'high';
  if ((this as any).rating >= 3) return 'medium';
  return 'low';
});

// Ensure virtual fields are serialized
checkOutSchema.set('toJSON', {
  virtuals: true,
});

export const CheckOutModel = mongoose.model<CheckOutDocument>(
  'CheckOut',
  checkOutSchema
);
