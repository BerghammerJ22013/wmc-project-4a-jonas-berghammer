<script>
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { isLoggedIn } from '$lib/auth.js';
	import { userStore } from '$lib/userStore.svelte.js';
	import { socketStore } from '$lib/socketStore.svelte.js';
	import { locale } from '$lib/i18n.js';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();

	if (browser && !isLoggedIn()) goto('/login');

	onMount(async () => {
		if (isLoggedIn() && !userStore.user) {
			await userStore.load();
		}
		if (userStore.user?.language) {
			locale.set(userStore.user.language);
			localStorage.setItem('sportsync_lang', userStore.user.language);
		}
		if (isLoggedIn()) socketStore.connect();
	});

	onDestroy(() => socketStore.disconnect());
</script>

<div class="pb-16">
	{@render children()}
</div>

<Navbar />
