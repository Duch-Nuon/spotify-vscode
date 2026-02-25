import * as vscode from 'vscode';
import { PlayerController } from '../player/playerController.js';
import { StatusBarProvider } from '../statusBar/statusBarProvider.js';
import { SidebarProvider } from '../statusBar/sidebarProvider.js';
import { updateTrackUI } from '../utils/helper.js';

export function registerNextCommand(context: vscode.ExtensionContext, statusBarProvider: StatusBarProvider, sidebarProvider: SidebarProvider): vscode.Disposable {
  return vscode.commands.registerCommand('spotify-vscode.next', async () => {
    try {
      const playerController = new PlayerController();
      await playerController.skipToNext();
      await updateTrackUI(statusBarProvider, sidebarProvider);
      
    } catch (error) {
      vscode.window.showErrorMessage(`Spotify: Failed to skip to next track – ${error}`);
    }
  });
}
