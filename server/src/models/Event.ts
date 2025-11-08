import mongoose, { Document, Schema } from 'mongoose';
import { TaskFrequency, DayOfWeek } from '../types';

export interface IEvent extends Document {
  name: string;
  description?: string;
  startTime: Date;
  duration: number; // in minutes
  frequency: TaskFrequency;
  customDays?: DayOfWeek;
  endDate?: Date;
  userId: mongoose.Types.ObjectId;
  googleCalendarEventId?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    startTime: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // in minutes
      required: true,
      min: 1
    },
    frequency: {
      type: String,
      enum: Object.values(TaskFrequency),
      default: TaskFrequency.ONCE
    },
    customDays: {
      monday: { type: Boolean, default: false },
      tuesday: { type: Boolean, default: false },
      wednesday: { type: Boolean, default: false },
      thursday: { type: Boolean, default: false },
      friday: { type: Boolean, default: false },
      saturday: { type: Boolean, default: false },
      sunday: { type: Boolean, default: false }
    },
    endDate: {
      type: Date
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    googleCalendarEventId: {
      type: String
    },
    color: {
      type: String,
      default: '#10b981' // green
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
eventSchema.index({ userId: 1, startTime: 1 });

export default mongoose.model<IEvent>('Event', eventSchema);
