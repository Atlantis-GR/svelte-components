<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getAuthService } from '../context.js';
	import type { AuthService } from '../auth.service.js';
	import { createScopedLogger } from '../logger.js';
	import '../styles/auth.css';

	interface Props {
		onComplete?: () => void;
		redirectDelay?: number;
		redirectUrl?: string;
		autoRedirect?: boolean;
		theme?: 'light' | 'dark' | 'auto';
		customStyles?: Partial<{
			container: string;
			card: string;
			title: string;
			message: string;
			button: string;
		}>;
		title?: string;
		message?: string;
		buttonText?: string;
		showIcon?: boolean;
	}

	let {
		onComplete = undefined,
		redirectDelay = 3000,
		redirectUrl = '/',
		autoRedirect = true,
		theme = 'auto',
		customStyles = {},
		title = 'You have been logged out',
		message = 'Thank you for using our application.',
		buttonText = 'Return to Home',
		showIcon = true
	}: Props = $props();

	const logger = createScopedLogger('LoggedOut');

	let countdown = $state(Math.ceil(redirectDelay / 1000));
	let intervalId: number;
	let authService: AuthService;

	// Determine theme based on system preference if auto
	let resolvedTheme = $derived(
		theme === 'auto'
			? globalThis?.window?.matchMedia?.('(prefers-color-scheme: dark)')?.matches
				? 'dark'
				: 'light'
			: theme
	);

	onMount(() => {
		const handleLogout = async () => {
			try {
				// Get auth service from context
				authService = getAuthService();

				// Handle the logout callback
				await authService.signoutRedirectCallback();
				logger.info('Logout successful');
			} catch (error) {
				logger.error('Error during logout callback:', error);
			}

			// Call complete callback if provided
			if (onComplete) {
				onComplete();
			}

			// Start countdown for auto-redirect
			if (autoRedirect) {
				intervalId = window.setInterval(() => {
					countdown--;
					if (countdown <= 0) {
						window.clearInterval(intervalId);
						goto(redirectUrl);
					}
				}, 1000);
			}
		};

		handleLogout();

		// Cleanup
		return () => {
			if (intervalId) {
				window.clearInterval(intervalId);
			}
		};
	});

	function handleRedirect() {
		if (intervalId) {
			window.clearInterval(intervalId);
		}
		goto(redirectUrl);
	}
</script>

<div class="auth-container" data-theme={resolvedTheme} style={customStyles.container || ''}>
	<div class="auth-card" style={customStyles.card || ''}>
		{#if showIcon}
			<div class="auth-icon success">✓</div>
		{/if}
		<h1 class="auth-title" style={customStyles.title || ''}>{title}</h1>
		<p class="auth-message" style={customStyles.message || ''}>{message}</p>

		{#if autoRedirect}
			<p class="auth-message muted">
				Redirecting to home page in {countdown} second{countdown !== 1 ? 's' : ''}...
			</p>
		{/if}

		<button class="auth-button success" style={customStyles.button || ''} onclick={handleRedirect}>
			{buttonText}
		</button>
	</div>
</div>
