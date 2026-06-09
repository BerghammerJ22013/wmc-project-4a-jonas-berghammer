<script>
	import { API } from '$lib/auth.js';

	let { chats, selectedId, onselect } = $props();

	function formatTime(dateStr) {
		if (!dateStr) return '';
		const d = new Date(dateStr);
		const now = new Date();
		const diffDays = Math.floor((now - d) / 86400000);
		if (diffDays === 0) return d.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' });
		if (diffDays === 1) return 'Gestern';
		if (diffDays < 7) return d.toLocaleDateString('de-AT', { weekday: 'short' });
		return d.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit' });
	}
</script>

<div class="flex flex-col h-full">
	<div class="px-4 py-4 border-b border-gray-100">
		<h1 class="text-xl font-bold text-gray-900">Chats</h1>
	</div>

	{#if chats.length === 0}
		<div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
			<div class="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-3">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-orange-300">
					<path fill-rule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clip-rule="evenodd" />
				</svg>
			</div>
			<p class="text-sm font-medium text-gray-700 mb-1">Noch keine Matches</p>
			<p class="text-xs text-gray-400">Swipe und finde deinen Sportpartner!</p>
		</div>
	{:else}
		<ul class="flex-1 overflow-y-auto">
			{#each chats as chat (chat.id)}
				<li>
					<button
						onclick={() => onselect(chat)}
						class="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left {selectedId === chat.id ? 'bg-orange-50 border-r-2 border-orange-500' : ''}"
					>
						<!-- Avatar -->
						<div class="relative shrink-0">
							<div class="w-12 h-12 rounded-full bg-orange-100 overflow-hidden">
								{#if chat.profile_picture}
									<img src="{API}/uploads/{chat.profile_picture}" alt={chat.name} class="w-full h-full object-cover" />
								{:else}
									<div class="w-full h-full flex items-center justify-center">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-orange-300">
											<path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
										</svg>
									</div>
								{/if}
							</div>
							{#if chat.unread > 0}
								<span class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
									{chat.unread > 9 ? '9+' : chat.unread}
								</span>
							{/if}
						</div>

						<!-- Text -->
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between mb-0.5">
								<span class="font-semibold text-sm text-gray-900 truncate">{chat.name || 'Unbekannt'}</span>
								<span class="text-xs text-gray-400 shrink-0 ml-2">{formatTime(chat.last_at)}</span>
							</div>
							<p class="text-xs text-gray-500 truncate {chat.unread > 0 ? 'font-medium text-gray-700' : ''}">
								{chat.last_content ?? 'Ihr habt euch gematcht 🎉'}
							</p>
						</div>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
