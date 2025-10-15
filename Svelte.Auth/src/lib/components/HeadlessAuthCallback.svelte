<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  import { getAuthService } from '../context.js';
  import type { AuthService } from '../auth.service.js';
  import { createScopedLogger } from '../logger.js';

  /**
   * Headless AuthCallback component - provides business logic only
   * Renders custom HTML via slot with reactive state
   * 
   * Events:
   * - success: Fired when authentication completes successfully
   * - error: Fired when authentication fails
   * - stateChange: Fired when loading/error state changes
   * 
   * Slot props:
   * - loading: boolean - whether auth is in progress
   * - error: string | null - error message if auth failed
   * - handleRetry: function - retry authentication
   * - handleRedirect: function - redirect to home/specified URL
   */
  
  interface Props {
    onSuccess?: ((redirectUrl?: string) => void) | undefined;
    onError?: ((error: Error) => void) | undefined;
    defaultRedirect?: string;
    autoRedirect?: boolean; // Whether to auto-redirect on success
    children?: import('svelte').Snippet<[{
      loading: boolean;
      error: string | null;
      user: any;
      redirectUrl: string;
      handleRetry: () => void;
      handleRedirect: (url?: string) => void;
    }]>;
  }

  let {
    onSuccess = undefined,
    onError = undefined,
    defaultRedirect = '/',
    autoRedirect = true,
    children
  }: Props = $props();

  const dispatch = createEventDispatcher<{
    success: { user: any; redirectUrl: string };
    error: { error: Error; message: string };
    stateChange: { loading: boolean; error: string | null };
  }>();

  let loading = $state(true);
  let error = $state<string | null>(null);
  let authService: AuthService;
  const logger = createScopedLogger('HeadlessAuthCallback');
  let user = $state<any>(null);
  let redirectUrl = $state(defaultRedirect);

  // Expose handlers to slot
  function handleRetry() {
    loading = true;
    error = null;
    dispatch('stateChange', { loading, error });
    performAuth();
  }

  function handleRedirect(url?: string) {
    goto(url || redirectUrl);
  }

  async function performAuth() {
    try {
      authService = getAuthService();
      user = await authService.signinRedirectCallback();

      logger.info('Authentication successful', user);

      // Get the return URL from state
      redirectUrl = (user.state as any)?.url || defaultRedirect;
      
      loading = false;
      dispatch('stateChange', { loading, error });
      dispatch('success', { user, redirectUrl });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(redirectUrl);
      } else if (autoRedirect) {
        handleRedirect();
      }
    } catch (err) {
      logger.error('Error during authentication callback:', err);
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      error = errorMessage;
      loading = false;
      
      dispatch('stateChange', { loading, error });
      dispatch('error', { error: err as Error, message: errorMessage });
      
      // Call error callback if provided
      if (onError) {
        onError(err as Error);
      }
    }
  }

  onMount(() => {
    performAuth();
  });
</script>

{@render children?.({ loading, error, user, redirectUrl, handleRetry, handleRedirect })}