// OAuth User Interface (matches what comes from auth providers)
export interface User {
	sub: string; // Subject (user ID)
	email: string; // Email address
	name?: string; // Full name
	given_name?: string; // First name
	family_name?: string; // Last name
	picture?: string; // Profile picture URL
	[key: string]: any; // Allow additional claims
}

// Configuration Management
export interface ConfigurationItem {
	id: string;
	key: string;
	value: any;
	type: 'string' | 'number' | 'boolean' | 'object' | 'array';
	description?: string;
	category?: string;
	isSecure?: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateConfigRequest {
	key: string;
	value: any;
	type: 'string' | 'number' | 'boolean' | 'object' | 'array';
	description?: string;
	category?: string;
	isSecure?: boolean;
}

export interface UpdateConfigRequest {
	value?: any;
	description?: string;
	category?: string;
	isSecure?: boolean;
}

// Posts/Content Management
export interface Post {
	id: string;
	title: string;
	content: string;
	authorId: string;
	authorEmail: string;
	authorName: string;
	status: 'draft' | 'published' | 'archived';
	tags: string[];
	metadata?: Record<string, any>;
	createdAt: string;
	updatedAt: string;
	publishedAt?: string;
}

export interface CreatePostRequest {
	title: string;
	content: string;
	status?: 'draft' | 'published';
	tags?: string[];
	metadata?: Record<string, any>;
}

export interface UpdatePostRequest {
	title?: string;
	content?: string;
	status?: 'draft' | 'published' | 'archived';
	tags?: string[];
	metadata?: Record<string, any>;
}

// Activity Logging
export interface ActivityLog {
	id: string;
	action: string;
	resource: string;
	resourceId?: string;
	userId?: string;
	userEmail?: string;
	ipAddress?: string;
	userAgent?: string;
	details?: Record<string, any>;
	timestamp: string;
}

export interface CreateActivityLogRequest {
	action: string;
	resource: string;
	resourceId?: string;
	userId?: string;
	userEmail?: string;
	ipAddress?: string;
	userAgent?: string;
	details?: Record<string, any>;
}

// API Response Types
export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
	timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

// Query Parameters
export interface PaginationParams {
	page?: number;
	limit?: number;
}

export interface PostQueryParams extends PaginationParams {
	status?: 'draft' | 'published' | 'archived';
	authorId?: string;
	tags?: string;
	search?: string;
}

export interface ActivityLogQueryParams extends PaginationParams {
	action?: string;
	resource?: string;
	userId?: string;
	startDate?: string;
	endDate?: string;
}

// Health Check
export interface HealthCheck {
	status: 'healthy' | 'unhealthy' | 'degraded';
	timestamp: string;
	version: string;
	environment: string;
	database: {
		status: 'connected' | 'disconnected' | 'error';
		responseTime?: number;
	};
	uptime: number;
	memory: {
		rss: number;
		heapTotal: number;
		heapUsed: number;
		external: number;
	};
}
