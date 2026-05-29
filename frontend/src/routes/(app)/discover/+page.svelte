<script>
	import SwipeCard from '$lib/components/SwipeCard.svelte';

	const DUMMY_USERS = [
		{
			id: 1,
			name: 'Anna Mayer',
			age: 24,
			location: 'Linz',
			bio: 'Laufe gerne morgens und klettere am Wochenende.',
			profile_picture: null,
			sports: [{ name: 'Laufen' }, { name: 'Klettern' }, { name: 'Yoga' }],
		},
		{
			id: 2,
			name: 'Max Huber',
			age: 27,
			location: 'Wels',
			bio: 'Fussball ist meine Leidenschaft, suche Mitspieler.',
			profile_picture: null,
			sports: [{ name: 'Fussball' }, { name: 'Laufen' }, { name: 'Radfahren' }],
		},
		{
			id: 3,
			name: 'Sara Gruber',
			age: 22,
			location: 'Grieskirchen',
			bio: 'Yoga-Liebhaberin und gelegentliche Schwimmerin.',
			profile_picture: null,
			sports: [{ name: 'Yoga' }, { name: 'Schwimmen' }, { name: 'Wandern' }],
		},
		{
			id: 4,
			name: 'Luca Bauer',
			age: 26,
			location: 'Steyr',
			bio: 'Basketball und Tennis - immer auf der Suche nach Sparring.',
			profile_picture: null,
			sports: [{ name: 'Basketball' }, { name: 'Tennis' }, { name: 'Volleyball' }],
		},
		{
			id: 5,
			name: 'Mia Schmidt',
			age: 23,
			location: 'Linz',
			bio: 'Radfahren und Wandern in der Natur.',
			profile_picture: null,
			sports: [{ name: 'Radfahren' }, { name: 'Wandern' }, { name: 'Laufen' }],
		},
	];

	let users = $state([...DUMMY_USERS]);
	let current = $derived(users[0] ?? null);

	function swipe(direction) {
		users = users.slice(1);
	}
</script>

<div class="h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden flex flex-col">
	<div class="flex-1 flex items-center justify-center px-4 py-4 overflow-hidden">
		{#if current}
			<SwipeCard
				user={current}
				onlike={() => swipe('like')}
				onpass={() => swipe('pass')}
			/>
		{:else}
			<!-- Empty state -->
			<div class="flex flex-col items-center justify-center text-center">
				<div class="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 text-orange-300">
						<path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
					</svg>
				</div>
				<h2 class="text-lg font-semibold text-gray-800 mb-1">Keine weiteren Profile</h2>
				<p class="text-sm text-gray-400 max-w-xs">Schau später nochmal vorbei oder erweitere deinen Suchradius in den Einstellungen.</p>
			</div>
		{/if}
	</div>
</div>
