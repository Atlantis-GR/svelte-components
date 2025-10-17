<script lang="ts">
	import { useConfig } from '@atlantis-gr/svelte-config';
	import { FeatureFlag, ConfigValue, ConfigDebugger } from '@atlantis-gr/svelte-config/components';
	import { safeUpdateConfig } from '$lib/config-helpers';
	import { createScopedLogger, getLogger } from '@atlantis-gr/svelte-auth';

	const {
		config,
		authSettings,
		brandingSettings,
		featureFlags,
		apiUrl,
		isProduction,
		culture,
		appVersion,
		service
	} = useConfig();
	let logger = createScopedLogger('ConfigDemo');
	let configJson = $state('');
	// Watch config changes
	$effect(() => {
		if ($config) {
			configJson = JSON.stringify($config, null, 2);
		}
	});

	function toggleFeature() {
		safeUpdateConfig({
			features: {
				...$featureFlags,
				enableBetaFeatures: !$featureFlags.enableBetaFeatures
			}
		});
	}

	function addCustomSetting({
		key,
		value,
		type
	}: { key?: string; value?: string; type?: string } = {}) {
		if (!key || !value) return;

		let convertedValue: any = value;
		try {
			switch (type) {
				case 'number':
					convertedValue = Number(value);
					if (isNaN(convertedValue)) throw new Error('Invalid number');
					break;
				case 'boolean':
					convertedValue = value.toLowerCase() === 'true';
					break;
				case 'json':
					convertedValue = JSON.parse(value);
					break;
				case 'string':
				default:
					convertedValue = value;
					break;
			}
		} catch (error) {
			logger.error('Failed to convert value:', error);
			return;
		}

		safeUpdateConfig({
			app: {
				...$config?.app,
				[key]: convertedValue,
				lastModified: new Date().toISOString()
			}
		});

		logger.info('Added custom setting:', { key, value: convertedValue, type });

		// Clear inputs after successful add
		keyInput = '';
		valueInput = '';
	}

	function removeCustomSetting(key: string) {
		const currentApp = { ...$config?.app };
		delete currentApp[key];

		logger.info('Removing custom setting:', { key, remaining: currentApp });

		safeUpdateConfig({
			app: {
				...currentApp,
				lastModified: new Date().toISOString()
			}
		});
	}

	let keyInput = $state('');
	let valueInput = $state('');
	let typeInput = $state('string');

	function getValuePlaceholder(type: string): string {
		switch (type) {
			case 'number':
				return 'e.g., 42 or 3.14';
			case 'boolean':
				return 'true or false';
			case 'json':
				return 'e.g., {"key": "value"}';
			case 'string':
			default:
				return 'Enter value here';
		}
	}

	// Periodic reload functions
	async function manualReload() {
		try {
			logger.info('Manually triggering configuration reload...');
			await service.reloadNow(false);
			logger.info('Manual reload completed');
		} catch (error) {
			logger.error('Manual reload failed:', error);
		}
	}

	function serviceStopPeriodicReload() {
		service.stopPeriodicReload();
		isPeriodicActive = false;
		logger.info('Periodic reload stopped');
	}

	// Periodic reload status (will update manually)
	let isPeriodicActive = $state(true); // Initial assumption based on layout settings
	let reloadInterval = $state(30000); // Demo setting from layout
</script>

<svelte:head>
	<title>Configuration Demo - {$brandingSettings?.appName || 'Svelte Components'}</title>
</svelte:head>

