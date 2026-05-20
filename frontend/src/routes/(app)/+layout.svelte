<script>
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { isLoggedIn } from '$lib/auth.js';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();

	if (browser && !isLoggedIn()) goto('/login');
</script>

<div class="pb-16">
	{@render children()}
</div>

<Navbar />
