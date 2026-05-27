<script>
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { isLoggedIn } from '$lib/auth.js';
	import { userStore } from '$lib/userStore.svelte.js';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();

	if (browser && !isLoggedIn()) goto('/login');

	onMount(async () => {
		if (isLoggedIn() && !userStore.user) {
			await userStore.load();
		}
	});
</script>

<div class="pb-16">
	{@render children()}
</div>

<Navbar />
