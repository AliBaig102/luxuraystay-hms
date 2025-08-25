import mongoose, { Document, Schema } from 'mongoose';
import { Test } from '../types/models';

export interface TestDocument extends Test, Document {}

// Test schema definition
const testSchema = new Schema<TestDocument>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters long'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters long'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    versionKey: false, // Removes __v field
  }
);

// Virtual for full name
testSchema.virtual('fullName').get(function (this: TestDocument) {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
testSchema.set('toJSON', {
  virtuals: true,
  transform: function (_doc: any, ret: any) {
    delete ret._id;
    return ret;
  },
});

// Create and export the model
export const TestModel = mongoose.model<TestDocument>('Test', testSchema);
