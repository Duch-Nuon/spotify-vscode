
import * as vscode from 'vscode';
import * as crypto from 'crypto';
import * as http from 'http';
import { TokenStorage } from './tokenStorage.js';

const config = vscode.workspace.getConfiguration('spotify');
const clientId = config.get<string>('clientId');

const REDIRECT_URI = 'http://127.0.0.1:7867/callback';

const SCOPES = [
  'user-modify-playback-state',
  'user-read-playback-state',
  'user-read-currently-playing',
  'user-library-modify',
  'user-library-read',
].join(' ');

function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}

function sha256Base64url(plain: string): string {
  return crypto.createHash('sha256').update(plain).digest('base64url');
}

let tokenStorage: TokenStorage;

/** Must be called once during activation to initialize storage. */
export function initAuth(context: vscode.ExtensionContext): void {
  tokenStorage = new TokenStorage(context.secrets);
}

/**
 * Returns a valid access token.
 * - If one exists and is still fresh → returns it immediately.
 * - If one exists but is expired → refreshes it automatically.
 * - If none exists → returns null (caller should trigger login).
 */
export async function getAccessToken(): Promise<string | null> {
  return tokenStorage.getValidAccessToken(refreshToken);
}

/** Returns true when the user has a valid (non-expired) token. */
export async function isLoggedIn(): Promise<boolean> {
  return tokenStorage.isTokenValid();
}

/** Clears all stored tokens (logout). */
export async function logout(): Promise<void> {
  await tokenStorage.clear();
  vscode.window.showInformationMessage('Spotify: Logged out.');
}

/**
 * Full login flow:
 * 1. Check if a valid token already exists → skip login.
 * 2. Check if token is expired but refresh token exists → refresh.
 * 3. Otherwise → open browser for PKCE auth.
 */
export async function loginWithSpotify(): Promise<string | null> {
  // 1. Already valid?
  if (await tokenStorage.isTokenValid()) {
    const token = await tokenStorage.getAccessToken();
    vscode.window.showInformationMessage('Spotify: Already logged in.');
    return token ?? null;
  }

  // 2. Expired but refreshable?
  if (await tokenStorage.isTokenExpired()) {
    const rt = await tokenStorage.getRefreshToken();
    if (rt) {
      const refreshed = await refreshToken(rt);
      if (refreshed) {
        await tokenStorage.save(refreshed.accessToken, refreshed.refreshToken, refreshed.expiresIn);
        vscode.window.showInformationMessage('Spotify: Session refreshed.');        
        return refreshed.accessToken;
      }
    }
  }

  // 3. Fresh login
  const codeVerifier = generateRandomString(64);
  const codeChallenge = sha256Base64url(codeVerifier);

  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId ?? '');
  authUrl.searchParams.set('scope', SCOPES);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);

  await vscode.env.openExternal(vscode.Uri.parse(authUrl.toString()));

  const code = await waitForCallback();
  if (!code) {
    vscode.window.showErrorMessage('Spotify: Login timed out or was cancelled.');
    return null;
  }

  const tokens = await exchangeCodeForToken(code, codeVerifier);
  if (!tokens) {
    return null;
  }

  await tokenStorage.save(tokens.accessToken, tokens.refreshToken, tokens.expiresIn);
  vscode.window.showInformationMessage('Spotify: Logged in successfully!');
  return tokens.accessToken;
}

function waitForCallback(): Promise<string | null> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? '', `http://${req.headers.host}`);
      if (url.pathname === '/callback') {
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        res.writeHead(200, { 'Content-Type': 'text/html' });
        if (error || !code) {
          res.end('<html><body><h2>Authorization failed.</h2><p>You can close this tab.</p></body></html>');
          server.close();
          resolve(null);
        } else {
          res.end('<html><body><h2>Success!</h2><p>You can close this tab and return to VS Code.</p></body></html>');
          server.close();
          resolve(code);
        }
      }
    });

    server.listen(7867, '127.0.0.1');

    // Timeout after 2 minutes
    setTimeout(() => {
      server.close();
      resolve(null);
    }, 120_000);
  });
}

async function exchangeCodeForToken(code: string, codeVerifier: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: clientId ?? '',
    code_verifier: codeVerifier,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    vscode.window.showErrorMessage('Spotify: Failed to exchange authorization code.');
    return null;
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

async function refreshToken(rt: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: rt,
    client_id: clientId ?? '',
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    vscode.window.showErrorMessage('Spotify: Failed to refresh token. Please log in again.');
    return null;
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

