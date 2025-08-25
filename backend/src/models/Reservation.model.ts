import mongoose, { Schema, Document } from 'mongoose';
import {
  Reservation,
  ReservationStatus,
  ReservationSource,
} from '../types/models';

export interface ReservationDocument extends Reservation, Document {}

const reservationSchema = new Schema(
  {
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
    checkInDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: ReservationDocument, value: Date) {
          return value > new Date();
        },
        message: 'Check-in date must be in the future',
      },
    },
    checkOutDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: ReservationDocument, value: Date) {
          return value > this.checkInDate;
        },
        message: 'Check-out date must be after check-in date',
      },
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: [1, 'Number of guests must be at least 1'],
      max: [10, 'Number of guests cannot exceed 10'],
    },
    status: {
      type: String,
      enum: Object.values(ReservationStatus),
      default: ReservationStatus.PENDING,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    depositAmount: {
      type: Number,
      min: [0, 'Deposit amount cannot be negative'],
      validate: {
        validator: function (this: ReservationDocument, value: number) {
          return !value || value <= this.totalAmount;
        },
        message: 'Deposit amount cannot exceed total amount',
      },
    },
    specialRequests: {
      type: String,
      trim: true,
      maxlength: [1000, 'Special requests cannot exceed 1000 characters'],
    },
    source: {
      type: String,
      enum: Object.values(ReservationSource),
      required: true,
    },
    assignedRoomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
reservationSchema.index({ guestId: 1 });
reservationSchema.index({ roomId: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ checkInDate: 1 });
reservationSchema.index({ checkOutDate: 1 });
reservationSchema.index({ createdAt: -1 });

// Compound indexes for common queries
reservationSchema.index({ guestId: 1, status: 1 });
reservationSchema.index({ checkInDate: 1, checkOutDate: 1 });
reservationSchema.index({ status: 1, checkInDate: 1 });

// Virtual for reservation duration
reservationSchema.virtual('duration').get(function (this: ReservationDocument) {
  if (this.checkInDate && this.checkOutDate) {
    const diffTime = Math.abs(
      this.checkOutDate.getTime() - this.checkInDate.getTime()
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for remaining balance
reservationSchema.virtual('remainingBalance').get(function (
  this: ReservationDocument
) {
  return this.totalAmount - (this.depositAmount || 0);
});

// Ensure virtual fields are serialized
reservationSchema.set('toJSON', {
  virtuals: true,
});

export const ReservationModel = mongoose.model<ReservationDocument>(
  'Reservation',
  reservationSchema
);
