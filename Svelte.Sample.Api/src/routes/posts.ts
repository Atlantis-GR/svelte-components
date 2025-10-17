import { Router, Request, Response } from 'express';
import { authenticateToken, optionalAuth, logActivity } from '../middleware/auth.js';
import { db_operations } from '../services/database.js';
import {
	ApiResponse,
	PaginatedResponse,
	Post,
	CreatePostRequest,
	UpdatePostRequest
} from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get published posts (public endpoint)
router.get('/public', optionalAuth, async (req: Request, res: Response) => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
		const offset = (page - 1) * limit;

		const posts = await db_operations.getPublishedPosts(limit, offset);
		const totalCountResult = await db_operations.getPostsCount(1);
		const totalCount = totalCountResult.count;

		const response: PaginatedResponse<Post> = {
			success: true,
			data: posts.map((post) => ({
				id: post.id,
				title: post.title,
				content: post.content,
				authorId: post.author_id,
				authorEmail: post.author_email,
				authorName: post.author_email.split('@')[0], // Simple name extraction
				status: post.is_published ? 'published' : 'draft',
				tags: [], // SQLite schema doesn't include tags
				createdAt: post.created_at,
				updatedAt: post.updated_at
			})),
			pagination: {
				page,
				limit,
				total: totalCount,
				totalPages: Math.ceil(totalCount / limit),
				hasNext: page * limit < totalCount,
				hasPrev: page > 1
			},
			timestamp: new Date().toISOString()
		};

		res.json(response);
	} catch (error) {
		const response: ApiResponse = {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch posts',
			timestamp: new Date().toISOString()
		};

		res.status(500).json(response);
	}
});

// Get all posts (authenticated users only)
router.get('/', authenticateToken, async (req: Request, res: Response) => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
		const offset = (page - 1) * limit;

		const posts = await db_operations.getAllPosts(limit, offset);
		const publishedCountResult = await db_operations.getPostsCount(1);
		const unpublishedCountResult = await db_operations.getPostsCount(0);
		const totalCount = publishedCountResult.count + unpublishedCountResult.count;

		const response: PaginatedResponse<Post> = {
			success: true,
			data: posts.map((post) => ({
				id: post.id,
				title: post.title,
				content: post.content,
				authorId: post.author_id,
				authorEmail: post.author_email,
				authorName: post.author_email.split('@')[0],
				status: post.is_published ? 'published' : 'draft',
				tags: [],
				createdAt: post.created_at,
				updatedAt: post.updated_at
			})),
			pagination: {
				page,
				limit,
				total: totalCount,
				totalPages: Math.ceil(totalCount / limit),
				hasNext: page * limit < totalCount,
				hasPrev: page > 1
			},
			timestamp: new Date().toISOString()
		};

		res.json(response);
	} catch (error) {
		const response: ApiResponse = {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch posts',
			timestamp: new Date().toISOString()
		};

		res.status(500).json(response);
	}
});

// Get single post by ID
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const post = await db_operations.getPostById(id);

		if (!post) {
			const response: ApiResponse = {
				success: false,
				error: 'Post not found',
				timestamp: new Date().toISOString()
			};
			return res.status(404).json(response);
		}

		// Only allow viewing unpublished posts if user is authenticated and is the author
		if (!post.is_published && (!req.user || req.user.sub !== post.author_id)) {
			const response: ApiResponse = {
				success: false,
				error: 'Post not found',
				timestamp: new Date().toISOString()
			};
			return res.status(404).json(response);
		}

		const postData: Post = {
			id: post.id,
			title: post.title,
			content: post.content,
			authorId: post.author_id,
			authorEmail: post.author_email,
			authorName: post.author_email.split('@')[0],
			status: post.is_published ? 'published' : 'draft',
			tags: [],
			createdAt: post.created_at,
			updatedAt: post.updated_at
		};

		const response: ApiResponse<Post> = {
			success: true,
			data: postData,
			timestamp: new Date().toISOString()
		};

		res.json(response);
	} catch (error) {
		const response: ApiResponse = {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch post',
			timestamp: new Date().toISOString()
		};

		res.status(500).json(response);
	}
});

