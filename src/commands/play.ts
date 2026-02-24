import * as vscode from 'vscode';
import { PlayerController } from '../player/playerController';

export function registerPlayCommand(context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('spotify-vscode.togglePlay', async () => {
    try {
      const playerController = new PlayerController();
      await playerController.togglePlayPause();
    } catch (error) {
      vscode.window.showErrorMessage(`Spotify: Failed to toggle play/pause – ${error}`);
    }
  });
}
