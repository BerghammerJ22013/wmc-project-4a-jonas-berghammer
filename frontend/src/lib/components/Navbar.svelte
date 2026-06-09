<script>
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { _ } from 'svelte-i18n';
  import { logout } from '$lib/auth.js';
  import { userStore } from '$lib/userStore.svelte.js';

  const links = [
    {
      href: '/discover',
      labelKey: 'nav.discover',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>`,
    },
    {
      href: '/chats',
      labelKey: 'nav.chats',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clip-rule="evenodd" /></svg>`,
    },
    {
      href: '/profile',
      labelKey: 'nav.profile',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" /></svg>`,
    },
  ];

  async function handleLogout() {
    await logout();
    userStore.clear();
    goto('/login');
  }
</script>

<nav>
  <div class="nav-inner">
    {#each links as link}
      {@const active = page.url.pathname === link.href}
      <a href={link.href} class="nav-link" class:active>
        {@html link.icon}
        <span>{$_(link.labelKey)}</span>
      </a>
    {/each}

    <button class="nav-link logout" onclick={handleLogout}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clip-rule="evenodd" />
      </svg>
      <span>{$_('nav.logout')}</span>
    </button>
  </div>
</nav>

<style>
  nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--white);
    border-top: 1px solid var(--gray-200);
    box-shadow: 0 -2px 10px rgb(0 0 0 / 0.06);
    z-index: 50;
  }

  .nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-around;
    max-width: 32rem;
    margin: 0 auto;
    height: var(--navbar-height);
    padding: 0 0.5rem;
  }

  .nav-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.125rem;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-xl);
    color: var(--gray-400);
    transition: color 0.15s;
    cursor: pointer;
  }

  .nav-link :global(svg) {
    width: 1.5rem;
    height: 1.5rem;
  }

  .nav-link span {
    font-size: 0.75rem;
    font-weight: 500;
  }

  .nav-link:hover {
    color: var(--gray-600);
  }

  .nav-link.active {
    color: var(--orange-500);
  }

  .logout:hover {
    color: var(--red-500);
  }
</style>
