<script>
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import SwipeCard from '$lib/components/SwipeCard.svelte';
	import MatchModal from '$lib/components/MatchModal.svelte';
	import { getToken, API } from '$lib/auth.js';

	let users = $state([]);
	let loading = $state(true);
	let error = $state('');
	let matchedUser = $state(null);

	let current = $derived(users[0] ?? null);

	onMount(async () => {
		try {
			const res = await fetch(`${API}/discover`, {
				headers: { Authorization: `Bearer ${getToken()}` },
			});
			if (!res.ok) throw new Error();
			users = await res.json();
		} catch {
			error = 'Profile konnten nicht geladen werden.';
		} finally {
			loading = false;
		}
	});

	async function swipe(direction) {
		const swiped = current;
		users = users.slice(1);
		const res = await fetch(`${API}/swipes`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${getToken()}`,
			},
			body: JSON.stringify({ swiped_id: swiped.id, direction }),
		});
		const data = await res.json();
		if (data.matched) matchedUser = swiped;
	}
</script>

<div class="h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden flex flex-col">
	<div class="flex-1 flex justify-center px-4 py-6 sm:px-6 sm:py-8 overflow-hidden">
		{#if loading}
			<div class="flex-1 flex items-center justify-center">
				<div class="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
			</div>
		{:else if error}
			<div class="flex-1 flex items-center justify-center">
				<p class="text-sm text-red-500">{error}</p>
			</div>
		{:else if current}
			<!-- wrapper stretches to full height via default flex align-self:stretch -->
			<div class="w-full max-w-sm">
				<SwipeCard
					user={current}
					onlike={() => swipe('like')}
					onpass={() => swipe('pass')}
				/>
			</div>
		{:else}
			<div class="flex-1 flex flex-col items-center justify-center text-center">
				<div class="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 text-orange-300">
						<path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
					</svg>
				</div>
				<h2 class="text-lg font-semibold text-gray-800 mb-1">{$_('discover.noProfiles')}</h2>
				<p class="text-sm text-gray-400 max-w-xs">{$_('discover.noProfilesHint')}</p>
			</div>
		{/if}
	</div>
</div>

<MatchModal user={matchedUser} onclose={() => (matchedUser = null)} />
