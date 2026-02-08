const API_BASE = '/api';

function getSessionId() {
  return localStorage.getItem('sessionId');
}

function setSession(sessionId, username) {
  localStorage.setItem('sessionId', sessionId);
  localStorage.setItem('username', username);
}

function clearSession() {
  localStorage.removeItem('sessionId');
  localStorage.removeItem('username');
}

async function apiFetch(path, options = {}) {
  const sessionId = getSessionId();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export async function register(username, password) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setSession(data.sessionId, data.username);
  return data;
}

export async function login(username, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setSession(data.sessionId, data.username);
  return data;
}

export async function logout() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch {
    // ignore
  }
  clearSession();
}

export async function getMe() {
  return apiFetch('/auth/me');
}

export async function loadGame() {
  return apiFetch('/save');
}

export async function saveGame(saveData) {
  return apiFetch('/save', {
    method: 'POST',
    body: JSON.stringify({ saveData }),
  });
}

export async function deleteSave() {
  return apiFetch('/save', { method: 'DELETE' });
}

export function getSavedUsername() {
  return localStorage.getItem('username');
}

export function hasSavedSession() {
  return !!getSessionId();
}

// Invites API
export async function sendInvite(username) {
  return apiFetch('/invites/send', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

export async function getInvites() {
  return apiFetch('/invites');
}

export async function acceptInvite(inviteId) {
  return apiFetch(`/invites/${inviteId}/accept`, { method: 'POST' });
}

export async function declineInvite(inviteId) {
  return apiFetch(`/invites/${inviteId}/decline`, { method: 'POST' });
}

// Daily Rewards API
export async function getDailyRewardStatus() {
  return apiFetch('/daily-rewards');
}

export async function claimDailyReward() {
  return apiFetch('/daily-rewards/claim', { method: 'POST' });
}