// Create new post
router.post(
	'/',
	authenticateToken,
	logActivity('create', 'post'),
	async (req: Request, res: Response) => {
		try {
			const postData: CreatePostRequest = req.body;

			if (!postData.title || !postData.content) {
				const response: ApiResponse = {
					success: false,
					error: 'Title and content are required',
					timestamp: new Date().toISOString()
				};
				return res.status(400).json(response);
			}

			const postId = uuidv4();
			const isPublished = postData.status === 'published' ? 1 : 0;

			await db_operations.createPost(
				postId,
				postData.title,
				postData.content,
				req.user!.sub,
				req.user!.email,
				isPublished
			);

			// Log activity
			if (res.locals.activityLog) {
				await db_operations.createActivityLog(
					uuidv4(),
					res.locals.activityLog.userId || null,
					res.locals.activityLog.userEmail || null,
					res.locals.activityLog.action,
					res.locals.activityLog.resource,
					JSON.stringify({ postId, title: postData.title }),
					res.locals.activityLog.ipAddress || null,
					res.locals.activityLog.userAgent || null
				);
			}

			const newPost = await db_operations.getPostById(postId);
			const postResponse: Post = {
				id: newPost.id,
				title: newPost.title,
				content: newPost.content,
				authorId: newPost.author_id,
				authorEmail: newPost.author_email,
				authorName: newPost.author_email.split('@')[0],
				status: newPost.is_published ? 'published' : 'draft',
				tags: [],
				createdAt: newPost.created_at,
				updatedAt: newPost.updated_at
			};

			const response: ApiResponse<Post> = {
				success: true,
				data: postResponse,
				message: 'Post created successfully',
				timestamp: new Date().toISOString()
			};

			res.status(201).json(response);
		} catch (error) {
			const response: ApiResponse = {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to create post',
				timestamp: new Date().toISOString()
			};

			res.status(500).json(response);
		}
	}
);

// Update post
router.put(
	'/:id',
	authenticateToken,
	logActivity('update', 'post'),
	async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const updateData: UpdatePostRequest = req.body;

			const existingPost = await db_operations.getPostById(id);
			if (!existingPost) {
				const response: ApiResponse = {
					success: false,
					error: 'Post not found',
					timestamp: new Date().toISOString()
				};
				return res.status(404).json(response);
			}

			// Only allow updating own posts
			if (existingPost.author_id !== req.user!.sub) {
				const response: ApiResponse = {
					success: false,
					error: 'Not authorized to update this post',
					timestamp: new Date().toISOString()
				};
				return res.status(403).json(response);
			}

			const title = updateData.title ?? existingPost.title;
			const content = updateData.content ?? existingPost.content;
			const isPublished = updateData.status
				? updateData.status === 'published'
					? 1
					: 0
				: existingPost.is_published;

			await db_operations.updatePost(title, content, isPublished, id, existingPost.author_id);

			// Log activity
			if (res.locals.activityLog) {
				await db_operations.createActivityLog(
					uuidv4(),
					res.locals.activityLog.userId || null,
					res.locals.activityLog.userEmail || null,
					res.locals.activityLog.action,
					res.locals.activityLog.resource,
					JSON.stringify({ postId: id, changes: updateData }),
					res.locals.activityLog.ipAddress || null,
					res.locals.activityLog.userAgent || null
				);
			}

			const updatedPost = await db_operations.getPostById(id);
			const postResponse: Post = {
				id: updatedPost.id,
				title: updatedPost.title,
				content: updatedPost.content,
				authorId: updatedPost.author_id,
				authorEmail: updatedPost.author_email,
				authorName: updatedPost.author_email.split('@')[0],
				status: updatedPost.is_published ? 'published' : 'draft',
				tags: [],
				createdAt: updatedPost.created_at,
				updatedAt: updatedPost.updated_at
			};

			const response: ApiResponse<Post> = {
				success: true,
				data: postResponse,
				message: 'Post updated successfully',
				timestamp: new Date().toISOString()
			};

			res.json(response);
		} catch (error) {
			const response: ApiResponse = {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to update post',
				timestamp: new Date().toISOString()
			};

			res.status(500).json(response);
		}
	}
);

// Delete post
router.delete(
	'/:id',
	authenticateToken,
	logActivity('delete', 'post'),
	async (req: Request, res: Response) => {
		try {
			const { id } = req.params;

			const existingPost = await db_operations.getPostById(id);
			if (!existingPost) {
				const response: ApiResponse = {
					success: false,
					error: 'Post not found',
					timestamp: new Date().toISOString()
				};
				return res.status(404).json(response);
			}

			// Only allow deleting own posts
			if (existingPost.author_id !== req.user!.sub) {
				const response: ApiResponse = {
					success: false,
					error: 'Not authorized to delete this post',
					timestamp: new Date().toISOString()
				};
				return res.status(403).json(response);
			}

			await db_operations.deletePost(id, existingPost.author_id);

			// Log activity
			if (res.locals.activityLog) {
				await db_operations.createActivityLog(
					uuidv4(),
					res.locals.activityLog.userId || null,
					res.locals.activityLog.userEmail || null,
					res.locals.activityLog.action,
					res.locals.activityLog.resource,
					JSON.stringify({ postId: id, title: existingPost.title }),
					res.locals.activityLog.ipAddress || null,
					res.locals.activityLog.userAgent || null
				);
			}

			const response: ApiResponse = {
				success: true,
				message: 'Post deleted successfully',
				timestamp: new Date().toISOString()
			};

			res.json(response);
		} catch (error) {
			const response: ApiResponse = {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to delete post',
				timestamp: new Date().toISOString()
			};

			res.status(500).json(response);
		}
	}
);

export default router;
