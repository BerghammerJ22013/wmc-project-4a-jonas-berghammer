<script>
	import { goto } from '$app/navigation';
	import { _ } from 'svelte-i18n';
	import { setToken } from '$lib/auth.js';
	import { userStore } from '$lib/userStore.svelte.js';
	import { t } from '$lib/i18n.js';

	let email = $state('');
	let password = $state('');
	let passwordConfirm = $state('');
	let errors = $state({ email: '', password: '', passwordConfirm: '', general: '' });
	let loading = $state(false);

	function validateEmail(val) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
	}

	function validatePassword(val) {
		return val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val);
	}

	function passwordStrength(val) {
		if (!val) return null;
		if (val.length < 6) return 'weak';
		if (validatePassword(val)) return 'strong';
		return 'medium';
	}

	let strength = $derived(passwordStrength(password));

	const strengthColor = { weak: 'bg-red-400', medium: 'bg-yellow-400', strong: 'bg-green-500' };
	const strengthWidth = { weak: 'w-1/3', medium: 'w-2/3', strong: 'w-full' };

	function validate() {
		const e = { email: '', password: '', passwordConfirm: '', general: '' };
		if (!email) e.email = t('register.errors.emailRequired');
		else if (!validateEmail(email)) e.email = t('register.errors.emailInvalid');
		if (!password) e.password = t('register.errors.passwordRequired');
		else if (!validatePassword(password)) e.password = t('register.errors.passwordWeak');
		if (!passwordConfirm) e.passwordConfirm = t('register.errors.confirmRequired');
		else if (password !== passwordConfirm) e.passwordConfirm = t('register.errors.confirmMismatch');
		errors = e;
		return !e.email && !e.password && !e.passwordConfirm;
	}

	async function handleSubmit(event) {
		event.preventDefault();
		if (!validate()) return;

		loading = true;
		errors.general = '';

		try {
			const res = await fetch('http://localhost:3000/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				errors.general = data.error ?? t('register.errors.failed');
				return;
			}

			setToken(data.token);
			await userStore.load();
			goto('/discover');
		} catch {
			errors.general = t('register.errors.serverUnreachable');
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
	<div class="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 sm:p-8">

		<div class="text-center mb-8">
			<div class="text-4xl mb-2">🏃</div>
			<h1 class="text-3xl font-bold text-gray-900">SportSync</h1>
			<p class="text-gray-500 text-sm mt-1">{$_('register.subtitle')}</p>
		</div>

		{#if errors.general}
			<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
				{errors.general}
			</div>
		{/if}

		<form onsubmit={handleSubmit} novalidate class="space-y-4">
			<div>
				<label for="email" class="block text-sm font-medium text-gray-700 mb-1">{$_('register.email')}</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="name@beispiel.at"
					class="w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition bg-white
						{errors.email ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300' : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'}"
				/>
				{#if errors.email}
					<p class="mt-1 text-xs text-red-500">{errors.email}</p>
				{/if}
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-gray-700 mb-1">{$_('register.password')}</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="••••••••"
					class="w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition bg-white
						{errors.password ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300' : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'}"
				/>
				{#if password && !errors.password}
					<div class="mt-1.5 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
						<div class="h-full rounded-full transition-all {strengthColor[strength]} {strengthWidth[strength]}"></div>
					</div>
					<p class="mt-0.5 text-xs text-gray-400">{$_('register.strength.' + strength)}</p>
				{/if}
				{#if errors.password}
					<p class="mt-1 text-xs text-red-500">{errors.password}</p>
				{/if}
			</div>

			<div>
				<label for="passwordConfirm" class="block text-sm font-medium text-gray-700 mb-1">{$_('register.confirmPassword')}</label>
				<input
					id="passwordConfirm"
					type="password"
					bind:value={passwordConfirm}
					placeholder="••••••••"
					class="w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition bg-white
						{errors.passwordConfirm ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300' : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'}"
				/>
				{#if errors.passwordConfirm}
					<p class="mt-1 text-xs text-red-500">{errors.passwordConfirm}</p>
				{/if}
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-lg transition cursor-pointer"
			>
				{loading ? $_('register.submitting') : $_('register.submit')}
			</button>
		</form>

		<p class="text-center text-sm text-gray-500 mt-6">
			{$_('register.hasAccount')}
			<a href="/login" class="text-orange-500 font-medium hover:underline">{$_('register.loginLink')}</a>
		</p>
	</div>
</div>
