<script>
  import { _ } from 'svelte-i18n';
  import { API } from '$lib/auth.js';

  let { user, onlike, onpass } = $props();
</script>

<div class="card">
  <div class="photo">
    {#if user.profile_picture}
      <img src="{API}/uploads/{user.profile_picture}" alt={user.name} />
    {:else}
      <div class="photo-placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
        </svg>
      </div>
    {/if}

    <div class="overlay">
      <h2 class="name">{user.name || $_('card.unknown')}{user.age ? `, ${user.age}` : ''}</h2>
      {#if user.location}
        <p class="location">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.079 3.953-5.056 3.953-9.327 0-4.112-3.29-7.25-7.25-7.25-3.96 0-7.25 3.138-7.25 7.25 0 4.271 2.009 7.248 3.953 9.327a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" clip-rule="evenodd" />
          </svg>
          {user.location}{user.distance_km != null ? ` · ${user.distance_km} km` : ''}
        </p>
      {/if}
    </div>
  </div>

  <div class="body">
    {#if user.sports?.length}
      <div class="sports">
        {#each user.sports as sport}
          <span class="sport-tag">{sport.name ?? sport}</span>
        {/each}
      </div>
    {/if}
    {#if user.bio}
      <p class="bio">{user.bio}</p>
    {/if}
  </div>

  <div class="actions">
    <button class="btn-pass" onclick={onpass}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
      </svg>
      {$_('card.pass')}
    </button>
    <button class="btn-like" onclick={onlike}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
      {$_('card.like')}
    </button>
  </div>
</div>

<style>
  .card {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--white);
    border-radius: var(--radius-3xl);
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--gray-100);
    overflow: hidden;
  }

  .photo {
    position: relative;
    flex: 1;
    min-height: 0;
    background: var(--gray-100);
  }

  .photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .photo-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--orange-100), var(--orange-200));
  }

  .photo-placeholder svg {
    width: 6rem;
    height: 6rem;
    color: var(--orange-300);
  }

  .overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgb(0 0 0 / 0.6), transparent);
    padding: 2.5rem 1.25rem 1rem;
  }

  .name {
    color: var(--white);
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.25;
  }

  .location {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: rgb(255 255 255 / 0.8);
    font-size: 0.875rem;
    margin-top: 0.125rem;
  }

  .location svg {
    width: 0.875rem;
    height: 0.875rem;
    flex-shrink: 0;
  }

  .body {
    flex-shrink: 0;
    padding: 0.75rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .sports {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .sport-tag {
    padding: 0.25rem 0.625rem;
    background: var(--orange-50);
    border: 1px solid var(--orange-200);
    color: var(--orange-600);
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: var(--radius-full);
  }

  .bio {
    font-size: 0.875rem;
    color: var(--gray-600);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .actions {
    flex-shrink: 0;
    display: flex;
    gap: 0.75rem;
    padding: 0.25rem 1.25rem 1.25rem;
  }

  .btn-pass,
  .btn-like {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border-radius: var(--radius-2xl);
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }

  .btn-pass svg,
  .btn-like svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .btn-pass {
    border: 2px solid var(--gray-200);
    color: var(--gray-500);
    background: var(--white);
  }

  .btn-pass:hover {
    border-color: var(--red-300);
    color: var(--red-500);
    background: var(--red-50);
  }

  .btn-like {
    background: var(--orange-500);
    color: var(--white);
    box-shadow: 0 1px 3px var(--orange-200);
  }

  .btn-like:hover {
    background: var(--orange-600);
  }
</style>
