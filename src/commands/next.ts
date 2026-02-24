import * as vscode from 'vscode';

export function registerNextCommand(context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('spotify-vscode.next', async () => {
    try {
      // TODO: call playerController.skipToNext()
      vscode.window.showInformationMessage('Spotify: Skipped to next track');
    } catch (error) {
      vscode.window.showErrorMessage(`Spotify: Failed to skip to next track – ${error}`);
    }
  });
}
