# Google Calendar API Setup Guide

## 🎯 Overview

This guide will help you set up Google Calendar integration for To-Do Ta-Da. This allows you to:
- Sync events from your Google Calendar to the app
- Display Google Calendar meetings in your calendar view
- (Optional) Create events in Google Calendar from the app

---

## 📋 Prerequisites

- A Google account
- Access to Google Cloud Console
- Your To-Do Ta-Da backend running

---

## 🚀 Setup Steps

### Step 1: Create a Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project**
   - Click the project dropdown at the top (says "Select a project")
   - Click **"NEW PROJECT"**
   - Project name: `To-Do Ta-Da` (or any name you prefer)
   - Organization: Leave as default (No organization)
   - Click **"CREATE"**

3. **Wait for Creation**
   - It takes a few seconds
   - You'll see a notification when it's ready

4. **Select Your Project**
   - Make sure your new project is selected in the dropdown

---

### Step 2: Enable Google Calendar API

1. **Open API Library**
   - In the left sidebar, click **"APIs & Services"** → **"Library"**
   - Or visit: https://console.cloud.google.com/apis/library

2. **Search for Calendar API**
   - In the search box, type: `Google Calendar API`
   - Click on **"Google Calendar API"** in the results

3. **Enable the API**
   - Click the blue **"ENABLE"** button
   - Wait for it to enable (takes a few seconds)

---

### Step 3: Configure OAuth Consent Screen

Before creating credentials, you need to set up the OAuth consent screen.

1. **Go to OAuth Consent Screen**
   - Sidebar: **"APIs & Services"** → **"OAuth consent screen"**
   - Or visit: https://console.cloud.google.com/apis/credentials/consent

2. **Choose User Type**
   - Select **"External"** (unless you have Google Workspace, then you can use "Internal")
   - Click **"CREATE"**

3. **App Information (Page 1)**
   - **App name**: `To-Do Ta-Da`
   - **User support email**: Select your email from dropdown
   - **App logo**: (optional - skip for now)
   - **Application home page**: `http://localhost:5000` (or leave empty)
   - **Application privacy policy link**: (leave empty for development)
   - **Application terms of service link**: (leave empty for development)
   - **Authorized domains**: (leave empty for now)
   - **Developer contact information**: Your email address
   - Click **"SAVE AND CONTINUE"**

4. **Scopes (Page 2)**
   - Click **"ADD OR REMOVE SCOPES"**
   - In the filter, search for: `calendar`
   - Check these scopes:
     - ✅ `https://www.googleapis.com/auth/calendar` - See, edit, share, and permanently delete all calendars
     - ✅ `https://www.googleapis.com/auth/calendar.events` - View and edit events on all your calendars
   - Click **"UPDATE"**
   - Click **"SAVE AND CONTINUE"**

