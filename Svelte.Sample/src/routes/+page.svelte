<script lang="ts">
  import { onMount } from 'svelte';
  import { createScopedLogger, getAuthService, getAuthStores } from '@atlantis-gr/svelte-auth';

  let authService: any;
  let isAuthenticated = $state(false);
  let user = $state<any>(null);
  let accessToken = $state('');
  let logger = createScopedLogger('HomePage');

  onMount(() => {
    try {
      authService = getAuthService();
      if (logger) {
        logger.info('Home page loaded, using memory logger.');
      }
      const stores = getAuthStores();
      stores.isAuthenticated.subscribe((v) => (isAuthenticated = v));
      stores.user.subscribe((v) => (user = v));
      stores.accessToken.subscribe((v) => (accessToken = v || ''));
    } catch (err) {
      logger.error('Home page: auth context not found', err);
    }
  });

  function login() {
    authService?.signinRedirect();
  }
</script>

<div class="space-y-8">
  <!-- Hero Section -->
  <div class="text-center">
    <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl">
      Welcome to 
      <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
        Svelte Components
      </span>
    </h1>
    <p class="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
      A comprehensive OAuth/OIDC authentication library for Svelte applications.
    </p>
    
    <!-- Navigation Links -->
    <div class="mt-8 flex justify-center space-x-4 flex-wrap gap-y-3">
      <a href="/dashboard" 
         class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        📊 Dashboard
      </a>
      <a href="/posts" 
         class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
        � Posts & Blog
      </a>
      <a href="/config-demo" 
         class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        � Configuration Demo
      </a>
      <a href="/api-demo" 
         class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
        API Integration Demo
      </a>
      <a href="/logger-example" 
         class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        � Logger Example
      </a>
    </div>
  </div>

  <!-- Auth Status Card -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-900">Authentication Status</h2>
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 rounded-full {isAuthenticated ? 'bg-green-400' : 'bg-gray-300'}"></div>
        <span class="text-sm font-medium {isAuthenticated ? 'text-green-700' : 'text-gray-500'}">
          {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
        </span>
      </div>
    </div>

    {#if isAuthenticated && user}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- User Info -->
        <div class="space-y-3">
          <h3 class="text-sm font-medium text-gray-900">User Information</h3>
          <dl class="space-y-2">
            <div>
              <dt class="text-xs font-medium text-gray-500">Name</dt>
              <dd class="text-sm text-gray-900">{user.profile?.name || 'N/A'}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-gray-500">Email</dt>
              <dd class="text-sm text-gray-900">{user.profile?.email || 'N/A'}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-gray-500">Subject ID</dt>
              <dd class="text-sm font-mono text-gray-700 break-all">{user.profile?.sub || 'N/A'}</dd>
            </div>
          </dl>
        </div>

        <!-- Token Info -->
        <div class="space-y-3">
          <h3 class="text-sm font-medium text-gray-900">Token Information</h3>
          <dl class="space-y-2">
            <div>
              <dt class="text-xs font-medium text-gray-500">Token Type</dt>
              <dd class="text-sm text-gray-900">{user.token_type || 'Bearer'}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-gray-500">Expires At</dt>
              <dd class="text-sm text-gray-900">
                {user.expires_at ? new Date(user.expires_at * 1000).toLocaleString() : 'N/A'}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-gray-500">Access Token (truncated)</dt>
              <dd class="text-xs font-mono text-gray-600 break-all">
                {accessToken ? accessToken.substring(0, 50) + '...' : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    {:else}
      <div class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Not Authenticated</h3>
        <p class="mt-1 text-sm text-gray-500">Sign in to see your authentication details</p>
        <div class="mt-6">
          <button 
            onclick={login}
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In to Continue
          </button>
        </div>
      </div>
    {/if}
  </div>

  <!-- Features Grid -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center space-x-3 mb-4">
        <div class="flex-shrink-0">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900">OAuth/OIDC Support</h3>
      </div>
      <p class="text-gray-600">
        Full support for OAuth 2.0 and OpenID Connect flows with automatic token management and refresh.
      </p>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center space-x-3 mb-4">
        <div class="flex-shrink-0">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900">Reactive Stores</h3>
      </div>
      <p class="text-gray-600">
        Built-in Svelte stores for authentication state, user profile, and token management.
      </p>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center space-x-3 mb-4">
        <div class="flex-shrink-0">
          <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900">TypeScript Ready</h3>
      </div>
      <p class="text-gray-600">
        Written in TypeScript with full type safety and excellent developer experience.
      </p>
    </div>
  </div>

  <!-- Documentation Links -->
  <div class="bg-blue-50 rounded-lg border border-blue-200 p-6">
    <div class="flex items-start space-x-3">
      <div class="flex-shrink-0">
        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-medium text-blue-900">Getting Started</h3>
        <p class="mt-1 text-blue-700">
          This sample demonstrates the core features of Svelte Components. 
          Check out the auth callback pages and explore the reactive authentication state.
        </p>
        <div class="mt-4 flex flex-wrap gap-4">
          <a 
            href="/auth-callback" 
            class="text-blue-600 hover:text-blue-500 font-medium text-sm"
          >
            Auth Callback →
          </a>
          <a 
            href="/auth-renew" 
            class="text-blue-600 hover:text-blue-500 font-medium text-sm"
          >
            Silent Renew →
          </a>
          <a 
            href="/logged-out" 
            class="text-blue-600 hover:text-blue-500 font-medium text-sm"
          >
            Logged Out →
          </a>
          <a 
            href="/headless-auth-callback" 
            class="text-purple-600 hover:text-purple-500 font-medium text-sm"
          >
            Headless Demo →
          </a>
          <a 
            href="/logger-example" 
            class="text-orange-600 hover:text-orange-500 font-medium text-sm"
          >
            Custom Logger →
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
