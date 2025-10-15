import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db_operations } from '../services/database.js';
import { ApiResponse, ConfigurationItem, CreateConfigRequest, UpdateConfigRequest } from '../types/index.js';
import { authenticateToken, requireAdmin, logActivity } from '../middleware/auth.js';

const router = Router();

// Get public configuration (no auth required)
router.get('/public', async (req: Request, res: Response) => {
  try {
    const configs = await db_operations.getPublicConfig();
    
    const configMap: Record<string, any> = {};
    configs.forEach(config => {
      // Try to parse JSON values, fallback to string
      try {
        configMap[config.key] = JSON.parse(config.value);
      } catch {
        configMap[config.key] = config.value;
      }
    });

    const response: ApiResponse = {
      success: true,
      data: configMap,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch public configuration',
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
});

// Get all configuration (admin only)
router.get('/all', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const configs = await db_operations.getAllConfig();

    const response: ApiResponse = {
      success: true,
      data: configs,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch configuration',
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
});

// Get specific configuration by key (admin only)
router.get('/:key', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const config = await db_operations.getConfigByKey(key);

    if (!config) {
      const response: ApiResponse = {
        success: false,
        error: 'Configuration not found',
        timestamp: new Date().toISOString()
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: config,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch configuration',
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
});

// Create new configuration (admin only)
router.post('/', authenticateToken, requireAdmin, logActivity('create', 'config'), async (req: Request, res: Response) => {
  try {
    const configData: CreateConfigRequest = req.body;
    
    // Basic validation
    if (!configData.key) {
      const response: ApiResponse = {
        success: false,
        error: 'Configuration key is required',
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(response);
    }

    // Check if key already exists
    const existing = await db_operations.getConfigByKey(configData.key);
    if (existing) {
      const response: ApiResponse = {
        success: false,
        error: 'Configuration key already exists',
        timestamp: new Date().toISOString()
      };
      return res.status(409).json(response);
    }

    const newConfig = await db_operations.setConfig(
      uuidv4(),
      configData.key,
      JSON.stringify(configData.value),
      configData.description || null,
      configData.isSecure ? 0 : 1  // 1 for public, 0 for secure/private
    );

    // Log activity
    if (res.locals.activityLog) {
      await db_operations.createActivityLog(
        uuidv4(),
        res.locals.activityLog.userId || null,
        res.locals.activityLog.userEmail || null,
        res.locals.activityLog.action,
        res.locals.activityLog.resource,
        JSON.stringify({ key: configData.key }),
        res.locals.activityLog.ipAddress || null,
        res.locals.activityLog.userAgent || null
      );
    }

    const response: ApiResponse = {
      success: true,
      data: newConfig,
      message: 'Configuration created successfully',
      timestamp: new Date().toISOString()
    };

    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create configuration',
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
});

// Update configuration (admin only)
router.put('/:key', authenticateToken, requireAdmin, logActivity('update', 'config'), async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const updateData: UpdateConfigRequest = req.body;

    const existingConfig = await db_operations.getConfigByKey(key);
    if (!existingConfig) {
      const response: ApiResponse = {
        success: false,
        error: 'Configuration not found',
        timestamp: new Date().toISOString()
      };
      return res.status(404).json(response);
    }

    await db_operations.setConfig(
      existingConfig.id,
      key,
      updateData.value !== undefined ? JSON.stringify(updateData.value) : existingConfig.value,
      updateData.description ?? existingConfig.description,
      updateData.isSecure ? 0 : (existingConfig.is_public || 1)
    );

    // Get the updated config
    const updatedConfig = await db_operations.getConfigByKey(key);

    // Log activity
    if (res.locals.activityLog) {
      await db_operations.createActivityLog(
        uuidv4(),
        res.locals.activityLog.userId || null,
        res.locals.activityLog.userEmail || null,
        res.locals.activityLog.action,
        res.locals.activityLog.resource,
        JSON.stringify({ key: key, changes: updateData }),
        res.locals.activityLog.ipAddress || null,
        res.locals.activityLog.userAgent || null
      );
    }

    const response: ApiResponse = {
      success: true,
      data: updatedConfig,
      message: 'Configuration updated successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update configuration',
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
});

// Delete configuration (admin only)
router.delete('/:key', authenticateToken, requireAdmin, logActivity('delete', 'config'), async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    const existingConfig = await db_operations.getConfigByKey(key);
    if (!existingConfig) {
      const response: ApiResponse = {
        success: false,
        error: 'Configuration not found',
        timestamp: new Date().toISOString()
      };
      return res.status(404).json(response);
    }

    await db_operations.deleteConfig(key);

    // Log activity
    if (res.locals.activityLog) {
      await db_operations.createActivityLog(
        uuidv4(),
        res.locals.activityLog.userId || null,
        res.locals.activityLog.userEmail || null,
        res.locals.activityLog.action,
        res.locals.activityLog.resource,
        JSON.stringify({ key: key }),
        res.locals.activityLog.ipAddress || null,
        res.locals.activityLog.userAgent || null
      );
    }

    const response: ApiResponse = {
      success: true,
      message: 'Configuration deleted successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete configuration',
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
});

export default router;