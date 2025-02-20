import { Router } from 'express';
import { EmailService } from '../services/emailService';

const router = Router();
const emailService = new EmailService();

router.post('/send', async (req, res) => {
  try {
    const { from, to, subject, body } = req.body;
    
    // Basic validation
    if (!from || !to || !subject || !body) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['from', 'to', 'subject', 'body'] 
      });
    }

    const result = await emailService.sendEmail({ from, to, subject, body });
    return res.status(200).json({ 
      message: 'Email sent successfully', 
      messageId: result.messageId 
    });
  } catch (error: any) {
    console.error("Error in email send endpoint:", error);
    return res.status(500).json({ 
      error: 'Failed to send email', 
      message: error.message 
    });
  }
});

export default router;
