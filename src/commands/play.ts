import * as vscode from 'vscode';

export function registerPlayCommand(context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('spotify-vscode.togglePlay', async () => {
    try {
      // TODO: call playerController.togglePlayPause()
      vscode.window.showInformationMessage('Spotify: Toggled play/pause');
    } catch (error) {
      vscode.window.showErrorMessage(`Spotify: Failed to toggle play/pause – ${error}`);
    }
  });
}
