<script lang="ts">
	import { AuthRenew } from '@atlantis-gr/svelte-auth/components';
</script>

<div class="mx-auto max-w-md">
	<div class="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
		<div class="mb-6">
			<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
				<svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					/>
				</svg>
			</div>
		</div>

		<h1 class="mb-2 text-2xl font-bold text-gray-900">Silent Token Renewal</h1>
		<p class="mb-6 text-gray-600">Automatically refreshing your authentication token...</p>

		<div class="space-y-4">
			<AuthRenew />

			<div class="border-t border-gray-200 pt-4">
				<p class="text-sm text-gray-500">
					This page handles silent token renewal in the background.
				</p>
			</div>
		</div>
	</div>
</div>
