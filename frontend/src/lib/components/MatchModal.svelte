<script>
  import { _ } from 'svelte-i18n';
  import { API } from '$lib/auth.js';

  let { user, onclose } = $props();
</script>

{#if user}
  <div class="backdrop">
    <button class="backdrop-btn" onclick={onclose} aria-label="Schließen"></button>

    <div class="modal">
      <div class="avatar-wrap">
        <div class="avatar">
          {#if user.profile_picture}
            <img src="{API}/uploads/{user.profile_picture}" alt="" />
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
            </svg>
          {/if}
        </div>
        <div class="heart-badge">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>
      </div>

      <h2>{$_('match.title')}</h2>
      <p>{$_('match.subtitle', { name: user.name })}</p>

      <div class="actions">
        <a href="/chats" class="btn-primary" onclick={onclose}>{$_('match.sendMessage')}</a>
        <button class="btn-ghost" onclick={onclose}>{$_('match.keepDiscovering')}</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  .backdrop-btn {
    position: absolute;
    inset: 0;
    background: rgb(0 0 0 / 0.6);
    backdrop-filter: blur(4px);
    cursor: default;
  }

  .modal {
    position: relative;
    background: var(--white);
    border-radius: var(--radius-3xl);
    box-shadow: var(--shadow-2xl);
    padding: 2rem;
    max-width: 24rem;
    width: 100%;
    text-align: center;
  }

  .avatar-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
    position: relative;
    width: fit-content;
    margin-inline: auto;
  }

  .avatar {
    width: 5rem;
    height: 5rem;
    border-radius: var(--radius-full);
    background: var(--orange-100);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar svg {
    width: 2.5rem;
    height: 2.5rem;
    color: var(--orange-300);
  }

  .heart-badge {
    position: absolute;
    top: -0.25rem;
    right: -0.25rem;
    width: 1.75rem;
    height: 1.75rem;
    background: var(--orange-500);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow);
  }

  .heart-badge svg {
    width: 1rem;
    height: 1rem;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: 0.25rem;
  }

  p {
    font-size: 0.875rem;
    color: var(--gray-500);
    margin-bottom: 1.5rem;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-primary {
    display: block;
    padding: 0.75rem;
    background: var(--orange-500);
    color: var(--white);
    font-weight: 600;
    border-radius: var(--radius-2xl);
    transition: background 0.15s;
    text-align: center;
  }

  .btn-primary:hover {
    background: var(--orange-600);
  }

  .btn-ghost {
    width: 100%;
    padding: 0.75rem;
    color: var(--gray-500);
    font-weight: 500;
    border-radius: var(--radius-2xl);
    cursor: pointer;
    transition: background 0.15s;
  }

  .btn-ghost:hover {
    background: var(--gray-50);
  }
</style>
