<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import apiClient from '$lib/api-client.js';
  import { getAuthStores, createScopedLogger } from '@atlantis-gr/svelte-auth';
  import { marked } from 'marked';

  let post = $state<any>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let isAuthenticated = $state(false);
  let postId = $state('');

  const logger = createScopedLogger('ViewPost');

  onMount(() => {
    try {
      const stores = getAuthStores();
      stores.isAuthenticated.subscribe((v) => (isAuthenticated = v));
    } catch (err) {
      logger.error('Auth context not found:', err);
    }

    // Get post ID from URL params
    page.subscribe(($page) => {
      const id = $page.params.id;
      if (id && id !== postId) {
        postId = id;
        loadPost(id);
      }
    });
  });

  async function loadPost(id: string) {
    try {
      loading = true;
      error = null;

      const result = await apiClient.getPost(id);

      if (result.success) {
        post = result.data;
        logger.info('Post loaded successfully:', post);
      } else {
        error = result.error || 'Post not found';
      }
    } catch (err) {
      logger.error('Failed to load post:', err);
      error = err instanceof Error ? err.message : 'Failed to load post';
    } finally {
      loading = false;
    }
  }

  function backToPosts() {
    goto('/posts');
  }

  function editPost() {
    goto(`/posts/${postId}/edit`);
  }

  async function deletePost() {
    if (!post || !confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await apiClient.deletePost(postId);
      if (result.success) {
        logger.info('Post deleted successfully');
        goto('/posts');
      } else {
        error = result.error || 'Failed to delete post';
      }
    } catch (err) {
      logger.error('Failed to delete post:', err);
      error = err instanceof Error ? err.message : 'Failed to delete post';
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function renderMarkdown(content: string): string {
    try {
      // marked can return Promise<string> or string depending on options
      const result = marked(content);
      if (typeof result === 'string') {
        return result;
      } else {
        // For async case, return content as-is for now
        console.warn('Async markdown parsing not supported in this context');
        return content.replace(/\n/g, '<br>');
      }
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return content.replace(/\n/g, '<br>'); // Fallback to line breaks
    }
  }

  function getStatusBadgeClass(status: string) {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function canEditPost() {
    return isAuthenticated && post && post.authorId;
    // In a real app, you'd check if current user ID matches post.authorId
  }
</script>

<div class="max-w-4xl mx-auto">
  <div class="mb-6">
    <nav class="flex items-center space-x-2 text-sm text-gray-500">
      <a href="/" class="hover:text-blue-600">Home</a>
      <span>›</span>
      <a href="/posts" class="hover:text-blue-600">Posts</a>
      <span>›</span>
      <span class="text-gray-900">{post?.title || 'Loading...'}</span>
    </nav>
  </div>

  {#if error}
    <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <p class="mt-1 text-sm text-red-700">{error}</p>
        </div>
      </div>
      <div class="mt-4">
        <button
          onclick={backToPosts}
          class="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          ← Back to Posts
        </button>
      </div>
    </div>
  {:else if loading}
    <div class="flex justify-center items-center py-12">
      <div class="flex items-center space-x-2">
        <svg class="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-gray-500">Loading post...</span>
      </div>
    </div>
  {:else if post}
    <article class="bg-white rounded-lg shadow-sm border border-gray-200">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusBadgeClass(post.status)}">
                {post.status}
              </span>
              <span class="text-sm text-gray-500">
                by {post.authorName} • {formatDate(post.createdAt)}
              </span>
              {#if post.updatedAt !== post.createdAt}
                <span class="text-sm text-gray-400">
                  (updated {formatDate(post.updatedAt)})
                </span>
              {/if}
            </div>
            <h1 class="text-3xl font-bold text-gray-900">{post.title}</h1>
          </div>

          <div class="flex items-center space-x-2 ml-4">
            <button
              onclick={backToPosts}
              class="text-sm text-gray-600 hover:text-blue-600 font-medium"
              title="Back to posts"
            >
              ← Back
            </button>
            {#if canEditPost()}
              <button
                onclick={editPost}
                class="text-sm text-gray-600 hover:text-yellow-600 font-medium"
                title="Edit post"
              >
                Edit
              </button>
              <button
                onclick={deletePost}
                class="text-sm text-gray-600 hover:text-red-600 font-medium"
                title="Delete post"
              >
                Delete
              </button>
            {/if}
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="px-6 py-8">
        <div class="prose prose-lg max-w-none">
          {@html renderMarkdown(post.content)}
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between text-sm text-gray-500">
          <div>
            <span>Post ID: {post.id}</span>
          </div>
          <div class="flex items-center space-x-4">
            {#if post.tags && post.tags.length > 0}
              <div class="flex items-center space-x-1">
                <span>Tags:</span>
                {#each post.tags as tag}
                  <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {tag}
                  </span>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </article>

    <!-- Related Actions -->
    <div class="mt-6 flex justify-between">
      <div class="flex space-x-3">
        <button
          onclick={backToPosts}
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Posts
        </button>
      </div>

      {#if canEditPost()}
        <div class="flex space-x-3">
          <button
            onclick={editPost}
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Edit Post
          </button>
          <button
            onclick={deletePost}
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Delete Post
          </button>
        </div>
      {/if}
    </div>
  {:else}
    <div class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Post not found</h3>
      <p class="mt-1 text-sm text-gray-500">The requested post could not be found.</p>
      <div class="mt-6">
        <button
          onclick={backToPosts}
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          ← Back to Posts
        </button>
      </div>
    </div>
  {/if}
</div>