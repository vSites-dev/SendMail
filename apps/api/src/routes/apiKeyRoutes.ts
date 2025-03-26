import { Router } from 'express';
import { ApiKeyService } from '../services/apiKeyService';

const router = Router();
const apiKeyService = new ApiKeyService();

// Create a new API key
router.post('/', async (req, res) => {
  try {
    const { projectId, name, expiresAt } = req.body;
    
    if (!projectId || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['projectId', 'name'] 
      });
    }
    
    // Parse expiresAt if provided
    let expiryDate: Date | undefined;
    if (expiresAt) {
      expiryDate = new Date(expiresAt);
      if (isNaN(expiryDate.getTime())) {
        return res.status(400).json({ error: 'Invalid expiry date format' });
      }
    }
    
    const { apiKey, rawKey } = await apiKeyService.createApiKey(projectId, name, expiryDate);
    
    return res.status(201).json({
      message: 'API key created successfully',
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        projectId: apiKey.projectId,
        createdAt: apiKey.createdAt,
        expiresAt: apiKey.expiresAt,
      },
      // The raw key is only returned once and should be saved by the client
      key: rawKey
    });
  } catch (error: any) {
    console.error("Error creating API key:", error);
    return res.status(500).json({ 
      error: 'Failed to create API key', 
      message: error.message 
    });
  }
});

// List API keys for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    const apiKeys = await apiKeyService.listApiKeys(projectId);
    
    // Don't return the hashed key in the response
    const sanitizedKeys = apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      projectId: key.projectId,
      lastUsedAt: key.lastUsedAt,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
    }));
    
    return res.status(200).json({ apiKeys: sanitizedKeys });
  } catch (error: any) {
    console.error("Error listing API keys:", error);
    return res.status(500).json({ 
      error: 'Failed to list API keys', 
      message: error.message 
    });
  }
});

// Delete an API key
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { projectId } = req.body;
    
    if (!id || !projectId) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['id', 'projectId'] 
      });
    }
    
    await apiKeyService.deleteApiKey(id, projectId);
    
    return res.status(200).json({ message: 'API key deleted successfully' });
  } catch (error: any) {
    console.error("Error deleting API key:", error);
    return res.status(500).json({ 
      error: 'Failed to delete API key', 
      message: error.message 
    });
  }
});

export default router;
