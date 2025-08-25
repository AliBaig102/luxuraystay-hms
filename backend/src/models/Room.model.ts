import mongoose, { Schema, Document } from 'mongoose';
import { Room, RoomType, RoomStatus } from '../types/models';

export interface RoomDocument extends Room, Document {}

const roomSchema = new Schema<RoomDocument>(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    roomType: {
      type: String,
      enum: Object.values(RoomType),
      required: true,
    },
    floor: {
      type: Number,
      required: true,
      min: [1, 'Floor must be at least 1'],
      max: [100, 'Floor cannot exceed 100'],
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1'],
      max: [10, 'Capacity cannot exceed 10'],
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    status: {
      type: String,
      enum: Object.values(RoomStatus),
      default: RoomStatus.AVAILABLE,
      required: true,
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    images: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
roomSchema.index({ roomNumber: 1 });
roomSchema.index({ roomType: 1 });
roomSchema.index({ floor: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ pricePerNight: 1 });
roomSchema.index({ isActive: 1 });
roomSchema.index({ createdAt: -1 });

// Compound index for room availability queries
roomSchema.index({ status: 1, isActive: 1 });

// Virtual for room availability
roomSchema.virtual('isAvailable').get(function (this: RoomDocument) {
  return this.status === RoomStatus.AVAILABLE && this.isActive;
});

// Ensure virtual fields are serialized
roomSchema.set('toJSON', {
  virtuals: true,
});

export const RoomModel = mongoose.model<RoomDocument>('Room', roomSchema);
