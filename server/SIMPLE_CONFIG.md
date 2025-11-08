# ⚡ Simple Configuration Guide

## 🎯 What You Actually Need to Get Started

### ✅ REQUIRED (Must have)
1. **MongoDB** running locally
2. **Email configuration** (for reminders)

### ⭕ OPTIONAL (Nice to have, but not required)
1. Google Chat Webhook (if not restricted - email works fine!)
2. Google Calendar API (app has built-in events)

---

## 📧 Simple Email Setup (REQUIRED)

### If you use Gmail (most common):

1. **Go to**: https://myaccount.google.com/
2. **Security** → **2-Step Verification** (enable it if not already)
3. **Security** → **App Passwords** (at the bottom)
4. **Generate** an app password:
   - App: Mail
   - Device: Other (custom name) → "To-Do Ta-Da"
   - Copy the 16-character password (like: `abcd efgh ijkl mnop`)

5. **Update your `.env` file**:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```
(Remove spaces from the password when pasting)

### That's it! Email reminders will work. ✅

---

## 💬 Google Chat Webhook (OPTIONAL)

### ❌ If you get "Webhook management is restricted":

**Just skip it!** Leave it empty in your `.env`:
```env
GOOGLE_CHAT_WEBHOOK_URL=
```

The app will automatically use email instead. Works perfectly!

---

## 📅 Google Calendar API (OPTIONAL)

### Want to sync with Google Calendar?

Follow the detailed guide in `GOOGLE_CALENDAR_SETUP.md`

### Don't need it right now?

**Just skip it!** Your app has a built-in event system. Leave these empty:
```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

You can add Google Calendar later if you want.

---

## ⚙️ Your Minimal Working Configuration

Here's what your `.env` should look like to get started:

```env
# Server
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todo-tada
JWT_SECRET=todo_tada_jwt_secret_key_change_in_production_2024
JWT_EXPIRE=7d

# Email (REQUIRED) - Update with your actual email and app password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Google Chat (OPTIONAL) - Leave empty if restricted
GOOGLE_CHAT_WEBHOOK_URL=

# Google Calendar (OPTIONAL) - Leave empty for now
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# Environment
NODE_ENV=development
```

---

## 🚀 Start Your Server

Once you've updated your email settings:

```bash
# Make sure MongoDB is running first!
# On Mac: brew services start mongodb-community

cd server
npm run dev
```

You should see:
```
MongoDB connected successfully
Reminder service started
Server is running on port 5000
```

---

## ✅ Test It

1. **Register a user**: `POST http://localhost:5000/api/auth/register`
2. **Login**: `POST http://localhost:5000/api/auth/login`
3. **Create a reminder task** with a deadline 65 minutes from now
4. **Wait** for the reminder emails (60, 30, 10, 5 min before deadline)

---

## 🎉 You're Done!

With just email configured, you have:
- ✅ Full authentication
- ✅ Task management
- ✅ Kanban board
- ✅ Time tracking
- ✅ Calendar events
- ✅ Email reminders
- ✅ Analytics

Everything works without Google Chat or Google Calendar!

---

## 📚 Need More Details?

- **Email setup**: See `SETUP_GUIDE.md`
- **Google Calendar**: See `GOOGLE_CALENDAR_SETUP.md`
- **API docs**: See `README.md`
- **Quick start**: See `QUICKSTART.md`

---

## 💡 Common Issues

### "MongoDB connection error"
```bash
# Start MongoDB
brew services start mongodb-community
```

### "Invalid login" for email
- Make sure you're using an **App Password** for Gmail, not your regular password
- Check EMAIL_USER and EMAIL_PASSWORD are correct
- Remove any spaces from the password

### Reminders not sending
- Check that MongoDB is running
- Make sure the task has `isReminder: true`
- Set `reminderDeadline` to a future time
- Check server logs for error messages

---

That's it! Keep it simple - email is all you need for reminders. 🎊