<div class="space-y-8">
	<div class="rounded-lg bg-white p-6 shadow">
		<h1 class="mb-4 text-3xl font-bold text-gray-900">Configuration Demo</h1>
		<p class="text-gray-600">
			This page demonstrates the Svelte.Config library features including reactive configuration
			access, feature flags, and integration with Svelte.Auth.
		</p>
	</div>

	<!-- Logger Configuration Info -->
	<div
		class="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow"
	>
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
				<h3 class="text-lg font-semibold text-blue-900">Enhanced Logging</h3>
				<p class="mt-1 text-blue-700">
					The Config package now uses the <code class="rounded bg-blue-100 px-1">ILogger</code>
					interface from
					<code class="rounded bg-blue-100 px-1">@atlantis-gr/svelte-logging-abstractions</code>
					instead of direct console logs. This provides better logging control and consistency across
					the application. The Config package now logs with proper prefixes like
					<code class="rounded bg-blue-100 px-1">[Config] [ConfigService]</code> for better debugging.
				</p>
				<p class="mt-2 text-sm text-blue-600">
					Try the actions below and check your browser console to see structured Config package
					logs!
				</p>
			</div>
		</div>
	</div>

	<!-- Configuration Overview -->
	<div class="rounded-lg bg-white p-6 shadow">
		<h2 class="mb-4 text-2xl font-bold text-gray-900">Configuration Overview</h2>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			<div class="rounded-lg bg-blue-50 p-4">
				<h3 class="font-semibold text-blue-900">API URL</h3>
				<p class="text-blue-700">{$apiUrl}</p>
			</div>
			<div class="rounded-lg bg-green-50 p-4">
				<h3 class="font-semibold text-green-900">Version</h3>
				<p class="text-green-700">{$appVersion}</p>
			</div>
			<div class="rounded-lg bg-purple-50 p-4">
				<h3 class="font-semibold text-purple-900">Culture</h3>
				<p class="text-purple-700">{$culture}</p>
			</div>
			<div class="rounded-lg bg-yellow-50 p-4">
				<h3 class="font-semibold text-yellow-900">Environment</h3>
				<p class="text-yellow-700">{$isProduction ? 'Production' : 'Development'}</p>
			</div>
			<div class="rounded-lg bg-red-50 p-4">
				<h3 class="font-semibold text-red-900">App Name</h3>
				<p class="text-red-700">
					<ConfigValue path="branding.appName" defaultValue="Default App" />
				</p>
			</div>
			<div class="rounded-lg bg-indigo-50 p-4">
				<h3 class="font-semibold text-indigo-900">Auth Authority</h3>
				<p class="text-sm break-all text-indigo-700">
					{$authSettings?.authority || 'Not configured'}
				</p>
			</div>
		</div>
	</div>

	<!-- Feature Flags Demo -->
	<div class="rounded-lg bg-white p-6 shadow">
		<h2 class="mb-4 text-2xl font-bold text-gray-900">Feature Flags</h2>
		<div class="space-y-4">
			<FeatureFlag flag="enableNewHeader">
				{#snippet children()}
					<div class="rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
						🎉 New header feature is enabled!
					</div>
				{/snippet}
				{#snippet fallbackSnippet()}
					<div class="rounded border border-gray-400 bg-gray-100 px-4 py-3 text-gray-700">
						New header feature is disabled.
					</div>
				{/snippet}
			</FeatureFlag>

			<FeatureFlag flag="enableDarkMode">
				{#snippet children()}
					<div class="rounded border border-blue-400 bg-blue-100 px-4 py-3 text-blue-700">
						🌙 Dark mode is available!
					</div>
				{/snippet}
				{#snippet fallbackSnippet()}
					<div class="rounded border border-gray-400 bg-gray-100 px-4 py-3 text-gray-700">
						Dark mode is not available.
					</div>
				{/snippet}
			</FeatureFlag>

			<FeatureFlag flag="enableBetaFeatures">
				{#snippet children()}
					<div class="rounded border border-orange-400 bg-orange-100 px-4 py-3 text-orange-700">
						Beta features are enabled! Use with caution.
					</div>
				{/snippet}
				{#snippet fallbackSnippet()}
					<div class="rounded border border-gray-400 bg-gray-100 px-4 py-3 text-gray-700">
						Beta features are disabled.
					</div>
				{/snippet}
			</FeatureFlag>

			<div class="flex space-x-4">
				<button
					class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					onclick={toggleFeature}
				>
					Toggle Beta Features
				</button>
				<!-- Adding custom setting-->
				<div class="space-y-2">
					<div class="flex space-x-2">
						<input
							type="text"
							placeholder="Setting Key (e.g., myCustomValue)"
							bind:value={keyInput}
							class="flex-1 rounded border p-2"
						/>
						<select bind:value={typeInput} class="rounded border p-2">
							<option value="string">String</option>
							<option value="number">Number</option>
							<option value="boolean">Boolean</option>
							<option value="json">JSON Object</option>
						</select>
					</div>
					<div class="flex space-x-2">
						<input
							type="text"
							placeholder={getValuePlaceholder(typeInput)}
							bind:value={valueInput}
							class="flex-1 rounded border p-2"
						/>
						<button
							class="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-400"
							onclick={() =>
								addCustomSetting({ key: keyInput, value: valueInput, type: typeInput })}
							disabled={!keyInput || !valueInput}
						>
							Add Setting
						</button>
					</div>
					<p class="text-sm text-gray-600">
						Current app settings: {Object.keys($config?.app || {}).length} items
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Custom App Settings -->
	<div class="rounded-lg bg-white p-6 shadow">
		<h2 class="mb-4 text-2xl font-bold text-gray-900">Custom App Settings</h2>
		{#if $config?.app && Object.keys($config.app).length > 0}
			<div class="space-y-2">
				{#each Object.entries($config.app) as [key, value]}
					<div class="flex items-center justify-between rounded border bg-gray-50 p-3">
						<div class="flex-1">
							<span class="font-medium text-gray-900">{key}:</span>
							<span class="ml-2 text-gray-700">
								{#if typeof value === 'object'}
									<code class="rounded bg-gray-200 px-1 text-sm">{JSON.stringify(value)}</code>
								{:else}
									<code class="rounded bg-gray-200 px-1 text-sm">{String(value)}</code>
								{/if}
								<span class="ml-2 text-xs text-gray-500">({typeof value})</span>
							</span>
						</div>
						<button
							class="px-2 py-1 text-sm text-red-600 hover:text-red-800"
							onclick={() => removeCustomSetting(key)}
							title="Remove setting"
						>
							✕
						</button>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-gray-500 italic">
				No custom settings added yet. Use the form above to add some!
			</p>
		{/if}
	</div>

	<!-- Periodic Reload Configuration -->
	<div class="rounded-lg bg-white p-6 shadow">
		<h2 class="mb-4 text-2xl font-bold text-gray-900">Periodic Configuration Reload</h2>
		<div class="space-y-4">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<h3 class="font-semibold text-gray-900">Status</h3>
					<div class="flex items-center space-x-2">
						<div
							class="h-3 w-3 rounded-full {isPeriodicActive ? 'bg-green-500' : 'bg-red-500'}"
						></div>
						<span class="text-sm {isPeriodicActive ? 'text-green-700' : 'text-red-700'}">
							{isPeriodicActive ? 'Active' : 'Inactive'}
						</span>
					</div>
					{#if reloadInterval}
						<p class="text-sm text-gray-600">
							Reloading every {(reloadInterval / 1000).toFixed(0)} seconds
						</p>
					{/if}
				</div>

				<div class="space-y-2">
					<h3 class="font-semibold text-gray-900">Last Updated</h3>
					<p class="text-sm text-gray-600">
						{$config ? new Date($config.lastModified || Date.now()).toLocaleString() : 'Never'}
					</p>
				</div>
			</div>

			<div class="flex space-x-4">
				<button
					class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					onclick={manualReload}
				>
					Reload Now
				</button>

				<button
					class="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:bg-gray-400"
					onclick={serviceStopPeriodicReload}
					disabled={!isPeriodicActive}
				>
					Stop Periodic Reload
				</button>
			</div>

			<div class="rounded border border-blue-200 bg-blue-50 p-4">
				<h4 class="mb-2 font-medium text-blue-900">💡 About Periodic Reload</h4>
				<ul class="space-y-1 text-sm text-blue-800">
					<li>• Configuration automatically reloads every 30 seconds (demo setting)</li>
					<li>• In production, typically set to 5-30 minutes</li>
					<li>• Reloads are silent by default (no loading indicators)</li>
					<li>• Changes to manifest file will be picked up automatically</li>
					<li>• Manual reload shows loading state for user feedback</li>
				</ul>
			</div>
		</div>
	</div>

	<!-- Branding Configuration -->
	<div class="rounded-lg bg-white p-6 shadow">
		<h2 class="mb-4 text-2xl font-bold text-gray-900">Branding Configuration</h2>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div>
				<h3 class="mb-2 font-semibold text-gray-900">Colors</h3>
				<div class="space-y-2">
					<div class="flex items-center space-x-2">
						<div
							class="h-4 w-4 rounded border"
							style="background-color: {$brandingSettings?.primaryColor || '#000'}"
						></div>
						<span>Primary: {$brandingSettings?.primaryColor || 'Not set'}</span>
					</div>
					<div class="flex items-center space-x-2">
						<div
							class="h-4 w-4 rounded border"
							style="background-color: {$brandingSettings?.secondaryColor || '#666'}"
						></div>
						<span>Secondary: {$brandingSettings?.secondaryColor || 'Not set'}</span>
					</div>
				</div>
			</div>
			<div>
				<h3 class="mb-2 font-semibold text-gray-900">Theme</h3>
				<p>Current theme: <span class="font-mono">{$brandingSettings?.theme || 'auto'}</span></p>
			</div>
		</div>
	</div>

	<!-- Advanced Configuration Access -->
	<div class="rounded-lg bg-white p-6 shadow">
		<h2 class="mb-4 text-2xl font-bold text-gray-900">Advanced Configuration</h2>
		<div class="space-y-4">
			<div>
				<h3 class="mb-2 font-semibold text-gray-900">Nested Values</h3>
				<p>Max Retries: <ConfigValue path="app.maxRetries" defaultValue="3" /></p>
				<p>Timeout: <ConfigValue path="app.timeout" defaultValue="5000" />ms</p>
				<p>Custom Setting: <ConfigValue path="app.customSetting" defaultValue="Not set" /></p>
			</div>

			<div>
				<h3 class="mb-2 font-semibold text-gray-900">Feature Flags Status</h3>
				<div class="space-y-1">
					{#each Object.entries($featureFlags) as [flag, enabled]}
						<div class="flex items-center space-x-2">
							<span class="h-3 w-3 rounded-full {enabled ? 'bg-green-500' : 'bg-red-500'}"></span>
							<span class="font-mono text-sm">{flag}</span>
							<span class="text-sm text-gray-600">({enabled ? 'enabled' : 'disabled'})</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Configuration Debugger -->
	<FeatureFlag flag="enableConfigDebugger">
		<div class="rounded-lg bg-white p-6 shadow">
			<h2 class="mb-4 text-2xl font-bold text-gray-900">Configuration Debugger</h2>
			<ConfigDebugger />
		</div>
	</FeatureFlag>
</div>
