<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getAuthService } from '../context.js';
  import type { AuthService } from '../auth.service.js';
  import { createScopedLogger } from '../logger.js';
  import '../styles/auth.css';

  interface Props {
    onSuccess?: (redirectUrl?: string) => void;
    onError?: (error: Error) => void;
    defaultRedirect?: string;
    theme?: 'light' | 'dark' | 'auto';
    customStyles?: Partial<{
      container: string;
      card: string;
      loadingText: string;
      errorText: string;
      button: string;
    }>;
    showSpinner?: boolean;
    loadingMessage?: string;
    errorTitle?: string;
    returnButtonText?: string;
  }

  let {
    onSuccess = undefined,
    onError = undefined,
    defaultRedirect = '/',
    theme = 'auto',
    customStyles = {},
    showSpinner = true,
    loadingMessage = 'Completing authentication...',
    errorTitle = 'Authentication Error',
    returnButtonText = 'Return to Home'
  }: Props = $props();

  let loading = $state(true);
  let error = $state<string | null>(null);
  let authService: AuthService;
  const logger = createScopedLogger('AuthCallback');

  let resolvedTheme = $derived(
    theme === 'auto' 
      ? (globalThis?.window?.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light')
      : theme
  );

  onMount(async () => {
    try {
      // Get auth service from context
      authService = getAuthService();
      
      // Handle the callback
      const user = await authService.signinRedirectCallback();

      logger.info('Authentication successful', user);

      // Get the return URL from state
      const returnUrl = (user.state as any)?.url || defaultRedirect;
      
      loading = false;
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(returnUrl);
      } else {
        // Default: redirect to the return URL
        goto(returnUrl);
      }
    } catch (err) {
      logger.error('Error during authentication callback:', err);
      error = err instanceof Error ? err.message : 'Authentication failed';
      loading = false;
      
      // Call error callback if provided
      if (onError) {
        onError(err as Error);
      }
    }
  });
</script>

{#if loading}
  <div class="auth-container {resolvedTheme}" style="{customStyles.container || ''}">
    <div class="auth-card" style="{customStyles.card || ''}">
      {#if showSpinner}
        <div class="auth-spinner"></div>
      {/if}
      <p class="auth-text" style="{customStyles.loadingText || ''}">{loadingMessage}</p>
    </div>
  </div>
{:else if error}
  <div class="auth-container {resolvedTheme}" style="{customStyles.container || ''}">
    <div class="auth-card auth-error" style="{customStyles.card || ''}">
      <div class="auth-icon auth-icon-error">⚠</div>
      <h2 class="auth-title">{errorTitle}</h2>
      <p class="auth-text auth-error-text" style="{customStyles.errorText || ''}">{error}</p>
      <button 
        class="auth-button" 
        style="{customStyles.button || ''}"
        onclick={() => goto('/')}
      >
        {returnButtonText}
      </button>
    </div>
  </div>
{/if}

<style>
  /* Component-specific styles that extend the base auth styles */
  .auth-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(var(--color-primary-rgb), 0.2);
    border-top: 4px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto var(--space-6);
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
