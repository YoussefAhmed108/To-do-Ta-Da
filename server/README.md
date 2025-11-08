# To-Do Ta-Da! Backend API Documentation

A comprehensive task management and calendar API built with Node.js, TypeScript, MongoDB, and JWT authentication.

## Table of Contents

- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Auth Endpoints](#auth-endpoints)
  - [Column Endpoints](#column-endpoints)
  - [Task Endpoints](#task-endpoints)
  - [Event Endpoints](#event-endpoints)
  - [Analytics Endpoints](#analytics-endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)

## Getting Started

### Installation

```bash
cd server
npm install
```

### Environment Setup

Create a `.env` file in the server directory based on `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todo-tada
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration (for reminders)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Google Chat Webhook (for reminders)
GOOGLE_CHAT_WEBHOOK_URL=your-google-chat-webhook-url

NODE_ENV=development
```

### Running the Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

## Authentication

All endpoints except `/api/auth/register` and `/api/auth/login` require JWT authentication.

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### Auth Endpoints

#### 1. Register User

**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com"
    }
  }
}
```

#### 2. Login User

**POST** `/api/auth/login`

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com"
    }
  }
}
```

#### 3. Get Current User

**GET** `/api/auth/me`

Get the currently authenticated user's information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2023-11-07T10:00:00.000Z",
    "updatedAt": "2023-11-07T10:00:00.000Z"
  }
}
```

---

### Column Endpoints

#### 1. Get All Columns

**GET** `/api/columns`

Retrieve all kanban columns for the authenticated user.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "To Do",
      "color": "#ef4444",
      "position": 0,
      "userId": "507f1f77bcf86cd799439012",
      "createdAt": "2023-11-07T10:00:00.000Z",
      "updatedAt": "2023-11-07T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "In Progress",
      "color": "#3b82f6",
      "position": 1,
      "userId": "507f1f77bcf86cd799439012",
      "createdAt": "2023-11-07T10:00:00.000Z",
      "updatedAt": "2023-11-07T10:00:00.000Z"
    }
  ]
}
```

#### 2. Create Column

**POST** `/api/columns`

Create a new kanban column.

**Request Body:**
```json
{
  "name": "Done",
  "color": "#10b981",
  "position": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Done",
    "color": "#10b981",
    "position": 2,
    "userId": "507f1f77bcf86cd799439012",
    "createdAt": "2023-11-07T10:00:00.000Z",
    "updatedAt": "2023-11-07T10:00:00.000Z"
  }
}
```

#### 3. Update Column

**PUT** `/api/columns/:id`

Update a column's details.

**Request Body:**
```json
{
  "name": "Completed",
  "color": "#22c55e",
  "position": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Completed",
    "color": "#22c55e",
    "position": 2,
    "userId": "507f1f77bcf86cd799439012",
    "createdAt": "2023-11-07T10:00:00.000Z",
    "updatedAt": "2023-11-07T10:05:00.000Z"
  }
}
```

#### 4. Delete Column

**DELETE** `/api/columns/:id`

Delete a column (only if it has no tasks).

**Response (200):**
```json
{
  "success": true,
  "message": "Column deleted successfully"
}
```

#### 5. Reorder Columns

**POST** `/api/columns/reorder`

Reorder multiple columns at once.

**Request Body:**
```json
{
  "columnOrders": [
    { "id": "507f1f77bcf86cd799439011", "position": 0 },
    { "id": "507f1f77bcf86cd799439013", "position": 1 },
    { "id": "507f1f77bcf86cd799439014", "position": 2 }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "_id": "507f1f77bcf86cd799439011", "name": "To Do", "position": 0, ... },
    { "_id": "507f1f77bcf86cd799439013", "name": "In Progress", "position": 1, ... },
    { "_id": "507f1f77bcf86cd799439014", "name": "Done", "position": 2, ... }
  ]
}
```

---

### Task Endpoints

#### 1. Get All Tasks

**GET** `/api/tasks`

Retrieve tasks with optional filters.

**Query Parameters:**
- `columnId` (optional): Filter by column
- `parentTaskId` (optional): Filter by parent task (use 'null' for top-level tasks)
- `startDate` (optional): Filter by start date range
- `endDate` (optional): Filter by end date range

