<script>
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import SwipeCard from '$lib/components/SwipeCard.svelte';
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
	<div class="flex-1 flex items-center justify-center px-4 py-4 overflow-hidden">
		{#if loading}
			<div class="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
		{:else if error}
			<div class="text-center">
				<p class="text-sm text-red-500">{error}</p>
			</div>
		{:else if current}
			<SwipeCard
				user={current}
				onlike={() => swipe('like')}
				onpass={() => swipe('pass')}
			/>
		{:else}
			<div class="flex flex-col items-center justify-center text-center">
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

<!-- It's a Match Modal -->
{#if matchedUser}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-6">
		<!-- Backdrop -->
		<button
			class="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
			onclick={() => matchedUser = null}
			aria-label="Schließen"
		></button>

		<!-- Modal -->
		<div class="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
			<!-- Hearts -->
			<div class="flex justify-center mb-4">
				<div class="relative">
					<div class="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
						{#if matchedUser.profile_picture}
							<img src="{API}/uploads/{matchedUser.profile_picture}" alt="" class="w-full h-full rounded-full object-cover" />
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 text-orange-300">
								<path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
							</svg>
						{/if}
					</div>
					<div class="absolute -top-1 -right-1 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center shadow">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-4 h-4">
							<path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
						</svg>
					</div>
				</div>
			</div>

			<h2 class="text-2xl font-bold text-gray-900 mb-1">{$_('match.title')}</h2>
			<p class="text-gray-500 text-sm mb-6">
				{$_('match.subtitle', { name: matchedUser.name })}
			</p>

			<div class="flex flex-col gap-2">
				<a
					href="/chats"
					class="w-full py-3 bg-orange-500 text-white font-semibold rounded-2xl hover:bg-orange-600 transition-colors"
					onclick={() => matchedUser = null}
				>
					{$_('match.sendMessage')}
				</a>
				<button
					onclick={() => matchedUser = null}
					class="w-full py-3 text-gray-500 font-medium rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer"
				>
					{$_('match.keepDiscovering')}
				</button>
			</div>
		</div>
	</div>
{/if}
