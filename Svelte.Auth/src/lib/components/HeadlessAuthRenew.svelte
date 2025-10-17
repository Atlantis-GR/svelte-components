<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { getAuthService } from '../context.js';
	import type { AuthService } from '../auth.service.js';
	import { createScopedLogger } from '../logger.js';

	/**
	 * Headless AuthRenew component - provides business logic only
	 * Renders custom HTML via children snippet with reactive state (when showContent is true)
	 *
	 * Events:
	 * - success: Fired when silent renewal completes successfully
	 * - error: Fired when silent renewal fails
	 * - stateChange: Fired when renewal state changes
	 *
	 * Children snippet props:
	 * - isRenewing: boolean - whether renewal is in progress
	 * - isComplete: boolean - whether renewal completed successfully
	 * - error: Error | null - error if renewal failed
	 * - handleRetry: function - retry the renewal
	 */

	interface Props {
		onSuccess?: (() => void) | undefined;
		onError?: ((error: Error) => void) | undefined;
		showContent?: boolean; // Whether to render any content at all
		children?: import('svelte').Snippet<
			[{ isRenewing: boolean; isComplete: boolean; error: Error | null; handleRetry: () => void }]
		>;
	}
	let {
		onSuccess = undefined,
		onError = undefined,
		showContent = false,
		children
	}: Props = $props();
	const logger = createScopedLogger('HeadlessAuthRenew');
	const dispatch = createEventDispatcher<{
		success: { timestamp: number };
		error: { error: Error; timestamp: number };
		stateChange: { isRenewing: boolean; isComplete: boolean; error: Error | null };
	}>();

	let authService: AuthService;
	let isRenewing = $state(true);
	let isComplete = $state(false);
	let error = $state<Error | null>(null);

	// Expose handlers to slot
	function handleRetry() {
		isRenewing = true;
		isComplete = false;
		error = null;
		dispatch('stateChange', { isRenewing, isComplete, error });
		performRenewal();
	}

	async function performRenewal() {
		try {
			authService = getAuthService();
			await authService.signinSilentCallback();

			logger.info('Silent authentication renewal successful');

			isRenewing = false;
			isComplete = true;
			const timestamp = Date.now();

			dispatch('stateChange', { isRenewing, isComplete, error });
			dispatch('success', { timestamp });

			// Call success callback if provided
			if (onSuccess) {
				onSuccess();
			}
		} catch (err) {
			logger.error('Error during silent authentication renewal:', err);

			isRenewing = false;
			isComplete = false;
			error = err as Error;
			const timestamp = Date.now();

			dispatch('stateChange', { isRenewing, isComplete, error });
			dispatch('error', { error: err as Error, timestamp });

			// Call error callback if provided
			if (onError) {
				onError(err as Error);
			}
		}
	}

	onMount(() => {
		performRenewal();
	});

	// Effect to dispatch state changes when reactive variables change
	$effect(() => {
		dispatch('stateChange', { isRenewing, isComplete, error });
	});
</script>

{#if showContent && children}
	{@render children({ isRenewing, isComplete, error, handleRetry })}
{/if}
