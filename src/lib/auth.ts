import Cookies from 'js-cookie';

const TOKEN_KEY = 'dashboard_token';

export interface TokenPayload {
  tenantId: string;
  email: string;
  role: 'tenant' | 'owner';
  iat: number;
  exp: number;
}

/**
 * Decode a JWT payload without verification (client-side only).
 * Verification happens on the management API side.
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Store the dashboard token in a cookie.
 */
export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, {
    expires: 30, // 30 days
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * Get the stored dashboard token.
 */
export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

/**
 * Remove the dashboard token (logout).
 */
export function removeToken(): void {
  Cookies.remove(TOKEN_KEY, { path: '/' });
}

/**
 * Get the decoded payload from the stored token.
 */
export function getAuth(): TokenPayload | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload) return null;
  // Check expiration
  if (payload.exp * 1000 < Date.now()) {
    removeToken();
    return null;
  }
  return payload;
}

/**
 * Check if the current user is an owner.
 */
export function isOwner(): boolean {
  const auth = getAuth();
  return auth?.role === 'owner';
}
