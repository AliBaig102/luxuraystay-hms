import mongoose, { Schema, Document } from 'mongoose';
import { CheckIn } from '../types/models';

export interface CheckInDocument extends CheckIn, Document {}

const checkInSchema = new Schema<CheckInDocument>(
  {
    reservationId: {
      type: String,
      ref: 'Reservation',
      required: true,
    },
    roomId: {
      type: String,
      ref: 'Room',
      required: true,
    },
    guestId: {
      type: String,
      ref: 'User',
      required: true,
    },
    checkInTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    checkOutTime: {
      type: Date,
    },
    assignedRoomNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    keyIssued: {
      type: Boolean,
      default: false,
    },
    welcomePackDelivered: {
      type: Boolean,
      default: false,
    },
    specialInstructions: {
      type: String,
      trim: true,
      maxlength: [1000, 'Special instructions cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
checkInSchema.index({ reservationId: 1 });
checkInSchema.index({ roomId: 1 });
checkInSchema.index({ guestId: 1 });
checkInSchema.index({ checkInTime: 1 });
checkInSchema.index({ checkOutTime: 1 });
checkInSchema.index({ createdAt: -1 });

// Compound indexes for common queries
checkInSchema.index({ guestId: 1, checkInTime: 1 });
checkInSchema.index({ roomId: 1, checkInTime: 1 });
checkInSchema.index({ reservationId: 1, checkInTime: 1 });

// Virtual for stay duration
checkInSchema.virtual('stayDuration').get(function (this: CheckInDocument) {
  if (this.checkInTime && this.checkOutTime) {
    const diffTime = Math.abs(
      this.checkOutTime.getTime() - this.checkInTime.getTime()
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Duration in days
  }
  return null;
});

// Virtual for current status
checkInSchema.virtual('isCheckedOut').get(function (this: CheckInDocument) {
  return !!this.checkOutTime;
});

// Virtual for active stay
checkInSchema.virtual('isActiveStay').get(function (this: CheckInDocument) {
  return !this.checkOutTime;
});

// Ensure virtual fields are serialized
checkInSchema.set('toJSON', {
  virtuals: true,
});

export const CheckInModel = mongoose.model<CheckInDocument>(
  'CheckIn',
  checkInSchema
);
