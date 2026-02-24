import * as vscode from 'vscode';

export function registerPreviousCommand(context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('spotify-vscode.previous', async () => {
    try {
      // TODO: call playerController.skipToPrevious()
      vscode.window.showInformationMessage('Spotify: Skipped to previous track');
    } catch (error) {
      vscode.window.showErrorMessage(`Spotify: Failed to skip to previous track – ${error}`);
    }
  });
}
