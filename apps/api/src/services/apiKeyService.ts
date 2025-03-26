import { PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';
import crypto from 'crypto';

// Define the ApiKey type based on the schema
type ApiKey = {
  id: string;
  name: string;
  key: string;
  projectId: string;
  project?: any;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class ApiKeyService {
  /**
   * Create a new API key for a project
   */
  async createApiKey(projectId: string, name: string, expiresAt?: Date): Promise<{ apiKey: ApiKey; rawKey: string }> {
    // Generate a secure random API key
    const rawKey = `sk_${crypto.randomBytes(24).toString('hex')}`;
    
    // Hash the key for storage
    const hashedKey = this.hashApiKey(rawKey);
    
    const apiKey = await (prisma.$queryRaw`
      INSERT INTO api_keys (id, name, key, project_id, expires_at, created_at, updated_at)
      VALUES (
        ${crypto.randomUUID()},
        ${name},
        ${hashedKey},
        ${projectId},
        ${expiresAt},
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING id, name, key, project_id as "projectId", last_used_at as "lastUsedAt", 
                expires_at as "expiresAt", created_at as "createdAt", updated_at as "updatedAt"
    ` as unknown as Promise<ApiKey[]>);
    
    // Return both the API key record and the raw key
    // The raw key will only be shown once to the user
    return { apiKey: apiKey[0], rawKey };
  }
  
  /**
   * Validate an API key
   */
  async validateApiKey(rawKey: string): Promise<ApiKey | null> {
    if (!rawKey) return null;
    
    const hashedKey = this.hashApiKey(rawKey);
    
    const apiKeys = await (prisma.$queryRaw`
      SELECT ak.*, p.* 
      FROM api_keys ak
      JOIN projects p ON ak.project_id = p.id
      WHERE ak.key = ${hashedKey}
    ` as unknown as Promise<(ApiKey & { project: any })[]>);
    
    if (!apiKeys.length) return null;
    
    const apiKey = apiKeys[0];
    
    // Check if the key has expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }
    
    // Update last used timestamp
    await (prisma.$executeRaw`
      UPDATE api_keys
      SET last_used_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${apiKey.id}
    ` as unknown as Promise<void>);
    
    return apiKey;
  }
  
  /**
   * List API keys for a project
   */
  async listApiKeys(projectId: string): Promise<ApiKey[]> {
    return (prisma.$queryRaw`
      SELECT id, name, project_id as "projectId", last_used_at as "lastUsedAt", 
             expires_at as "expiresAt", created_at as "createdAt", updated_at as "updatedAt"
      FROM api_keys
      WHERE project_id = ${projectId}
      ORDER BY created_at DESC
    ` as unknown as Promise<ApiKey[]>);
  }
  
  /**
   * Delete an API key
   */
  async deleteApiKey(id: string, projectId: string): Promise<void> {
    await (prisma.$executeRaw`
      DELETE FROM api_keys
      WHERE id = ${id} AND project_id = ${projectId}
    ` as unknown as Promise<void>);
  }
  
  /**
   * Hash an API key for secure storage
   */
  private hashApiKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }
}
