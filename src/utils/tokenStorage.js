let accessToken = null;
let refreshToken = null;
let currentUser = null;

export const tokenStorage = {
  setAccessToken: (token) => {
    accessToken = token || null;
  },
  getAccessToken: () => accessToken,
  setRefreshToken: (token) => {
    refreshToken = token || null;
  },
  getRefreshToken: () => refreshToken,
  setUser: (user) => {
    currentUser = user || null;
  },
  getUser: () => currentUser,
  getTokenPayload: (token) => {
    if (!token) return null;

    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return null;

      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
      const decoded = atob(padded);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  },
  isAccessTokenValid: () => {
    const token = accessToken;
    if (!token) return false;

    const payload = tokenStorage.getTokenPayload(token);
    if (!payload?.exp) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  },
  clear: () => {
    accessToken = null;
    refreshToken = null;
    currentUser = null;
  },
};