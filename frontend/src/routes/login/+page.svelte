<script>
  import { goto } from '$app/navigation';
  import { _ } from 'svelte-i18n';
  import { API, setToken } from '$lib/auth.js';
  import { userStore } from '$lib/userStore.svelte.js';
  import { t } from '$lib/i18n.js';

  let email = $state('');
  let password = $state('');
  let errors = $state({ email: '', password: '', general: '' });
  let loading = $state(false);

  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function validate() {
    const e = { email: '', password: '', general: '' };
    if (!email) e.email = t('login.errors.emailRequired');
    else if (!validateEmail(email)) e.email = t('login.errors.emailInvalid');
    if (!password) e.password = t('login.errors.passwordRequired');
    errors = e;
    return !e.email && !e.password;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    loading = true;
    errors.general = '';
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { errors.general = data.error ?? t('login.errors.failed'); return; }
      setToken(data.token);
      await userStore.load();
      goto('/discover');
    } catch {
      errors.general = t('login.errors.serverUnreachable');
    } finally {
      loading = false;
    }
  }
</script>

<div class="page">
  <div class="card">
    <div class="logo">
      <span class="emoji">🏃</span>
      <h1>SportSync</h1>
      <p>{$_('login.subtitle')}</p>
    </div>

    {#if errors.general}
      <div class="alert">{errors.general}</div>
    {/if}

    <form onsubmit={handleSubmit} novalidate>
      <div class="field">
        <label for="email">{$_('login.email')}</label>
        <input id="email" type="email" bind:value={email} placeholder="name@beispiel.at" class:invalid={errors.email} />
        {#if errors.email}<span class="error">{errors.email}</span>{/if}
      </div>

      <div class="field">
        <label for="password">{$_('login.password')}</label>
        <input id="password" type="password" bind:value={password} placeholder="••••••••" class:invalid={errors.password} />
        {#if errors.password}<span class="error">{errors.password}</span>{/if}
      </div>

      <button type="submit" class="btn-submit" disabled={loading}>
        {loading ? $_('login.submitting') : $_('login.submit')}
      </button>
    </form>

    <p class="footer">
      {$_('login.noAccount')}
      <a href="/register">{$_('login.registerLink')}</a>
    </p>
  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f97316, #dc2626);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .card {
    width: 100%;
    max-width: 24rem;
    background: var(--white);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-2xl);
    padding: 1.5rem;
  }

  @media (min-width: 480px) {
    .card { padding: 2rem; }
  }

  .logo {
    text-align: center;
    margin-bottom: 2rem;
  }

  .emoji {
    font-size: 2.5rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  .logo h1 {
    font-size: 1.875rem;
    font-weight: 700;
    color: var(--gray-900);
  }

  .logo p {
    font-size: 0.875rem;
    color: var(--gray-500);
    margin-top: 0.25rem;
  }

  .alert {
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: var(--red-50);
    border: 1px solid var(--red-200);
    border-radius: var(--radius-lg);
    color: var(--red-500);
    font-size: 0.875rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--gray-700);
  }

  input {
    padding: 0.625rem 1rem;
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-lg);
    font-size: 0.875rem;
    color: var(--gray-900);
    background: var(--white);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  input:focus {
    border-color: var(--orange-500);
    box-shadow: 0 0 0 3px var(--orange-100);
  }

  input.invalid {
    border-color: var(--red-400);
    background: var(--red-50);
  }

  input.invalid:focus {
    box-shadow: 0 0 0 3px var(--red-200);
  }

  .error {
    font-size: 0.75rem;
    color: var(--red-500);
  }

  .btn-submit {
    margin-top: 0.25rem;
    padding: 0.625rem;
    background: var(--orange-500);
    color: var(--white);
    font-weight: 600;
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: background 0.15s, opacity 0.15s;
    font-size: 0.9375rem;
  }

  .btn-submit:hover {
    background: var(--orange-600);
  }

  .btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .footer {
    text-align: center;
    font-size: 0.875rem;
    color: var(--gray-500);
    margin-top: 1.5rem;
  }

  .footer a {
    color: var(--orange-500);
    font-weight: 500;
  }

  .footer a:hover {
    text-decoration: underline;
  }
</style>
