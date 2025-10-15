<script lang="ts">
	import { AuthRenew } from "@atlantis-gr/svelte-auth/components";
</script>

<div class="max-w-md mx-auto">
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
    <div class="mb-6">
      <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
    </div>
    
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Silent Token Renewal</h1>
    <p class="text-gray-600 mb-6">
      Automatically refreshing your authentication token...
    </p>
    
    <div class="space-y-4">
      <AuthRenew />
      
      <div class="pt-4 border-t border-gray-200">
        <p class="text-sm text-gray-500">
          This page handles silent token renewal in the background.
        </p>
      </div>
    </div>
  </div>
</div>
