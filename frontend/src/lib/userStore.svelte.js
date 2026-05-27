import { getToken, removeToken, API } from './auth.js';

let _user = $state(null);
let _loading = $state(false);

export const userStore = {
	get user() { return _user; },
	get loading() { return _loading; },
	get isLoggedIn() { return !!getToken(); },

	async load() {
		const token = getToken();
		if (!token) { _user = null; return; }

		_loading = true;
		try {
			const res = await fetch(`${API}/users/me`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.ok) {
				_user = await res.json();
			} else {
				removeToken();
				_user = null;
			}
		} catch {
			_user = null;
		} finally {
			_loading = false;
		}
	},

	/** Partial update — merges into existing user without refetch */
	update(partial) {
		if (_user) _user = { ..._user, ...partial };
	},

	clear() {
		_user = null;
	},
};
