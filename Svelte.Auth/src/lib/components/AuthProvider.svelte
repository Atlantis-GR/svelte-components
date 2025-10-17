<script lang="ts">
	import { browser } from '$app/environment';
	import type { AuthSettings } from '../types.js';
	import { demoAuthSettings } from '../types.js';
	import { initAuth } from '../context.js';

	/**
	 * Auth settings - if not provided, uses demo settings for quick testing
	 * In production, provide your actual IdP configuration
	 */
	const {
		settings = undefined,
		interceptorConfig = undefined,
		children
	}: { settings?: AuthSettings; interceptorConfig?: any; children?: any } = $props();

	// Use demo settings if none provided (OOBE)
	const authSettings = settings || demoAuthSettings;

	// Initialize sync on the client so child components can access context during their onMount
	if (browser) {
		initAuth(authSettings, interceptorConfig);
	}
</script>

{@render children?.()}

<style>
	/* minimal styles */
</style>
