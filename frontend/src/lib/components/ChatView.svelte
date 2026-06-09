<script>
  import { tick } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { API, getToken } from '$lib/auth.js';
  import { socketStore } from '$lib/socketStore.svelte.js';
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

  async function handleNewMessage(msg) {
    if (msg.match_id !== chat?.id) return;
    messages = [...messages, msg];
    await tick();
    scrollToBottom();
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    sending = true;
    input = '';
    try {
      await fetch(`${API}/matches/${chat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ content: text }),
      });
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
    socketStore.emit('join_match', matchId);
    socketStore.on('new_message', handleNewMessage);
    return () => socketStore.off('new_message', handleNewMessage);
  });
</script>

<div class="view">
  <div class="header">
    <button class="back-btn" onclick={onback} aria-label={$_('chat.back')}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fill-rule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clip-rule="evenodd" />
      </svg>
    </button>

    <div class="header-avatar">
      {#if chat.profile_picture}
        <img src="{API}/uploads/{chat.profile_picture}" alt={chat.name} />
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
        </svg>
      {/if}
    </div>
    <div>
      <p class="header-name">{chat.name || $_('chat.unknown')}</p>
      {#if chat.location}<p class="header-location">{chat.location}</p>{/if}
    </div>
  </div>

  <div class="messages scrollbar-hide" bind:this={messagesEl}>
    {#if loading}
      <div class="centered"><div class="spinner"></div></div>
    {:else if messages.length === 0}
      <div class="centered empty-chat">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>
        <p class="empty-title">{$_('chat.noMessages')}</p>
        <p class="empty-hint">{$_('chat.writeFirst')}</p>
      </div>
    {:else}
      {#each messages as msg (msg.id)}
        {@const isMe = msg.sender_id === userStore.user?.id}
        <div class="bubble-row" class:mine={isMe}>
          <div class="bubble" class:mine={isMe} class:theirs={!isMe}>
            {msg.content}
          </div>
          <p class="bubble-time" class:mine={isMe}>{formatTime(msg.created_at)}</p>
        </div>
      {/each}
    {/if}
  </div>

  <div class="input-bar">
    <textarea
      bind:value={input}
      onkeydown={onKeydown}
      placeholder={$_('chat.placeholder')}
      rows="1"
      class="msg-input"
    ></textarea>
    <button class="send-btn" onclick={send} disabled={!input.trim() || sending}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
      </svg>
    </button>
  </div>
</div>

<style>
  .view {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-bottom: 1px solid var(--gray-100);
    background: var(--white);
    flex-shrink: 0;
  }

  .back-btn {
    padding: 0.375rem;
    border-radius: var(--radius-xl);
    cursor: pointer;
    color: var(--gray-600);
    transition: background 0.1s;
    display: none;
  }

  .back-btn:hover {
    background: var(--gray-100);
  }

  .back-btn svg {
    width: 1.25rem;
    height: 1.25rem;
    display: block;
  }

  @media (max-width: 767px) {
    .back-btn { display: block; }
  }

  .header-avatar {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--radius-full);
    background: var(--orange-100);
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .header-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .header-avatar svg {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--orange-300);
  }

  .header-name {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--gray-900);
  }

  .header-location {
    font-size: 0.75rem;
    color: var(--gray-400);
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: var(--gray-50);
  }

  .centered {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border: 4px solid var(--orange-500);
    border-top-color: transparent;
    border-radius: var(--radius-full);
    animation: spin 0.7s linear infinite;
  }

  .empty-chat {
    flex-direction: column;
    text-align: center;
    padding: 3rem 0;
  }

  .empty-icon {
    width: 3.5rem;
    height: 3.5rem;
    background: var(--orange-50);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 0.75rem;
  }

  .empty-icon svg {
    width: 1.75rem;
    height: 1.75rem;
    color: var(--orange-300);
  }

  .empty-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--gray-700);
    margin-bottom: 0.25rem;
  }

  .empty-hint {
    font-size: 0.75rem;
    color: var(--gray-400);
  }

  .bubble-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .bubble-row.mine {
    align-items: flex-end;
  }

  .bubble {
    max-width: 70%;
    padding: 0.625rem 0.875rem;
    border-radius: var(--radius-2xl);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .bubble.theirs {
    background: var(--white);
    color: var(--gray-800);
    border: 1px solid var(--gray-100);
    box-shadow: var(--shadow-sm);
    border-bottom-left-radius: var(--radius-sm);
  }

  .bubble.mine {
    background: var(--orange-500);
    color: var(--white);
    border-bottom-right-radius: var(--radius-sm);
  }

  .bubble-time {
    font-size: 0.7rem;
    color: var(--gray-400);
    margin-top: 0.25rem;
  }

  .bubble-time.mine {
    text-align: right;
  }

  .input-bar {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--gray-100);
    background: var(--white);
    flex-shrink: 0;
  }

  .msg-input {
    flex: 1;
    resize: none;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-2xl);
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
    color: var(--gray-800);
    background: var(--white);
    outline: none;
    max-height: 8rem;
    overflow-y: auto;
    line-height: 1.5;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .msg-input::placeholder {
    color: var(--gray-400);
  }

  .msg-input:focus {
    border-color: var(--orange-400);
    box-shadow: 0 0 0 3px var(--orange-100);
  }

  .send-btn {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius-2xl);
    background: var(--orange-500);
    color: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s, opacity 0.15s;
    box-shadow: 0 1px 3px var(--orange-200);
  }

  .send-btn:hover {
    background: var(--orange-600);
  }

  .send-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .send-btn svg {
    width: 1.25rem;
    height: 1.25rem;
  }
</style>
