const AUTH_TOKEN_KEY = 'auth_token';

const getBrowserStorage = (key) => {
  if (typeof window === 'undefined') return null;
  return window[key] || null;
};

const safeGet = (storage, key) => {
  if (!storage) return '';
  try {
    return storage.getItem(key) || '';
  } catch {
    return '';
  }
};

const safeSet = (storage, key, value) => {
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const safeRemove = (storage, key) => {
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
};

const emitAuthStateChanged = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('auth:state-changed'));
};

const readQuickAccessValue = (payload) => {
  if (!payload || typeof payload !== 'object') return null;

  if (typeof payload.quick_access_enabled === 'boolean') {
    return payload.quick_access_enabled;
  }
  if (payload.quick_access_enabled === 0 || payload.quick_access_enabled === 1) {
    return Boolean(payload.quick_access_enabled);
  }

  const settings = payload.settings;
  if (!settings || typeof settings !== 'object') return null;

  if (typeof settings.quickAccess === 'boolean') {
    return settings.quickAccess;
  }
  if (settings.quickAccess === 0 || settings.quickAccess === 1) {
    return Boolean(settings.quickAccess);
  }

  return null;
};

const readStoredUserData = () => {
  const local = getBrowserStorage('localStorage');
  const session = getBrowserStorage('sessionStorage');
  const raw = safeGet(local, 'user_data') || safeGet(session, 'user_data');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getStoredQuickAccessPreference = () => {
  const stored = readStoredUserData();
  const quickAccess = readQuickAccessValue(stored);
  return quickAccess === null ? false : quickAccess;
};

export const resolveQuickAccessPreference = (customerPayload) => {
  const payloadPreference = readQuickAccessValue(customerPayload);
  if (payloadPreference !== null) return payloadPreference;
  return getStoredQuickAccessPreference();
};

export const getAuthToken = () => {
  const session = getBrowserStorage('sessionStorage');
  const local = getBrowserStorage('localStorage');
  const sessionToken = safeGet(session, AUTH_TOKEN_KEY);
  if (sessionToken) return sessionToken;
  return safeGet(local, AUTH_TOKEN_KEY);
};

export const hasAuthToken = () => Boolean(getAuthToken());

export const clearAuthToken = () => {
  const session = getBrowserStorage('sessionStorage');
  const local = getBrowserStorage('localStorage');
  safeRemove(local, AUTH_TOKEN_KEY);
  safeRemove(session, AUTH_TOKEN_KEY);
  emitAuthStateChanged();
};

export const setAuthToken = (token, { quickAccess = false } = {}) => {
  if (!token) {
    clearAuthToken();
    return;
  }

  const session = getBrowserStorage('sessionStorage');
  const local = getBrowserStorage('localStorage');

  if (quickAccess) {
    safeSet(local, AUTH_TOKEN_KEY, token);
    safeRemove(session, AUTH_TOKEN_KEY);
  } else {
    const savedToSession = safeSet(session, AUTH_TOKEN_KEY, token);
    if (!savedToSession) {
      safeSet(local, AUTH_TOKEN_KEY, token);
    } else {
      safeRemove(local, AUTH_TOKEN_KEY);
    }
  }

  emitAuthStateChanged();
};

export const syncAuthTokenPersistence = (quickAccess) => {
  const token = getAuthToken();
  if (!token) return;
  setAuthToken(token, { quickAccess: Boolean(quickAccess) });
};
