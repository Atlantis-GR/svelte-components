import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../types/index.js';

// Helper function to get the issuer/authority from a JWT token
function getTokenIssuer(token: string): string | null {
	try {
		const decoded = jwt.decode(token, { complete: true });
		if (
			decoded &&
			typeof decoded === 'object' &&
			decoded.payload &&
			typeof decoded.payload === 'object'
		) {
			return (decoded.payload as any).iss || null;
		}
		return null;
	} catch (error) {
		return null;
	}
}

// Helper function to validate OAuth token structure and basic claims
function validateTokenStructure(token: string): { valid: boolean; payload?: any; error?: string } {
	try {
		const decoded = jwt.decode(token, { complete: true });

		if (!decoded || typeof decoded !== 'object') {
			return { valid: false, error: 'Invalid token format' };
		}

		const payload = decoded.payload as any;

		// Check for required OAuth claims
		if (!payload.sub) {
			return { valid: false, error: 'Missing subject (sub) claim' };
		}

		if (!payload.iss) {
			return { valid: false, error: 'Missing issuer (iss) claim' };
		}

		// Check expiration
		if (payload.exp && Date.now() >= payload.exp * 1000) {
			return { valid: false, error: 'Token expired' };
		}

		return { valid: true, payload };
	} catch (error) {
		return { valid: false, error: 'Token decode error: ' + error };
	}
}

// Extend Express Request to include user from OAuth
declare global {
	namespace Express {
		interface Request {
			user?: {
				sub: string;
				email: string;
				name?: string;
				given_name?: string;
				family_name?: string;
				[key: string]: any;
			};
		}
	}
}

// OAuth-compatible middleware to extract and validate user from Authorization header
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

	if (!token) {
		const response: ApiResponse = {
			success: false,
			error: 'Access token required',
			timestamp: new Date().toISOString()
		};
		res.status(401).json(response);
		return;
	}

	// Validate token structure and extract claims
	const validation = validateTokenStructure(token);

	if (!validation.valid) {
		console.warn('Token validation failed:', validation.error);

		// Fallback: try to decode the custom demo format for backwards compatibility
		try {
			const decoded = Buffer.from(token, 'base64').toString();
			const [userId, email, name] = decoded.split(':');

			if (userId && email) {
				console.log('Using demo token format for development');
				req.user = {
					sub: userId,
					email: email,
					name: name || email,
					given_name: name?.split(' ')[0] || email.split('@')[0],
					family_name: name?.split(' ')[1] || ''
				};
				next();
				return;
			}
		} catch (error) {
			// Demo format also failed
		}

		const response: ApiResponse = {
			success: false,
			error: validation.error || 'Invalid or expired token',
			timestamp: new Date().toISOString()
		};
		res.status(403).json(response);
		return;
	}

	// Extract user information from valid OAuth token
	const payload = validation.payload;
	req.user = {
		sub: payload.sub,
		email: payload.email || payload.preferred_username || `user-${payload.sub}`,
		name: payload.name || payload.given_name || payload.preferred_username || 'Unknown User',
		given_name: payload.given_name || payload.name?.split(' ')[0] || 'User',
		family_name: payload.family_name || payload.name?.split(' ')[1] || '',
		// Include any additional claims
		...payload
	};

	console.log(
		`Authenticated user: ${req.user!.email} (${req.user!.sub}) from issuer: ${payload.iss}`
	);
	next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1];

	if (token) {
		// Try OAuth token first
		const validation = validateTokenStructure(token);
		if (validation.valid) {
			const payload = validation.payload;
			req.user = {
				sub: payload.sub,
				email: payload.email || payload.preferred_username || `user-${payload.sub}`,
				name: payload.name || payload.given_name || payload.preferred_username || 'Unknown User',
				given_name: payload.given_name || payload.name?.split(' ')[0] || 'User',
				family_name: payload.family_name || payload.name?.split(' ')[1] || '',
				...payload
			};
		} else {
			// Fallback to demo format
			try {
				const decoded = Buffer.from(token, 'base64').toString();
				const [userId, email, name] = decoded.split(':');

				if (userId && email) {
					req.user = {
						sub: userId,
						email: email,
						name: name || email,
						given_name: name?.split(' ')[0] || email.split('@')[0],
						family_name: name?.split(' ')[1] || ''
					};
				}
			} catch (error) {
				// Ignore invalid tokens for optional auth
			}
		}
	}

	next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
	if (!req.user) {
		const response: ApiResponse = {
			success: false,
			error: 'Authentication required',
			timestamp: new Date().toISOString()
		};
		res.status(401).json(response);
		return;
	}

	// For demo purposes, treat admin@example.com as admin
	if (req.user.email !== 'admin@example.com') {
		const response: ApiResponse = {
			success: false,
			error: 'Administrator access required',
			timestamp: new Date().toISOString()
		};
		res.status(403).json(response);
		return;
	}

	next();
}

export function logActivity(action: string, resource: string) {
	return async (req: Request, res: Response, next: NextFunction) => {
		// Store activity info for later logging
		res.locals.activityLog = {
			action,
			resource,
			userId: req.user?.sub,
			userEmail: req.user?.email,
			ipAddress: req.ip || req.connection.remoteAddress,
			userAgent: req.get('User-Agent')
		};

		next();
	};
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
	console.error('API Error:', err);

	const response: ApiResponse = {
		success: false,
		error: err.message || 'Internal server error',
		timestamp: new Date().toISOString()
	};

	// Don't leak sensitive information in production
	if (process.env.NODE_ENV === 'production') {
		response.error = 'Internal server error';
	}

	res.status(500).json(response);
}

export function notFound(req: Request, res: Response) {
	const response: ApiResponse = {
		success: false,
		error: `Route ${req.method} ${req.path} not found`,
		timestamp: new Date().toISOString()
	};

	res.status(404).json(response);
}
