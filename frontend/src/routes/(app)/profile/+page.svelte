<script>
	import { onMount } from 'svelte';
	import { getToken, API } from '$lib/auth.js';

	let user = $state(null);
	let allSports = $state([]);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		try {
			const token = getToken();
			const headers = { Authorization: `Bearer ${token}` };

			const [userRes, sportsRes] = await Promise.all([
				fetch(`${API}/users/me`, { headers }),
				fetch(`${API}/sports`),
			]);

			if (!userRes.ok) throw new Error('Profil konnte nicht geladen werden');

			user = await userRes.json();
			allSports = await sportsRes.json();
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	});
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<div class="bg-white border-b border-gray-100 px-4 pt-12 pb-6 text-center">
		<h1 class="text-xl font-bold text-gray-900">Mein Profil</h1>
	</div>

	{#if loading}
		<div class="flex justify-center items-center py-24">
			<div class="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
		</div>
	{:else if error}
		<div class="mx-4 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
			{error}
		</div>
	{:else}
		<div class="max-w-lg mx-auto px-4 py-6 space-y-4">

			<!-- Avatar -->
			<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-3">
				<div class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 text-gray-400">
						<path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
					</svg>
				</div>
				<div class="text-center">
					<p class="font-semibold text-gray-900">{user.name || 'Kein Name'}</p>
					<p class="text-sm text-gray-500">{user.email}</p>
				</div>
			</div>

			<!-- Profilbild-Upload (kommt) -->
			<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
				<h2 class="font-semibold text-gray-900 mb-3">Profilbild</h2>
				<div class="h-10 bg-gray-100 rounded-xl animate-pulse"></div>
			</div>

			<!-- Sportarten (kommt) -->
			<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
				<h2 class="font-semibold text-gray-900 mb-3">Meine Sportarten</h2>
				<div class="h-10 bg-gray-100 rounded-xl animate-pulse"></div>
			</div>

			<!-- Persönliche Daten (kommt) -->
			<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
				<h2 class="font-semibold text-gray-900 mb-3">Persönliche Daten</h2>
				<div class="space-y-2">
					<div class="h-10 bg-gray-100 rounded-xl animate-pulse"></div>
					<div class="h-10 bg-gray-100 rounded-xl animate-pulse"></div>
					<div class="h-10 bg-gray-100 rounded-xl animate-pulse"></div>
				</div>
			</div>

		</div>
	{/if}
</div>
