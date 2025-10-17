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
			<span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
				Svelte Components
			</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-xl text-gray-600">
			A comprehensive OAuth/OIDC authentication library for Svelte applications.
		</p>

		<!-- Navigation Links -->
		<div class="mt-8 flex flex-wrap justify-center space-x-4 gap-y-3">
			<a
				href="/dashboard"
				class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
			>
				📊 Dashboard
			</a>
			<a
				href="/posts"
				class="inline-flex items-center rounded-md border border-transparent bg-purple-600 px-6 py-3 text-base font-medium text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none"
			>
				� Posts & Blog
			</a>
			<a
				href="/config-demo"
				class="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
			>
				� Configuration Demo
			</a>
			<a
				href="/api-demo"
				class="inline-flex items-center rounded-md border border-transparent bg-green-600 px-6 py-3 text-base font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
			>
				API Integration Demo
			</a>
			<a
				href="/logger-example"
				class="inline-flex items-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
			>
				� Logger Example
			</a>
		</div>
	</div>

	<!-- Auth Status Card -->
	<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-lg font-semibold text-gray-900">Authentication Status</h2>
			<div class="flex items-center space-x-2">
				<div class="h-3 w-3 rounded-full {isAuthenticated ? 'bg-green-400' : 'bg-gray-300'}"></div>
				<span class="text-sm font-medium {isAuthenticated ? 'text-green-700' : 'text-gray-500'}">
					{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
				</span>
			</div>
		</div>

		{#if isAuthenticated && user}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
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
							<dd class="font-mono text-sm break-all text-gray-700">
								{user.profile?.sub || 'N/A'}
							</dd>
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
							<dd class="font-mono text-xs break-all text-gray-600">
								{accessToken ? accessToken.substring(0, 50) + '...' : 'N/A'}
							</dd>
						</div>
					</dl>
				</div>
			</div>
		{:else}
			<div class="py-8 text-center">
				<svg
					class="mx-auto h-12 w-12 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
					/>
				</svg>
				<h3 class="mt-2 text-sm font-medium text-gray-900">Not Authenticated</h3>
				<p class="mt-1 text-sm text-gray-500">Sign in to see your authentication details</p>
				<div class="mt-6">
					<button
						onclick={login}
						class="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
					>
						<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
							/>
						</svg>
						Sign In to Continue
					</button>
				</div>
			</div>
		{/if}
	</div>

	<!-- Features Grid -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="mb-4 flex items-center space-x-3">
				<div class="flex-shrink-0">
					<svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
						/>
					</svg>
				</div>
				<h3 class="text-lg font-medium text-gray-900">OAuth/OIDC Support</h3>
			</div>
			<p class="text-gray-600">
				Full support for OAuth 2.0 and OpenID Connect flows with automatic token management and
				refresh.
			</p>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="mb-4 flex items-center space-x-3">
				<div class="flex-shrink-0">
					<svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 10V3L4 14h7v7l9-11h-7z"
						/>
					</svg>
				</div>
				<h3 class="text-lg font-medium text-gray-900">Reactive Stores</h3>
			</div>
			<p class="text-gray-600">
				Built-in Svelte stores for authentication state, user profile, and token management.
			</p>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="mb-4 flex items-center space-x-3">
				<div class="flex-shrink-0">
					<svg
						class="h-8 w-8 text-purple-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
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
	<div class="rounded-lg border border-blue-200 bg-blue-50 p-6">
		<div class="flex items-start space-x-3">
			<div class="flex-shrink-0">
				<svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</div>
			<div>
				<h3 class="text-lg font-medium text-blue-900">Getting Started</h3>
				<p class="mt-1 text-blue-700">
					This sample demonstrates the core features of Svelte Components. Check out the auth
					callback pages and explore the reactive authentication state.
				</p>
				<div class="mt-4 flex flex-wrap gap-4">
					<a href="/auth-callback" class="text-sm font-medium text-blue-600 hover:text-blue-500">
						Auth Callback →
					</a>
					<a href="/auth-renew" class="text-sm font-medium text-blue-600 hover:text-blue-500">
						Silent Renew →
					</a>
					<a href="/logged-out" class="text-sm font-medium text-blue-600 hover:text-blue-500">
						Logged Out →
					</a>
					<a
						href="/headless-auth-callback"
						class="text-sm font-medium text-purple-600 hover:text-purple-500"
					>
						Headless Demo →
					</a>
					<a
						href="/logger-example"
						class="text-sm font-medium text-orange-600 hover:text-orange-500"
					>
						Custom Logger →
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
