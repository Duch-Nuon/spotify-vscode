import * as vscode from 'vscode';
import { PlayerController } from '../player/playerController.js';
import { updateTrackUI } from '../utils/helper.js';
import { SidebarProvider } from '../statusBar/sidebarProvider.js';
import { StatusBarProvider } from '../statusBar/statusBarProvider.js';
import { SidebarQueueProvider } from '../statusBar/sidebarQueueProvider.js';

export function registerPreviousCommand(context: vscode.ExtensionContext, statusBarProvider: StatusBarProvider, sidebarProvider: SidebarProvider, sidebarQueueProvider: SidebarQueueProvider): vscode.Disposable {
  return vscode.commands.registerCommand('spotify-vscode.previous', async () => {
    try {
      const playerController = new PlayerController();
      await playerController.skipToPrevious();
      await updateTrackUI(statusBarProvider, sidebarProvider, sidebarQueueProvider);
    } catch (error) {
      vscode.window.showErrorMessage(`Spotify: Failed to skip to previous track – ${error}`);
    }
  });
}
