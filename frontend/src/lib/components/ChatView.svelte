<script>
	import { tick } from 'svelte';
	import { io } from 'socket.io-client';
	import { API, getToken } from '$lib/auth.js';
	import { userStore } from '$lib/userStore.svelte.js';

	let { chat, onback } = $props();

	let messages = $state([]);
	let loading = $state(true);
	let input = $state('');
	let sending = $state(false);
	let messagesEl = $state(null);

	function scrollToBottom() {
		if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
	}

	async function loadMessages(matchId) {
		loading = true;
		try {
			const res = await fetch(`${API}/matches/${matchId}/messages`, {
				headers: { Authorization: `Bearer ${getToken()}` },
			});
			messages = await res.json();
			await tick();
			scrollToBottom();
		} finally {
			loading = false;
		}
	}

	async function send() {
		const text = input.trim();
		if (!text || sending) return;
		sending = true;
		input = '';
		try {
			await fetch(`${API}/matches/${chat.id}/messages`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${getToken()}`,
				},
				body: JSON.stringify({ content: text }),
			});
			// message arrives via socket broadcast — no local push needed
		} finally {
			sending = false;
		}
	}

	function onKeydown(e) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}

	function formatTime(dateStr) {
		return new Date(dateStr).toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' });
	}

	$effect(() => {
		const matchId = chat?.id;
		if (!matchId) return;

		messages = [];
		loadMessages(matchId);

		const socket = io(API, { auth: { token: getToken() } });

		socket.emit('join_match', matchId);

		socket.on('new_message', async (msg) => {
			messages = [...messages, msg];
			await tick();
			scrollToBottom();
		});

		return () => socket.disconnect();
	});
</script>

<div class="flex flex-col h-full">
	<!-- Header -->
	<div class="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 bg-white shrink-0">
		<!-- Back button (mobile) -->
		<button
			onclick={onback}
			class="md:hidden p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
			aria-label="Zurück"
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-gray-600">
				<path fill-rule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clip-rule="evenodd" />
			</svg>
		</button>

		<div class="w-9 h-9 rounded-full bg-orange-100 overflow-hidden shrink-0">
			{#if chat.profile_picture}
				<img src="{API}/uploads/{chat.profile_picture}" alt={chat.name} class="w-full h-full object-cover" />
			{:else}
				<div class="w-full h-full flex items-center justify-center">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-orange-300">
						<path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
					</svg>
				</div>
			{/if}
		</div>
		<div>
			<p class="font-semibold text-sm text-gray-900">{chat.name || 'Unbekannt'}</p>
			{#if chat.location}
				<p class="text-xs text-gray-400">{chat.location}</p>
			{/if}
		</div>
	</div>

	<!-- Messages -->
	<div bind:this={messagesEl} class="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
		{#if loading}
			<div class="flex justify-center pt-8">
				<div class="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
			</div>
		{:else if messages.length === 0}
			<div class="flex flex-col items-center justify-center h-full text-center py-12">
				<div class="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mb-3">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7 text-orange-300">
						<path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
					</svg>
				</div>
				<p class="text-sm font-medium text-gray-700 mb-1">Ihr habt euch gematcht!</p>
				<p class="text-xs text-gray-400">Schreib die erste Nachricht.</p>
			</div>
		{:else}
			{#each messages as msg (msg.id)}
				{@const isMe = msg.sender_id === userStore.user?.id}
				<div class="flex {isMe ? 'justify-end' : 'justify-start'}">
					<div class="max-w-[70%]">
						<div class="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
							{isMe
								? 'bg-orange-500 text-white rounded-br-sm'
								: 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm'}">
							{msg.content}
						</div>
						<p class="text-xs text-gray-400 mt-1 {isMe ? 'text-right' : 'text-left'}">{formatTime(msg.created_at)}</p>
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<!-- Input -->
	<div class="px-4 py-3 border-t border-gray-100 bg-white shrink-0">
		<div class="flex items-end gap-2">
			<textarea
				bind:value={input}
				onkeydown={onKeydown}
				placeholder="Nachricht..."
				rows="1"
				class="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent leading-relaxed max-h-32 overflow-y-auto"
			></textarea>
			<button
				onclick={send}
				disabled={!input.trim() || sending}
				class="shrink-0 w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-orange-200"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
					<path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
				</svg>
			</button>
		</div>
	</div>
</div>
