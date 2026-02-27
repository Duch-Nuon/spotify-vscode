import * as vscode from 'vscode';

export function registerSetClientIdCommand(context: vscode.ExtensionContext) {
  return vscode.commands.registerCommand('spotify-vscode.setClientId', async () => {
    const current = vscode.workspace.getConfiguration('spotify').get<string>('clientId') ?? '';
    const clientId = await vscode.window.showInputBox({
      prompt: 'Enter your Spotify Application Client ID',
      value: current,
      ignoreFocusOut: true,
      placeHolder: 'Your Spotify Client ID',
    });
    if (clientId !== undefined) {
      await vscode.workspace.getConfiguration('spotify').update('clientId', clientId, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage('Spotify Client ID updated.');
    }
  });
}
