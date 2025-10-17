<script lang="ts">
	import { onMount } from 'svelte';
	import {
		LogLevel,
		getAuthService,
		getAuthStores,
		AuthService,
		createScopedLogger
	} from '@atlantis-gr/svelte-auth';
	import {
		logsStore,
		memoryLogger,
		ensureMemoryLoggerConfigured,
		isMemoryLoggerActive,
		totalLogsCreated,
		reconfigureMemoryLogger,
		getCurrentLogLevel
	} from '$lib/memory-logger';

	let logs = $state<Array<{ level: string; message: string; timestamp: Date; args?: any[] }>>([]);
	let totalLogs = $state(0);
	let isLoggerActive = $state(true);
	let showLogs = $state(false);
	let authService: AuthService;
	let isAuthenticated = $state(false);
	let logger = createScopedLogger('LoggerExample');
	let logLevel = $state(memoryLogger.getLogLevel());

	onMount(() => {
		const unsubscribeLogs = logsStore.subscribe((value) => {
			logs = value;
		});

		const unsubscribeTotal = totalLogsCreated.subscribe((value) => {
			totalLogs = value;
		});

		ensureMemoryLoggerConfigured(logLevel);
		isLoggerActive = true;

		const checkInterval = setInterval(() => {
			isLoggerActive = isMemoryLoggerActive();
		}, 10000);

		try {
			authService = getAuthService();
			const stores = getAuthStores();
			stores.isAuthenticated.subscribe((v) => (isAuthenticated = v));
		} catch (err) {
			logger?.error('AuthService not available:', err);
		}

		return () => {
			unsubscribeLogs();
			unsubscribeTotal();
			clearInterval(checkInterval);
		};
	});

	function updateLogLevel() {
		reconfigureMemoryLogger(logLevel);
		isLoggerActive = true;
	}

	function reconfigureLogger() {
		reconfigureMemoryLogger(logLevel);
		isLoggerActive = true;
	}

	function triggerAuth() {
		if (authService) {
			if (isAuthenticated) {
				authService.signoutRedirect();
			} else {
				authService.signinRedirect();
			}
		}
	}

	function getUser() {
		if (authService) {
			const user = authService.getCurrentUser();
			if (user) {
				memoryLogger.info('Retrieved user', user);
			} else {
				memoryLogger.warn('No user is currently authenticated');
			}
		}
	}

	function testLogLevelSync() {
		const currentLevel = getCurrentLogLevel();
		memoryLogger.info('Log level sync test', {
			selectedLevel: LogLevel[logLevel],
			selectedNumeric: logLevel,
			actualLevel: LogLevel[currentLevel],
			actualNumeric: currentLevel,
			inSync: logLevel === currentLevel
		});
	}

	function formatTimestamp(date: Date): string {
		return date.toLocaleTimeString();
	}

	function formatArgs(args?: any[]): string {
		if (!args || args.length === 0) return '';
		return JSON.stringify(args, null, 2);
	}

	function getLevelColor(level: string): string {
		switch (level) {
			case 'TRACE':
				return 'text-gray-500';
			case 'DEBUG':
				return 'text-blue-600';
			case 'INFO':
				return 'text-green-600';
			case 'WARN':
				return 'text-yellow-600';
			case 'ERROR':
				return 'text-red-600';
			default:
				return 'text-gray-800';
		}
	}
</script>

