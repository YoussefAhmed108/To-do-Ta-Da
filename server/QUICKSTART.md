# To-Do Ta-Da! Backend - Quick Start Guide

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (v5 or higher)
3. **npm** or **yarn**

## Quick Start

### 1. Install MongoDB (if not already installed)

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
```

**Windows:**
Download and install from [MongoDB official website](https://www.mongodb.com/try/download/community)

### 2. Setup the Server

```bash
cd server

# Option 1: Use the setup script
./setup.sh

# Option 2: Manual setup
npm install
cp .env.example .env
# Edit .env with your configuration
npm run build
```

### 3. Configure Environment Variables

Edit the `.env` file with your settings:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todo-tada
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRE=7d

# For email reminders (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# For Google Chat reminders (optional)
GOOGLE_CHAT_WEBHOOK_URL=your-webhook-url
```

### 4. Run the Server

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

## Testing the API

### 1. Health Check

```bash
curl http://localhost:5000/health
```

### 2. Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

Save the returned token for authenticated requests.

### 4. Create a Column (requires authentication)

```bash
curl -X POST http://localhost:5000/api/columns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "To Do",
    "color": "#ef4444",
    "position": 0
  }'
```

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.ts    # Authentication logic
│   │   ├── columnController.ts  # Kanban columns
│   │   ├── taskController.ts    # Task management
│   │   ├── eventController.ts   # Calendar events
│   │   └── analyticsController.ts # Analytics & stats
│   ├── middleware/
│   │   └── auth.ts              # JWT authentication middleware
│   ├── models/
│   │   ├── User.ts              # User model
│   │   ├── Column.ts            # Column model
│   │   ├── Task.ts              # Task model
│   │   └── Event.ts             # Event model
│   ├── routes/
│   │   ├── authRoutes.ts        # /api/auth/*
│   │   ├── columnRoutes.ts      # /api/columns/*
│   │   ├── taskRoutes.ts        # /api/tasks/*
│   │   ├── eventRoutes.ts       # /api/events/*
│   │   └── analyticsRoutes.ts   # /api/analytics/*
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   ├── utils/
│   │   ├── jwt.ts               # JWT helper
│   │   ├── emailService.ts      # Email service
│   │   ├── googleChatService.ts # Google Chat integration
│   │   └── reminderService.ts   # Reminder cron job
│   └── server.ts                # Main entry point
├── dist/                        # Compiled JavaScript (generated)
├── node_modules/                # Dependencies
├── .env                         # Environment variables (create from .env.example)
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── nodemon.json                 # Nodemon configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── README.md                    # Full API documentation
└── QUICKSTART.md               # This file
```

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Columns
- `GET /api/columns` - Get all columns
- `POST /api/columns` - Create column
- `PUT /api/columns/:id` - Update column
- `DELETE /api/columns/:id` - Delete column
- `POST /api/columns/reorder` - Reorder columns

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task
- `POST /api/tasks/bulk-subtasks` - Create bulk subtasks
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/complete` - Mark task complete
- `POST /api/tasks/:id/timer/start` - Start timer
- `POST /api/tasks/:id/timer/stop` - Stop timer
- `GET /api/tasks/:id/subtasks` - Get subtasks
- `POST /api/tasks/:id/move` - Move task to column

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Analytics
- `GET /api/analytics` - Get analytics dashboard
- `GET /api/analytics/weekly-plan` - Get weekly plan

## Key Features

✅ **JWT Authentication** - Secure token-based auth  
✅ **Kanban Board** - Columns with drag-and-drop support  
✅ **Task Management** - Full CRUD with subtasks  
✅ **Time Tracking** - Start/stop timers on tasks  
✅ **Recurring Tasks** - Daily, weekdays, weekends, custom  
✅ **Calendar Events** - With recurrence support  
✅ **Reminders** - Auto-notifications via Google Chat/Email  
✅ **Analytics** - Stats by category and column  
✅ **Weekly Planning** - View tasks for current week  
✅ **Bulk Operations** - Generate multiple subtasks at once  

## Troubleshooting

### MongoDB Connection Error

If you see "MongoDB connection error", ensure MongoDB is running:
```bash
# macOS
brew services list
brew services start mongodb-community

# Linux
sudo systemctl status mongod
sudo systemctl start mongod
```

### Port Already in Use

If port 5000 is already in use, change it in `.env`:
```env
PORT=3001
```

### JWT Token Expired

Tokens expire after 7 days by default. Login again to get a new token.

## Next Steps

1. ✅ Read the full [API Documentation](./README.md)
2. ✅ Test all endpoints with Postman or cURL
3. ✅ Configure email/Google Chat for reminders
4. ✅ Connect to the frontend client

---

For detailed API documentation, see [README.md](./README.md)
