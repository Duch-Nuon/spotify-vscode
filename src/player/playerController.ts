import * as vscode from 'vscode';
import { SpotifyClient } from '../api/spotifyClient';
import { getAccessToken } from '../auth/authProvider.js';
export class PlayerController {

    private token: Promise<string | null>;

    constructor() {
        this.token = getAccessToken();
    }

    async skipToNext() {

        const success = await SpotifyClient.skipToNext(this.token);

        if (success) {
            vscode.window.showInformationMessage('Spotify: Skipped to next track');
        } else {
            vscode.window.showErrorMessage('Spotify: Failed to skip to next track');
        }
    }

    async skipToPrevious() {

        const success = await SpotifyClient.skipToPrevious(this.token);

        if (success) {
            vscode.window.showInformationMessage('Spotify: Skipped to previous track');
        } else {
            vscode.window.showErrorMessage('Spotify: Failed to skip to previous track');
        }
    }

    async togglePlayPause() {

        const state = await SpotifyClient.getPlayBackState(this.token);
        const isPlaying = state?.is_playing ?? false;
        const isDeviceAvailable = state?.device.is_active ?? false;

        if (!isDeviceAvailable) {
            vscode.window.showErrorMessage('Spotify: No active device available');
            vscode.env.openExternal(vscode.Uri.parse("spotify:"));
            return;
        }

        const success = await SpotifyClient.togglePlayPause(this.token, isPlaying);

        if (success) {
            vscode.window.showInformationMessage(`Spotify: ${isPlaying ? 'Paused' : 'Resumed'} playback`);
        } else {
            vscode.window.showErrorMessage(`Spotify: Failed to ${isPlaying ? 'pause' : 'resume'} playback`);
        }
    }
}