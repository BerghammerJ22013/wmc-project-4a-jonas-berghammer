<script>
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { isLoggedIn } from '$lib/auth.js';
  import { userStore } from '$lib/userStore.svelte.js';
  import { socketStore } from '$lib/socketStore.svelte.js';
  import { locale } from '$lib/i18n.js';
  import Navbar from '$lib/components/Navbar.svelte';
  import MatchModal from '$lib/components/MatchModal.svelte';

  let { children } = $props();
  let globalMatchedUser = $state(null);

  if (browser && !isLoggedIn()) goto('/login');

  function onMatchEvent(user) { globalMatchedUser = user; }

  onMount(async () => {
    if (isLoggedIn() && !userStore.user) await userStore.load();
    if (userStore.user?.language) {
      locale.set(userStore.user.language);
      localStorage.setItem('sportsync_lang', userStore.user.language);
    }
    if (isLoggedIn()) socketStore.connect();
    socketStore.on('match', onMatchEvent);
  });

  onDestroy(() => {
    socketStore.off('match', onMatchEvent);
    socketStore.disconnect();
  });
</script>

<div class="layout">
  {@render children()}
</div>

<Navbar />
<MatchModal user={globalMatchedUser} onclose={() => (globalMatchedUser = null)} />

<style>
  .layout {
    padding-bottom: var(--navbar-height);
  }
</style>