<div class="min-h-screen p-8">
	<div class="mx-auto max-w-4xl">
		<h1 class="mb-8 text-3xl font-bold text-gray-800">Custom Logger Example</h1>

		<div class="mb-8 rounded-lg bg-white p-6 shadow-lg">
			<h2 class="mb-4 text-xl font-semibold text-gray-800">Logger Configuration</h2>

			<div class="space-y-4">
				<div>
					<label for="logLevel" class="mb-2 block text-sm font-medium text-gray-700">
						Log Level
					</label>
					<select
						id="logLevel"
						bind:value={logLevel}
						onchange={updateLogLevel}
						class="rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					>
						<option value={LogLevel.TRACE}>TRACE</option>
						<option value={LogLevel.DEBUG}>DEBUG</option>
						<option value={LogLevel.INFO}>INFO</option>
						<option value={LogLevel.WARN}>WARN</option>
						<option value={LogLevel.ERROR}>ERROR</option>
					</select>
					<p class="mt-1 text-xs text-gray-500">
						Current level: {LogLevel[logLevel]} ({logLevel}) - Only messages at this level or higher
						will be displayed
					</p>
				</div>

				<div class="flex gap-4">
					<button
						onclick={() => (showLogs = !showLogs)}
						class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
					>
						{showLogs ? 'Hide' : 'Show'} Logs
					</button>

					<button
						onclick={() => memoryLogger.clear()}
						class="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
					>
						Clear Logs
					</button>

					<button
						onclick={() => memoryLogger.info('Test log message', { test: 'data' })}
						class="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
					>
						Test Log
					</button>

					<button
						onclick={triggerAuth}
						class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
					>
						{isAuthenticated ? 'Sign Out' : 'Sign In'}
					</button>

					<button
						onclick={getUser}
						class="rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
					>
						Get User
					</button>

					<button
						onclick={testLogLevelSync}
						class="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
					>
						Test Sync
					</button>

					<a
						href="/"
						class="inline-block rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
					>
						Go Home (Test Persistence)
					</a>

					{#if !isLoggerActive}
						<button
							onclick={reconfigureLogger}
							class="rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
						>
							Reconfigure Logger
						</button>
					{/if}
				</div>

				<!-- Log Level Testing Buttons -->
				<div class="mt-4">
					<h3 class="mb-2 text-sm font-medium text-gray-700">Test Log Levels</h3>
					<div class="flex flex-wrap gap-2">
						<button
							onclick={() => memoryLogger.trace('TRACE message', { level: 'trace' })}
							class="rounded bg-gray-400 px-3 py-1 text-xs text-white hover:bg-gray-500"
						>
							Test TRACE
						</button>
						<button
							onclick={() => memoryLogger.debug('DEBUG message', { level: 'debug' })}
							class="rounded bg-blue-400 px-3 py-1 text-xs text-white hover:bg-blue-500"
						>
							Test DEBUG
						</button>
						<button
							onclick={() => memoryLogger.info('INFO message', { level: 'info' })}
							class="rounded bg-green-400 px-3 py-1 text-xs text-white hover:bg-green-500"
						>
							Test INFO
						</button>
						<button
							onclick={() => memoryLogger.warn('WARN message', { level: 'warn' })}
							class="rounded bg-yellow-400 px-3 py-1 text-xs text-white hover:bg-yellow-500"
						>
							Test WARN
						</button>
						<button
							onclick={() => memoryLogger.error('ERROR message', { level: 'error' })}
							class="rounded bg-red-400 px-3 py-1 text-xs text-white hover:bg-red-500"
						>
							Test ERROR
						</button>
					</div>
				</div>

				<div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
					<div class="flex items-start space-x-3">
						<div class="flex-shrink-0">
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
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div>
							<h3 class="text-sm font-medium text-blue-900">Persistent Logging</h3>
							<p class="mt-1 text-sm text-blue-700">
								Logs are now stored persistently across page navigation. You can navigate to other
								pages and return here to see the same log history preserved. The logger maintains
								the last 100 entries.
							</p>
							<div class="mt-2 flex items-center space-x-2">
								<div
									class="h-2 w-2 rounded-full {isLoggerActive ? 'bg-green-500' : 'bg-red-500'}"
								></div>
								<span class="text-xs {isLoggerActive ? 'text-green-700' : 'text-red-700'}">
									Memory Logger {isLoggerActive ? 'Active' : 'Inactive'}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="mb-8 rounded-lg bg-white p-6 shadow-lg">
			<h2 class="mb-4 text-xl font-semibold text-gray-800">Authentication Actions</h2>
			<p class="mb-4 text-gray-600">
				The auth components below will generate logs that you can view with the custom logger. Try
				signing in, signing out, or getting user info to see the logger in action.
			</p>

			<div class="space-y-4">
				<div class="flex gap-4">
					<a
						href="/"
						class="inline-block rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
					>
						Go to Home
					</a>
					<a
						href="/auth-callback"
						class="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
					>
						Auth Callback Demo
					</a>
					<a
						href="/headless-auth-callback"
						class="inline-block rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
					>
						Headless Demo
					</a>
				</div>
			</div>
		</div>

		{#if showLogs}
			<div class="rounded-lg bg-white p-6 shadow-lg">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-xl font-semibold text-gray-800">Live Log Output</h2>
					<div class="text-sm text-gray-600">
						{logs.length} displayed • {totalLogs} total created
					</div>
				</div>

				{#if logs.length === 0}
					<p class="text-gray-500 italic">
						No logs yet. Interact with the auth components to see logs appear.
					</p>
				{:else}
					<div class="max-h-96 overflow-y-auto rounded-lg bg-gray-900 p-4">
						{#each logs as log}
							<div class="mb-2 font-mono text-sm">
								<span class="text-gray-400">{formatTimestamp(log.timestamp)}</span>
								<span class="ml-2 font-semibold {getLevelColor(log.level)}">[{log.level}]</span>
								<span class="ml-2 text-white">{log.message}</span>
								{#if log.args}
									<pre class="mt-1 ml-20 text-xs text-gray-300">{formatArgs(log.args)}</pre>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
