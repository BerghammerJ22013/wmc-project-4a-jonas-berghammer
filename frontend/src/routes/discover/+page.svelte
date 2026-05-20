<script>
	import { goto } from '$app/navigation';
	import { logout, isLoggedIn } from '$lib/auth.js';
	import { browser } from '$app/environment';

	if (browser && !isLoggedIn()) goto('/login');

	async function handleLogout() {
		await logout();
		goto('/login');
	}
</script>

<div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
	<button
		onclick={handleLogout}
		class="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition cursor-pointer"
	>
		Abmelden
	</button>
</div>
