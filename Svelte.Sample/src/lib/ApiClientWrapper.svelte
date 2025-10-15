<script lang="ts">
	import { onMount } from 'svelte';
	import { setAuthToken } from './api-client';

	interface Props {
		children?: any;
	}

	let { children }: Props = $props();

	onMount(() => {
		setAuthToken(null);
	});
</script>

{#if children}
	{@render children()}
{/if}