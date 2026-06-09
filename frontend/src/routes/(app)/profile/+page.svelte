<script>
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { getToken, API } from '$lib/auth.js';
  import { userStore } from '$lib/userStore.svelte.js';
  import { locale, t } from '$lib/i18n.js';

  let allSports = $state([]);
  let sportsLoaded = $state(false);
  let error = $state('');

  let pictureUrl = $state(null);
  let uploading = $state(false);
  let pictureMsg = $state('');
  let pictureMsgOk = $state(false);
  let fileInput;

  let selectedSports = $state([]);
  let savingSports = $state(false);
  let sportsMsg = $state('');
  let sportsMsgOk = $state(false);

  let name = $state('');
  let age = $state('');
  let location = $state('');
  let bio = $state('');
  let formInitialized = $state(false);
  let savingData = $state(false);
  let dataMsg = $state('');
  let dataMsgOk = $state(false);

  let searchRadius = $state(50);
  let language = $state('de');
  let savingSettings = $state(false);
  let settingsMsg = $state('');
  let settingsMsgOk = $state(false);

  $effect(() => {
    const u = userStore.user;
    if (u && !formInitialized) {
      name = u.name || '';
      age = u.age ?? '';
      location = u.location || '';
      bio = u.bio || '';
      selectedSports = u.sports?.map((s) => s.id) ?? [];
      searchRadius = u.search_radius ?? 50;
      language = u.language ?? 'de';
      if (u.profile_picture) pictureUrl = `${API}/uploads/${u.profile_picture}`;
      formInitialized = true;
    }
  });

  onMount(async () => {
    try {
      const res = await fetch(`${API}/sports`);
      allSports = await res.json();
      sportsLoaded = true;
    } catch {
      error = t('profile.errors.loadFailed');
    }
    if (!userStore.user && !userStore.loading) await userStore.load();
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
        userStore.update({ profile_picture: data.filename });
        pictureMsg = t('profile.pictureSaved');
        pictureMsgOk = true;
      } else {
        pictureMsg = data.error || t('profile.errors.uploadFailed');
        pictureMsgOk = false;
      }
    } catch {
      pictureMsg = t('profile.errors.connectionError');
      pictureMsgOk = false;
    } finally {
      uploading = false;
    }
  }

  function toggleSport(id) {
    selectedSports = selectedSports.includes(id)
      ? selectedSports.filter((s) => s !== id)
      : [...selectedSports, id];
  }

  async function saveSports() {
    savingSports = true;
    sportsMsg = '';
    try {
      const res = await fetch(`${API}/users/me/sports`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ sports: selectedSports }),
      });
      if (res.ok) {
        userStore.update({ sports: allSports.filter((s) => selectedSports.includes(s.id)) });
        sportsMsg = t('profile.saved');
        sportsMsgOk = true;
      } else {
        const data = await res.json();
        sportsMsg = data.error || t('profile.errors.saveFailed');
        sportsMsgOk = false;
      }
    } catch {
      sportsMsg = t('profile.errors.connectionError');
      sportsMsgOk = false;
    } finally {
      savingSports = false;
    }
  }

  async function savePersonalData() {
    savingData = true;
    dataMsg = '';
    try {
      const u = userStore.user;
      const res = await fetch(`${API}/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          name: name || null, age: age !== '' ? Number(age) : null,
          location: location || null, bio: bio || null,
          latitude: u?.latitude, longitude: u?.longitude,
          search_radius: searchRadius, language,
          onboarding_complete: u?.onboarding_complete,
        }),
      });
      if (res.ok) {
        userStore.update({ name, age: age !== '' ? Number(age) : null, location, bio, search_radius: searchRadius, language });
        dataMsg = t('profile.saved');
        dataMsgOk = true;
      } else {
        const data = await res.json();
        dataMsg = data.error || t('profile.errors.saveFailed');
        dataMsgOk = false;
      }
    } catch {
      dataMsg = t('profile.errors.connectionError');
      dataMsgOk = false;
    } finally {
      savingData = false;
    }
  }

  async function saveSettings() {
    savingSettings = true;
    settingsMsg = '';
    try {
      const u = userStore.user;
      const res = await fetch(`${API}/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          name: u?.name, age: u?.age, location: u?.location, bio: u?.bio,
          latitude: u?.latitude, longitude: u?.longitude,
          search_radius: searchRadius, language,
          onboarding_complete: u?.onboarding_complete,
        }),
      });
      if (res.ok) {
        userStore.update({ search_radius: searchRadius, language });
        locale.set(language);
        localStorage.setItem('sportsync_lang', language);
        settingsMsg = t('profile.saved');
        settingsMsgOk = true;
      } else {
        const data = await res.json();
        settingsMsg = data.error || t('profile.errors.saveFailed');
        settingsMsgOk = false;
      }
    } catch {
      settingsMsg = t('profile.errors.connectionError');
      settingsMsgOk = false;
    } finally {
      savingSettings = false;
    }
  }
