<script>
	import { onMount } from 'svelte';
	import { getToken, API } from '$lib/auth.js';

	let user = $state(null);
	let allSports = $state([]);
	let loading = $state(true);
	let error = $state('');

	// picture
	let pictureUrl = $state(null);
	let uploading = $state(false);
	let pictureMsg = $state('');
	let pictureMsgOk = $state(false);
	let fileInput;

	// sports
	let selectedSports = $state([]);
	let savingSports = $state(false);
	let sportsMsg = $state('');
	let sportsMsgOk = $state(false);

	onMount(async () => {
		try {
			const token = getToken();
			const headers = { Authorization: `Bearer ${token}` };

			const [userRes, sportsRes] = await Promise.all([
				fetch(`${API}/users/me`, { headers }),
				fetch(`${API}/sports`),
			]);

			if (!userRes.ok) throw new Error('Profil konnte nicht geladen werden');

			user = await userRes.json();
			allSports = await sportsRes.json();
			selectedSports = user.sports.map((s) => s.id);

			if (user.profile_picture) {
				pictureUrl = `${API}/uploads/${user.profile_picture}`;
			}
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	});

	async function uploadPicture(e) {
		const file = e.target.files[0];
		if (!file) return;

		uploading = true;
		pictureMsg = '';

		const formData = new FormData();
		formData.append('picture', file);

		try {
			const res = await fetch(`${API}/users/me/picture`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${getToken()}` },
				body: formData,
			});
			const data = await res.json();
			if (res.ok) {
				pictureUrl = `${API}/uploads/${data.filename}`;
				pictureMsg = 'Profilbild gespeichert!';
				pictureMsgOk = true;
			} else {
				pictureMsg = data.error || 'Fehler beim Upload';
				pictureMsgOk = false;
			}
		} catch {
			pictureMsg = 'Verbindungsfehler';
			pictureMsgOk = false;
		} finally {
			uploading = false;
		}
	}

	function toggleSport(id) {
		if (selectedSports.includes(id)) {
			selectedSports = selectedSports.filter((s) => s !== id);
		} else {
			selectedSports = [...selectedSports, id];
		}
	}

	async function saveSports() {
		savingSports = true;
		sportsMsg = '';

		try {
			const res = await fetch(`${API}/users/me/sports`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${getToken()}`,
				},
				body: JSON.stringify({ sports: selectedSports }),
			});
			if (res.ok) {
				sportsMsg = 'Sportarten gespeichert!';
				sportsMsgOk = true;
			} else {
				const data = await res.json();
				sportsMsg = data.error || 'Fehler beim Speichern';
				sportsMsgOk = false;
			}
		} catch {
			sportsMsg = 'Verbindungsfehler';
			sportsMsgOk = false;
		} finally {
			savingSports = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<div class="bg-white border-b border-gray-100 px-4 pt-12 pb-6 text-center">
		<h1 class="text-xl font-bold text-gray-900">Mein Profil</h1>
	</div>

	{#if loading}
		<div class="flex justify-center items-center py-24">
			<div class="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
		</div>
	{:else if error}
		<div class="mx-4 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
			{error}
		</div>
	{:else}
		<div class="max-w-lg mx-auto px-4 py-6 space-y-4">

			<!-- Avatar + Name -->
			<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-3">
				<div class="relative">
					<button
						onclick={() => fileInput.click()}
						class="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
						title="Profilbild ändern"
					>
						{#if pictureUrl}
							<img src={pictureUrl} alt="Profilbild" class="w-full h-full object-cover" />
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 text-gray-400">
								<path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
							</svg>
						{/if}
					</button>
					<div class="absolute bottom-0 right-0 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center shadow pointer-events-none">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-4 h-4">
							<path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
							<path fill-rule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clip-rule="evenodd" />
						</svg>
					</div>
				</div>

				<input bind:this={fileInput} type="file" accept="image/*" class="hidden" onchange={uploadPicture} />

				<div class="text-center">
					<p class="font-semibold text-gray-900">{user.name || 'Kein Name'}</p>
					<p class="text-sm text-gray-500">{user.email}</p>
				</div>

				{#if uploading}
					<p class="text-sm text-orange-500 flex items-center gap-1">
						<span class="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin inline-block"></span>
						Wird hochgeladen…
					</p>
				{:else if pictureMsg}
					<p class="text-sm {pictureMsgOk ? 'text-green-600' : 'text-red-500'}">{pictureMsg}</p>
				{/if}

				<p class="text-xs text-gray-400">Tippe auf das Bild um es zu ändern</p>
			</div>

			<!-- Sportarten -->
			<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
				<h2 class="font-semibold text-gray-900 mb-1">Meine Sportarten</h2>
				<p class="text-xs text-gray-400 mb-4">Wähle alle Sportarten die du ausübst</p>

				<div class="flex flex-wrap gap-2 mb-4">
					{#each allSports as sport}
						{@const active = selectedSports.includes(sport.id)}
						<button
							onclick={() => toggleSport(sport.id)}
							class="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer
								{active
									? 'bg-orange-500 border-orange-500 text-white'
									: 'bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500'}"
						>
							{sport.name}
						</button>
					{/each}
				</div>

				<div class="flex items-center justify-between">
					<span class="text-xs text-gray-400">{selectedSports.length} ausgewählt</span>
					<button
						onclick={saveSports}
						disabled={savingSports}
						class="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
					>
						{savingSports ? 'Speichern…' : 'Speichern'}
					</button>
				</div>

				{#if sportsMsg}
					<p class="text-xs mt-2 {sportsMsgOk ? 'text-green-600' : 'text-red-500'}">{sportsMsg}</p>
				{/if}
			</div>

			<!-- Persönliche Daten (kommt) -->
			<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
				<h2 class="font-semibold text-gray-900 mb-3">Persönliche Daten</h2>
				<div class="space-y-2">
					<div class="h-10 bg-gray-100 rounded-xl animate-pulse"></div>
					<div class="h-10 bg-gray-100 rounded-xl animate-pulse"></div>
					<div class="h-10 bg-gray-100 rounded-xl animate-pulse"></div>
				</div>
			</div>

		</div>
	{/if}
</div>
