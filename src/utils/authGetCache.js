import { getGatewayBase } from './apiBase';

const CACHE_TTL_MS = 60000;
const inflightRequests = new Map();
const cachedResponses = new Map();

const buildKey = (token, path) => `${token}:${path}`;

const getCached = (key, force) => {
  if (force) return null;
  const entry = cachedResponses.get(key);
  if (!entry) return null;
  if ((Date.now() - entry.timestamp) > CACHE_TTL_MS) {
    cachedResponses.delete(key);
    return null;
  }
  return entry.value;
};

export const fetchAuthGet = async (path, token, { force = false } = {}) => {
  if (!token) {
    return { ok: false, status: 401, data: null };
  }

  const key = buildKey(token, path);
  const cached = getCached(key, force);
  if (cached) return cached;

  if (!force && inflightRequests.has(key)) {
    return inflightRequests.get(key);
  }

  const requestPromise = fetch(`${getGatewayBase()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
      const data = await response.json().catch(() => null);
      const result = { ok: response.ok, status: response.status, data };
      cachedResponses.set(key, {
        timestamp: Date.now(),
        value: result,
      });
      return result;
    })
    .finally(() => {
      inflightRequests.delete(key);
    });

  inflightRequests.set(key, requestPromise);
  return requestPromise;
};

export const fetchNotificationsMeCached = (token, options) =>
  fetchAuthGet('/auth/v1/notifications/me', token, options);

export const fetchBankResponsesMeCached = (token, options) =>
  fetchAuthGet('/auth/v1/bank-responses/me', token, options);

export const fetchCustomerMeCached = (token, options) =>
  fetchAuthGet('/auth/v1/customers/me', token, options);

export const fetchCustomerFilesMeCached = (token, options) =>
  fetchAuthGet('/auth/v1/customer-files/me', token, options);

export const fetchBankVisibilityMeCached = (token, options) =>
  fetchAuthGet('/auth/v1/customers/me/bank-visibility', token, options);

export const fetchIsAuthenticatedCached = (token, options) =>
  fetchAuthGet('/auth/v1/is-authenticated', token, options);

export const clearAuthGetCache = (token) => {
  const prefix = token ? `${token}:` : '';
  Array.from(cachedResponses.keys()).forEach((key) => {
    if (!prefix || key.startsWith(prefix)) {
      cachedResponses.delete(key);
    }
  });
  Array.from(inflightRequests.keys()).forEach((key) => {
    if (!prefix || key.startsWith(prefix)) {
      inflightRequests.delete(key);
    }
  });
};
