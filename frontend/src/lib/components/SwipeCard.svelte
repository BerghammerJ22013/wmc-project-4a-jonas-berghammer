<script>
	import { API } from '$lib/auth.js';

	let { user, onlike, onpass } = $props();
</script>

<div class="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden w-full max-w-sm mx-auto">
	<!-- Profile picture -->
	<div class="relative h-110 bg-gray-100">
		{#if user.profile_picture}
			<img
				src="{API}/uploads/{user.profile_picture}"
				alt="{user.name}"
				class="w-full h-full object-cover"
			/>
		{:else}
			<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-24 h-24 text-orange-300">
					<path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
				</svg>
			</div>
		{/if}

		<!-- Name + age overlay -->
		<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-5 pb-4 pt-10">
			<h2 class="text-white text-xl font-bold leading-tight">
				{user.name || 'Unbekannt'}{user.age ? `, ${user.age}` : ''}
			</h2>
			{#if user.location}
				<p class="text-white/80 text-sm flex items-center gap-1 mt-0.5">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 shrink-0">
						<path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.079 3.953-5.056 3.953-9.327 0-4.112-3.29-7.25-7.25-7.25-3.96 0-7.25 3.138-7.25 7.25 0 4.271 2.009 7.248 3.953 9.327a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" clip-rule="evenodd" />
					</svg>
					{user.location}
				</p>
			{/if}
		</div>
	</div>

	<!-- Card body -->
	<div class="px-5 py-4 space-y-3">
		<!-- Sports -->
		{#if user.sports?.length}
			<div class="flex flex-wrap gap-1.5">
				{#each user.sports as sport}
					<span class="px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-medium rounded-full">
						{sport.name ?? sport}
					</span>
				{/each}
			</div>
		{/if}

		<!-- Bio -->
		{#if user.bio}
			<p class="text-sm text-gray-600 leading-relaxed line-clamp-3">{user.bio}</p>
		{/if}
	</div>

	<!-- Buttons -->
	<div class="flex gap-3 px-5 pb-5">
		<button
			onclick={onpass}
			class="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-semibold hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
				<path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
			</svg>
			Pass
		</button>

		<button
			onclick={onlike}
			class="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors cursor-pointer shadow-sm shadow-orange-200"
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
				<path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
			</svg>
			Like
		</button>
	</div>
</div>
