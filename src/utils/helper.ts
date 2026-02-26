import { StatusBarProvider } from '../statusBar/statusBarProvider.js';
import { SidebarProvider } from '../statusBar/sidebarProvider.js';
import { getCurrentTrackInfo, getQueueInfo } from '../player/playerState.js';
import { SidebarQueueProvider } from '../statusBar/sidebarQueueProvider.js';
import * as vscode from 'vscode';

/**
 * Updates both the status bar and sidebar webview with the current track info.
 * @param statusBarProvider StatusBarProvider instance
 * @param sidebarProvider SidebarProvider instance
 * @param sideQueueBarProvider SidebarQueueProvider instance
 */

export async function updateTrackUI(
    statusBarProvider: StatusBarProvider,
    sidebarProvider?: SidebarProvider,
    sideQueueBarProvider?: SidebarQueueProvider
) {
    await new Promise(resolve => setTimeout(resolve, 500));

    await getCurrentTrackInfo().then(currentTrackInfo => {
        if (currentTrackInfo) {
            statusBarProvider.updateTrack(currentTrackInfo);
            if (sidebarProvider && typeof sidebarProvider.updateCurrentTrackInfo === 'function') {
                sidebarProvider.updateCurrentTrackInfo(
                    currentTrackInfo.name,
                    currentTrackInfo.artist,
                    currentTrackInfo.albumArtUrl,
                    currentTrackInfo.isPlaying
                );
            }
        }
    }).catch(error => {
        console.error("Failed to get current track info:", error);
        vscode.window.showErrorMessage(`Spotify: Failed to update track info`);
    });

    await getQueueInfo().then(queueInfo => {
        if (queueInfo && sideQueueBarProvider) {
            queueInfo.queue.unshift(queueInfo.currently_playing);
            sideQueueBarProvider.reRenderQueueUI(queueInfo.queue);
        }
    }).catch(error => {
        console.error("Failed to get queue info:", error);
        vscode.window.showErrorMessage(`Spotify: Failed to update queue info`);
    });
}
