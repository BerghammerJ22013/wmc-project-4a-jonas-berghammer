<script>
  import { _ } from 'svelte-i18n';
  import { API } from '$lib/auth.js';

  let { chats, likes = [], selectedId, onselect, onlike } = $props();

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

<div class="list-root">
  {#if likes.length > 0}
    <div class="likes-section">
      <p class="likes-label">{$_('chats.likes')}</p>
      <div class="likes-scroll scrollbar-hide">
        {#each likes as liker (liker.id)}
          <button class="liker-chip" onclick={() => onlike?.(liker)} title={liker.name}>
            <div class="liker-avatar">
              {#if liker.profile_picture}
                <img src="{API}/uploads/{liker.profile_picture}" alt={liker.name} />
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
                </svg>
              {/if}
              <div class="heart-dot">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              </div>
            </div>
            <span class="liker-name">{liker.name ?? '?'}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <div class="list-header">
    <h1>{$_('chats.title')}</h1>
  </div>

  {#if chats.length === 0}
    <div class="empty">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clip-rule="evenodd" />
        </svg>
      </div>
      <p class="empty-title">{$_('chats.noMatches')}</p>
      <p class="empty-hint">{$_('chats.noMatchesHint')}</p>
    </div>
  {:else}
    <ul class="chats-list">
      {#each chats as chat (chat.id)}
        <li>
          <button class="chat-item" class:selected={selectedId === chat.id} onclick={() => onselect(chat)}>
            <div class="chat-avatar">
              <div class="avatar-img">
                {#if chat.profile_picture}
                  <img src="{API}/uploads/{chat.profile_picture}" alt={chat.name} />
                {:else}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
                  </svg>
                {/if}
              </div>
              {#if chat.unread > 0}
                <span class="unread-badge">{chat.unread > 9 ? '9+' : chat.unread}</span>
              {/if}
            </div>

            <div class="chat-info">
              <div class="chat-row">
                <span class="chat-name">{chat.name || 'Unbekannt'}</span>
                <span class="chat-time">{formatTime(chat.last_at)}</span>
              </div>
              <p class="chat-preview" class:unread={chat.unread > 0}>
                {chat.last_content ?? $_('chats.matched')}
              </p>
            </div>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .list-root {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .likes-section {
    padding: 1rem 1rem 0.75rem;
    border-bottom: 1px solid var(--gray-100);
    flex-shrink: 0;
  }

  .likes-label {
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--orange-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
  }

  .likes-scroll {
    display: flex;
    gap: 0.75rem;
    overflow-x: auto;
    padding-bottom: 0.25rem;
  }

  .liker-chip {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
    cursor: pointer;
    opacity: 1;
    transition: opacity 0.15s;
  }

  .liker-chip:hover {
    opacity: 0.75;
  }

  .liker-avatar {
    position: relative;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: var(--radius-full);
    background: var(--orange-100);
    overflow: visible;
    border: 2px solid var(--orange-400);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .liker-avatar img {
    width: 100%;
    height: 100%;
    border-radius: var(--radius-full);
    object-fit: cover;
  }

  .liker-avatar svg {
    width: 1.75rem;
    height: 1.75rem;
    color: var(--orange-300);
  }

  .heart-dot {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 1.25rem;
    height: 1.25rem;
    background: var(--orange-500);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-sm);
  }

  .heart-dot svg {
    width: 0.75rem;
    height: 0.75rem;
    color: var(--white);
  }

  .liker-name {
    font-size: 0.75rem;
    color: var(--gray-600);
    font-weight: 500;
    max-width: 3.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
  }

  .list-header {
    padding: 1rem;
    border-bottom: 1px solid var(--gray-100);
    flex-shrink: 0;
  }

  .list-header h1 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--gray-900);
  }

  .empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    text-align: center;
  }

  .empty-icon {
    width: 4rem;
    height: 4rem;
    background: var(--orange-50);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.75rem;
  }

  .empty-icon svg {
    width: 2rem;
    height: 2rem;
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

  .chats-list {
    flex: 1;
    overflow-y: auto;
    list-style: none;
  }

  .chat-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    text-align: left;
    cursor: pointer;
    transition: background 0.1s;
    border-left: 2px solid transparent;
  }

  .chat-item:hover {
    background: var(--gray-50);
  }

  .chat-item.selected {
    background: var(--orange-50);
    border-left-color: var(--orange-500);
  }

  .chat-avatar {
    position: relative;
    flex-shrink: 0;
  }

  .avatar-img {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-full);
    background: var(--orange-100);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-img svg {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--orange-300);
  }

  .unread-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    min-width: 1.25rem;
    height: 1.25rem;
    background: var(--orange-500);
    color: var(--white);
    font-size: 0.65rem;
    font-weight: 700;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0.2rem;
  }

  .chat-info {
    flex: 1;
    min-width: 0;
  }

  .chat-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.125rem;
  }

  .chat-name {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--gray-900);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chat-time {
    font-size: 0.75rem;
    color: var(--gray-400);
    flex-shrink: 0;
    margin-left: 0.5rem;
  }

  .chat-preview {
    font-size: 0.75rem;
    color: var(--gray-500);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chat-preview.unread {
    font-weight: 500;
    color: var(--gray-700);
  }
</style>
