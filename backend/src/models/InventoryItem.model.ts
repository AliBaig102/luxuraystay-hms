import mongoose, { Schema, Document } from 'mongoose';
import {
  InventoryItem,
  InventoryItemType,
  InventoryItemStatus,
  InventoryUnit,
} from '../types/models';

export interface InventoryItemDocument extends InventoryItem, Document {}

const inventoryItemSchema = new Schema<InventoryItemDocument>(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: [100, 'SKU cannot exceed 100 characters'],
      match: [
        /^[A-Z0-9-_]+$/,
        'SKU can only contain uppercase letters, numbers, hyphens, and underscores',
      ],
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Item name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: true,
      maxlength: [100, 'Category cannot exceed 100 characters'],
    },
    type: {
      type: String,
      enum: Object.values(InventoryItemType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(InventoryItemStatus),
      default: InventoryItemStatus.IN_STOCK,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
      max: [1000000, 'Quantity cannot exceed 1000000'],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative'],
      max: [100000, 'Unit price cannot exceed 100000'],
    },
    minQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Minimum quantity cannot be negative'],
      max: [100000, 'Minimum quantity cannot exceed 100000'],
    },
    maxQuantity: {
      type: Number,
      min: [0, 'Maximum quantity cannot be negative'],
      max: [1000000, 'Maximum quantity cannot exceed 1000000'],
    },
    supplier: {
      type: String,
      maxlength: [200, 'Supplier cannot exceed 200 characters'],
    },
    location: {
      type: String,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    barcode: {
      type: String,
      maxlength: [100, 'Barcode cannot exceed 100 characters'],
    },
    expiryDate: {
      type: Date,
    },
    lastRestocked: {
      type: Date,
    },
    totalValue: {
      type: Number,
      required: true,
      min: [0, 'Total value cannot be negative'],
      max: [100000000, 'Total value cannot exceed 100000000'],
    },
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
inventoryItemSchema.index({ sku: 1 });
inventoryItemSchema.index({ barcode: 1 });
inventoryItemSchema.index({ type: 1 });
inventoryItemSchema.index({ status: 1 });
inventoryItemSchema.index({ category: 1 });
inventoryItemSchema.index({ supplier: 1 });
inventoryItemSchema.index({ location: 1 });
inventoryItemSchema.index({ isActive: 1 });
inventoryItemSchema.index({ quantity: 1 });
inventoryItemSchema.index({ expiryDate: 1 });
inventoryItemSchema.index({ lastRestocked: 1 });
inventoryItemSchema.index({ createdAt: -1 });

// Compound indexes for common queries
inventoryItemSchema.index({ type: 1, status: 1 });
inventoryItemSchema.index({ category: 1, status: 1 });
inventoryItemSchema.index({ supplier: 1, isActive: 1 });

// Text search index
inventoryItemSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  tags: 'text',
});

// Pre-save middleware to calculate total value
inventoryItemSchema.pre('save', function (next) {
  if (this.isModified('quantity') || this.isModified('unitPrice')) {
    this.totalValue = this.quantity * this.unitPrice;
  }

  // Update status based on quantity
  if (this.quantity <= 0) {
    this.status = InventoryItemStatus.OUT_OF_STOCK;
  } else if (this.quantity <= this.minQuantity) {
    this.status = InventoryItemStatus.LOW_STOCK;
  } else if (
    this.status === InventoryItemStatus.OUT_OF_STOCK ||
    this.status === InventoryItemStatus.LOW_STOCK
  ) {
    this.status = InventoryItemStatus.IN_STOCK;
  }

  next();
});

// Virtual for stock level percentage
inventoryItemSchema.virtual('stockLevelPercentage').get(function (
  this: InventoryItemDocument
) {
  if (this.maxQuantity && this.maxQuantity > 0) {
    return Math.round((this.quantity / this.maxQuantity) * 100);
  }
  return null;
});

// Virtual for days until expiry
inventoryItemSchema.virtual('daysUntilExpiry').get(function (
  this: InventoryItemDocument
) {
  if (this.expiryDate) {
    const now = new Date();
    const diffTime = this.expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
});

// Ensure virtual fields are serialized
inventoryItemSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc: any, ret: any) {
    return ret;
  },
});

export const InventoryItemModel = mongoose.model<InventoryItemDocument>(
  'InventoryItem',
  inventoryItemSchema
);
