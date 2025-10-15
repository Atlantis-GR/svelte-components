<script lang="ts">
  import { useConfig } from '../context.js';
  import { browser } from '$app/environment';

  // Props
  interface Props {
    expanded?: boolean;
    showInProduction?: boolean;
  }

  let {
    expanded = false,
    showInProduction = false
  }: Props = $props();

  // Get configuration
  const { config, isProduction } = useConfig();

  // Show only in development unless explicitly allowed
  let shouldShow = $derived(browser && (!$isProduction || showInProduction));

  let isExpanded = $state(expanded);

  function toggleExpanded() {
    isExpanded = !isExpanded;
  }

  function copyToClipboard() {
    if (browser && $config) {
      navigator.clipboard.writeText(JSON.stringify($config, null, 2));
    }
  }
</script>

{#if shouldShow}
  <div class="config-debugger">
    <div class="header">
      <button onclick={toggleExpanded} class="toggle-btn">
        <span class="icon">{isExpanded ? '▼' : '▶'}</span>
        Configuration Debug
      </button>
      <button onclick={copyToClipboard} class="copy-btn" title="Copy to clipboard">
        Copy
      </button>
    </div>
    
    {#if isExpanded}
      <div class="content">
        {#if $config}
          <pre>{JSON.stringify($config, null, 2)}</pre>
        {:else}
          <p class="no-config">No configuration loaded</p>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .config-debugger {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    color: #00ff00;
    border: 1px solid #333;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    z-index: 9999;
    max-width: 400px;
    max-height: 300px;
  }

  .header {
    display: flex;
    align-items: center;
    padding: 8px;
    background: rgba(0, 0, 0, 0.8);
    border-bottom: 1px solid #333;
  }

  .toggle-btn {
    background: none;
    border: none;
    color: #00ff00;
    cursor: pointer;
    display: flex;
    align-items: center;
    font-family: inherit;
    font-size: inherit;
    flex: 1;
  }

  .icon {
    margin-right: 8px;
    font-size: 10px;
  }

  .copy-btn {
    background: none;
    border: none;
    color: #00ff00;
    cursor: pointer;
    padding: 4px;
    margin-left: 8px;
  }

  .copy-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .content {
    padding: 8px;
    overflow: auto;
    max-height: 250px;
  }

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-size: 11px;
    line-height: 1.4;
  }

  .no-config {
    margin: 0;
    color: #ff6b6b;
    font-style: italic;
  }
</style>