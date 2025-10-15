<script lang="ts">
	import { AuthCallback } from "@atlantis-gr/svelte-auth/components";
</script>

<div class="max-w-md mx-auto">
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
    <div class="mb-6">
      <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
    
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Authentication Callback</h1>
    <p class="text-gray-600 mb-6">
      Processing your authentication response...
    </p>
    
    <div class="space-y-4">
      <AuthCallback />
      
      <div class="pt-4 border-t border-gray-200">
        <p class="text-sm text-gray-500">
          This page handles the OAuth redirect callback.
        </p>
      </div>
    </div>
  </div>
</div>

