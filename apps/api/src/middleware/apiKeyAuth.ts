import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from '../services/apiKeyService';

// Extend Express Request interface to include project and apiKey
declare global {
  namespace Express {
    interface Request {
      project?: any;
      apiKey?: any;
    }
  }
}

const apiKeyService = new ApiKeyService();

/**
 * Middleware to authenticate requests using API keys
 */
export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get API key from Authorization header or query parameter
    const authHeader = req.headers.authorization;
    const queryApiKey = req.query.api_key as string;
    
    let apiKey: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else if (queryApiKey) {
      apiKey = queryApiKey;
    }
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required' });
    }
    
    // Validate API key
    const validatedKey = await apiKeyService.validateApiKey(apiKey);
    
    if (!validatedKey) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Attach project and API key to request for use in route handlers
    req.project = validatedKey.project;
    req.apiKey = validatedKey;
    
    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};
