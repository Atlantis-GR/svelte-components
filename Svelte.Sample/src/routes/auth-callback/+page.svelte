<script lang="ts">
	import { AuthCallback } from '@atlantis-gr/svelte-auth/components';
</script>

<div class="mx-auto max-w-md">
	<div class="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
		<div class="mb-6">
			<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
				<svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</div>
		</div>

		<h1 class="mb-2 text-2xl font-bold text-gray-900">Authentication Callback</h1>
		<p class="mb-6 text-gray-600">Processing your authentication response...</p>

		<div class="space-y-4">
			<AuthCallback />

			<div class="border-t border-gray-200 pt-4">
				<p class="text-sm text-gray-500">This page handles the OAuth redirect callback.</p>
			</div>
		</div>
	</div>
</div>