5. **Test Users (Page 3)**
   - Click **"+ ADD USERS"**
   - Enter your email address (the one you'll use to test)
   - Click **"ADD"**
   - Click **"SAVE AND CONTINUE"**

6. **Summary (Page 4)**
   - Review your settings
   - Click **"BACK TO DASHBOARD"**

---

### Step 4: Create OAuth 2.0 Credentials

1. **Go to Credentials**
   - Sidebar: **"APIs & Services"** → **"Credentials"**
   - Or visit: https://console.cloud.google.com/apis/credentials

2. **Create OAuth Client ID**
   - Click **"+ CREATE CREDENTIALS"** at the top
   - Select **"OAuth client ID"**

3. **Configure OAuth Client**
   - **Application type**: Select **"Web application"**
   - **Name**: `To-Do Ta-Da Backend` (or any name)
   
4. **Add Authorized Redirect URIs**
   - Under "Authorized redirect URIs", click **"+ ADD URI"**
   - Enter: `http://localhost:5000/api/auth/google/callback`
   - If you deploy to production later, also add: `https://yourdomain.com/api/auth/google/callback`
   
5. **Create**
   - Click **"CREATE"**

6. **Copy Your Credentials**
   - A popup will show your credentials
   - **Client ID**: Copy this (looks like `123456789-abcdefg.apps.googleusercontent.com`)
   - **Client Secret**: Copy this (looks like `GOCSPX-AbCdEfGhIjKlMnOp`)
   - Click **"OK"**
   
   ⚠️ **Important**: Save these somewhere safe! You'll need them in the next step.

---

### Step 5: Update Your .env File

Open your `.env` file in the server directory and add/update these lines:

```env
# Google Calendar API Configuration
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOp
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

**Replace** the values with your actual Client ID and Client Secret from Step 4.

---

### Step 6: Restart Your Server

```bash
# Stop your server (Ctrl+C if running)
# Then restart it
npm run dev
```

---

## 🔗 Using Google Calendar Integration

### Connecting Your Google Calendar

Once the server is running with the correct credentials, users can connect their Google Calendar:

1. **Frontend will call**: `GET http://localhost:5000/api/auth/google/authorize`
   - This redirects to Google's authorization page

2. **User authorizes** the app to access their calendar

3. **Google redirects back** to your callback URL with tokens

4. **Backend stores** the access token and refresh token for the user

### API Endpoints (Already in your backend)

The User model already has fields for:
```typescript
googleCalendarToken?: string;
googleCalendarRefreshToken?: string;
```

---

## 🧪 Testing the Integration

### Quick Test with Browser

1. **Start your server**:
   ```bash
   npm run dev
   ```

2. **Create an authorization route** (we'll add this):
   - Visit: `http://localhost:5000/api/auth/google/authorize`
   - You'll be redirected to Google
   - Sign in and authorize
   - You'll be redirected back with tokens

---

## 🎨 What You Can Do with Google Calendar API

Once integrated, you can:

### Read Events
- Fetch events from user's Google Calendar
- Display them in your app's calendar view
- Show upcoming meetings

### Create Events
- Create calendar events from your app
- When a task has a specific time, add it to Google Calendar

### Update Events
- Sync changes between your app and Google Calendar
- Update event times, descriptions, etc.

### Delete Events
- Remove events from Google Calendar

---

## ⚠️ Important Notes

### Publishing Status

Your app starts in **"Testing"** mode, which means:
- ✅ Only test users (emails you added) can authorize
- ✅ Tokens expire after 7 days in testing mode
- ❌ Other users will see "This app isn't verified" warning

### To Go to Production:
1. Go to OAuth consent screen
2. Click **"PUBLISH APP"**
3. May require Google verification if you request sensitive scopes

### Token Expiration
- Access tokens expire after 1 hour
- Refresh tokens can be used to get new access tokens
- The backend should handle token refresh automatically

---

## 🐛 Troubleshooting

### "Access blocked: This app's request is invalid"
- Check that your redirect URI in Google Console matches exactly: `http://localhost:5000/api/auth/google/callback`
- Make sure you enabled Google Calendar API
- Verify your OAuth consent screen is configured

### "Error 400: redirect_uri_mismatch"
- The redirect URI in your .env must match exactly what's in Google Console
- Check for trailing slashes, http vs https, etc.

### "This app isn't verified"
- Normal for testing mode
- Click "Advanced" → "Go to To-Do Ta-Da (unsafe)" to proceed
- Or add your email as a test user in OAuth consent screen

### Tokens not saving
- Check that your User model has the googleCalendarToken fields
- Verify MongoDB is running and connected
- Check server logs for errors

---

## 📝 Environment Variables Summary

Add these to your `.env` file:

```env
# Google Calendar API (Optional - for calendar sync)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

---

## 🎉 Alternative: Skip Google Calendar for Now

**Google Calendar integration is OPTIONAL**. You can skip it for now and:
- ✅ Use the built-in event system (already working)
- ✅ Create events manually in your app
- ✅ Add Google Calendar later when needed

Just leave the Google Calendar environment variables empty:
```env
# Google Calendar API (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

---

## 📚 Additional Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google API Node.js Client](https://github.com/googleapis/google-api-nodejs-client)

---

## 💡 Quick Summary

**If Google Calendar seems complicated, here's the simple path:**

1. **For now**: Leave Google Calendar empty - you don't need it to start
2. **Use built-in events**: Your app already has a full event system
3. **Add later**: Set up Google Calendar when you need calendar sync

Your reminder system works perfectly with just **email** - no webhook or Google Calendar needed!

```env
# Minimal working configuration
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todo-tada
JWT_SECRET=todo_tada_jwt_secret_key_change_in_production_2024
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Leave these empty for now
GOOGLE_CHAT_WEBHOOK_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

NODE_ENV=development
```

That's it! Your app will work perfectly with just email notifications. 🎊
