import * as vscode from 'vscode';
import { PlayerController } from '../player/playerController.js';

export function registerPreviousCommand(context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('spotify-vscode.previous', async () => {
    try {
      const playerController = new PlayerController();
      await playerController.skipToPrevious();
    } catch (error) {
      vscode.window.showErrorMessage(`Spotify: Failed to skip to previous track – ${error}`);
    }
  });
}
