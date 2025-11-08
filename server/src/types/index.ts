import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export enum TaskFrequency {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKDAYS = 'weekdays',
  WEEKENDS = 'weekends',
  CUSTOM = 'custom'
}

export enum TaskCategory {
  WORK = 'work',
  PERSONAL = 'personal',
  SHOPPING = 'shopping',
  HEALTH = 'health',
  EDUCATION = 'education',
  OTHER = 'other'
}

export interface DayOfWeek {
  monday?: boolean;
  tuesday?: boolean;
  wednesday?: boolean;
  thursday?: boolean;
  friday?: boolean;
  saturday?: boolean;
  sunday?: boolean;
}

export interface TaskCompletion {
  date: Date;
  completed: boolean;
  timeTaken?: number; // in minutes
}

export interface TimeEntry {
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
}
