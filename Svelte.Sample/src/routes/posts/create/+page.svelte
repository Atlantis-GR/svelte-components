<script lang="ts">
	import { goto } from '$app/navigation';
	import apiClient, { setAuthToken } from '$lib/api-client.js';
	import { onMount } from 'svelte';
	import { getAuthStores, createScopedLogger } from '@atlantis-gr/svelte-auth';

	let title = $state('');
	let excerpt = $state('');
	let content = $state('');
	let tags = $state('');
	let status = $state<'draft' | 'published'>('draft');
	let featuredImage = $state('');
	let category = $state('general');
	let publishDate = $state('');
	let seoTitle = $state('');
	let seoDescription = $state('');

	let loading = $state(false);
	let error = $state<string | null>(null);
	let success = $state(false);
	let isAuthenticated = $state(false);
	let wordCount = $state(0);
	let estimatedReadTime = $state(0);

	const logger = createScopedLogger('CreatePost');

	// Available categories
	const categories = [
		'general',
		'technology',
		'business',
		'lifestyle',
		'health',
		'education',
		'entertainment',
		'sports',
		'travel',
		'food'
	];

	// Toolbar state
	let showPreview = $state(false);
	let showAdvanced = $state(false);

	onMount(() => {
		try {
			const authStores = getAuthStores();

			authStores.user.subscribe((user) => {
				const token = user?.access_token || null;
				setAuthToken(token);
				isAuthenticated = !!token;
			});
		} catch (authError) {
			console.warn('Could not access auth stores:', authError);
		}

		publishDate = new Date().toISOString().slice(0, 16);
	});

	$effect(() => {
		const words = content
			.trim()
			.split(/\s+/)
			.filter((word) => word.length > 0);
		wordCount = words.length;
		estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));
	});

	$effect(() => {
		if (title && !seoTitle) {
			seoTitle = title;
		}
	});

	$effect(() => {
		if (excerpt && !seoDescription) {
			seoDescription = excerpt;
		}
	});

	async function handleSubmit() {
		if (!title.trim() || !content.trim()) {
			error = 'Title and content are required';
			return;
		}

		if (!isAuthenticated) {
			error = 'You must be logged in to create posts';
			return;
		}

		try {
			loading = true;
			error = null;

			// Prepare post data with enhanced fields
			const postData = {
				title: title.trim(),
				content: content.trim(),
				status,
				excerpt: excerpt.trim() || content.trim().substring(0, 200) + '...',
				tags: tags
					.split(',')
					.map((tag) => tag.trim())
					.filter((tag) => tag.length > 0),
				category,
				featuredImage: featuredImage.trim() || null,
				publishDate: status === 'published' ? new Date(publishDate).toISOString() : null,
				seo: {
					title: seoTitle.trim() || title.trim(),
					description: seoDescription.trim() || excerpt.trim() || content.trim().substring(0, 160)
				},
				stats: {
					wordCount,
					estimatedReadTime
				}
			};

			const result = await apiClient.createPost(postData);

			if (result.success) {
				success = true;
				logger.info('Post created successfully:', result.data);

				// Reset form
				resetForm();

				// Redirect to posts list after a short delay
				setTimeout(() => {
					goto('/posts');
				}, 1500);
			} else {
				error = result.error || 'Failed to create post';
			}
		} catch (err) {
			logger.error('Failed to create post:', err);
			error = err instanceof Error ? err.message : 'Failed to create post';
		} finally {
			loading = false;
		}
	}

	function resetForm() {
		title = '';
		excerpt = '';
		content = '';
		tags = '';
		status = 'draft';
		featuredImage = '';
		category = 'general';
		seoTitle = '';
		seoDescription = '';
		publishDate = new Date().toISOString().slice(0, 16);
	}

	function handleCancel() {
		goto('/posts');
	}

	function insertMarkdown(syntax: string, placeholder: string = '') {
		const textarea = document.getElementById('content') as HTMLTextAreaElement;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = content.substring(start, end);
		const replacement = selectedText || placeholder;

		let newText = '';
		switch (syntax) {
			case 'bold':
				newText = `**${replacement}**`;
				break;
			case 'italic':
				newText = `*${replacement}*`;
				break;
			case 'heading':
				newText = `## ${replacement}`;
				break;
			case 'link':
				newText = `[${replacement}](url)`;
				break;
			case 'image':
				newText = `![${replacement}](image-url)`;
				break;
			case 'code':
				newText = `\`${replacement}\``;
				break;
			case 'quote':
				newText = `> ${replacement}`;
				break;
			case 'list':
				newText = `- ${replacement}`;
				break;
		}

		content = content.substring(0, start) + newText + content.substring(end);

		// Restore focus and cursor position
		setTimeout(() => {
			textarea.focus();
			const newPos = start + newText.length;
			textarea.setSelectionRange(newPos, newPos);
		}, 0);
	}

	function handleSaveDraft() {
		status = 'draft';
		handleSubmit();
	}

	function handlePublish() {
		status = 'published';
		handleSubmit();
	}
