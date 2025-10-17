<script lang="ts">
	import { LoggedOut } from '@atlantis-gr/svelte-auth/components';
</script>

<div class="mx-auto max-w-md">
	<div class="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
		<div class="mb-6">
			<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
				<svg class="h-8 w-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
					/>
				</svg>
			</div>
		</div>

		<h1 class="mb-2 text-2xl font-bold text-gray-900">Logged Out</h1>
		<p class="mb-6 text-gray-600">You have been successfully logged out of the application.</p>

		<div class="space-y-4">
			<LoggedOut />

			<div class="border-t border-gray-200 pt-4">
				<p class="text-sm text-gray-500">This page confirms the logout process is complete.</p>
				<a href="/" class="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-500">
					← Return to Home
				</a>
			</div>
		</div>
	</div>
</div>
