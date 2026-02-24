import * as vscode from 'vscode';
import { PlayerController } from '../player/playerController.js';

export function registerNextCommand(context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('spotify-vscode.next', async () => {
    try {
            
      const playerController = new PlayerController();
      await playerController.skipToNext();
    } catch (error) {
      vscode.window.showErrorMessage(`Spotify: Failed to skip to next track – ${error}`);
    }
  });
}
