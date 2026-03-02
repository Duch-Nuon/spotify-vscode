import * as vscode from 'vscode';

export function registerSetRedirectPortCommand(context: vscode.ExtensionContext) {
  return vscode.commands.registerCommand('spotify-vscode.setRedirectPort', async () => {
    const current = vscode.workspace.getConfiguration('spotify').get<number>('redirectPort') ?? 7867;
    const input = await vscode.window.showInputBox({
      prompt: 'Enter the local port for the Spotify OAuth callback',
      value: String(current),
      ignoreFocusOut: true,
      placeHolder: '7867',
      validateInput: (value) => {
        const port = Number(value);
        if (!Number.isInteger(port) || port < 1024 || port > 65535) {
          return 'Please enter a valid port number between 1024 and 65535';
        }
        return null;
      },
    });
    if (input !== undefined) {
      const port = Number(input);
      await vscode.workspace.getConfiguration('spotify').update('redirectPort', port, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(
        `Spotify redirect port set to ${port}. Make sure http://127.0.0.1:${port}/callback is added in your Spotify app settings.`
      );
    }
  });
}
