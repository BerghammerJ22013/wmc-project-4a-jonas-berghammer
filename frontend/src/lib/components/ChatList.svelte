<script>
	import { _ } from 'svelte-i18n';
	import { API } from '$lib/auth.js';

	let { chats, likes = [], selectedId, onselect } = $props();

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
	<!-- Received likes -->
	{#if likes.length > 0}
		<div class="px-4 pt-4 pb-3 border-b border-gray-100 shrink-0">
			<p class="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-3">{$_('chats.likes')}</p>
			<div class="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
				{#each likes as liker (liker.id)}
					<div class="flex flex-col items-center gap-1 shrink-0">
						<div class="relative">
							<div class="w-14 h-14 rounded-full bg-orange-100 overflow-hidden ring-2 ring-orange-400">
								{#if liker.profile_picture}
									<img src="{API}/uploads/{liker.profile_picture}" alt={liker.name} class="w-full h-full object-cover" />
								{:else}
									<div class="w-full h-full flex items-center justify-center">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7 text-orange-300">
											<path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
										</svg>
									</div>
								{/if}
							</div>
							<div class="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-3 h-3">
									<path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
								</svg>
							</div>
						</div>
						<span class="text-xs text-gray-600 font-medium max-w-[3.5rem] truncate text-center">{liker.name ?? '?'}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<div class="px-4 py-4 border-b border-gray-100 shrink-0">
		<h1 class="text-xl font-bold text-gray-900">{$_('chats.title')}</h1>
	</div>

	{#if chats.length === 0}
		<div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
			<div class="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-3">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-orange-300">
					<path fill-rule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clip-rule="evenodd" />
				</svg>
			</div>
			<p class="text-sm font-medium text-gray-700 mb-1">{$_('chats.noMatches')}</p>
			<p class="text-xs text-gray-400">{$_('chats.noMatchesHint')}</p>
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
								{chat.last_content ?? $_('chats.matched')}
							</p>
						</div>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
