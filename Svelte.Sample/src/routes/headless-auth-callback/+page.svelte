<script lang="ts">
	import { HeadlessAuthCallback } from '@atlantis-gr/svelte-auth/components';
	import { createScopedLogger } from '@atlantis-gr/svelte-auth';

	const logger = createScopedLogger('HeadlessAuthCallback');

	function handleSuccess(event: CustomEvent<{ user: any; redirectUrl: string }>) {
		logger.info('Custom auth success handler:', event.detail);
	}

	function handleError(e: CustomEvent<{ error: Error; message: string }>) {
		logger.error('Custom auth error handler:', e.detail);
	}

	function handleStateChange(event: CustomEvent<{ loading: boolean; error: string | null }>) {
		logger.info('Auth state changed:', event.detail);
	}
</script>

<svelte:head>
	<title>Custom Auth Callback - Headless Demo</title>
</svelte:head>

<HeadlessAuthCallback
	on:success={handleSuccess}
	on:error={handleError}
	on:stateChange={handleStateChange}
>
	{#snippet children({ loading, error, user, redirectUrl, handleRetry, handleRedirect })}
		<div class="custom-auth-container">
			<div class="custom-auth-card">
				{#if loading}
					<!-- Custom loading design -->
					<div class="loading-section">
						<div class="custom-spinner">
							<div class="spinner-ring"></div>
							<div class="spinner-ring"></div>
							<div class="spinner-ring"></div>
						</div>
						<h1 class="loading-title">Welcome Back!</h1>
						<p class="loading-subtitle">We're securely signing you in...</p>
						<div class="loading-dots">
							<span></span>
							<span></span>
							<span></span>
						</div>
					</div>
				{:else if error}
					<!-- Custom error design -->
					<div class="error-section">
						<div class="error-icon">⚠️</div>
						<h1 class="error-title">Authentication Failed</h1>
						<p class="error-message">{error}</p>
						<div class="error-actions">
							<button onclick={handleRetry} class="retry-button">
								<span class="button-icon">🔄</span>
								Try Again
							</button>
							<button onclick={() => handleRedirect('/')} class="home-button">
								<span class="button-icon">🏠</span>
								Go Home
							</button>
						</div>
						<div class="error-help">
							<p>Need help? <a href="/support">Contact Support</a></p>
						</div>
					</div>
				{:else if user}
					<!-- Custom success state (brief) -->
					<div class="success-section">
						<div class="success-icon">✅</div>
						<h1 class="success-title">Success!</h1>
						<p class="success-message">Redirecting to {redirectUrl}...</p>
					</div>
				{/if}
			</div>
		</div>
	{/snippet}
</HeadlessAuthCallback>

<style>
	.custom-auth-container {
		min-height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 1rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.custom-auth-card {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border-radius: 24px;
		padding: 3rem;
		box-shadow: 0 30px 60px rgba(0, 0, 0, 0.12);
		text-align: center;
		max-width: 500px;
		width: 100%;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	/* Loading Styles */
	.loading-section {
		padding: 2rem 0;
	}

	.custom-spinner {
		position: relative;
		width: 80px;
		height: 80px;
		margin: 0 auto 2rem;
	}

	.spinner-ring {
		position: absolute;
		border: 4px solid transparent;
		border-radius: 50%;
		animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
	}

	.spinner-ring:nth-child(1) {
		width: 80px;
		height: 80px;
		border-top-color: #667eea;
		animation-delay: 0s;
	}

	.spinner-ring:nth-child(2) {
		width: 60px;
		height: 60px;
		top: 10px;
		left: 10px;
		border-top-color: #764ba2;
		animation-delay: -0.2s;
	}

	.spinner-ring:nth-child(3) {
		width: 40px;
		height: 40px;
		top: 20px;
		left: 20px;
		border-top-color: #f093fb;
		animation-delay: -0.4s;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.loading-title {
		font-size: 2rem;
		font-weight: 700;
		color: #2d3748;
		margin: 0 0 0.5rem 0;
	}

	.loading-subtitle {
		font-size: 1.1rem;
		color: #718096;
		margin: 0 0 2rem 0;
	}

	.loading-dots {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
	}

	.loading-dots span {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #667eea;
		animation: pulse 1.5s ease-in-out infinite;
	}

	.loading-dots span:nth-child(2) {
		animation-delay: 0.2s;
	}
	.loading-dots span:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes pulse {
		0%,
		80%,
		100% {
			opacity: 0.3;
			transform: scale(0.8);
		}
		40% {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* Error Styles */
	.error-section {
		padding: 2rem 0;
	}

	.error-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.error-title {
		font-size: 1.75rem;
		font-weight: 700;
		color: #e53e3e;
		margin: 0 0 1rem 0;
	}

	.error-message {
		font-size: 1rem;
		color: #718096;
		margin: 0 0 2rem 0;
		line-height: 1.5;
	}

	.error-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-bottom: 2rem;
	}

	.retry-button,
	.home-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 1.5rem;
		border: none;
		border-radius: 12px;
		font-weight: 600;
		font-size: 0.95rem;
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
	}

	.retry-button {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.retry-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
	}

	.home-button {
		background: #f7fafc;
		color: #2d3748;
		border: 1px solid #e2e8f0;
	}

	.home-button:hover {
		background: #edf2f7;
		transform: translateY(-2px);
	}

	.button-icon {
		font-size: 1rem;
	}

	.error-help {
		padding-top: 1rem;
		border-top: 1px solid #e2e8f0;
	}

	.error-help p {
		font-size: 0.9rem;
		color: #a0aec0;
		margin: 0;
	}

	.error-help a {
		color: #667eea;
		text-decoration: none;
	}

	.error-help a:hover {
		text-decoration: underline;
	}

	/* Success Styles */
	.success-section {
		padding: 2rem 0;
	}

	.success-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.success-title {
		font-size: 1.75rem;
		font-weight: 700;
		color: #38a169;
		margin: 0 0 0.5rem 0;
	}

	.success-message {
		font-size: 1rem;
		color: #718096;
		margin: 0;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.custom-auth-card {
			padding: 2rem 1.5rem;
			margin: 1rem;
		}

		.error-actions {
			flex-direction: column;
		}

		.retry-button,
		.home-button {
			width: 100%;
			justify-content: center;
		}
	}
</style>
