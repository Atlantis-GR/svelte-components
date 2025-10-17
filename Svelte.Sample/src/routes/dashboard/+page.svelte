<script lang="ts">
	import { onMount } from 'svelte';
	import apiClient from '$lib/api-client.js';
	import { getAuthStores, createScopedLogger } from '@atlantis-gr/svelte-auth';

	let isAuthenticated = $state(false);
	let apiHealth = $state<any>(null);
	let postsCount = $state(0);
	let configCount = $state(0);
	let loading = $state(true);

	const logger = createScopedLogger('Dashboard');

	onMount(async () => {
		try {
			const stores = getAuthStores();
			stores.isAuthenticated.subscribe((v) => (isAuthenticated = v));
		} catch (err) {
			logger.error('Auth context not found:', err);
		}

		// Load dashboard data
		loadDashboardData();
	});

	async function loadDashboardData() {
		try {
			loading = true;

			// Get API health
			const healthResult = await apiClient.getHealth();
			if (healthResult.success) {
				apiHealth = healthResult.data;
			}

			// Get posts count
			const postsResult = await apiClient.getPublicPosts(1, 1);
			if (postsResult.success && postsResult.pagination) {
				postsCount = postsResult.pagination.total;
			}

			// Get config count
			const configResult = await apiClient.getPublicConfig();
			if (configResult.success && configResult.data) {
				configCount = Object.keys(configResult.data).length;
			}
		} catch (err) {
			logger.error('Failed to load dashboard data:', err);
		} finally {
			loading = false;
		}
	}

	function formatUptime(seconds: number) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = Math.floor(seconds % 60);

		if (hours > 0) {
			return `${hours}h ${minutes}m ${secs}s`;
		} else if (minutes > 0) {
			return `${minutes}m ${secs}s`;
		} else {
			return `${secs}s`;
		}
	}
</script>

