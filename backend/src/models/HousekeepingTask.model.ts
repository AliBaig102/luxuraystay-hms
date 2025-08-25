import mongoose, { Schema, Document } from 'mongoose';
import {
  HousekeepingTask,
  HousekeepingTaskType,
  TaskStatus,
  Priority,
} from '../types/models';

export interface HousekeepingTaskDocument extends HousekeepingTask, Document {
  duration: number;
  isOverdue: boolean;
  completionTime: number | null;
}

const housekeepingTaskSchema = new Schema(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    assignedStaffId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    taskType: {
      type: String,
      enum: Object.values(HousekeepingTaskType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.PENDING,
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    completedDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.MEDIUM,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
housekeepingTaskSchema.index({ roomId: 1 });
housekeepingTaskSchema.index({ assignedStaffId: 1 });
housekeepingTaskSchema.index({ taskType: 1 });
housekeepingTaskSchema.index({ status: 1 });
housekeepingTaskSchema.index({ scheduledDate: 1 });
housekeepingTaskSchema.index({ priority: 1 });
housekeepingTaskSchema.index({ createdAt: -1 });

// Compound indexes for common queries
housekeepingTaskSchema.index({ assignedStaffId: 1, status: 1 });
housekeepingTaskSchema.index({ roomId: 1, status: 1 });
housekeepingTaskSchema.index({ status: 1, scheduledDate: 1 });
housekeepingTaskSchema.index({ priority: 1, scheduledDate: 1 });

// Virtual for task duration
housekeepingTaskSchema.virtual('duration').get(function () {
  if ((this as any).scheduledDate && (this as any).completedDate) {
    const diffTime = Math.abs(
      (this as any).completedDate.getTime() -
        (this as any).scheduledDate.getTime()
    );
    return Math.ceil(diffTime / (1000 * 60 * 60)); // Duration in hours
  }
  return 0;
});

// Virtual for overdue status
housekeepingTaskSchema.virtual('isOverdue').get(function () {
  return (
    (this as any).status === TaskStatus.PENDING &&
    new Date() > (this as any).scheduledDate
  );
});

// Virtual for completion time
housekeepingTaskSchema.virtual('completionTime').get(function () {
  if ((this as any).scheduledDate && (this as any).completedDate) {
    const diffTime =
      (this as any).completedDate.getTime() -
      (this as any).scheduledDate.getTime();
    return Math.ceil(diffTime / (1000 * 60)); // Time in minutes
  }
  return null;
});

// Ensure virtual fields are serialized
housekeepingTaskSchema.set('toJSON', {
  virtuals: true,
});

export const HousekeepingTaskModel = mongoose.model<HousekeepingTaskDocument>(
  'HousekeepingTask',
  housekeepingTaskSchema
);
