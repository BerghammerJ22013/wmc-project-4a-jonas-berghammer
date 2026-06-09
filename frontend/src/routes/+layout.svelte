<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { browser } from '$app/environment';
	import { waitLocale } from 'svelte-i18n';
	import { setupI18n } from '$lib/i18n.js';

	let { children } = $props();

	if (browser) {
		setupI18n(localStorage.getItem('sportsync_lang') ?? 'de');
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#await waitLocale()}
{:then}
	{@render children()}
{/await}
