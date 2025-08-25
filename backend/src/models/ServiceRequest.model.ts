import mongoose, { Schema, Document } from 'mongoose';
import {
  ServiceRequest,
  ServiceType,
  Priority,
  ServiceStatus,
} from '../types/models';

export interface ServiceRequestDocument extends ServiceRequest, Document {
  age: number;
  completionTime: number | null;
  isOverdue: boolean;
  urgencyScore: number;
}

const serviceRequestSchema = new Schema(
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
    serviceType: {
      type: String,
      enum: Object.values(ServiceType),
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.MEDIUM,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ServiceStatus),
      default: ServiceStatus.REQUESTED,
      required: true,
    },
    assignedStaffId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    requestedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    completedDate: {
      type: Date,
    },
    cost: {
      type: Number,
      min: [0, 'Cost cannot be negative'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
serviceRequestSchema.index({ guestId: 1 });
serviceRequestSchema.index({ roomId: 1 });
serviceRequestSchema.index({ serviceType: 1 });
serviceRequestSchema.index({ priority: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ assignedStaffId: 1 });
serviceRequestSchema.index({ requestedDate: 1 });
serviceRequestSchema.index({ createdAt: -1 });

// Compound indexes for common queries
serviceRequestSchema.index({ guestId: 1, status: 1 });
serviceRequestSchema.index({ roomId: 1, status: 1 });
serviceRequestSchema.index({ serviceType: 1, status: 1 });
serviceRequestSchema.index({ assignedStaffId: 1, status: 1 });
serviceRequestSchema.index({ priority: 1, requestedDate: 1 });

// Virtual for request age
serviceRequestSchema.virtual('age').get(function () {
  const diffTime = Math.abs(
    new Date().getTime() - (this as any).requestedDate.getTime()
  );
  return Math.ceil(diffTime / (1000 * 60 * 60)); // Age in hours
});

// Virtual for completion time
serviceRequestSchema.virtual('completionTime').get(function () {
  if ((this as any).requestedDate && (this as any).completedDate) {
    const diffTime =
      (this as any).completedDate.getTime() -
      (this as any).requestedDate.getTime();
    return Math.ceil(diffTime / (1000 * 60)); // Time in minutes
  }
  return null;
});

// Virtual for overdue status
serviceRequestSchema.virtual('isOverdue').get(function () {
  if (
    (this as any).status === ServiceStatus.REQUESTED ||
    (this as any).status === ServiceStatus.IN_PROGRESS
  ) {
    const age = (this as any).age;
    switch ((this as any).priority) {
      case Priority.URGENT:
        return age > 2; // 2 hours for urgent
      case Priority.HIGH:
        return age > 4; // 4 hours for high
      case Priority.MEDIUM:
        return age > 8; // 8 hours for medium
      case Priority.LOW:
        return age > 24; // 24 hours for low
      default:
        return false;
    }
  }
  return false;
});

// Virtual for urgency score
serviceRequestSchema.virtual('urgencyScore').get(function () {
  let score = 0;

  // Priority score
  const priority = (this as any).priority;
  switch (priority) {
    case Priority.URGENT:
      score += 10;
      break;
    case Priority.HIGH:
      score += 7;
      break;
    case Priority.MEDIUM:
      score += 4;
      break;
    case Priority.LOW:
      score += 1;
      break;
  }

  // Age score (older requests get higher score)
  score += Math.min((this as any).age, 48); // Cap at 48 hours

  return score;
});

// Ensure virtual fields are serialized
serviceRequestSchema.set('toJSON', {
  virtuals: true,
});

export const ServiceRequestModel = mongoose.model<ServiceRequestDocument>(
  'ServiceRequest',
  serviceRequestSchema
);
