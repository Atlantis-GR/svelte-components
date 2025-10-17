<script>
	import apiClient from '$lib/api-client.js';
	import { onMount } from 'svelte';

	let apiHealth = $state();
	let publicConfig = $state();
	let publicPosts = $state();
	let loading = $state(true);
	let error = $state();

	onMount(async () => {
		try {
			loading = true;
			error = null;

			const healthResult = await apiClient.getHealth();
			apiHealth = healthResult.data;

			const configResult = await apiClient.getPublicConfig();
			publicConfig = configResult.data;

			const postsResult = await apiClient.getPublicPosts();
			publicPosts = postsResult.data;

			loading = false;
		} catch (err) {
			console.error('API Error:', err);
			error = err instanceof Error ? err.message : 'An unknown error occurred';
			loading = false;
		}
	});
</script>

<div class="container">
	<h1>API Integration Demo</h1>
	<p>This page demonstrates the connection between the Svelte Sample app and the new API server.</p>

	{#if loading}
		<div class="loading">
			<p>🔄 Loading API data...</p>
		</div>
	{:else if error}
		<div class="error">
			<h2>❌ Error</h2>
			<p>{error}</p>
			<p><strong>Make sure the API server is running:</strong></p>
			<pre><code>cd Svelte.Sample.Api && npm run dev</code></pre>
		</div>
	{:else}
		<div class="success">
			<h2>✅ API Connection Successful!</h2>

			<section class="api-section">
				<h3>🏥 API Health Status</h3>
				{#if apiHealth}
					<div class="health-status">
						<p><strong>Status:</strong> {apiHealth.status}</p>
						<p><strong>Version:</strong> {apiHealth.version}</p>
						<p><strong>Environment:</strong> {apiHealth.environment}</p>
						<p>
							<strong>Database:</strong>
							{apiHealth.database.status}
							{#if apiHealth.database.responseTime}
								({apiHealth.database.responseTime}ms)
							{/if}
						</p>
						<p><strong>Uptime:</strong> {Math.round(apiHealth.uptime / 1000)}s</p>
					</div>
				{/if}
			</section>

			<section class="api-section">
				<h3>Public Configuration</h3>
				{#if publicConfig}
					<div class="config-grid">
						{#each Object.entries(publicConfig) as [key, value]}
							<div class="config-item">
								<strong>{key}:</strong>
								<span class="config-value">{JSON.stringify(value)}</span>
							</div>
						{/each}
					</div>
				{/if}
			</section>

			<section class="api-section">
				<h3>📄 Public Posts</h3>
				{#if publicPosts && publicPosts.length > 0}
					<div class="posts-grid">
						{#each publicPosts as post}
							<article class="post-card">
								<h4>{post.title}</h4>
								<p class="post-content">{post.content}</p>
								<div class="post-meta">
									<span class="author">👤 {post.authorName}</span>
									<span class="status">📌 {post.status}</span>
									<span class="date">📅 {new Date(post.createdAt).toLocaleDateString()}</span>
								</div>
							</article>
						{/each}
					</div>
				{:else}
					<p>No public posts available.</p>
				{/if}
			</section>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.loading {
		text-align: center;
		padding: 3rem;
		font-size: 1.2rem;
	}

	.error {
		background: #ffe6e6;
		border: 2px solid #ff6b6b;
		border-radius: 8px;
		padding: 2rem;
		margin: 2rem 0;
	}

	.error h2 {
		color: #c53030;
		margin-top: 0;
	}

	.error pre {
		background: #2d3748;
		color: #e2e8f0;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
	}

	.success {
		background: #e6fffa;
		border: 2px solid #38b2ac;
		border-radius: 8px;
		padding: 2rem;
		margin: 2rem 0;
	}

	.success h2 {
		color: #2c7a7b;
		margin-top: 0;
	}

	.api-section {
		margin: 2rem 0;
		padding: 1.5rem;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.api-section h3 {
		margin-top: 0;
		color: #2d3748;
		border-bottom: 2px solid #e2e8f0;
		padding-bottom: 0.5rem;
	}

	.health-status p {
		margin: 0.5rem 0;
		padding: 0.25rem;
	}

	.config-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	}

	.config-item {
		background: #f7fafc;
		padding: 1rem;
		border-radius: 6px;
		border-left: 4px solid #4299e1;
	}

	.config-value {
		color: #2b6cb0;
		font-family: 'Courier New', monospace;
	}

	.posts-grid {
		display: grid;
		gap: 1.5rem;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
	}

	.post-card {
		background: #f8f9fa;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 1.5rem;
		transition: box-shadow 0.2s;
	}

	.post-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.post-card h4 {
		margin: 0 0 1rem 0;
		color: #2d3748;
	}

	.post-content {
		color: #4a5568;
		margin-bottom: 1rem;
		line-height: 1.6;
	}

	.post-meta {
		display: flex;
		gap: 1rem;
		font-size: 0.9rem;
		color: #718096;
		border-top: 1px solid #e2e8f0;
		padding-top: 1rem;
	}

	.post-meta span {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}

		.config-grid,
		.posts-grid {
			grid-template-columns: 1fr;
		}

		.post-meta {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>
