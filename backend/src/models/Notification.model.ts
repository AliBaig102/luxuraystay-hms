import mongoose, { Schema, Document } from 'mongoose';
import { Notification, NotificationType, Priority } from '../types/models';

export interface NotificationDocument extends Notification, Document {
  age: number;
  isUrgent: boolean;
  timeBasedPriority: number;
}

const notificationSchema = new Schema(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientType: {
      type: String,
      enum: ['user', 'guest'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readDate: {
      type: Date,
    },
    actionUrl: {
      type: String,
      trim: true,
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
notificationSchema.index({ recipientId: 1 });
notificationSchema.index({ recipientType: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ createdAt: -1 });

// Compound indexes for common queries
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ recipientId: 1, type: 1 });
notificationSchema.index({ type: 1, priority: 1 });
notificationSchema.index({ isRead: 1, createdAt: 1 });

// Virtual for notification age
notificationSchema.virtual('age').get(function () {
  const diffTime = Math.abs(
    new Date().getTime() - (this as any).createdAt.getTime()
  );
  return Math.ceil(diffTime / (1000 * 60)); // Age in minutes
});

// Virtual for urgency indicator
notificationSchema.virtual('isUrgent').get(function () {
  return (
    (this as any).priority === Priority.URGENT ||
    (this as any).priority === Priority.HIGH
  );
});

// Virtual for time-based priority
notificationSchema.virtual('timeBasedPriority').get(function () {
  let score = 0;

  // Base priority score
  switch ((this as any).priority) {
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

  // Unread bonus
  if (!(this as any).isRead) {
    score += 5;
  }

  // Age penalty (older notifications get lower score)
  const ageInHours = (this as any).age / 60;
  score -= Math.min(ageInHours, 24); // Cap penalty at 24 hours

  return Math.max(score, 1); // Minimum score of 1
});

// Ensure virtual fields are serialized
notificationSchema.set('toJSON', {
  virtuals: true,
});

export const NotificationModel = mongoose.model<NotificationDocument>(
  'Notification',
  notificationSchema
);
