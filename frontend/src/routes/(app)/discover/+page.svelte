<script>
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import SwipeCard from '$lib/components/SwipeCard.svelte';
  import MatchModal from '$lib/components/MatchModal.svelte';
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
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ swiped_id: swiped.id, direction }),
    });
    const data = await res.json();
    if (data.matched) matchedUser = swiped;
  }
</script>

<div class="page">
  <div class="stage">
    {#if loading}
      <div class="centered"><div class="spinner"></div></div>
    {:else if error}
      <div class="centered"><p class="error-text">{error}</p></div>
    {:else if current}
      <div class="card-wrap">
        <SwipeCard
          user={current}
          onlike={() => swipe('like')}
          onpass={() => swipe('pass')}
        />
      </div>
    {:else}
      <div class="empty">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>
        <h2>{$_('discover.noProfiles')}</h2>
        <p>{$_('discover.noProfilesHint')}</p>
      </div>
    {/if}
  </div>
</div>

<MatchModal user={matchedUser} onclose={() => (matchedUser = null)} />

<style>
  .page {
    height: calc(100vh - var(--navbar-height));
    background: var(--gray-50);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .stage {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 1.5rem 1rem;
    overflow: hidden;
  }

  @media (min-width: 640px) {
    .stage { padding: 2rem 1.5rem; }
  }

  .centered {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .spinner {
    width: 2.5rem;
    height: 2.5rem;
    border: 4px solid var(--orange-500);
    border-top-color: transparent;
    border-radius: var(--radius-full);
    animation: spin 0.7s linear infinite;
  }

  .error-text {
    font-size: 0.875rem;
    color: var(--red-500);
  }

  .card-wrap {
    width: 100%;
    max-width: 24rem;
  }

  .empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .empty-icon {
    width: 5rem;
    height: 5rem;
    background: var(--orange-50);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .empty-icon svg {
    width: 2.5rem;
    height: 2.5rem;
    color: var(--orange-300);
  }

  .empty h2 {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--gray-800);
    margin-bottom: 0.25rem;
  }

  .empty p {
    font-size: 0.875rem;
    color: var(--gray-400);
    max-width: 20rem;
  }
</style>
