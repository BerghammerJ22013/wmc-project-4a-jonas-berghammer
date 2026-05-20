<script>
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let errors = $state({ email: '', password: '', general: '' });
	let loading = $state(false);

	function validateEmail(val) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
	}

	function validate() {
		const e = { email: '', password: '', general: '' };
		if (!email) e.email = 'E-Mail ist erforderlich.';
		else if (!validateEmail(email)) e.email = 'Ungültige E-Mail-Adresse.';
		if (!password) e.password = 'Passwort ist erforderlich.';
		errors = e;
		return !e.email && !e.password;
	}

	async function handleSubmit(event) {
		event.preventDefault();
		if (!validate()) return;

		loading = true;
		errors.general = '';

		try {
			const res = await fetch('http://localhost:3000/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				errors.general = data.error ?? 'Anmeldung fehlgeschlagen.';
				return;
			}

			localStorage.setItem('token', data.token);
			goto('/discover');
		} catch {
			errors.general = 'Server nicht erreichbar.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
	<div class="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">

		<div class="text-center mb-8">
			<div class="text-4xl mb-2">🏃</div>
			<h1 class="text-3xl font-bold text-gray-900">SportSync</h1>
			<p class="text-gray-500 text-sm mt-1">Finde deinen Sport-Buddy</p>
		</div>

		{#if errors.general}
			<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
				{errors.general}
			</div>
		{/if}

		<form onsubmit={handleSubmit} novalidate class="space-y-4">

			<div>
				<label for="email" class="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="name@beispiel.at"
					class="w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition
						{errors.email ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300' : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'}"
				/>
				{#if errors.email}
					<p class="mt-1 text-xs text-red-500">{errors.email}</p>
				{/if}
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="••••••••"
					class="w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition
						{errors.password ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300' : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'}"
				/>
				{#if errors.password}
					<p class="mt-1 text-xs text-red-500">{errors.password}</p>
				{/if}
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-lg transition cursor-pointer"
			>
				{loading ? 'Anmelden…' : 'Anmelden'}
			</button>
		</form>

		<p class="text-center text-sm text-gray-500 mt-6">
			Noch kein Account?
			<a href="/register" class="text-orange-500 font-medium hover:underline">Registrieren</a>
		</p>
	</div>
</div>
