import * as vscode from 'vscode';

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in ms
}

const KEYS = {
  ACCESS_TOKEN: 'spotify_access_token',
  REFRESH_TOKEN: 'spotify_refresh_token',
  EXPIRES_AT: 'spotify_expires_at',
} as const;

/** Buffer in ms — treat token as expired 60s early to avoid edge-case failures */
const EXPIRY_BUFFER_MS = 60_000;

export class TokenStorage {
  constructor(private readonly secrets: vscode.SecretStorage) {}

  // ── Store ────────────────────────────────────────────────

  async save(accessToken: string, refreshToken: string, expiresIn: number): Promise<void> {
    const expiresAt = Date.now() + expiresIn * 1000;

    await Promise.all([
      this.secrets.store(KEYS.ACCESS_TOKEN, accessToken),
      this.secrets.store(KEYS.REFRESH_TOKEN, refreshToken),
      this.secrets.store(KEYS.EXPIRES_AT, String(expiresAt)),
    ]);
  }

  // ── Read ─────────────────────────────────────────────────

  async getAccessToken(): Promise<string | undefined> {
    return this.secrets.get(KEYS.ACCESS_TOKEN);
  }

  async getRefreshToken(): Promise<string | undefined> {
    return this.secrets.get(KEYS.REFRESH_TOKEN);
  }

  async getAll(): Promise<TokenData | null> {
    const [accessToken, refreshToken, expiresAtStr] = await Promise.all([
      this.secrets.get(KEYS.ACCESS_TOKEN),
      this.secrets.get(KEYS.REFRESH_TOKEN),
      this.secrets.get(KEYS.EXPIRES_AT),
    ]);

    if (!accessToken || !refreshToken || !expiresAtStr) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      expiresAt: Number(expiresAtStr),
    };
  }

  // ── Check ────────────────────────────────────────────────

  /** Returns true if an access token exists (may or may not be expired). */
  async hasToken(): Promise<boolean> {
    const token = await this.secrets.get(KEYS.ACCESS_TOKEN);
    return token !== undefined;
  }

  /** Returns true if the access token exists AND is still valid. */
  async isTokenValid(): Promise<boolean> {
    const data = await this.getAll();
    if (!data) {
      return false;
    }
    return data.expiresAt - EXPIRY_BUFFER_MS > Date.now();
  }

  /** Returns true if there is a token but it has expired. */
  async isTokenExpired(): Promise<boolean> {
    const data = await this.getAll();
    if (!data) {
      return false; // no token at all
    }
    return data.expiresAt - EXPIRY_BUFFER_MS <= Date.now();
  }

  /**
   * Returns a valid access token, refreshing automatically if expired.
   * Returns null if no token exists or refresh fails.
   */
  async getValidAccessToken(refreshFn: (refreshToken: string) => Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null>): Promise<string | null> {
    const data = await this.getAll();
    if (!data) {
      return null;
    }

    // Token still valid — return it
    if (data.expiresAt - EXPIRY_BUFFER_MS > Date.now()) {
      return data.accessToken;
    }

    // Token expired — try to refresh
    const refreshed = await refreshFn(data.refreshToken);
    if (!refreshed) {
      return null;
    }

    await this.save(refreshed.accessToken, refreshed.refreshToken, refreshed.expiresIn);
    return refreshed.accessToken;
  }

  // ── Clear ────────────────────────────────────────────────

  async clear(): Promise<void> {
    await Promise.all([
      this.secrets.delete(KEYS.ACCESS_TOKEN),
      this.secrets.delete(KEYS.REFRESH_TOKEN),
      this.secrets.delete(KEYS.EXPIRES_AT),
    ]);
  }
}
