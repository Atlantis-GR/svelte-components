<script lang="ts">
	import { useConfig } from '../context.js';

	// Props
	interface Props {
		path: string;
		defaultValue?: any;
		format?: ((value: any) => string) | null;
		as?: 'text' | 'json' | 'html';
	}

	let { path, defaultValue = undefined, format = null, as = 'text' }: Props = $props();

	// Get configuration
	const { config } = useConfig();

	// Helper function to get nested value from object path
	function getNestedValue(obj: any, path: string, defaultValue: any) {
		const keys = path.split('.');
		let current = obj;

		for (const key of keys) {
			if (current == null || typeof current !== 'object') {
				return defaultValue;
			}
			current = current[key];
		}

		return current !== undefined ? current : defaultValue;
	}

	// Get value reactively from config store
	let value = $derived(getNestedValue($config, path, defaultValue));
	let displayValue = $derived(format ? format(value) : value);
	let stringValue = $derived(
		as === 'json' ? JSON.stringify(displayValue, null, 2) : String(displayValue)
	);
</script>

{#if as === 'html'}
	{@html stringValue}
{:else if as === 'json'}
	<pre>{stringValue}</pre>
{:else}
	{stringValue}
{/if}
