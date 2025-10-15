<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import apiClient, { setAuthToken } from '$lib/api-client.js';
  import { getAuthStores, createScopedLogger } from '@atlantis-gr/svelte-auth';

  let post = $state<any>(null);
  let title = $state('');
  let content = $state('');
  let status = $state<'draft' | 'published' | 'archived'>('draft');
  let loading = $state(true);
  let saving = $state(false);
  let error = $state<string | null>(null);
  let success = $state(false);
  let isAuthenticated = $state(false);
  let postId = $state('');

  const logger = createScopedLogger('EditPost');

  onMount(() => {
    // Set up auth token from this component context
    try {
      const authStores = getAuthStores();
      
      // Set auth token for API calls
      authStores.user.subscribe((user) => {
        const token = user?.access_token || null;
        setAuthToken(token);
        isAuthenticated = !!token;
      });
      
    } catch (authError) {
      console.warn('Edit page: Could not access auth stores:', authError);
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
        title = post.title;
        content = post.content;
        status = post.status;
        logger.info('Post loaded for editing:', post);
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

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) {
      error = 'Title and content are required';
      return;
    }

    if (!isAuthenticated) {
      error = 'You must be logged in to edit posts';
      return;
    }

    try {
      saving = true;
      error = null;

      const result = await apiClient.updatePost(postId, {
        title: title.trim(),
        content: content.trim(),
        status
      });

      if (result.success) {
        success = true;
        logger.info('Post updated successfully:', result.data);
        
        // Redirect to view post after a short delay
        setTimeout(() => {
          goto(`/posts/${postId}`);
        }, 1500);
      } else {
        error = result.error || 'Failed to update post';
      }
    } catch (err) {
      logger.error('Failed to update post:', err);
      error = err instanceof Error ? err.message : 'Failed to update post';
    } finally {
      saving = false;
    }
  }

  function handleCancel() {
    goto(`/posts/${postId}`);
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
</script>

<div class="max-w-4xl mx-auto">
  <div class="mb-6">
    <nav class="flex items-center space-x-2 text-sm text-gray-500">
      <a href="/" class="hover:text-blue-600">Home</a>
      <span>›</span>
      <a href="/posts" class="hover:text-blue-600">Posts</a>
      <span>›</span>
      {#if post}
        <a href="/posts/{postId}" class="hover:text-blue-600">{post.title}</a>
        <span>›</span>
      {/if}
      <span class="text-gray-900">Edit</span>
    </nav>
  </div>

  {#if loading}
    <div class="flex justify-center items-center py-12">
      <div class="flex items-center space-x-2">
        <svg class="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-gray-500">Loading post...</span>
      </div>
    </div>
  {:else if error && !post}
    <div class="bg-red-50 border border-red-200 rounded-md p-4">
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
        <a href="/posts" class="text-sm text-red-600 hover:text-red-800 font-medium">
          ← Back to Posts
        </a>
      </div>
    </div>
  {:else if post}
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">Edit Post</h1>
            <p class="mt-1 text-sm text-gray-600">
              Originally created by {post.authorName} on {formatDate(post.createdAt)}
              {#if post.updatedAt !== post.createdAt}
                • Last updated {formatDate(post.updatedAt)}
              {/if}
            </p>
          </div>
        </div>
      </div>

      <form onsubmit={handleSubmit} class="p-6 space-y-6">
        {#if error}
          <div class="bg-red-50 border border-red-200 rounded-md p-4">
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

        {#if success}
          <div class="bg-green-50 border border-green-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">Success!</h3>
                <p class="mt-1 text-sm text-green-700">Your post has been updated successfully. Redirecting to view post...</p>
              </div>
            </div>
          </div>
        {/if}

        {#if !isAuthenticated}
          <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">Authentication Required</h3>
                <p class="mt-1 text-sm text-yellow-700">You need to be logged in to edit posts. Please authenticate first.</p>
              </div>
            </div>
          </div>
        {/if}

        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            bind:value={title}
            placeholder="Enter a compelling title for your post..."
            disabled={saving || !isAuthenticated}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            required
          />
        </div>

        <div>
          <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            id="content"
            bind:value={content}
            placeholder="Write your post content here... You can use markdown formatting."
            rows="12"
            disabled={saving || !isAuthenticated}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            required
          ></textarea>
        </div>

        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            bind:value={status}
            disabled={saving || !isAuthenticated}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="draft">Draft - Save for later</option>
            <option value="published">Published - Make visible to everyone</option>
            <option value="archived">Archived - Hide from public view</option>
          </select>
        </div>

        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onclick={handleCancel}
            disabled={saving}
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !isAuthenticated || !title.trim() || !content.trim()}
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if saving}
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            {:else}
              Save Changes
            {/if}
          </button>
        </div>
      </form>
    </div>
  {/if}
</div>

<style>
  /* Add some custom styling for the form */
  textarea {
    resize: vertical;
    min-height: 200px;
  }
</style>