</script>

<div class="mx-auto max-w-6xl">
	<div class="mb-6">
		<nav class="flex items-center space-x-2 text-sm text-gray-500">
			<a href="/" class="hover:text-blue-600">Home</a>
			<span>›</span>
			<a href="/posts" class="hover:text-blue-600">Posts</a>
			<span>›</span>
			<span class="text-gray-900">Create Post</span>
		</nav>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
		<!-- Main Content Area -->
		<div class="lg:col-span-3">
			<div class="rounded-lg border border-gray-200 bg-white shadow-sm">
				<div class="border-b border-gray-200 px-6 py-4">
					<div class="flex items-center justify-between">
						<div>
							<h1 class="text-2xl font-semibold text-gray-900">Create New Post</h1>
							<p class="mt-1 text-sm text-gray-600">
								Create engaging content with rich formatting and media support
							</p>
						</div>
						<div class="flex items-center space-x-2">
							<button
								type="button"
								onclick={() => (showPreview = !showPreview)}
								class="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
								class:bg-gray-100={showPreview}
							>
								{showPreview ? 'Edit' : 'Preview'}
							</button>
						</div>
					</div>
				</div>

				<form class="space-y-6 p-6">
					{#if error}
						<div class="rounded-md border border-red-200 bg-red-50 p-4">
							<div class="flex">
								<div class="flex-shrink-0">
									<svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<div class="ml-3">
									<h3 class="text-sm font-medium text-red-800">Error</h3>
									<p class="mt-1 text-sm text-red-700">{error}</p>
								</div>
							</div>
						</div>
					{/if}

					{#if success}
						<div class="rounded-md border border-green-200 bg-green-50 p-4">
							<div class="flex">
								<div class="flex-shrink-0">
									<svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<div class="ml-3">
									<h3 class="text-sm font-medium text-green-800">Success!</h3>
									<p class="mt-1 text-sm text-green-700">
										Your post has been created successfully. Redirecting to posts list...
									</p>
								</div>
							</div>
						</div>
					{/if}

					{#if !isAuthenticated}
						<div class="rounded-md border border-yellow-200 bg-yellow-50 p-4">
							<div class="flex">
								<div class="flex-shrink-0">
									<svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<div class="ml-3">
									<h3 class="text-sm font-medium text-yellow-800">Authentication Required</h3>
									<p class="mt-1 text-sm text-yellow-700">
										You need to be logged in to create posts. Please authenticate first.
									</p>
								</div>
							</div>
						</div>
					{/if}

					<!-- Title -->
					<div>
						<label for="title" class="mb-2 block text-sm font-medium text-gray-700">
							Title *
						</label>
						<input
							type="text"
							id="title"
							bind:value={title}
							placeholder="Enter a compelling title for your post..."
							disabled={loading || !isAuthenticated}
							class="w-full rounded-md border border-gray-300 px-4 py-3 text-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
							required
						/>
					</div>

					<!-- Excerpt -->
					<div>
						<label for="excerpt" class="mb-2 block text-sm font-medium text-gray-700">
							Excerpt
							<span class="text-xs text-gray-500">(Brief summary for previews)</span>
						</label>
						<textarea
							id="excerpt"
							bind:value={excerpt}
							placeholder="Write a brief summary of your post..."
							rows="3"
							disabled={loading || !isAuthenticated}
							class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
						></textarea>
					</div>

					<!-- Content Editor -->
					<div>
						<div class="mb-2 flex items-center justify-between">
							<label for="content" class="block text-sm font-medium text-gray-700">
								Content *
							</label>
							<div class="flex items-center space-x-4 text-xs text-gray-500">
								<span>{wordCount} words</span>
								<span>{estimatedReadTime} min read</span>
							</div>
						</div>

						{#if !showPreview}
							<!-- Markdown Toolbar -->
							<div
								class="flex items-center space-x-1 rounded-t-md border border-gray-300 bg-gray-50 p-2"
							>
								<button
									type="button"
									onclick={() => insertMarkdown('bold', 'bold text')}
									class="rounded p-1 hover:bg-gray-200"
									title="Bold"
								>
									<strong>B</strong>
								</button>
								<button
									type="button"
									onclick={() => insertMarkdown('italic', 'italic text')}
									class="rounded p-1 hover:bg-gray-200"
									title="Italic"
								>
									<em>I</em>
								</button>
								<button
									type="button"
									onclick={() => insertMarkdown('heading', 'Heading')}
									class="rounded p-1 hover:bg-gray-200"
									title="Heading"
								>
									H
								</button>
								<span class="h-4 w-px bg-gray-300"></span>
								<button
									type="button"
									onclick={() => insertMarkdown('link', 'link text')}
									class="rounded p-1 hover:bg-gray-200"
									title="Link"
								>
									🔗
								</button>
								<button
									type="button"
									onclick={() => insertMarkdown('image', 'alt text')}
									class="rounded p-1 hover:bg-gray-200"
									title="Image"
								>
									🖼️
								</button>
								<span class="h-4 w-px bg-gray-300"></span>
								<button
									type="button"
									onclick={() => insertMarkdown('code', 'code')}
									class="rounded p-1 hover:bg-gray-200"
									title="Code"
								>
									&lt;/&gt;
								</button>
								<button
									type="button"
									onclick={() => insertMarkdown('quote', 'quote')}
									class="rounded p-1 hover:bg-gray-200"
									title="Quote"
								>
									"
								</button>
								<button
									type="button"
									onclick={() => insertMarkdown('list', 'list item')}
									class="rounded p-1 hover:bg-gray-200"
									title="List"
								>
									•
								</button>
							</div>

							<textarea
								id="content"
								bind:value={content}
								placeholder="Write your post content here... Supports markdown formatting."
								rows="15"
								disabled={loading || !isAuthenticated}
								class="w-full rounded-b-md border border-gray-300 px-4 py-3 font-mono text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
								style="border-top: none;"
								required
							></textarea>
						{:else}
							<!-- Preview -->
							<div class="min-h-96 rounded-md border border-gray-300 bg-white p-4">
								<div class="prose max-w-none">
									<h1>{title || 'Your Title Here'}</h1>
									{#if excerpt}
										<p class="lead text-gray-600">{excerpt}</p>
									{/if}
									<div class="whitespace-pre-wrap">
										{content || 'Your content will appear here...'}
									</div>
								</div>
							</div>
						{/if}
					</div>

					<!-- Action Buttons -->
					<div class="flex items-center justify-between border-t border-gray-200 pt-6">
						<button
							type="button"
							onclick={handleCancel}
							disabled={loading}
							class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
						>
							Cancel
						</button>

						<div class="flex items-center space-x-3">
							<button
								type="button"
								onclick={handleSaveDraft}
								disabled={loading || !isAuthenticated || !title.trim() || !content.trim()}
								class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
							>
								{loading ? 'Saving...' : 'Save Draft'}
							</button>

							<button
								type="button"
								onclick={handlePublish}
								disabled={loading || !isAuthenticated || !title.trim() || !content.trim()}
								class="rounded-md border border-transparent bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
							>
								{loading ? 'Publishing...' : 'Publish Post'}
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>

		<!-- Sidebar -->
		<div class="lg:col-span-1">
			<div class="space-y-6">
				<!-- Post Settings -->
				<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
					<h3 class="mb-4 text-sm font-medium text-gray-900">Post Settings</h3>

					<div class="space-y-4">
						<!-- Category -->
						<div>
							<label for="category" class="mb-1 block text-xs font-medium text-gray-700">
								Category
							</label>
							<select
								id="category"
								bind:value={category}
								disabled={loading || !isAuthenticated}
								class="w-full rounded-md border border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
							>
								{#each categories as cat}
									<option value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
								{/each}
							</select>
						</div>

						<!-- Tags -->
						<div>
							<label for="tags" class="mb-1 block text-xs font-medium text-gray-700">
								Tags
								<span class="text-gray-500">(comma-separated)</span>
							</label>
							<input
								type="text"
								id="tags"
								bind:value={tags}
								placeholder="technology, tutorial, guide"
								disabled={loading || !isAuthenticated}
								class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
							/>
						</div>

						<!-- Featured Image -->
						<div>
							<label for="featuredImage" class="mb-1 block text-xs font-medium text-gray-700">
								Featured Image URL
							</label>
							<input
								type="url"
								id="featuredImage"
								bind:value={featuredImage}
								placeholder="https://example.com/image.jpg"
								disabled={loading || !isAuthenticated}
								class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
							/>
						</div>

						<!-- Publish Date -->
						<div>
							<label for="publishDate" class="mb-1 block text-xs font-medium text-gray-700">
								Publish Date
							</label>
							<input
								type="datetime-local"
								id="publishDate"
								bind:value={publishDate}
								disabled={loading || !isAuthenticated}
								class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
							/>
						</div>
					</div>
				</div>

				<!-- SEO Settings -->
				<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
					<button
						type="button"
						onclick={() => (showAdvanced = !showAdvanced)}
						class="mb-4 flex w-full items-center justify-between text-sm font-medium text-gray-900"
					>
						SEO Settings
						<svg
							class="h-4 w-4 transform transition-transform"
							class:rotate-180={showAdvanced}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							></path>
						</svg>
					</button>

					{#if showAdvanced}
						<div class="space-y-4">
							<!-- SEO Title -->
							<div>
								<label for="seoTitle" class="mb-1 block text-xs font-medium text-gray-700">
									SEO Title
									<span class="text-gray-500">({seoTitle.length}/60)</span>
								</label>
								<input
									type="text"
									id="seoTitle"
									bind:value={seoTitle}
									placeholder="Optimized title for search engines"
									maxlength="60"
									disabled={loading || !isAuthenticated}
									class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
								/>
							</div>

							<!-- SEO Description -->
							<div>
								<label for="seoDescription" class="mb-1 block text-xs font-medium text-gray-700">
									SEO Description
									<span class="text-gray-500">({seoDescription.length}/160)</span>
								</label>
								<textarea
									id="seoDescription"
									bind:value={seoDescription}
									placeholder="Brief description for search engine results"
									rows="3"
									maxlength="160"
									disabled={loading || !isAuthenticated}
									class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
								></textarea>
							</div>
						</div>
					{/if}
				</div>

				<!-- Post Stats -->
				<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
					<h3 class="mb-3 text-sm font-medium text-gray-900">Writing Stats</h3>
					<div class="space-y-2 text-sm text-gray-600">
						<div class="flex justify-between">
							<span>Words:</span>
							<span class="font-medium">{wordCount}</span>
						</div>
						<div class="flex justify-between">
							<span>Reading time:</span>
							<span class="font-medium">{estimatedReadTime} min</span>
						</div>
						<div class="flex justify-between">
							<span>Characters:</span>
							<span class="font-medium">{content.length}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
