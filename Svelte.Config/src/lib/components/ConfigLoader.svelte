<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { getConfigService } from '../context.js';
  import type { AppSettings, ConfigLoadOptions } from '../types.js';
  import { configLoading, configError } from '../stores.js';
  import { createConfigScopedLogger } from '../logger.js';
  import type { Snippet } from 'svelte';

  // Props
  interface Props {
    options?: ConfigLoadOptions;
    autoLoad?: boolean;
    immediate?: boolean;
    children?: Snippet<[{ load: () => Promise<AppSettings | null>, loading: boolean, error: Error | null }]>;
  }

  let {
    options = {},
    autoLoad = false,
    immediate = false,
    children
  }: Props = $props();

  // Events
  const dispatch = createEventDispatcher<{
    loaded: AppSettings;
    error: Error;
    start: void;
    complete: void;
  }>();

  // Logger
  const logger = createConfigScopedLogger('ConfigLoader');

  // Get service from context
  let service: ReturnType<typeof getConfigService>;
  
  try {
    service = getConfigService();
  } catch (error) {
    logger.warn('No configuration context found. Some features may not work.');
  }

  // Loading state
  let loading = $state(false);
  let error = $state<Error | null>(null);

  // Load function
  export async function load(): Promise<AppSettings | null> {
    if (!service) {
      const err = new Error('Configuration service not available');
      error = err;
      dispatch('error', err);
      return null;
    }

    loading = true;
    error = null;
    dispatch('start');

    try {
      const config = await service.loadConfig(options);
      dispatch('loaded', config);
      return config;
    } catch (err) {
      const loadError = err instanceof Error ? err : new Error('Load failed');
      error = loadError;
      dispatch('error', loadError);
      return null;
    } finally {
      loading = false;
      dispatch('complete');
    }
  }

  // Auto-load on mount or immediately
  if (autoLoad || immediate) {
    load();
  }

  // Reactive state
  const isLoading = $derived(loading || $configLoading);
</script>
{@render children?.({ load, loading: isLoading, error: error || $configError })}
