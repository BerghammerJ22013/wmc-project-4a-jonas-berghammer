import { io } from 'socket.io-client';
import { API, getToken } from './auth.js';

let _socket = $state(null);
const _handlers = new Map(); // event → Set of callbacks

function emit(event, ...args) {
	_socket?.emit(event, ...args);
}

function on(event, cb) {
	if (!_handlers.has(event)) _handlers.set(event, new Set());
	_handlers.get(event).add(cb);
}

function off(event, cb) {
	_handlers.get(event)?.delete(cb);
}

function connect() {
	if (_socket?.connected) return;

	_socket = io(API, { auth: { token: getToken() } });

	_socket.onAny((event, ...args) => {
		_handlers.get(event)?.forEach((cb) => cb(...args));
	});
}

function disconnect() {
	_socket?.disconnect();
	_socket = null;
}

export const socketStore = { connect, disconnect, emit, on, off };