</script>

<div class="page">
  {#if userStore.loading || !userStore.user}
    <div class="loading"><div class="spinner"></div></div>
  {:else if error}
    <div class="error-banner">{error}</div>
  {:else}
    {@const u = userStore.user}
    <div class="content">

      <!-- Avatar card -->
      <section class="card avatar-card">
        <div class="avatar-wrap">
          <button class="avatar-btn" onclick={() => fileInput.click()} title={$_('profile.changePicture')}>
            {#if pictureUrl}
              <img src={pictureUrl} alt="Profilbild" />
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
              </svg>
            {/if}
            <div class="camera-badge">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                <path fill-rule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </button>
          <input bind:this={fileInput} type="file" accept="image/*" class="file-input" onchange={uploadPicture} />
        </div>

        <p class="user-name">{u.name || $_('profile.noName')}</p>
        <p class="user-email">{u.email}</p>

        {#if uploading}
          <p class="msg loading-msg">
            <span class="inline-spinner"></span>
            {$_('profile.uploading')}
          </p>
        {:else if pictureMsg}
          <p class="msg" class:ok={pictureMsgOk} class:err={!pictureMsgOk}>{pictureMsg}</p>
        {/if}
        <p class="hint">{$_('profile.changePicture')}</p>
      </section>

      <!-- Sports -->
      <section class="card">
        <h2>{$_('profile.sports.title')}</h2>
        <p class="section-hint">{$_('profile.sports.hint')}</p>

        {#if !sportsLoaded}
          <div class="skeleton"></div>
        {:else}
          <div class="sports-grid">
            {#each allSports as sport}
              {@const active = selectedSports.includes(sport.id)}
              <button class="sport-btn" class:active onclick={() => toggleSport(sport.id)}>
                {sport.name}
              </button>
            {/each}
          </div>
        {/if}

        <div class="section-footer">
          <span class="count">{$_('profile.sports.selected', { values: { count: selectedSports.length } })}</span>
          <button class="btn-save" onclick={saveSports} disabled={savingSports}>
            {savingSports ? $_('profile.saving') : $_('profile.save')}
          </button>
        </div>
        {#if sportsMsg}
          <p class="msg" class:ok={sportsMsgOk} class:err={!sportsMsgOk}>{sportsMsg}</p>
        {/if}
      </section>

      <!-- Personal data -->
      <section class="card">
        <h2>{$_('profile.personalData')}</h2>

        <div class="form-fields">
          <div class="field">
            <label for="name">{$_('profile.name')}</label>
            <input id="name" type="text" bind:value={name} placeholder={$_('profile.name')} />
          </div>
          <div class="field">
            <label for="age">{$_('profile.age')}</label>
            <input id="age" type="number" bind:value={age} placeholder="22" min="14" max="99" />
          </div>
          <div class="field">
            <label for="location">{$_('profile.location')}</label>
            <input id="location" type="text" bind:value={location} placeholder="z.B. Wien" />
          </div>
          <div class="field">
            <label for="bio">{$_('profile.bio')}</label>
            <textarea id="bio" bind:value={bio} placeholder={$_('profile.bioPlaceholder')} rows="3"></textarea>
          </div>
        </div>

        <div class="section-footer right">
          <button class="btn-save" onclick={savePersonalData} disabled={savingData}>
            {savingData ? $_('profile.saving') : $_('profile.save')}
          </button>
        </div>
        {#if dataMsg}
          <p class="msg right" class:ok={dataMsgOk} class:err={!dataMsgOk}>{dataMsg}</p>
        {/if}
      </section>

      <!-- Settings -->
      <section class="card">
        <h2>{$_('profile.settings')}</h2>

        <div class="form-fields">
          <div class="field">
            <div class="radius-label">
              <label for="radius">{$_('profile.searchRadius')}</label>
              <span class="radius-value">{searchRadius} km</span>
            </div>
            <input id="radius" type="range" bind:value={searchRadius} min="5" max="200" step="5" class="range-input" />
            <div class="range-minmax">
              <span>5 km</span>
              <span>200 km</span>
            </div>
          </div>

          <div class="field">
            <label for="language">{$_('profile.language')}</label>
            <select id="language" bind:value={language}>
              <option value="de">🇦🇹 Deutsch</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>
        </div>

        <div class="section-footer right">
          <button class="btn-save" onclick={saveSettings} disabled={savingSettings}>
            {savingSettings ? $_('profile.saving') : $_('profile.save')}
          </button>
        </div>
        {#if settingsMsg}
          <p class="msg right" class:ok={settingsMsgOk} class:err={!settingsMsgOk}>{settingsMsg}</p>
        {/if}
      </section>

    </div>
  {/if}
</div>

<style>
  .page {
    min-height: calc(100vh - var(--navbar-height));
    background: var(--gray-50);
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 6rem;
  }

  .spinner {
    width: 2.5rem;
    height: 2.5rem;
    border: 4px solid var(--orange-500);
    border-top-color: transparent;
    border-radius: var(--radius-full);
    animation: spin 0.7s linear infinite;
  }

  .error-banner {
    margin: 1.5rem 1rem;
    padding: 1rem;
    background: var(--red-50);
    border: 1px solid var(--red-200);
    border-radius: var(--radius-xl);
    color: var(--red-500);
    font-size: 0.875rem;
    text-align: center;
  }

  .content {
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (min-width: 640px) {
    .content {
      max-width: 32rem;
      margin: 0 auto;
    }
  }

  .card {
    background: var(--white);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-100);
    padding: 1.25rem;
  }

  .card h2 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--gray-900);
    margin-bottom: 1rem;
  }

  .section-hint {
    font-size: 0.75rem;
    color: var(--gray-400);
    margin-bottom: 1rem;
    margin-top: -0.75rem;
  }

  /* Avatar card */
  .avatar-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    padding: 1.5rem;
  }

  .avatar-wrap {
    position: relative;
    margin-bottom: 0.25rem;
  }

  .avatar-btn {
    width: 6rem;
    height: 6rem;
    border-radius: var(--radius-full);
    overflow: hidden;
    background: var(--gray-200);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color 0.15s;
  }

  .avatar-btn:focus {
    border-color: var(--orange-400);
    outline: none;
  }

  .avatar-btn img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-btn svg {
    width: 3rem;
    height: 3rem;
    color: var(--gray-400);
  }

  .camera-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 1.75rem;
    height: 1.75rem;
    background: var(--orange-500);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-sm);
    pointer-events: none;
  }

  .camera-badge svg {
    width: 1rem;
    height: 1rem;
  }

  .file-input { display: none; }

  .user-name {
    font-weight: 600;
    color: var(--gray-900);
  }

  .user-email {
    font-size: 0.875rem;
    color: var(--gray-500);
  }

  .hint {
    font-size: 0.75rem;
    color: var(--gray-400);
  }

  .msg {
    font-size: 0.75rem;
    margin-top: 0.5rem;
  }

  .msg.ok { color: var(--green-600); }
  .msg.err { color: var(--red-500); }
  .msg.right { text-align: right; }

  .loading-msg {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: var(--orange-500);
    font-size: 0.875rem;
  }

  .inline-spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid var(--orange-500);
    border-top-color: transparent;
    border-radius: var(--radius-full);
    animation: spin 0.7s linear infinite;
  }

  /* Sports */
  .skeleton {
    height: 2.5rem;
    background: var(--gray-100);
    border-radius: var(--radius-xl);
    animation: pulse 1.5s ease-in-out infinite;
    margin-bottom: 1rem;
  }

  .sports-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .sport-btn {
    padding: 0.375rem 0.75rem;
    border-radius: var(--radius-full);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid var(--gray-200);
    color: var(--gray-600);
    background: var(--white);
    transition: background 0.1s, color 0.1s, border-color 0.1s;
  }

  .sport-btn:hover {
    border-color: var(--orange-300);
    color: var(--orange-500);
  }

  .sport-btn.active {
    background: var(--orange-500);
    border-color: var(--orange-500);
    color: var(--white);
  }

  /* Form fields */
  .form-fields {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--gray-500);
  }

  input[type="text"],
  input[type="number"],
  input[type="email"],
  textarea,
  select {
    padding: 0.625rem 1rem;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-xl);
    font-size: 0.875rem;
    color: var(--gray-900);
    background: var(--white);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  input[type="text"]:focus,
  input[type="number"]:focus,
  textarea:focus,
  select:focus {
    border-color: var(--orange-400);
    box-shadow: 0 0 0 3px var(--orange-100);
  }

  textarea {
    resize: none;
  }

  /* Range */
  .radius-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .radius-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--orange-500);
  }

  .range-input {
    width: 100%;
    height: 0.5rem;
    background: var(--gray-200);
    border-radius: var(--radius-full);
    appearance: none;
    cursor: pointer;
    accent-color: var(--orange-500);
    border: none;
    padding: 0;
    box-shadow: none;
  }

  .range-minmax {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--gray-400);
    margin-top: 0.25rem;
  }

  .count {
    font-size: 0.75rem;
    color: var(--gray-400);
  }

  .section-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1rem;
  }

  .section-footer.right {
    justify-content: flex-end;
  }

  .btn-save {
    padding: 0.5rem 1rem;
    background: var(--orange-500);
    color: var(--white);
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: var(--radius-xl);
    cursor: pointer;
    transition: background 0.15s, opacity 0.15s;
  }

  .btn-save:hover { background: var(--orange-600); }
  .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
