<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { goto } from '$app/navigation';
	import { getAuthService } from '../context.js';
	import type { AuthService } from '../auth.service.js';
	import { createScopedLogger } from '../logger.js';
	import type { Snippet } from 'svelte';

	interface Props {
		onComplete?: () => void;
		redirectDelay?: number;
		redirectUrl?: string;
		autoRedirect?: boolean;
		children?: Snippet<
			[
				{
					countdown: number;
					isComplete: boolean;
					autoRedirect: boolean;
					redirectUrl: string;
					handleRedirect: (url?: string) => void;
					cancelRedirect: () => void;
				}
			]
		>;
	}

	let {
		onComplete = undefined,
		redirectDelay = 3000,
		redirectUrl = '/',
		autoRedirect = true,
		children
	}: Props = $props();

	const logger = createScopedLogger('HeadlessLoggedOut');
	const dispatch = createEventDispatcher<{
		complete: { success: boolean };
		redirect: { url: string };
		countdownTick: { countdown: number };
	}>();

	let countdown = $state(Math.ceil(redirectDelay / 1000));
	let intervalId: number;
	let authService: AuthService;
	let isComplete = $state(false);

	// Expose handlers to slot
	function handleRedirect(url?: string) {
		if (intervalId) {
			window.clearInterval(intervalId);
		}
		const targetUrl = url || redirectUrl;
		dispatch('redirect', { url: targetUrl });
		goto(targetUrl);
	}

	function cancelRedirect() {
		if (intervalId) {
			window.clearInterval(intervalId);
			intervalId = 0;
		}
	}

	onMount(() => {
		const handleLogout = async () => {
			try {
				// Get auth service from context
				authService = getAuthService();

				// Handle the logout callback
				await authService.signoutRedirectCallback();
				logger.info('Logout successful');

				isComplete = true;
				dispatch('complete', { success: true });
			} catch (error) {
				logger.error('Error during logout callback:', error);
				isComplete = true;
				dispatch('complete', { success: false });
			}

			// Call complete callback if provided
			if (onComplete) {
				onComplete();
			}

			// Start countdown for auto-redirect
			if (autoRedirect) {
				intervalId = window.setInterval(() => {
					countdown--;
					dispatch('countdownTick', { countdown });

					if (countdown <= 0) {
						window.clearInterval(intervalId);
						handleRedirect();
					}
				}, 1000);
			}
		};

		handleLogout();
	});
</script>

{@render children?.({
	countdown,
	isComplete,
	autoRedirect,
	redirectUrl,
	handleRedirect,
	cancelRedirect
})}
