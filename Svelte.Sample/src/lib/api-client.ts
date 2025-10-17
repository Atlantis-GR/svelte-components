import type { UserProfile } from '../../../Svelte.Auth/src/lib/types.js';
import type { User } from 'oidc-client-ts';

// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Types for API responses
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

export interface Post {
	id: string;
	title: string;
	content: string;
	authorId: string;
	authorEmail: string;
	authorName: string;
	status: 'draft' | 'published' | 'archived';
	tags: string[];
	createdAt: string;
	updatedAt: string;
}

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

function createAuthHeader(token: string | null): Record<string, string> {
	return token ? { Authorization: `Bearer ${token}` } : {};
}

let currentAuthToken: string | null = null;
let authStatusCallbacks: ((isAuth: boolean) => void)[] = [];

export function setAuthToken(token: string | null) {
	const wasAuthenticated = !!currentAuthToken;
	currentAuthToken = token;
	const isAuthenticated = !!token;

	if (wasAuthenticated !== isAuthenticated) {
		authStatusCallbacks.forEach((callback) => callback(isAuthenticated));
	}
}

export function getCurrentAuthToken(): string | null {
	return currentAuthToken;
}

export function isAuthenticated(): boolean {
	return !!currentAuthToken;
}

export function onAuthStatusChange(callback: (isAuth: boolean) => void): () => void {
	authStatusCallbacks.push(callback);

	return () => {
		const index = authStatusCallbacks.indexOf(callback);
		if (index > -1) {
			authStatusCallbacks.splice(index, 1);
		}
	};
}

// Generic API request helper
async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {},
	requireAuth = false
): Promise<ApiResponse<T>> {
	const url = `${API_BASE_URL}${endpoint}`;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...((options.headers as Record<string, string>) || {})
	};

	if (requireAuth) {
		const token = getCurrentAuthToken();
		if (!token) {
			throw new Error('Authentication required');
		}
		Object.assign(headers, createAuthHeader(token));
	}

	const response = await fetch(url, { ...options, headers });
	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error || `HTTP ${response.status}`);
	}

	return data;
}

// API Client functions
export const apiClient = {
	// Health check
	async getHealth() {
		return apiRequest<{
			status: string;
			timestamp: string;
			version: string;
			environment: string;
			database: { status: string; responseTime?: number };
			uptime: number;
		}>('/health');
	},

	// Configuration endpoints
	async getPublicConfig() {
		return apiRequest<Record<string, any>>('/config/public');
	},

	async getAllConfig() {
		return apiRequest<ConfigurationItem[]>('/config/all', {}, true);
	},

	async createConfig(config: {
		key: string;
		value: any;
		description?: string;
		isSecure?: boolean;
	}) {
		return apiRequest<ConfigurationItem>(
			'/config',
			{
				method: 'POST',
				body: JSON.stringify(config)
			},
			true
		);
	},

	// Posts endpoints
	async getPublicPosts(page = 1, limit = 10): Promise<PaginatedResponse<Post>> {
		return apiRequest<Post[]>(`/posts/public?page=${page}&limit=${limit}`) as Promise<
			PaginatedResponse<Post>
		>;
	},

	async getAllPosts(page = 1, limit = 10): Promise<PaginatedResponse<Post>> {
		return apiRequest<Post[]>(`/posts?page=${page}&limit=${limit}`, {}, true) as Promise<
			PaginatedResponse<Post>
		>;
	},

	async getPost(id: string) {
		return apiRequest<Post>(`/posts/${id}`, {}, true); // Require auth for getting individual posts
	},

	async createPost(post: { title: string; content: string; status?: 'draft' | 'published' }) {
		return apiRequest<Post>(
			'/posts',
			{
				method: 'POST',
				body: JSON.stringify(post)
			},
			true
		);
	},

	async updatePost(
		id: string,
		updates: { title?: string; content?: string; status?: 'draft' | 'published' | 'archived' }
	) {
		return apiRequest<Post>(
			`/posts/${id}`,
			{
				method: 'PUT',
				body: JSON.stringify(updates)
			},
			true
		);
	},

	async deletePost(id: string) {
		return apiRequest<{ message: string }>(
			`/posts/${id}`,
			{
				method: 'DELETE'
			},
			true
		);
	},

	// Auth endpoints
	async getCurrentUser() {
		return apiRequest<{ user: UserProfile }>('/auth/me', {}, true);
	},

	async validateToken() {
		return apiRequest<{ valid: boolean; user: UserProfile }>(
			'/auth/validate',
			{
				method: 'POST'
			},
			true
		);
	}
};

// Export for use in Svelte components
export default apiClient;
