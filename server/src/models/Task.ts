import mongoose, { Document, Schema } from 'mongoose';
import { TaskFrequency, DayOfWeek, TaskCompletion, TimeEntry } from '../types';

export interface ITask extends Document {
  name: string;
  description: string;
  category?: string;
  estimatedTime?: number; // in minutes
  timeTaken?: number; // in minutes
  frequency: TaskFrequency;
  customDays?: DayOfWeek;
  startDate?: Date;
  startTime?: string; // Time in HH:mm format (e.g., "14:30")
  endDate?: Date;
  columnId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  parentTaskId?: mongoose.Types.ObjectId;
  position: number;
  isReminder: boolean;
  reminderDeadline?: Date;
  remindersSent?: number[]; // [60, 30, 10, 5] minutes before deadline
  completions: TaskCompletion[]; // For recurring tasks
  timeEntries: TimeEntry[]; // For time tracking
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      trim: true
    },
    estimatedTime: {
      type: Number, // in minutes
      min: 0
    },
    timeTaken: {
      type: Number, // in minutes
      min: 0,
      default: 0
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
    startDate: {
      type: Date
    },
    startTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:mm format
    },
    endDate: {
      type: Date
    },
    columnId: {
      type: Schema.Types.ObjectId,
      ref: 'Column',
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    parentTaskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task'
    },
    position: {
      type: Number,
      default: 0
    },
    isReminder: {
      type: Boolean,
      default: false
    },
    reminderDeadline: {
      type: Date
    },
    remindersSent: [{
      type: Number
    }],
    completions: [{
      date: { type: Date, required: true },
      completed: { type: Boolean, default: false },
      timeTaken: { type: Number } // in minutes
    }],
    timeEntries: [{
      startTime: { type: Date, required: true },
      endTime: { type: Date },
      duration: { type: Number } // in minutes
    }],
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
taskSchema.index({ userId: 1, columnId: 1 });
taskSchema.index({ userId: 1, parentTaskId: 1 });
taskSchema.index({ userId: 1, isReminder: 1, reminderDeadline: 1 });
taskSchema.index({ userId: 1, startDate: 1, endDate: 1 });

export default mongoose.model<ITask>('Task', taskSchema);
