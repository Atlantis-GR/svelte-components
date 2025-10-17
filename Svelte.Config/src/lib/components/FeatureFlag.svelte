<script lang="ts">
	import { useConfig } from '../context.js';

	// Props
	interface Props {
		flag: string;
		invert?: boolean;
		fallback?: any;
		children?: any;
		fallbackSnippet?: any;
	}

	let { flag, invert = false, fallback = null, children, fallbackSnippet }: Props = $props();

	// Get configuration
	const { featureFlags } = useConfig();

	// Reactive check - use the reactive store directly
	let enabled = $derived($featureFlags[flag] === true);
	let shouldShow = $derived(invert ? !enabled : enabled);
</script>

{#if shouldShow}
	{#if children}
		{@render children()}
	{/if}
{:else if fallback}
	{@const FallbackComponent = fallback}
	<FallbackComponent />
{:else if fallbackSnippet}
	{@render fallbackSnippet()}
{/if}
