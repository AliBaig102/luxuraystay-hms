import mongoose, { Schema, Document } from 'mongoose';
import {
  InventoryTransaction,
  InventoryTransactionType,
} from '../types/models';

export interface InventoryTransactionDocument
  extends InventoryTransaction,
    Document {}

const inventoryTransactionSchema = new Schema<InventoryTransactionDocument>(
  {
    itemId: {
      type: String,
      ref: 'InventoryItem',
      required: true,
    },
    transactionType: {
      type: String,
      enum: Object.values(InventoryTransactionType),
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      max: [100000, 'Quantity cannot exceed 100000'],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative'],
      max: [100000, 'Unit price cannot exceed 100000'],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
      max: [10000000, 'Total amount cannot exceed 10000000'],
    },
    reference: {
      type: String,
      maxlength: [200, 'Reference cannot exceed 200 characters'],
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    performedBy: {
      type: String,
      ref: 'User',
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
      min: [0, 'Previous quantity cannot be negative'],
    },
    newQuantity: {
      type: Number,
      required: true,
      min: [0, 'New quantity cannot be negative'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
inventoryTransactionSchema.index({ itemId: 1 });
inventoryTransactionSchema.index({ transactionType: 1 });
inventoryTransactionSchema.index({ performedBy: 1 });
inventoryTransactionSchema.index({ createdAt: -1 });
inventoryTransactionSchema.index({ reference: 1 });

// Compound indexes for common queries
inventoryTransactionSchema.index({ itemId: 1, transactionType: 1 });
inventoryTransactionSchema.index({ itemId: 1, createdAt: -1 });
inventoryTransactionSchema.index({ performedBy: 1, createdAt: -1 });

// Pre-save middleware to calculate total amount if not provided
inventoryTransactionSchema.pre('save', function (next) {
  const doc = this as any;
  if (!doc.totalAmount && doc.unitPrice && doc.quantity) {
    doc.totalAmount = doc.unitPrice * doc.quantity;
  }
  next();
});

// Virtual for transaction impact (positive for in, negative for out)
inventoryTransactionSchema.virtual('quantityImpact').get(function (
  this: InventoryTransactionDocument
) {
  if (
    this.transactionType === InventoryTransactionType.IN ||
    this.transactionType === InventoryTransactionType.RETURN ||
    this.transactionType === InventoryTransactionType.ADJUSTMENT
  ) {
    return this.quantity;
  } else {
    return -this.quantity;
  }
});

// Ensure virtual fields are serialized
inventoryTransactionSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc: any, ret: any) {
    return ret;
  },
});

export const InventoryTransactionModel =
  mongoose.model<InventoryTransactionDocument>(
    'InventoryTransaction',
    inventoryTransactionSchema
  );
