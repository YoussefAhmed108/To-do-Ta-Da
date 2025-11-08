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
  timeTaken?: number;
}

export interface TimeEntry {
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export interface Task {
  _id: string;
  title?: string;
  name?: string;
  description?: string;
  columnId: string | { _id: string; name: string };
  userId: string;
  position: number;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  startDate?: string;
  startTime?: string; // Time in HH:mm format (e.g., "14:30")
  frequency?: TaskFrequency;
  customDays?: string[] | DayOfWeek;
  parentTaskId?: string | Task;
  estimatedTime?: number;
  timeTaken?: number;
  isCompleted?: boolean;
  completedAt?: string;
  isReminder?: boolean;
  reminderDeadline?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Column {
  _id: string;
  name: string;
  color: string;
  position: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  _id: string;
  title?: string; // Legacy field
  name?: string; // New field matching backend
  description?: string;
  startTime: Date;
  endTime?: Date; // Legacy field
  duration?: number; // New field matching backend (in minutes)
  frequency: TaskFrequency;
  customDays?: DayOfWeek;
  endDate?: Date;
  taskId?: string;
  userId: string;
  isAllDay?: boolean; // Legacy field
  color?: string;
  googleCalendarEventId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  categories: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}
