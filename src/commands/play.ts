import * as vscode from 'vscode';
import { PlayerController } from '../player/playerController';
import { updateTrackUI } from '../utils/helper';
import { SidebarProvider } from '../statusBar/sidebarProvider'; 
import { StatusBarProvider } from '../statusBar/statusBarProvider';
import { SidebarQueueProvider } from '../statusBar/sidebarQueueProvider';

export function registerPlayCommand(context: vscode.ExtensionContext, statusBarProvider: StatusBarProvider, sidebarProvider: SidebarProvider, sidebarQueueProvider: SidebarQueueProvider): vscode.Disposable {
  return vscode.commands.registerCommand('spotify-vscode.togglePlay', async () => {
    try {
      const playerController = new PlayerController();
      await playerController.togglePlayPause();
      await updateTrackUI(statusBarProvider, sidebarProvider, sidebarQueueProvider);
    } catch (error) {
      vscode.window.showErrorMessage(`Spotify: Failed to toggle play/pause – ${error}`);
    }
  });
}
