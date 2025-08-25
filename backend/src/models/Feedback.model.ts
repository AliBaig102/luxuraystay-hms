import mongoose, { Schema, Document } from 'mongoose';
import { Feedback, FeedbackCategory } from '../types/models';

export interface FeedbackDocument extends Feedback, Document {
  ratingText: string;
  hasResponse: boolean;
  responseTime: number | null;
}

const feedbackSchema = new Schema(
  {
    guestId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      enum: Object.values(FeedbackCategory),
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    response: {
      type: String,
      trim: true,
      maxlength: [1000, 'Response cannot exceed 1000 characters'],
    },
    respondedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    responseDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
feedbackSchema.index({ guestId: 1 });
feedbackSchema.index({ reservationId: 1 });
feedbackSchema.index({ roomId: 1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ createdAt: -1 });

// Compound indexes for common queries
feedbackSchema.index({ roomId: 1, category: 1 });
feedbackSchema.index({ rating: 1, category: 1 });
feedbackSchema.index({ guestId: 1, createdAt: 1 });

// Virtual for rating text
feedbackSchema.virtual('ratingText').get(function () {
  switch ((this as any).rating) {
    case 1:
      return 'Poor';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Very Good';
    case 5:
      return 'Excellent';
    default:
      return 'Unknown';
  }
});

// Virtual for response status
feedbackSchema.virtual('hasResponse').get(function () {
  return !!(
    (this as any).response &&
    (this as any).respondedBy &&
    (this as any).responseDate
  );
});

// Virtual for response time
feedbackSchema.virtual('responseTime').get(function () {
  if ((this as any).createdAt && (this as any).responseDate) {
    const diffTime =
      (this as any).responseDate.getTime() - (this as any).createdAt.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60)); // Time in hours
  }
  return null;
});

// Ensure virtual fields are serialized
feedbackSchema.set('toJSON', {
  virtuals: true,
});

export const FeedbackModel = mongoose.model<FeedbackDocument>(
  'Feedback',
  feedbackSchema
);
