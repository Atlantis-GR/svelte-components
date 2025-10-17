<script lang="ts">
	import { onMount } from 'svelte';
	import { createScopedLogger, getAuthService, getAuthStores } from '@atlantis-gr/svelte-auth';

	let authService: any;
	let isAuthenticated = $state(false);
	let displayName = $state('');
	let logger = createScopedLogger('AuthHeader');

	onMount(() => {
		try {
			authService = getAuthService();
			const stores = getAuthStores();
			stores.isAuthenticated.subscribe((v) => (isAuthenticated = v));
			stores.displayName.subscribe((v) => (displayName = v ?? ''));
		} catch (err) {
			logger.error('AuthHeader: auth context not found in onMount', err);
		}
	});

	function login() {
		authService?.signinRedirect();
	}

	function logout() {
		authService?.signoutRedirect();
	}
</script>

<header class="border-b border-gray-200 bg-white shadow-sm">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between py-4">
			<div class="flex items-center space-x-3">
				<div class="flex-shrink-0">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600"
					>
						<a href="/" aria-label="homepage">
							<svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
						</a>
					</div>
				</div>
				<div>
					<h1 class="text-xl font-semibold text-gray-900">Svelte Components</h1>
					<p class="text-sm text-gray-500">Demo Application</p>
				</div>
			</div>

			<div class="flex items-center space-x-4">
				{#if isAuthenticated}
					<div class="flex items-center space-x-3">
						<div class="flex items-center space-x-2">
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
								<svg
									class="h-4 w-4 text-gray-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
							</div>
							<span class="text-sm font-medium text-gray-700">{displayName || 'User'}</span>
						</div>
						<button
							onclick={logout}
							class="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
						>
							Sign Out
						</button>
					</div>
				{:else}
					<button
						onclick={login}
						class="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
					>
						<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
							/>
						</svg>
						Sign In
					</button>
				{/if}
			</div>
		</div>
	</div>
</header>
