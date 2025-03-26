import { Router } from 'express';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { EmailService } from '../services/emailService';

const router = Router();
const emailService = new EmailService();

// Apply API key authentication to all routes
router.use(apiKeyAuth);

// Public API endpoints

// Send an email
router.post('/email/send', async (req, res) => {
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
      success: true, 
      messageId: result.messageId 
    });
  } catch (error: any) {
    console.error("Error in public API email send endpoint:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get contacts
router.get('/contacts', async (req, res) => {
  try {
    const projectId = req.project.id;
    
    // Get contacts for the project
    const contacts = await prisma.contact.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    
    return res.status(200).json({ 
      success: true, 
      contacts 
    });
  } catch (error: any) {
    console.error("Error in public API get contacts endpoint:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Create a contact
router.post('/contacts', async (req, res) => {
  try {
    const projectId = req.project.id;
    const { email, name, metadata } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }
    
    // Create the contact
    const contact = await prisma.contact.create({
      data: {
        email,
        name,
        metadata,
        projectId,
      },
    });
    
    return res.status(201).json({ 
      success: true, 
      contact 
    });
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'A contact with this email already exists'
      });
    }
    
    console.error("Error in public API create contact endpoint:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get campaigns
router.get('/campaigns', async (req, res) => {
  try {
    const projectId = req.project.id;
    
    // Get campaigns for the project
    const campaigns = await prisma.campaign.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    
    return res.status(200).json({ 
      success: true, 
      campaigns 
    });
  } catch (error: any) {
    console.error("Error in public API get campaigns endpoint:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get campaign details
router.get('/campaigns/:id', async (req, res) => {
  try {
    const projectId = req.project.id;
    const { id } = req.params;
    
    // Get campaign details
    const campaign = await prisma.campaign.findFirst({
      where: { 
        id,
        projectId 
      },
      include: {
        contacts: true,
        emails: true
      }
    });
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      campaign 
    });
  } catch (error: any) {
    console.error("Error in public API get campaign details endpoint:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

import prisma from '../lib/prisma';

export default router;
