<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { AuthProvider } from '@atlantis-gr/svelte-auth/components';
	import AuthHeader from '$lib/AuthHeader.svelte';
	import { createKeycloakSettings, createScopedLogger, getLogger } from '@atlantis-gr/svelte-auth';
	import { ensureMemoryLoggerConfigured } from '$lib/memory-logger';
	import { LogLevel } from '@atlantis-gr/svelte-auth';
	import {
		initConfig,
		loadAppConfig,
		getResolvedAuthSettings,
		useConfig
	} from '@atlantis-gr/svelte-config';
	import { ConfigLoader } from '@atlantis-gr/svelte-config/components';

	interface Props {
		children?: any;
	}

	let { children }: Props = $props();
	import { onMount } from 'svelte';
	import ApiClientWrapper from '$lib/ApiClientWrapper.svelte';
	// Configure our memory logger globally at app startup
	ensureMemoryLoggerConfigured(LogLevel.ERROR);

	// Initialize configuration context
	initConfig({
		manifestUrl: '/app-settings.manifest.json',
		defaults: {
			api_url: 'http://localhost:3000',
			culture: 'en-US',
			features: {
				enableConfigDebugger: true
			}
		}
	});

	// Get configuration stores
	const { brandingSettings } = useConfig();

	// Load configuration and initialize auth
	let authSettings = $state<any>(null);
	let configReady = $state(false);

	onMount(async () => {
		const logger = createScopedLogger('AppLayout');
		try {
			await loadAppConfig(
				{},
				{
					periodicReload: true,
					reloadInterval: 30000, // 30 seconds for demo (normally would be 5 minutes)
					silentReload: true
				}
			);
			const resolvedAuthSettings = getResolvedAuthSettings();
			// Get resolved auth settings from configuration
			if (resolvedAuthSettings) {
				authSettings = createKeycloakSettings(
					resolvedAuthSettings.authority,
					resolvedAuthSettings.realm,
					resolvedAuthSettings.client_id
				);
			}
			configReady = true;
		} catch (error) {
			logger.error('Failed to load configuration:', error);
		}
	});

	// Reactive title based on configuration
	let appTitle = $derived($brandingSettings?.appName || 'Svelte Components - Sample');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>{appTitle}</title>
</svelte:head>

{#if configReady && authSettings}
	<AuthProvider settings={authSettings}>
		<ApiClientWrapper>
			<AuthHeader />
			<main class="min-h-screen bg-gray-50">
				<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					{#if children}
						{@render children()}
					{/if}
				</div>
			</main>
		</ApiClientWrapper>
	</AuthProvider>
{:else}
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-center">
			<div class="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-gray-600"></div>
			<p class="mt-4 text-gray-600">Initializing...</p>
		</div>
	</div>
{/if}
