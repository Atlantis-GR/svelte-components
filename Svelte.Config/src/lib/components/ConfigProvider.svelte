<script lang="ts">
  import { onMount } from 'svelte';
  import { initConfig, loadAppConfig } from '../context.js';
  import type { AppSettings, ConfigProviders, ConfigLoadOptions } from '../types.js';
  import { configLoading, configError, configInitialized } from '../stores.js';

  // Props
  interface Props {
    providers?: ConfigProviders;
    loadOptions?: ConfigLoadOptions;
    autoLoad?: boolean;
    showLoading?: boolean;
    showError?: boolean;
    loadingComponent?: any;
    errorComponent?: any;
    onLoaded?: ((config: AppSettings) => void) | null;
    onError?: ((error: Error) => void) | null;
    onInitialized?: (() => void) | null;
    children?: any;
    loading?: any;
    error?: any;
    initializing?: any;
  }

  let {
    providers = {},
    loadOptions = {},
    autoLoad = true,
    showLoading = true,
    showError = true,
    loadingComponent = null,
    errorComponent = null,
    onLoaded = null,
    onError = null,
    onInitialized = null,
    children,
    loading,
    error,
    initializing
  }: Props = $props();

  // Initialize configuration context
  const context = initConfig(providers);

  // Load configuration on mount if autoLoad is enabled
  onMount(async () => {
    if (autoLoad) {
      try {
        const config = await loadAppConfig(providers, loadOptions);
        onLoaded?.(config);
        onInitialized?.();
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Configuration load failed');
        onError?.(err);
      }
    }
  });

  // Manual load function
  export async function loadConfig(): Promise<AppSettings | null> {
    try {
      const config = await loadAppConfig(providers, loadOptions);
      onLoaded?.(config);
      return config;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Configuration load failed');
      onError?.(err);
      return null;
    }
  }

  // Reactive statements
  let isLoading = $derived($configLoading);
  let hasError = $derived($configError !== null);
  let isInitialized = $derived($configInitialized);
</script>

{#if isLoading && showLoading}
  {#if loadingComponent}
    {@const LoadingComponent = loadingComponent}
    <LoadingComponent />
  {:else if loading}
    {@render loading()}
  {:else}
    <div class="config-loading">
      <div class="spinner"></div>
      <p>Loading configuration...</p>
    </div>
  {/if}
{:else if hasError && showError}
  {#if errorComponent}
    {@const ErrorComponent = errorComponent}
    <ErrorComponent error={$configError} />
  {:else if error}
    {@render error({ error: $configError })}
  {:else}
    <div class="config-error">
      <h3>Configuration Error</h3>
      <p>{$configError?.message || 'Unknown error occurred'}</p>
      <button onclick={loadConfig}>Retry</button>
    </div>
  {/if}
{:else if isInitialized}
  {#if children}
    {@render children()}
  {/if}
{:else if initializing}
  {@render initializing()}
{:else}
  <div class="config-initializing">
    Initializing...
  </div>
{/if}

<style>
  .config-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .config-error {
    padding: 1rem;
    border: 1px solid #dc3545;
    background-color: #f8d7da;
    color: #721c24;
    border-radius: 0.25rem;
    text-align: center;
  }

  .config-error h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
  }

  .config-error p {
    margin: 0 0 1rem 0;
  }

  .config-error button {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  .config-error button:hover {
    background-color: #c82333;
  }

  .config-initializing {
    padding: 1rem;
    text-align: center;
    color: #6c757d;
  }
</style>