**Example:** `/api/tasks?columnId=507f1f77bcf86cd799439011`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "name": "Complete project proposal",
      "description": "Write and submit the Q4 project proposal",
      "category": "work",
      "estimatedTime": 120,
      "timeTaken": 95,
      "frequency": "once",
      "startDate": "2023-11-07T09:00:00.000Z",
      "columnId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "To Do",
        "color": "#ef4444"
      },
      "userId": "507f1f77bcf86cd799439012",
      "position": 0,
      "isReminder": false,
      "completions": [],
      "timeEntries": [],
      "isCompleted": false,
      "createdAt": "2023-11-07T10:00:00.000Z",
      "updatedAt": "2023-11-07T10:00:00.000Z"
    }
  ]
}
```

#### 2. Get Task by ID

**GET** `/api/tasks/:id`

Retrieve a specific task by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "name": "Complete project proposal",
    "description": "Write and submit the Q4 project proposal",
    ...
  }
}
```

#### 3. Create Task

**POST** `/api/tasks`

Create a new task.

**Request Body:**
```json
{
  "name": "Complete project proposal",
  "description": "Write and submit the Q4 project proposal",
  "category": "work",
  "estimatedTime": 120,
  "frequency": "once",
  "startDate": "2023-11-07T09:00:00.000Z",
  "columnId": "507f1f77bcf86cd799439011",
  "position": 0
}
```

**Optional Fields:**
- `category`: "work" | "personal" | "shopping" | "health" | "education" | "other"
- `estimatedTime`: number (minutes)
- `timeTaken`: number (minutes)
- `frequency`: "once" | "daily" | "weekdays" | "weekends" | "custom"
- `customDays`: `{ monday: true, tuesday: false, ... }`
- `startDate`: ISO date string
- `endDate`: ISO date string
- `parentTaskId`: string (for subtasks)
- `isReminder`: boolean
- `reminderDeadline`: ISO date string

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "name": "Complete project proposal",
    ...
  }
}
```

#### 4. Create Bulk Subtasks

**POST** `/api/tasks/bulk-subtasks`

Generate multiple subtasks with a prefix and number range.

**Request Body:**
```json
{
  "parentTaskId": "507f1f77bcf86cd799439020",
  "prefix": "Video",
  "start": 1,
  "end": 20,
  "columnId": "507f1f77bcf86cd799439011"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "name": "Video 1",
      "description": "Video 1",
      "parentTaskId": "507f1f77bcf86cd799439020",
      ...
    },
    {
      "_id": "507f1f77bcf86cd799439031",
      "name": "Video 2",
      "description": "Video 2",
      ...
    }
  ],
  "count": 20
}
```

#### 5. Update Task

**PUT** `/api/tasks/:id`

Update an existing task.

**Request Body:** (all fields optional)
```json
{
  "name": "Updated task name",
  "description": "Updated description",
  "category": "personal",
  "estimatedTime": 180
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "name": "Updated task name",
    ...
  }
}
```

#### 6. Delete Task

**DELETE** `/api/tasks/:id`

Delete a task and all its subtasks.

**Response (200):**
```json
{
  "success": true,
  "message": "Task and subtasks deleted successfully"
}
```

#### 7. Mark Task Complete

**POST** `/api/tasks/:id/complete`

Mark a task as complete. For recurring tasks, marks completion for a specific date.

**Request Body:**
```json
{
  "date": "2023-11-07T00:00:00.000Z",
  "timeTaken": 95
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "isCompleted": true,
    "completedAt": "2023-11-07T12:30:00.000Z",
    "timeTaken": 95,
    ...
  }
}
```

#### 8. Start Timer

**POST** `/api/tasks/:id/timer/start`

Start a timer for time tracking on a task.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "timeEntries": [
      {
        "startTime": "2023-11-07T12:00:00.000Z"
      }
    ],
    ...
  }
}
```

#### 9. Stop Timer

**POST** `/api/tasks/:id/timer/stop`

Stop the active timer and record the duration.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "timeEntries": [
      {
        "startTime": "2023-11-07T12:00:00.000Z",
        "endTime": "2023-11-07T13:35:00.000Z",
        "duration": 95
      }
    ],
    "timeTaken": 95,
    ...
  }
}
```

#### 10. Get Subtasks

**GET** `/api/tasks/:id/subtasks`

Get all subtasks for a parent task.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "name": "Subtask 1",
      "parentTaskId": "507f1f77bcf86cd799439020",
      ...
    }
  ]
}
```

