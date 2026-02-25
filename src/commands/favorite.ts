import * as vscode from 'vscode';

export function registerFavoriteCommand(context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand('spotify-vscode.favorite', async () => {
    try {
      // TODO: call spotifyClient to save current track to liked songs
      vscode.window.showInformationMessage('Spotify: Added current track to liked songs');
    } catch (error) {
      vscode.window.showErrorMessage(`Spotify: Failed to add track to liked songs – ${error}`);
    }
  });
}
