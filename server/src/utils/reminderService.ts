import cron from 'node-cron';
import Task from '../models/Task';
import User from '../models/User';
import { sendEmail } from './emailService';
import { sendGoogleChatMessage } from './googleChatService';

const REMINDER_INTERVALS = [60, 30, 10, 5]; // minutes before deadline

export const checkReminders = async (): Promise<void> => {
  try {
    const now = new Date();
    
    // Find all reminders that haven't been completed
    const reminders = await Task.find({
      isReminder: true,
      isCompleted: false,
      reminderDeadline: { $exists: true, $gte: now }
    }).populate('userId');

    for (const reminder of reminders) {
      const deadline = new Date(reminder.reminderDeadline!);
      const minutesUntilDeadline = Math.floor((deadline.getTime() - now.getTime()) / 60000);

      // Check which reminders need to be sent
      for (const interval of REMINDER_INTERVALS) {
        // If we're within the interval and haven't sent this reminder yet
        if (minutesUntilDeadline <= interval && !reminder.remindersSent?.includes(interval)) {
          const user = reminder.userId as any;
          const message = `⏰ Reminder: "${reminder.name}" is due in ${interval} minutes!\n\nDescription: ${reminder.description}`;

          try {
            // Try Google Chat first
            if (process.env.GOOGLE_CHAT_WEBHOOK_URL) {
              await sendGoogleChatMessage(message);
            } else {
              // Fallback to email
              await sendEmail({
                to: user.email,
                subject: `Reminder: ${reminder.name} (${interval} min)`,
                text: message,
                html: `
                  <h2>⏰ Task Reminder</h2>
                  <p><strong>${reminder.name}</strong> is due in <strong>${interval} minutes</strong>!</p>
                  <p><strong>Description:</strong> ${reminder.description}</p>
                  <p><strong>Deadline:</strong> ${deadline.toLocaleString()}</p>
                `
              });
            }

            // Mark this interval as sent
            reminder.remindersSent = reminder.remindersSent || [];
            reminder.remindersSent.push(interval);
            await reminder.save();

            console.log(`Reminder sent for task "${reminder.name}" (${interval} min before deadline)`);
          } catch (error) {
            console.error(`Failed to send reminder for task "${reminder.name}":`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
};

// Run every minute
export const startReminderService = (): void => {
  cron.schedule('* * * * *', () => {
    checkReminders();
  });
  console.log('Reminder service started');
};
