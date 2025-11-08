import axios from 'axios';

interface ChatMessage {
  text: string;
}

export const sendGoogleChatMessage = async (message: string): Promise<void> => {
  try {
    const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.log('Google Chat webhook URL not configured, skipping message');
      return;
    }

    const payload: ChatMessage = {
      text: message
    };

    await axios.post(webhookUrl, payload);
    console.log('Google Chat message sent successfully');
  } catch (error) {
    console.error('Error sending Google Chat message:', error);
    throw error;
  }
};
