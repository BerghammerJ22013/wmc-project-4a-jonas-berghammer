<script>
	import { onMount } from 'svelte';
	import ChatList from '$lib/components/ChatList.svelte';
	import ChatView from '$lib/components/ChatView.svelte';
	import { API, getToken } from '$lib/auth.js';

	let chats = $state([]);
	let loading = $state(true);
	let selectedChat = $state(null);

	onMount(async () => {
		try {
			const res = await fetch(`${API}/matches`, {
				headers: { Authorization: `Bearer ${getToken()}` },
			});
			chats = await res.json();
		} finally {
			loading = false;
		}
	});
</script>

<div class="h-[calc(100vh-4rem)] flex overflow-hidden bg-white">
	<!-- Left: chat list -->
	<div class="
		{selectedChat ? 'hidden md:flex' : 'flex'}
		w-full md:w-80 lg:w-96 flex-col border-r border-gray-100 shrink-0
	">
		{#if loading}
			<div class="flex-1 flex items-center justify-center">
				<div class="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
			</div>
		{:else}
			<ChatList
				{chats}
				selectedId={selectedChat?.id}
				onselect={(chat) => (selectedChat = chat)}
			/>
		{/if}
	</div>

	<!-- Right: chat view -->
	<div class="
		{selectedChat ? 'flex' : 'hidden md:flex'}
		flex-1 flex-col
	">
		{#if selectedChat}
			<ChatView
				chat={selectedChat}
				onback={() => (selectedChat = null)}
			/>
		{:else}
			<!-- Empty state (desktop only) -->
			<div class="flex-1 flex flex-col items-center justify-center text-center px-8">
				<div class="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 text-orange-300">
						<path fill-rule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clip-rule="evenodd" />
					</svg>
				</div>
				<h2 class="text-lg font-semibold text-gray-800 mb-1">Chat auswählen</h2>
				<p class="text-sm text-gray-400 max-w-xs">Wähle links einen Match aus, um die Unterhaltung zu starten.</p>
			</div>
		{/if}
	</div>
</div>