#### 11. Move Task

**POST** `/api/tasks/:id/move`

Move a task to a different column or position.

**Request Body:**
```json
{
  "columnId": "507f1f77bcf86cd799439013",
  "position": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "columnId": "507f1f77bcf86cd799439013",
    "position": 2,
    ...
  }
}
```

---

### Event Endpoints

#### 1. Get All Events

**GET** `/api/events`

Retrieve events with optional date range filtering.

**Query Parameters:**
- `startDate` (optional): Filter start
- `endDate` (optional): Filter end

**Example:** `/api/events?startDate=2023-11-01&endDate=2023-11-30`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439040",
      "name": "Team Meeting",
      "description": "Weekly team sync",
      "startTime": "2023-11-07T14:00:00.000Z",
      "duration": 60,
      "frequency": "weekly",
      "customDays": {
        "monday": true,
        "tuesday": false,
        "wednesday": false,
        "thursday": false,
        "friday": false,
        "saturday": false,
        "sunday": false
      },
      "userId": "507f1f77bcf86cd799439012",
      "color": "#10b981",
      "createdAt": "2023-11-07T10:00:00.000Z",
      "updatedAt": "2023-11-07T10:00:00.000Z"
    }
  ]
}
```

#### 2. Get Event by ID

**GET** `/api/events/:id`

Retrieve a specific event.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439040",
    "name": "Team Meeting",
    ...
  }
}
```

#### 3. Create Event

**POST** `/api/events`

Create a new calendar event.

**Request Body:**
```json
{
  "name": "Team Meeting",
  "description": "Weekly team sync",
  "startTime": "2023-11-07T14:00:00.000Z",
  "duration": 60,
  "frequency": "once",
  "color": "#10b981"
}
```

**Optional Fields:**
- `description`: string
- `frequency`: "once" | "daily" | "weekdays" | "weekends" | "custom"
- `customDays`: `{ monday: true, ... }`
- `endDate`: ISO date string (for recurring events)
- `color`: hex color code
- `googleCalendarEventId`: string

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439040",
    "name": "Team Meeting",
    ...
  }
}
```

#### 4. Update Event

**PUT** `/api/events/:id`

Update an existing event.

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Meeting",
  "duration": 90
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439040",
    "name": "Updated Meeting",
    "duration": 90,
    ...
  }
}
```

#### 5. Delete Event

**DELETE** `/api/events/:id`

Delete an event.

**Response (200):**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

---

### Analytics Endpoints

#### 1. Get Analytics

**GET** `/api/analytics`

Get task analytics grouped by category and column.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "byCategory": {
      "work": {
        "count": 25,
        "totalTime": 1500,
        "completedCount": 18,
        "averageTime": 83
      },
      "personal": {
        "count": 12,
        "totalTime": 600,
        "completedCount": 10,
        "averageTime": 60
      }
    },
    "byColumn": {
      "507f1f77bcf86cd799439011": {
        "name": "To Do",
        "color": "#ef4444",
        "count": 15,
        "totalTime": 800,
        "completedCount": 10,
        "averageTime": 80
      },
      "507f1f77bcf86cd799439013": {
        "name": "In Progress",
        "color": "#3b82f6",
        "count": 10,
        "totalTime": 700,
        "completedCount": 8,
        "averageTime": 87
      }
    },
    "overview": {
      "totalTasks": 37,
      "completedTasks": 28,
      "totalTimeTracked": 2100
    }
  }
}
```

#### 2. Get Weekly Plan

**GET** `/api/analytics/weekly-plan`

Get all tasks for the current week.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "startOfWeek": "2023-11-05T00:00:00.000Z",
    "endOfWeek": "2023-11-11T23:59:59.999Z",
    "tasks": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "name": "Complete project proposal",
        "frequency": "once",
        "startDate": "2023-11-07T09:00:00.000Z",
        ...
      },
      {
        "_id": "507f1f77bcf86cd799439021",
        "name": "Daily standup",
        "frequency": "weekdays",
        ...
      }
    ]
  }
}
```

---

## Data Models

