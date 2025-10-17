import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '../services/database.js';
import { HealthCheck, ApiResponse } from '../types/index.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
	try {
		const dbHealth = await checkDatabaseHealth();
		const memoryUsage = process.memoryUsage();

		const health: HealthCheck = {
			status: dbHealth.connected ? 'healthy' : 'unhealthy',
			timestamp: new Date().toISOString(),
			version: process.env.npm_package_version || 'unknown',
			environment: process.env.NODE_ENV || 'development',
			database: {
				status: dbHealth.connected ? 'connected' : 'disconnected',
				responseTime: dbHealth.responseTime
			},
			uptime: process.uptime(),
			memory: {
				rss: memoryUsage.rss,
				heapTotal: memoryUsage.heapTotal,
				heapUsed: memoryUsage.heapUsed,
				external: memoryUsage.external
			}
		};

		const response: ApiResponse<HealthCheck> = {
			success: true,
			data: health,
			timestamp: new Date().toISOString()
		};

		res.status(dbHealth.connected ? 200 : 503).json(response);
	} catch (error) {
		const response: ApiResponse = {
			success: false,
			error: 'Health check failed',
			timestamp: new Date().toISOString()
		};
		res.status(503).json(response);
	}
});

export default router;
