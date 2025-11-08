# Email and Google Chat Setup Guide

## 📧 Email Configuration Guide

### Gmail Setup (Recommended)

Gmail is the most common choice and works great for this application.

#### Step 1: Enable 2-Step Verification
1. Go to https://myaccount.google.com/
2. Click "Security" in the left menu
3. Under "Signing in to Google", click "2-Step Verification"
4. Follow the prompts to enable it (if not already enabled)

#### Step 2: Generate App Password
1. Stay in "Security" section
2. Scroll to "2-Step Verification"
3. At the bottom, click "App passwords"
4. You may need to sign in again
5. Select "Mail" for app type
6. Select "Other" for device type
7. Enter "To-Do Ta-Da Server"
8. Click "Generate"
9. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

#### Step 3: Update Your .env File
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.actual.email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # (no spaces)
```

### Other Email Providers

#### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-regular-password
```

#### Yahoo Mail
1. Enable "Allow apps that use less secure sign in" in Yahoo settings
2. Or generate an app password (recommended)
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

#### Office 365
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@company.com
EMAIL_PASSWORD=your-password
```

#### Custom SMTP Server
```env
EMAIL_HOST=smtp.yourserver.com
EMAIL_PORT=587  # Or 465 for SSL
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
```

---

## 💬 Google Chat Webhook Setup

Google Chat webhooks are **optional** but provide instant notifications in your team space.

### Step 1: Create or Open a Google Chat Space
1. Go to https://chat.google.com/
2. Create a new space OR use an existing one
3. You can create a personal space just for your reminders

### Step 2: Add a Webhook
1. Click on the **space name** at the top
2. Select **"Apps & integrations"** from the dropdown
3. Click **"Add webhooks"** (or "Webhooks" tab)
4. Click **"Add another"** or the **+ button**

### Step 3: Configure the Webhook
1. **Name**: `To-Do Ta-Da Reminders`
2. **Avatar URL**: (leave empty or add a custom icon URL)
3. Click **"Save"**

### Step 4: Copy the Webhook URL
1. Click **"Copy"** next to your new webhook
2. The URL will look like:
   ```
   https://chat.googleapis.com/v1/spaces/AAAAxxxxxxx/messages?key=xxxxxxx&token=xxxxxxx
   ```

### Step 5: Add to .env File
```env
GOOGLE_CHAT_WEBHOOK_URL=https://chat.googleapis.com/v1/spaces/AAAAxxxxxxx/messages?key=xxxxxxx&token=xxxxxxx
```

### Testing Your Webhook

You can test it with curl:
```bash
curl -X POST 'YOUR_WEBHOOK_URL' \
  -H 'Content-Type: application/json' \
  -d '{"text": "Test message from To-Do Ta-Da!"}'
```

---

## 🎯 Recommended Configuration

### For Personal Use
```env
# Use Gmail for emails
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Optional: Leave empty to use email only
GOOGLE_CHAT_WEBHOOK_URL=
```

### For Team Use
```env
# Use company email
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=you@company.com
EMAIL_PASSWORD=your-password

# Use Google Chat for team notifications
GOOGLE_CHAT_WEBHOOK_URL=https://chat.googleapis.com/v1/spaces/...
```

---

## 🔍 How the Reminder System Works

### Priority System
1. **First attempt**: Google Chat webhook (if configured)
2. **Fallback**: Email (if Google Chat fails or not configured)

### Reminder Timing
- ⏰ **60 minutes** before deadline
- ⏰ **30 minutes** before deadline
- ⏰ **10 minutes** before deadline
- ⏰ **5 minutes** before deadline

### Example Reminder Message
```
⏰ Reminder: "Submit project report" is due in 30 minutes!

Description: Complete and submit the Q4 project report to the team

Deadline: Nov 7, 2025 at 3:00 PM
```

---

## ✅ Testing Your Configuration

### 1. Start the Server
```bash
cd server
npm run dev
```

### 2. Create a Test Reminder Task

Use this curl command (replace YOUR_TOKEN with your JWT token):

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Reminder",
    "description": "This is a test reminder task",
    "columnId": "YOUR_COLUMN_ID",
    "isReminder": true,
    "reminderDeadline": "2025-11-07T18:00:00.000Z"
  }'
```

Set the `reminderDeadline` to about 65 minutes from now to test all reminder intervals.

### 3. Watch the Console

The server will log when reminders are checked and sent:
```
Reminder sent for task "Test Reminder" (60 min before deadline)
```

### 4. Check Your Notifications

- **Google Chat**: Look for messages in your space
- **Email**: Check your inbox

---

## 🐛 Troubleshooting

### Email Not Sending

**"Invalid login" error:**
- For Gmail: Make sure you're using an App Password, not your regular password
- For Yahoo: Enable "Allow apps that use less secure sign in"
- Check that EMAIL_USER and EMAIL_PASSWORD are correct

**"Connection timeout":**
- Check your EMAIL_HOST and EMAIL_PORT
- Make sure your firewall allows outbound connections on port 587
- Try PORT=465 with `secure: true` in emailService.ts

**"Self-signed certificate" error:**
- Add `tls: { rejectUnauthorized: false }` to transporter config (not recommended for production)

### Google Chat Webhook Not Working

**"Webhook URL not found" error:**
- Make sure you copied the entire URL including all parameters
- The URL should start with `https://chat.googleapis.com/`
- Check that the webhook is still active in your space settings

**Messages not appearing:**
- Make sure you're in the correct space
- Check if the webhook was deleted
- Try creating a new webhook

### Reminders Not Sending

**Check the logs:**
```bash
npm run dev
# Watch for "Reminder service started" message
# Watch for "Reminder sent..." messages
```

**Common issues:**
- MongoDB not running
- Task `isReminder` field not set to `true`
- `reminderDeadline` is in the past
- `reminderDeadline` is more than 60 minutes in the future
- Task is already completed

---

## 📝 Environment Variables Summary

Here's your complete `.env` configuration:

```env
# Server Configuration
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todo-tada
JWT_SECRET=todo_tada_jwt_secret_key_change_in_production_2024
JWT_EXPIRE=7d

# Email Configuration (REQUIRED for reminders)
EMAIL_HOST=smtp.gmail.com                    # Change based on your provider
EMAIL_PORT=587                               # Usually 587 or 465
EMAIL_USER=your-email@gmail.com              # Your actual email
EMAIL_PASSWORD=your-app-password             # App-specific password

# Google Chat (OPTIONAL - leave empty to use email only)
GOOGLE_CHAT_WEBHOOK_URL=https://chat.googleapis.com/v1/spaces/...

# Environment
NODE_ENV=development
```

---

## 🎉 You're All Set!

Once you've configured your email settings (and optionally Google Chat), your reminder system will automatically:

1. ✅ Check for upcoming reminders every minute
2. ✅ Send notifications at the right times
3. ✅ Track which reminders have been sent
4. ✅ Use Google Chat if available, otherwise email

Need help? Check the server logs for detailed information about reminder processing!
