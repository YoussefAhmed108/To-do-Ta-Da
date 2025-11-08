# TaskFlow - Full-Stack Task Management App

A modern, responsive task management application built with Next.js, Node.js, Express, and MongoDB.

## 🚀 Features

- **Kanban Board** - Visual task organization with drag & drop
- **Calendar View** - Schedule tasks and events with drag & drop
- **Analytics Dashboard** - Track productivity and completion rates
- **Custom Categories** - User-specific task categories
- **Subtasks** - Break down complex tasks
- **Recurring Tasks** - Daily, weekly, custom schedules
- **Timer** - Built-in productivity timer
- **Reminders** - Task deadline notifications
- **Responsive Design** - Mobile-friendly interface
- **User Authentication** - Secure JWT-based auth

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier available)
- Git

## 🛠️ Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/YoussefAhmed108/To-do-Ta-Da.git
cd To-do-Ta-Da
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
cp .env.example .env.local
# Edit .env.local with your backend API URL
npm run dev
```

### 4. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🌐 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set root directory to `client`
4. Add environment variable: `NEXT_PUBLIC_API_URL`
5. Deploy

### Backend (Render)
1. Create new Web Service on [Render](https://render.com)
2. Connect GitHub repository
3. Set root directory to `server`
4. Add environment variables (see .env.example)
5. Deploy

### Database (MongoDB Atlas)
1. Create free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Add database user and whitelist IP (0.0.0.0/0)
3. Get connection string and add to backend env vars

## 📦 Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- React DnD
- Lucide Icons
- date-fns

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- TypeScript

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=your_frontend_url
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=your_backend_api_url
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Youssef Ahmed - [@YoussefAhmed108](https://github.com/YoussefAhmed108)

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by productivity apps like Trello and Notion
