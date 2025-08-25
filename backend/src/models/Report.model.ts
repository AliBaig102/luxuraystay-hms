import mongoose, { Schema, Document } from 'mongoose';
import { Report, ReportType, ReportFormat } from '../types/models';

export interface ReportDocument extends Report, Document {}

const reportSchema = new Schema<ReportDocument>(
  {
    reportType: {
      type: String,
      enum: Object.values(ReportType),
      required: true,
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parameters: {
      type: Schema.Types.Mixed,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    format: {
      type: String,
      enum: Object.values(ReportFormat),
      required: true,
    },
    generatedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
reportSchema.index({ reportType: 1 });
reportSchema.index({ generatedBy: 1 });
reportSchema.index({ format: 1 });
reportSchema.index({ generatedDate: -1 });
reportSchema.index({ expiresAt: 1 });
reportSchema.index({ createdAt: -1 });

// Compound indexes for common queries
reportSchema.index({ reportType: 1, generatedDate: 1 });
reportSchema.index({ generatedBy: 1, reportType: 1 });
reportSchema.index({ format: 1, generatedDate: 1 });

// TTL index for automatic cleanup of expired reports
if (reportSchema.indexes().some(index => index.expiresAt)) {
  reportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

// Virtual for report age
reportSchema.virtual('age').get(function () {
  const diffTime = Math.abs(
    new Date().getTime() - this.generatedDate.getTime()
  );
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Age in days
});

// Virtual for expiration status
reportSchema.virtual('isExpired').get(function () {
  if (this.expiresAt) {
    return new Date() > this.expiresAt;
  }
  return false;
});

// Virtual for report size (approximate)
reportSchema.virtual('size').get(function () {
  try {
    const dataString = JSON.stringify(this.data);
    return dataString.length;
  } catch {
    return 0;
  }
});

// Virtual for report status
reportSchema.virtual('status').get(function () {
  if (this.isExpired) {
    return 'expired';
  }

  const age = this.age;
  if (age > 30) {
    return 'old';
  } else if (age > 7) {
    return 'recent';
  } else {
    return 'new';
  }
});

// Ensure virtual fields are serialized
reportSchema.set('toJSON', {
  virtuals: true,
});

export const ReportModel = mongoose.model<ReportDocument>(
  'Report',
  reportSchema
);
