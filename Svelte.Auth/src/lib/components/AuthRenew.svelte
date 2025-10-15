<script lang="ts">
  import { onMount } from 'svelte';
  import { getAuthService } from '../context.js';
  import type { AuthService } from '../auth.service.js';
  import { createScopedLogger } from '../logger.js';
  import '../styles/auth.css';

  interface Props {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    theme?: 'light' | 'dark' | 'auto';
    showVisualFeedback?: boolean;
    customStyles?: Partial<{
      container: string;
      card: string;
      message: string;
    }>;
    renewalMessage?: string;
  }

  let {
    onSuccess = undefined,
    onError = undefined,
    theme = 'auto',
    showVisualFeedback = false,
    customStyles = {},
    renewalMessage = 'Refreshing authentication...'
  }: Props = $props();

  const logger = createScopedLogger('AuthRenew');
  let authService: AuthService;
  let isRenewing = $state(true);
  let renewalComplete = $state(false);

  // Determine theme based on system preference if auto
  let resolvedTheme = $derived(
    theme === 'auto' 
      ? (globalThis?.window?.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light')
      : theme
  );

  onMount(async () => {
    try {
      // Get auth service from context
      authService = getAuthService();
      
      await authService.signinSilentCallback();
      logger.info('Silent authentication renewal successful');
      
      isRenewing = false;
      renewalComplete = true;
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      logger.error('Error during silent authentication renewal:', error);
      
      isRenewing = false;
      
      // Call error callback if provided
      if (onError) {
        onError(error as Error);
      }
    }
  });
</script>

{#if showVisualFeedback}
  <div class="auth-container {resolvedTheme}" style="{customStyles.container || ''}">
    <div class="auth-card" style="{customStyles.card || ''}">
      {#if isRenewing}
        <div class="auth-spinner"></div>
        <p class="auth-text" style="{customStyles.message || ''}">{renewalMessage}</p>
      {:else if renewalComplete}
        <div class="auth-icon auth-icon-success">✓</div>
        <p class="auth-text auth-success-text" style="{customStyles.message || ''}">Authentication refreshed successfully</p>
      {/if}
    </div>
  </div>
{:else}
  <!-- Silent renewal - no visible UI -->
  <div style="display: none;"></div>
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
