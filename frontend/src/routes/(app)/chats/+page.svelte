<script>
  import { onMount, onDestroy } from 'svelte';
  import { _ } from 'svelte-i18n';
  import ChatList from '$lib/components/ChatList.svelte';
  import ChatView from '$lib/components/ChatView.svelte';
  import MatchModal from '$lib/components/MatchModal.svelte';
  import { API, getToken } from '$lib/auth.js';
  import { socketStore } from '$lib/socketStore.svelte.js';
  import { userStore } from '$lib/userStore.svelte.js';

  let chats = $state([]);
  let likes = $state([]);
  let loading = $state(true);
  let selectedChat = $state(null);
  let matchedUser = $state(null);

  onMount(async () => {
    try {
      const [matchesRes, likesRes] = await Promise.all([
        fetch(`${API}/matches`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch(`${API}/likes/received`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      ]);
      chats = await matchesRes.json();
      likes = await likesRes.json();
    } finally {
      loading = false;
    }
    socketStore.on('new_message', handleNewMessage);
  });

  onDestroy(() => socketStore.off('new_message', handleNewMessage));

  function handleNewMessage(msg) {
    chats = chats.map((c) => {
      if (c.id !== msg.match_id) return c;
      const isSelected = selectedChat?.id === c.id;
      const isFromMe = msg.sender_id === userStore.user?.id;
      return {
        ...c,
        last_content: msg.content,
        last_at: msg.created_at,
        unread: isSelected || isFromMe ? c.unread : (c.unread ?? 0) + 1,
      };
    });
    chats = [...chats].sort((a, b) =>
      new Date(b.last_at ?? b.created_at) - new Date(a.last_at ?? a.created_at),
    );
  }

  async function likeback(liker) {
    likes = likes.filter((l) => l.id !== liker.id);
    const res = await fetch(`${API}/swipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ swiped_id: liker.id, direction: 'like' }),
    });
    const data = await res.json();
    if (data.matched) {
      matchedUser = liker;
      const matchesRes = await fetch(`${API}/matches`, { headers: { Authorization: `Bearer ${getToken()}` } });
      chats = await matchesRes.json();
    }
  }
</script>

<div class="page">
  <div class="list-pane" class:hidden={selectedChat}>
    {#if loading}
      <div class="centered"><div class="spinner"></div></div>
    {:else}
      <ChatList
        {chats}
        {likes}
        selectedId={selectedChat?.id}
        onselect={(chat) => {
          selectedChat = chat;
          chats = chats.map((c) => (c.id === chat.id ? { ...c, unread: 0 } : c));
        }}
        onlike={likeback}
      />
    {/if}
  </div>

  <div class="chat-pane" class:hidden={!selectedChat}>
    {#if selectedChat}
      <ChatView chat={selectedChat} onback={() => (selectedChat = null)} />
    {:else}
      <div class="no-chat">
        <div class="no-chat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clip-rule="evenodd" />
          </svg>
        </div>
        <h2>{$_('chats.selectChat')}</h2>
        <p>{$_('chats.selectChatHint')}</p>
      </div>
    {/if}
  </div>
</div>

<MatchModal user={matchedUser} onclose={() => (matchedUser = null)} />

<style>
  .page {
    height: calc(100vh - var(--navbar-height));
    display: flex;
    overflow: hidden;
    background: var(--white);
  }

  .list-pane {
    width: 100%;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--gray-100);
    flex-shrink: 0;
  }

  .chat-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 768px) {
    .list-pane {
      width: 20rem;
    }
    .list-pane.hidden,
    .chat-pane.hidden {
      display: flex;
    }
  }

  @media (max-width: 767px) {
    .list-pane.hidden { display: none; }
    .chat-pane.hidden { display: none; }
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

  .no-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
  }

  .no-chat-icon {
    width: 5rem;
    height: 5rem;
    background: var(--orange-50);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .no-chat-icon svg {
    width: 2.5rem;
    height: 2.5rem;
    color: var(--orange-300);
  }

  .no-chat h2 {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--gray-800);
    margin-bottom: 0.25rem;
  }

  .no-chat p {
    font-size: 0.875rem;
    color: var(--gray-400);
    max-width: 20rem;
  }
</style>