<div class="mx-auto max-w-6xl">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Project Dashboard</h1>
		<p class="mt-2 text-lg text-gray-600">
			Welcome to the Svelte Components demonstration project. This dashboard shows the integration
			between the sample app and the new API server.
		</p>
	</div>

	<!-- Quick Stats -->
	<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<div class="flex h-8 w-8 items-center justify-center rounded-md bg-green-100">
						<svg
							class="h-5 w-5 text-green-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
					</div>
				</div>
				<div class="ml-4">
					<h3 class="text-sm font-medium text-gray-500">API Status</h3>
					<p class="text-lg font-semibold text-gray-900">
						{#if loading}
							Loading...
						{:else if apiHealth}
							{apiHealth.status === 'healthy' ? 'Healthy' : 'Unhealthy'}
						{:else}
							Unknown
						{/if}
					</p>
				</div>
			</div>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<div class="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100">
						<svg
							class="h-5 w-5 text-purple-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							></path>
						</svg>
					</div>
				</div>
				<div class="ml-4">
					<h3 class="text-sm font-medium text-gray-500">Total Posts</h3>
					<p class="text-lg font-semibold text-gray-900">
						{#if loading}
							Loading...
						{:else}
							{postsCount}
						{/if}
					</p>
				</div>
			</div>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<div class="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100">
						<svg
							class="h-5 w-5 text-blue-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
							></path>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							></path>
						</svg>
					</div>
				</div>
				<div class="ml-4">
					<h3 class="text-sm font-medium text-gray-500">Config Items</h3>
					<p class="text-lg font-semibold text-gray-900">
						{#if loading}
							Loading...
						{:else}
							{configCount}
						{/if}
					</p>
				</div>
			</div>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<div class="flex h-8 w-8 items-center justify-center rounded-md bg-yellow-100">
						<svg
							class="h-5 w-5 text-yellow-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							></path>
						</svg>
					</div>
				</div>
				<div class="ml-4">
					<h3 class="text-sm font-medium text-gray-500">Auth Status</h3>
					<p class="text-lg font-semibold text-gray-900">
						{isAuthenticated ? 'Authenticated' : 'Guest'}
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Features Overview -->
	<div class="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
		<!-- API Features -->
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-xl font-semibold text-gray-900">API Features</h2>
			<div class="space-y-4">
				<div class="flex items-start">
					<div class="flex-shrink-0">
						<div class="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
							<svg class="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"
								></path>
							</svg>
						</div>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-gray-900">SQLite Database</h3>
						<p class="text-sm text-gray-500">
							Persistent storage with posts, configuration, and activity logs
						</p>
					</div>
				</div>

				<div class="flex items-start">
					<div class="flex-shrink-0">
						<div class="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
							<svg class="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"
								></path>
							</svg>
						</div>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-gray-900">OAuth Integration</h3>
						<p class="text-sm text-gray-500">Compatible with existing Svelte Auth libraries</p>
					</div>
				</div>

				<div class="flex items-start">
					<div class="flex-shrink-0">
						<div class="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
							<svg class="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"
								></path>
							</svg>
						</div>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-gray-900">RESTful API</h3>
						<p class="text-sm text-gray-500">
							Full CRUD operations for posts and configuration management
						</p>
					</div>
				</div>

				<div class="flex items-start">
					<div class="flex-shrink-0">
						<div class="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
							<svg class="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"
								></path>
							</svg>
						</div>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-gray-900">Security & Monitoring</h3>
						<p class="text-sm text-gray-500">
							Rate limiting, CORS, health checks, and activity logging
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Frontend Features -->
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-xl font-semibold text-gray-900">Frontend Features</h2>
			<div class="space-y-4">
				<div class="flex items-start">
					<div class="flex-shrink-0">
						<div class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
							<svg class="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"
								></path>
							</svg>
						</div>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-gray-900">Post Management</h3>
						<p class="text-sm text-gray-500">
							Create, edit, view, and delete blog posts with draft/publish states
						</p>
					</div>
				</div>

				<div class="flex items-start">
					<div class="flex-shrink-0">
						<div class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
							<svg class="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"
								></path>
							</svg>
						</div>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-gray-900">Responsive Design</h3>
						<p class="text-sm text-gray-500">Mobile-friendly interface with Tailwind CSS styling</p>
					</div>
				</div>

				<div class="flex items-start">
					<div class="flex-shrink-0">
						<div class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
							<svg class="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"
								></path>
							</svg>
						</div>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-gray-900">Real-time Updates</h3>
						<p class="text-sm text-gray-500">
							Live configuration updates and memory logger integration
						</p>
					</div>
				</div>

				<div class="flex items-start">
					<div class="flex-shrink-0">
						<div class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
							<svg class="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"
								></path>
							</svg>
						</div>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-gray-900">Pagination & Navigation</h3>
						<p class="text-sm text-gray-500">Seamless browsing experience with proper routing</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- API Status Details -->
	{#if apiHealth}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-xl font-semibold text-gray-900">API Server Status</h2>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				<div>
					<h3 class="mb-2 text-sm font-medium text-gray-500">Server Info</h3>
					<div class="space-y-1 text-sm">
						<p><span class="font-medium">Environment:</span> {apiHealth.environment}</p>
						<p><span class="font-medium">Version:</span> {apiHealth.version}</p>
						<p><span class="font-medium">Uptime:</span> {formatUptime(apiHealth.uptime)}</p>
					</div>
				</div>

				<div>
					<h3 class="mb-2 text-sm font-medium text-gray-500">Database</h3>
					<div class="space-y-1 text-sm">
						<p>
							<span class="font-medium">Status:</span>
							<span
								class="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium {apiHealth
									.database.status === 'connected'
									? 'bg-green-100 text-green-800'
									: 'bg-red-100 text-red-800'}"
							>
								{apiHealth.database.status}
							</span>
						</p>
						{#if apiHealth.database.responseTime}
							<p>
								<span class="font-medium">Response Time:</span>
								{apiHealth.database.responseTime}ms
							</p>
						{/if}
					</div>
				</div>

				<div>
					<h3 class="mb-2 text-sm font-medium text-gray-500">Endpoints</h3>
					<div class="space-y-1 text-sm">
						<p>
							<a
								href="http://localhost:3001/api/health"
								target="_blank"
								class="text-blue-600 hover:text-blue-800">Health Check</a
							>
						</p>
						<p>
							<a
								href="http://localhost:3001/api/config/public"
								target="_blank"
								class="text-blue-600 hover:text-blue-800">Public Config</a
							>
						</p>
						<p>
							<a
								href="http://localhost:3001/api/posts/public"
								target="_blank"
								class="text-blue-600 hover:text-blue-800">Public Posts</a
							>
						</p>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Quick Actions -->
	<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<h2 class="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h2>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			<a
				href="/posts"
				class="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
			>
				View Posts
			</a>
			{#if isAuthenticated}
				<a
					href="/posts/create"
					class="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
				>
					✍️ Create Post
				</a>
			{/if}
			<a
				href="/api-demo"
				class="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
			>
				API Demo
			</a>
			<a
				href="/config-demo"
				class="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
			>
				🔧 Config Demo
			</a>
		</div>
	</div>
</div>
