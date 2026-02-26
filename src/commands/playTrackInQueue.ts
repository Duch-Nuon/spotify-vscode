import * as vscode from 'vscode';
import { PlayerController } from '../player/playerController.js';
import { StatusBarProvider } from '../statusBar/statusBarProvider.js';
import { SidebarProvider } from '../statusBar/sidebarProvider.js';
import { updateTrackUI } from '../utils/helper.js';

export function registerPlayTrackInQueueCommand(context: vscode.ExtensionContext, statusBarProvider: StatusBarProvider, sidebarProvider: SidebarProvider): vscode.Disposable {
  return vscode.commands.registerCommand('spotify-vscode.playTrackInQueue', async (message) => {
    try {
      const playerController = new PlayerController();
      await playerController.playTrackInQueue(message.trackUri);
      await updateTrackUI(statusBarProvider, sidebarProvider);
      
    } catch (error) {
      vscode.window.showErrorMessage(`Spotify: Failed to play track in queue – ${error}`);
    }
  });
}
