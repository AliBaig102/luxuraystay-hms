import mongoose, { Schema, Document } from 'mongoose';
import { SystemSettings, SettingCategory } from '../types/models';

export interface SystemSettingsDocument extends SystemSettings, Document {}

const systemSettingsSchema = new Schema<SystemSettingsDocument>(
  {
    settingKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    settingValue: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      enum: Object.values(SettingCategory),
      required: true,
    },
    isEditable: {
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
systemSettingsSchema.index({ settingKey: 1 });
systemSettingsSchema.index({ category: 1 });
systemSettingsSchema.index({ isEditable: 1 });
systemSettingsSchema.index({ createdAt: -1 });

// Compound index for category-based queries
systemSettingsSchema.index({ category: 1, isEditable: 1 });

// Virtual for setting type
systemSettingsSchema.virtual('settingType').get(function () {
  // Try to determine the type based on the value
  const value = this.settingValue;

  if (value === 'true' || value === 'false') {
    return 'boolean';
  }

  if (!isNaN(Number(value)) && value !== '') {
    return 'number';
  }

  if (value.startsWith('{') || value.startsWith('[')) {
    try {
      JSON.parse(value);
      return 'json';
    } catch {
      return 'string';
    }
  }

  return 'string';
});

// Virtual for parsed value
systemSettingsSchema.virtual('parsedValue').get(function () {
  const type = this.settingType;

  switch (type) {
    case 'boolean':
      return this.settingValue === 'true';
    case 'number':
      return Number(this.settingValue);
    case 'json':
      try {
        return JSON.parse(this.settingValue);
      } catch {
        return this.settingValue;
      }
    default:
      return this.settingValue;
  }
});

// Ensure virtual fields are serialized
systemSettingsSchema.set('toJSON', {
  virtuals: true,
});

export const SystemSettingsModel = mongoose.model<SystemSettingsDocument>(
  'SystemSettings',
  systemSettingsSchema
);