### User Model
```typescript
{
  _id: ObjectId,
  username: string (unique, required),
  email: string (unique, required),
  password: string (hashed, required),
  googleCalendarToken?: string,
  googleCalendarRefreshToken?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Column Model
```typescript
{
  _id: ObjectId,
  name: string (required),
  color: string (hex color, required),
  position: number (required),
  userId: ObjectId (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```typescript
{
  _id: ObjectId,
  name: string (required),
  description: string (required),
  category?: "work" | "personal" | "shopping" | "health" | "education" | "other",
  estimatedTime?: number, // minutes
  timeTaken?: number, // minutes
  frequency: "once" | "daily" | "weekdays" | "weekends" | "custom",
  customDays?: {
    monday: boolean,
    tuesday: boolean,
    wednesday: boolean,
    thursday: boolean,
    friday: boolean,
    saturday: boolean,
    sunday: boolean
  },
  startDate?: Date,
  endDate?: Date,
  columnId: ObjectId (required),
  userId: ObjectId (required),
  parentTaskId?: ObjectId,
  position: number,
  isReminder: boolean,
  reminderDeadline?: Date,
  remindersSent?: number[], // [60, 30, 10, 5]
  completions: [{
    date: Date,
    completed: boolean,
    timeTaken?: number
  }],
  timeEntries: [{
    startTime: Date,
    endTime?: Date,
    duration?: number
  }],
  isCompleted: boolean,
  completedAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Event Model
```typescript
{
  _id: ObjectId,
  name: string (required),
  description?: string,
  startTime: Date (required),
  duration: number (minutes, required),
  frequency: "once" | "daily" | "weekdays" | "weekends" | "custom",
  customDays?: {
    monday: boolean,
    // ... other days
  },
  endDate?: Date,
  userId: ObjectId (required),
  googleCalendarEventId?: string,
  color?: string,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development mode)"
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error, missing required fields)
- **401**: Unauthorized (missing or invalid token)
- **404**: Not Found
- **500**: Internal Server Error

---

## Features

### Task Management
- ✅ Create, read, update, delete tasks
- ✅ Subtasks with parent-child relationships
- ✅ Bulk subtask generation with prefix and number range
- ✅ Task categories (work, personal, etc.)
- ✅ Time estimates and tracking
- ✅ Recurring tasks (daily, weekdays, weekends, custom days)
- ✅ Task completions tracking for recurring tasks
- ✅ Move tasks between columns

### Kanban Board
- ✅ Create, update, delete columns
- ✅ Column colors
- ✅ Reorder columns
- ✅ Tasks inherit column colors

### Time Tracking
- ✅ Start/stop timers for tasks
- ✅ Multiple time entries per task
- ✅ Automatic duration calculation
- ✅ Total time taken tracking

### Calendar & Events
- ✅ Create calendar events
- ✅ Recurring events
- ✅ Event duration
- ✅ Date range filtering

### Reminders
- ✅ Special reminder tasks
- ✅ Automatic notifications at 60, 30, 10, and 5 minutes before deadline
- ✅ Google Chat integration (primary)
- ✅ Email fallback
- ✅ Background service running every minute

### Analytics
- ✅ Task counts by category
- ✅ Task counts by column
- ✅ Average time taken by category
- ✅ Average time taken by column
- ✅ Weekly plan view
- ✅ Overall statistics

### Authentication
- ✅ JWT-based authentication
- ✅ Secure password hashing with bcrypt
- ✅ User registration and login
- ✅ Protected routes

---

## Notes

1. **Reminder Service**: The reminder service checks every minute for tasks with `isReminder: true` and sends notifications via Google Chat (or email fallback) at the specified intervals.

2. **Recurring Tasks**: When marking recurring tasks as complete, provide a `date` parameter to track completion for specific dates.

3. **Subtasks on Calendar**: Subtasks are stored with a `parentTaskId` reference. On the frontend, you can display them as `{parentTaskName}/{subtaskName}`.

4. **Column Colors**: Tasks inherit their column's color when displayed on the calendar.

5. **Google Calendar Integration**: The user model includes fields for Google Calendar tokens. You can extend the implementation to sync events with Google Calendar API.

---

## Development

### Database Indexes

The following indexes are created for optimal query performance:
- User: `email`, `username`
- Column: `userId + position`
- Task: `userId + columnId`, `userId + parentTaskId`, `userId + isReminder + reminderDeadline`, `userId + startDate + endDate`
- Event: `userId + startTime`

### Testing

You can test the API using tools like:
- Postman
- Insomnia
- cURL
- Thunder Client (VS Code extension)

---

## License

MIT
