<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import apiClient, { isAuthenticated, onAuthStatusChange, setAuthToken } from '$lib/api-client.js';
  import { createScopedLogger, getAuthStores } from '@atlantis-gr/svelte-auth';
  import AuthDebug from '$lib/AuthDebug.svelte';
  import { marked } from 'marked';

  let posts = $state<any[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let isAuth = $state(false);
  let currentPage = $state(1);
  let totalPages = $state(1);
  let pagination = $state<any>(null);

  const logger = createScopedLogger('PostsList');

  onMount(() => {
    try {
      const authStores = getAuthStores();
      
      authStores.user.subscribe((user) => {
        const token = user?.access_token || null;
        setAuthToken(token);
      });
      
    } catch (authError) {
      console.warn('Could not access auth stores:', authError);
    }

    // Set initial auth status
    isAuth = isAuthenticated();
    
    const unsubscribe = onAuthStatusChange((authStatus) => {
      isAuth = authStatus;
      loadPosts(); // Reload posts when auth status changes
    });
    
    // Load posts initially
    loadPosts();
    
    // Cleanup on unmount
    return unsubscribe;
  });

  async function loadPosts(page = 1) {
    try {
      loading = true;
      error = null;
      
      console.log('Loading posts, authenticated:', isAuth);
      
      let result;
      if (isAuth) {
        result = await apiClient.getAllPosts(page, 10);
        logger.info('Loaded all posts for authenticated user');
      } else {
        result = await apiClient.getPublicPosts(page, 10);
        logger.info('Loaded public posts');
      }

      if (result.success) {
        posts = result.data || [];
        pagination = result.pagination;
        currentPage = pagination?.page || 1;
        totalPages = pagination?.totalPages || 1;
      } else {
        error = result.error || 'Failed to load posts';
      }
    } catch (err) {
      logger.error('Failed to load posts:', err);
      error = err instanceof Error ? err.message : 'Failed to load posts';
    } finally {
      loading = false;
    }
  }

  function handlePageChange(page: number) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      loadPosts(page);
    }
  }

  function createPost() {
    goto('/posts/create');
  }

  function viewPost(postId: string) {
    goto(`/posts/${postId}`);
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
        return content;
      }
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return content; // Fallback to plain text
    }
  }

  function getPlainTextPreview(content: string, maxLength: number = 200): string {
    // Convert markdown to plain text for preview
    let plainText = content
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links but keep text
      .replace(/>\s+/g, '') // Remove quotes
      .replace(/[-*+]\s+/g, '') // Remove list markers
      .trim();
    
    return plainText.length > maxLength ? plainText.slice(0, maxLength) + '...' : plainText;
  }

  function editPost(postId: string) {
    goto(`/posts/${postId}/edit`);
  }

  async function deletePost(postId: string, postTitle: string) {
    if (!confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await apiClient.deletePost(postId);
      if (result.success) {
        logger.info('Post deleted successfully');
        // Reload the current page
        loadPosts(currentPage);
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
</script>

<div class="max-w-6xl mx-auto">
  <AuthDebug />
  <div class="mb-6">
    <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-4">
      <a href="/" class="hover:text-blue-600">Home</a>
      <span>›</span>
      <span class="text-gray-900">Posts</span>
    </nav>
    
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Posts</h1>
        <p class="mt-1 text-sm text-gray-600">
          {#if isAuth}
            Manage your blog posts and view all content
          {:else}
            Discover published articles and stories
          {/if}
        </p>
      </div>
      
      {#if isAuth}
        <button
          onclick={createPost}
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Create Post
        </button>
      {/if}
    </div>
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
    </div>
  {/if}

  {#if loading}
    <div class="flex justify-center items-center py-12">
      <div class="flex items-center space-x-2">
        <svg class="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-gray-500">Loading posts...</span>
      </div>
    </div>
  {:else if posts.length === 0}
    <div class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No posts found</h3>
      <p class="mt-1 text-sm text-gray-500">
        {#if isAuth}
          Get started by creating your first post.
        {:else}
          No published posts are available at the moment.
        {/if}
      </p>
      {#if isAuth}
        <div class="mt-6">
          <button
            onclick={createPost}
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Create your first post
          </button>
        </div>
      {/if}
    </div>
  {:else}
    <div class="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
      <div class="divide-y divide-gray-200">
        {#each posts as post}
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusBadgeClass(post.status)}">
                    {post.status}
                  </span>
                  <span class="text-sm text-gray-500">
                    by {post.authorName} • {formatDate(post.createdAt)}
                  </span>
                </div>
                
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  <button
                    onclick={() => viewPost(post.id)}
                    class="hover:text-blue-600 text-left"
                  >
                    {post.title}
                  </button>
                </h3>
                
                <p class="text-gray-600 text-sm line-clamp-2">
                  {getPlainTextPreview(post.content, 200)}
                </p>
              </div>
              
              {#if isAuth}
                <div class="flex items-center space-x-2 ml-4">
                  <button
                    onclick={() => viewPost(post.id)}
                    class="text-sm text-gray-600 hover:text-blue-600 font-medium"
                    title="View post"
                  >
                    View
                  </button>
                  <button
                    onclick={() => editPost(post.id)}
                    class="text-sm text-gray-600 hover:text-yellow-600 font-medium"
                    title="Edit post"
                  >
                    Edit
                  </button>
                  <button
                    onclick={() => deletePost(post.id, post.title)}
                    class="text-sm text-gray-600 hover:text-red-600 font-medium"
                    title="Delete post"
                  >
                    Delete
                  </button>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Pagination -->
    {#if pagination && totalPages > 1}
      <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 mt-6">
        <div class="flex justify-between flex-1 sm:hidden">
          <button
            onclick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onclick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            class="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing page <span class="font-medium">{currentPage}</span> of{' '}
              <span class="font-medium">{totalPages}</span>
              ({pagination.total} total posts)
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onclick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
                {#if page === currentPage}
                  <span class="relative inline-flex items-center px-4 py-2 border border-blue-500 bg-blue-50 text-sm font-medium text-blue-600">
                    {page}
                  </span>
                {:else if page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)}
                  <button
                    onclick={() => handlePageChange(page)}
                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {page}
                  </button>
                {:else if page === currentPage - 2 || page === currentPage + 2}
                  <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                {/if}
              {/each}
              
              <button
                onclick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>