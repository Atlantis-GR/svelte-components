<script lang="ts">
  import { onMount } from 'svelte';
  import apiClient, { getCurrentAuthToken, isAuthenticated } from './api-client.js';

  let authStatus = $state('Checking...');
  let userInfo = $state('');
  let apiStatus = $state('Testing...');

  onMount(async () => {
    // Test API connectivity first
    try {
      const healthResult = await apiClient.getHealth();
      apiStatus = healthResult.success ? '✅ API Connected' : '❌ API Error';
    } catch (apiError) {
      apiStatus = '❌ API Failed: ' + (apiError instanceof Error ? apiError.message : String(apiError));
      console.error('API health check failed:', apiError);
    }

    // Check auth token status (no context access)
    try {
      const hasAuth = isAuthenticated();
      const token = getCurrentAuthToken();
      
      if (hasAuth && token) {
        authStatus = 'Authenticated';
        userInfo = `Token: Present (${token.substring(0, 20)}...)`;
      } else {
        authStatus = 'Not authenticated';
        userInfo = 'No token available';
      }
    } catch (error) {
      console.error('Auth debug error:', error);
      authStatus = 'Error';
      userInfo = error instanceof Error ? error.message : String(error);
    }
  });
</script>

<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
  <h3 class="font-semibold text-yellow-800">🔍 Debug Info</h3>
  <p><strong>API Status:</strong> {apiStatus}</p>
  <p><strong>Auth Status:</strong> {authStatus}</p>
  <p><strong>User Info:</strong> {userInfo}</p>
</div>